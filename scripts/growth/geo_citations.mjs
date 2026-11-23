#!/usr/bin/env node
// Phase 4 GEO 引用追蹤（同步 generateContent + google_search grounding）。
//
// 讀 config/growth.json 的 citationQueries，逐題問 Gemini（帶即時搜尋），判定
// 回答的 grounding 來源有沒有潤讀網頁（cited）、文字有沒有點名潤讀（mentioned），
// 結果寫成一筆 status=completed 的 CitationBatchJob，analyze.mjs 會撿最新一筆渲染
// 週報的 GEO 章節（lib/render-geo.mjs）。
//
// CitationBatchJob 這個表名是 Batch API 時代留下的；同步執行沒有 batch job id，
// batchJobId 填 `sync-<時間戳>`，維持唯一。
//
// 執行：
//   node scripts/growth/geo_citations.mjs              # 全部題目，寫入資料庫
//   node scripts/growth/geo_citations.mjs --dry-run    # 不寫資料庫，印出結果
//   node scripts/growth/geo_citations.mjs --limit 2    # 只問前 N 題（驗證額度用）
//
// 缺 GEMINI_API_KEY 時警告後 exit 0，讓週報流程照常往下跑。
// 全部題目都失敗（多半是額度或計費問題）時 exit 1 且不寫資料庫，不交出一張
// 「0% 引用」的假數字。

import './lib/env.mjs';
import { loadGrowthConfig, loadCitationQueries } from './lib/load-config.mjs';
import { askGroundedMany, getCitationModel } from './lib/gemini-grounded.mjs';
import { summarizeCitations, topCompetitorDomains } from './lib/geo-citations.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitIndex = args.indexOf('--limit');
const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : null;
if (limit !== null && (!Number.isInteger(limit) || limit < 1)) {
  console.error('❌ --limit 必須是正整數');
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.warn('⚠️  未設定 GEMINI_API_KEY，略過 GEO 引用追蹤。');
  process.exit(0);
}

const config = loadGrowthConfig();
const allQueries = loadCitationQueries(config);
const queries = limit ? allQueries.slice(0, limit) : allQueries;
const model = getCitationModel();

console.log(`GEO 引用追蹤：${queries.length} 題，模型 ${model}（google_search grounding）`);
const submittedAt = new Date();
const results = await askGroundedMany(queries.map((q) => ({ key: q.id, question: q.query })), { model });
const summary = summarizeCitations(queries, results, { model, brandTerms: config.brandTerms });

for (const q of summary.perQuery) {
  const mark = q.error ? '✖' : q.cited ? '★' : q.mentioned ? '☆' : '·';
  console.log(`  ${mark} ${q.id} ${q.query}${q.error ? `（${q.error.slice(0, 120)}）` : `［${q.sourceDomains.slice(0, 4).join('、')}］`}`);
}
console.log(`作答 ${summary.answeredCount}/${summary.totalQueries}、引用 ${summary.citedCount}、提及 ${summary.mentionedCount}`);
const top = topCompetitorDomains(summary.perQuery, { limit: 5 });
if (top.length) console.log(`最常被引用的其他網域：${top.map(([d, n]) => `${d}（${n}）`).join('、')}`);

if (summary.answeredCount === 0) {
  console.error(`❌ 全部題目都沒有回應（第一個錯誤：${summary.errors[0]?.error ?? '未知'}），不寫入資料庫。`);
  process.exit(1);
}

if (dryRun) {
  console.log('--dry-run：未寫入資料庫。');
  process.exit(0);
}

const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();
try {
  const completedAt = new Date();
  const stamp = completedAt.getTime();
  await prisma.citationBatchJob.create({
    data: {
      id: `geo-${stamp}`,
      batchJobId: `sync-${stamp}`,
      status: 'completed',
      queriesJson: queries,
      resultsJson: summary,
      submittedAt,
      completedAt,
    },
  });
  console.log(`✅ 已寫入 CitationBatchJob geo-${stamp}`);
} finally {
  await prisma.$disconnect();
}
