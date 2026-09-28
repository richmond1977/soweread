#!/usr/bin/env node
// SERP 驗證層：對 analyze.mjs 分類出的「內容缺口」候選查詢，實際查一次 Google Top 10，
// 判斷主流知識物件型態，避免把「GSC 有曝光」直接當成「需要新內容」。
// 背景：純 GSC 規則只能證明「Google 覺得這個字跟潤讀有點關係」，證不了「讀者需要新文章」
// ——這個坑與判斷方式見 2026-09-19 與 Richmond 的討論（把 WiseCode 同一套驗證層移植過來，
// 但意圖分類換成適合內容媒體的知識物件型態，見 lib/serp-intent.mjs 檔頭）。
//
// 結果寫進 Neon 的 SerpSnapshot，不落地成檔案、不進 git——跟 GrowthSnapshot 同一個理由
// （這是 public repo，見 docs/growth-weekly-report-migration.md 第 6 節陷阱 1）。
//
// 只查 analyze.mjs 排序後的前 N 個內容缺口候選（預設 8），不是全部：
//   1) Serper 免費試用額度是一次性 2,500 次，不是每月重置，省著用。
//   2) 週報本來就只需要挑出最值得動的候選，不必驗證長尾全部。
//
// 執行：node --env-file=.env.local scripts/growth/serp_validate.mjs
//   （排進 npm run growth:refresh 與週報 GitHub Actions；缺 SERPER_API_KEY 只警告跳過，
//   不擋 ingest → analyze 這條鏈）
// 前置：需先跑過 npm run growth:ingest（讀 growth／primary 兩站最新的 GrowthSnapshot）

import './lib/env.mjs';
import { PrismaClient } from '@prisma/client';
import { loadGrowthConfig, loadGrowthSites } from './lib/load-config.mjs';
import { classify } from './lib/opportunity-classify.mjs';
import { fetchSerpMany } from './lib/serper-client.mjs';
import { classifyIntent, recommendAction } from './lib/serp-intent.mjs';

// 上限 20：免費額度是一次性的，防手誤把 GROWTH_SERP_MAX 設成大數一次燒光。
const MAX_QUERIES = Math.min(20, Math.max(1, Number(process.env.GROWTH_SERP_MAX) || 8));
if (Number(process.env.GROWTH_SERP_MAX) > 20) {
  console.warn('⚠️ GROWTH_SERP_MAX 超過上限 20，已鉗制為 20（Serper 免費額度一次性，不建議一次查太多）。');
}

async function validateSite(prisma, site, config) {
  const snapshot = await prisma.growthSnapshot.findFirst({
    where: { site: site.site },
    orderBy: { endDate: 'desc' },
  });
  if (!snapshot) {
    console.warn(`⚠️  找不到 ${site.label}（${site.site}）的 GrowthSnapshot，略過 SERP 查證。請先執行 npm run growth:ingest`);
    return;
  }

  const { content } = classify(snapshot.rawRows, config);
  const candidates = content.slice(0, MAX_QUERIES);
  if (candidates.length === 0) {
    console.log(`${site.label}：本區間沒有內容缺口候選，略過 SERP 查證。`);
    return;
  }

  console.log(`${site.label}：內容缺口候選 ${content.length} 個，查前 ${candidates.length} 個（GROWTH_SERP_MAX=${MAX_QUERIES}）`);
  const serpResults = await fetchSerpMany(candidates.map((c) => c.query));
  const byQuery = new Map(serpResults.map((r) => [r.query, r]));

  const results = candidates.map((c) => {
    const raw = byQuery.get(c.query);
    if (!raw || raw.error) {
      console.warn(`  ⚠️ ${c.query}：查詢失敗（${raw?.error ?? '無回應'}）`);
      return {
        query: c.query,
        impressions: c.impressions,
        position: c.position,
        page: c.page,
        error: raw?.error ?? '無回應',
      };
    }
    const { contentType, scores, totalConsidered, topDomains, authorityDomainCount } = classifyIntent(raw);
    const action = recommendAction({ contentType, hasLandingPage: Boolean(c.page) });
    console.log(`  ${c.query}：${contentType}（${JSON.stringify(scores)} / 共 ${totalConsidered} 筆 / 官方網域 ${authorityDomainCount}）`);
    return {
      query: c.query,
      impressions: c.impressions,
      position: c.position,
      page: c.page,
      contentType,
      scores,
      totalConsidered,
      topDomains,
      authorityDomainCount,
      peopleAlsoAsk: raw.peopleAlsoAsk ?? [],
      relatedSearches: raw.relatedSearches ?? [],
      action,
    };
  });

  const resultsJson = {
    fetchedAt: new Date().toISOString(),
    source: 'serper.dev',
    results,
  };
  const failed = results.filter((r) => r.error).length;

  await prisma.serpSnapshot.upsert({
    where: { site_endDate: { site: site.site, endDate: snapshot.endDate } },
    create: {
      id: `${site.site}-${snapshot.endDate}`,
      site: site.site,
      endDate: snapshot.endDate,
      maxQueries: MAX_QUERIES,
      totalCandidates: content.length,
      resultsJson,
      fetchedAt: new Date(),
    },
    update: {
      maxQueries: MAX_QUERIES,
      totalCandidates: content.length,
      resultsJson,
      fetchedAt: new Date(),
    },
  });

  console.log(`  ✅ 已寫入 SerpSnapshot（${site.site}, endDate=${snapshot.endDate}）${failed ? `，${failed} 題查詢失敗` : ''}`);
}

async function main() {
  // 選配步驟：缺 key 不可讓 ingest → analyze 這條鏈斷掉——analyze.mjs 本來就能在
  // 沒有 SerpSnapshot 時優雅降級（顯示「尚未查證」），這裡只警告後跳過。
  if (!process.env.SERPER_API_KEY) {
    console.warn('⚠️ 缺 SERPER_API_KEY，略過 SERP 查證（內容缺口表格將維持純 GSC 版本）。');
    return;
  }

  const config = loadGrowthConfig();
  const sites = loadGrowthSites();
  const prisma = new PrismaClient();

  try {
    for (const site of sites) {
      await validateSite(prisma, site, config);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('\n❌ serp_validate 失敗：', e.message);
  process.exit(1);
});
