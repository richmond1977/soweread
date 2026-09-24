#!/usr/bin/env node
// 改版成效追蹤 CLI（純規則，不用 AI、不連外網）：
//   add    — 記錄一次改版，從指定站台最新的 GrowthSnapshot 抓取基準值
//   decide — 到期後由人決定 keep / revert / iterate
//   list   — 列出全部紀錄
//
// 移植自 WISECODE_Website scripts/growth/experiment.mjs（2026-09-24）。差異：
// WISECODE 用本機 JSON 檔（experiments.json + data/growth/gsc/*.json），
// SOWEREAD 的 growth 資料一律進 Neon（見 prisma/schema.prisma 的 Experiment、
// GrowthSnapshot model），所以這裡改用 Prisma；又因為 SOWEREAD 是 growth／
// primary 兩站，--site 是必填參數（跟 analyze.mjs 對齊 site: 'growth'|'primary'）。
//
// 執行：node scripts/growth/experiment.mjs add --site growth --page /topics/xxx --change "..." --hypothesis "..."

import './lib/env.mjs';
import { PrismaClient } from '@prisma/client';
import { isDue, buildBaseline } from './lib/experiments.mjs';
import { loadGrowthSites } from './lib/load-config.mjs';

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

function requireSite(args, sites) {
  const site = args.site;
  if (!site) {
    console.error(`❌ 需要 --site（${sites.map((s) => s.site).join(' 或 ')}）`);
    process.exit(1);
  }
  if (!sites.some((s) => s.site === site)) {
    console.error(`❌ --site「${site}」不存在，可用值：${sites.map((s) => s.site).join('、')}`);
    process.exit(1);
  }
  return site;
}

async function cmdAdd(args, prisma, sites) {
  const site = requireSite(args, sites);
  const page = args.page;
  const change = args.change;
  const hypothesis = args.hypothesis;
  if (!page || !change || !hypothesis) {
    console.error('❌ add 需要 --page --change --hypothesis');
    process.exit(1);
  }

  const queries = args.queries
    ? String(args.queries)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const changedAt = args.date || todayISODate();
  const reviewAfterDays = args['review-days'] ? Number(args['review-days']) : 28;
  const allowEmptyBaseline = Boolean(args['allow-empty-baseline']);

  const snapshot = await prisma.growthSnapshot.findFirst({
    where: { site },
    orderBy: { endDate: 'desc' },
  });
  if (!snapshot) {
    console.error(`❌ 站台「${site}」沒有任何 GrowthSnapshot，請先執行 npm run growth:ingest`);
    process.exit(1);
  }

  const baseline = buildBaseline(page, queries, snapshot, snapshot.endDate);

  if (baseline.empty && !allowEmptyBaseline) {
    console.error(
      `❌ page「${page}」在最新快照（${snapshot.endDate}）裡完全沒有資料。` +
        '若確定要在無基準情況下建立追蹤，加 --allow-empty-baseline。'
    );
    process.exit(1);
  }

  // 基準期間若已涵蓋改版日（例如改完幾天才補登），基準就混入改版後數據，前後比較會失真
  if (baseline.endDate && baseline.endDate >= changedAt) {
    baseline.includesPostChange = true;
    console.warn(
      `⚠️ 基準快照期間（${baseline.startDate}～${baseline.endDate}）已涵蓋改版日 ${changedAt}，` +
        '基準混有改版後數據，比較結果請保守解讀。'
    );
  }

  const id = `exp-${Date.now()}`;
  await prisma.experiment.create({
    data: {
      id,
      site,
      page,
      queriesJson: queries,
      change,
      hypothesis,
      changedAt,
      reviewAfterDays,
      baselineJson: baseline,
      status: 'running',
      decision: null,
      decidedAt: null,
    },
  });

  console.log(`✅ 已建立 ${id}`);
  console.log(`   site: ${site}`);
  console.log(`   page: ${page}`);
  console.log(`   change: ${change}`);
  console.log(`   基準快照: ${snapshot.endDate}${baseline.empty ? '（該頁無資料，empty baseline）' : ''}`);
  console.log(`   到期日: changedAt(${changedAt}) + ${reviewAfterDays} 天`);
}

async function cmdDecide(args, prisma) {
  const id = args.id;
  const result = args.result;
  const validResults = ['keep', 'revert', 'iterate'];

  if (!id) {
    console.error('❌ decide 需要 --id');
    process.exit(1);
  }
  if (!validResults.includes(result)) {
    console.error(`❌ --result 必須是 ${validResults.join(' / ')} 其中之一，收到「${result}」`);
    process.exit(1);
  }

  const existing = await prisma.experiment.findUnique({ where: { id } });
  if (!existing) {
    console.error(`❌ 找不到 id「${id}」`);
    process.exit(1);
  }

  await prisma.experiment.update({
    where: { id },
    data: { status: result, decision: args.note || null, decidedAt: todayISODate() },
  });

  console.log(`✅ ${id} 已標記為 ${result}`);
}

async function cmdList(args, prisma) {
  const where = args.site ? { site: args.site } : {};
  const experiments = await prisma.experiment.findMany({ where, orderBy: { createdAt: 'asc' } });
  if (experiments.length === 0) {
    console.log('（目前沒有任何改版成效追蹤紀錄）');
    return;
  }
  const today = todayISODate();
  for (const e of experiments) {
    let statusLabel;
    if (e.status === 'running') {
      const due = isDue(e, today);
      statusLabel = due ? 'running（已到期，待決定）' : `running（尚餘 ${e.reviewAfterDays - Math.round((new Date(today) - new Date(e.changedAt)) / 86400000)} 天）`;
    } else {
      statusLabel = `${e.status}${e.decidedAt ? `（${e.decidedAt}）` : ''}`;
    }
    console.log(`- ${e.id}  [${e.site}]  [${statusLabel}]  ${e.page}  ${e.change}`);
  }
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  const sites = loadGrowthSites();
  const prisma = new PrismaClient();

  try {
    switch (cmd) {
      case 'add':
        await cmdAdd(args, prisma, sites);
        break;
      case 'decide':
        await cmdDecide(args, prisma);
        break;
      case 'list':
        await cmdList(args, prisma);
        break;
      default:
        console.error('用法：node scripts/growth/experiment.mjs <add|decide|list> [options]');
        process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌ 執行失敗：', e.message);
  process.exit(1);
});
