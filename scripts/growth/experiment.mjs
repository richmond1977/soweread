#!/usr/bin/env node
// 改版成效追蹤 CLI（純規則，不用 AI；add/repair 從 GSC 讀取改版前基準）：
//   add    — 記錄一次改版，抓取改版日前 28 日 GSC 基準
//   repair-baselines — 預設 dry-run；--apply 才修復 running 實驗的污染基準
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
import { googlePost } from './lib/google-auth.mjs';
import { fetchBaselineSnapshot, needsBaselineRepair, repairedBaseline, applyBaselineRepair, gscCalendarDate } from './lib/experiment-repair.mjs';

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
  const changedAt = args.date || gscCalendarDate();
  const reviewAfterDays = args['review-days'] ? Number(args['review-days']) : 28;
  const allowEmptyBaseline = Boolean(args['allow-empty-baseline']);

  if (!Number.isInteger(reviewAfterDays) || reviewAfterDays < 1) throw new Error('--review-days 必須是正整數');
  const snapshot = await fetchBaselineSnapshot(sites.find((s) => s.site === site), page, queries, changedAt, googlePost);

  const baseline = buildBaseline(page, queries, snapshot, snapshot.endDate);

  if (baseline.empty && !allowEmptyBaseline) {
    console.error(
      `❌ page「${page}」在改版前基準（${snapshot.endDate}）裡完全沒有資料。` +
        '若確定要在無基準情況下建立追蹤，加 --allow-empty-baseline。'
    );
    process.exit(1);
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

async function cmdRepair(args, prisma, sites) {
  if (args.apply !== undefined && args.apply !== true) throw new Error('--apply 為旗標，請勿帶值');
  if (args['dry-run'] && args.apply) throw new Error('--dry-run 與 --apply 不可同時使用');
  if (args.site) requireSite(args, sites);
  if (args.id === true) throw new Error('--id 需要實驗 id');
  const experiments = await prisma.experiment.findMany({
    where: { status: 'running', ...(args.site ? { site: args.site } : {}), ...(args.id ? { id: args.id } : {}) },
    orderBy: { createdAt: 'asc' },
  });
  const candidates = experiments.filter(needsBaselineRepair);
  console.log(`${args.apply ? 'APPLY' : 'DRY-RUN（不寫入資料庫）'}：${candidates.length} 筆污染基準`);
  let failures = 0;
  for (const experiment of candidates) {
    try {
      const site = sites.find((s) => s.site === experiment.site);
      if (!site) throw new Error(`未知站台 ${experiment.site}`);
      if (!Array.isArray(experiment.queriesJson) || experiment.queriesJson.some((q) => typeof q !== 'string')) throw new Error('queriesJson 格式無效');
      const snapshot = await fetchBaselineSnapshot(site, experiment.page, experiment.queriesJson, experiment.changedAt, googlePost);
      const baseline = repairedBaseline(experiment, snapshot);
      console.log(JSON.stringify({ id: experiment.id, mode: args.apply ? 'apply' : 'dry-run', baseline }, null, 2));
      if (args.apply) await applyBaselineRepair(prisma, experiment, baseline);
    } catch (error) {
      failures++;
      console.error(`❌ ${experiment.id}：${error.message}`);
    }
  }
  if (failures) throw new Error(`${failures} 筆基準修復失敗；失敗項目未寫入`);
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
      case 'repair':
      case 'repair-baselines':
        await cmdRepair(args, prisma, sites);
        break;
      case 'decide':
        await cmdDecide(args, prisma);
        break;
      case 'list':
        await cmdList(args, prisma);
        break;
      default:
        console.error('用法：node scripts/growth/experiment.mjs <add|decide|list|repair-baselines> [options]');
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
