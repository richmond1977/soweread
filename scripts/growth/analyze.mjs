#!/usr/bin/env node
// 機會分析引擎（純規則，不用 AI；Phase 1，僅涵蓋 GSC）：讀 growth／primary 兩站
// 最新的 GrowthSnapshot，各自做三層分類，合併渲染成一份週報，寫入 GrowthReport
// （Neon，不進 git）。
// 執行：node --env-file=.env.local scripts/growth/analyze.mjs
//
// 機會分類（演算法移植自來源端，門檻與 CTR 基準改讀 config/growth.json）：
//   striking  臨門一腳：排名 4–20、有曝光 → 強化既有頁面就能進前三（投報最高）
//   ctrGap    點擊落差：排名已在前 5 但 CTR 偏低 → 改 title/description
//   content   內容缺口：有曝光但排名 20+ → 需要新的專屬內容
//   （品牌詞、雜訊詞會被濾除）
//
// AI 引擎能見度（GEO）追蹤留待後續階段，本報告不涵蓋、不放佔位章節。

import './lib/env.mjs';
import { PrismaClient } from '@prisma/client';
import { loadGrowthConfig, loadGrowthSites, expectedCtr } from './lib/load-config.mjs';

// 雜訊判斷：含搜尋運算子（-site: 等）的字串
function isNoise(query) {
  return /-site:|site:|inurl:|\bfiletype:/i.test(query);
}

function isBrand(query, brandTerms) {
  const q = query.toLowerCase();
  return brandTerms.some((t) => q.includes(t.toLowerCase()));
}

// 把 query 對應到目前排名最好的落地頁（供強化建議用）
function landingPageFor(query, byQueryPage) {
  const rows = byQueryPage.filter((r) => r.query === query);
  if (rows.length === 0) return null;
  rows.sort((a, b) => a.position - b.position);
  return rows[0].page;
}

function fmtPct(x) {
  return (x * 100).toFixed(1) + '%';
}

function classify(rawRows, config) {
  const { byQuery, byQueryPage } = rawRows;
  const striking = [];
  const ctrGap = [];
  const content = [];

  const { minImpressions, brandTerms, strikingMinPosition, strikingMaxPosition, ctrGapMaxPosition } = config;
  const proximityDenominator = strikingMaxPosition - strikingMinPosition;

  for (const r of byQuery) {
    if (isNoise(r.query)) continue;
    if (r.impressions < minImpressions) continue;
    if (isBrand(r.query, brandTerms)) continue; // 品牌詞不當成長機會（不論目前排名）

    const page = landingPageFor(r.query, byQueryPage);
    const base = { ...r, page };

    if (r.position > strikingMinPosition && r.position <= strikingMaxPosition) {
      // 臨門一腳；離第一頁越近、曝光越高 → 分數越高
      const proximity = Math.max(0, strikingMaxPosition + 0.5 - r.position) / proximityDenominator;
      base.opportunity = Math.round(r.impressions * proximity);
      striking.push(base);
    } else if (r.position <= ctrGapMaxPosition && r.ctr < expectedCtr(r.position, config) * 0.6) {
      base.expectedCtr = expectedCtr(r.position, config);
      base.missedClicks = Math.round(r.impressions * (base.expectedCtr - r.ctr));
      ctrGap.push(base);
    } else if (r.position > strikingMaxPosition) {
      base.opportunity = r.impressions;
      content.push(base);
    }
  }

  striking.sort((a, b) => b.opportunity - a.opportunity);
  ctrGap.sort((a, b) => b.missedClicks - a.missedClicks);
  content.sort((a, b) => b.opportunity - a.opportunity);
  return { striking, ctrGap, content };
}

function renderSiteSection(site, snapshot, result) {
  const { startDate, endDate, rawRows } = snapshot;
  const { striking, ctrGap, content } = result;
  const tc = rawRows.byQuery.reduce((s, r) => s + r.clicks, 0);
  const ti = rawRows.byQuery.reduce((s, r) => s + r.impressions, 0);

  const lines = [];
  lines.push(`## ${site.label}　${site.domain}`);
  lines.push('');
  lines.push(`區間：${startDate} ~ ${endDate}・資料源：Google Search Console`);
  lines.push('');
  lines.push(`**區間總覽**：${ti} 次曝光、${tc} 次點擊、整體 CTR ${fmtPct(ti ? tc / ti : 0)}`);
  lines.push('');

  lines.push('### 🎯 臨門一腳（強化既有頁面，投報最高）');
  lines.push('');
  lines.push('排名 4–20 名、已有曝光的搜尋詞。優化對應頁面（補內容、加 FAQ、改標題）即可能進前三。');
  lines.push('');
  if (striking.length === 0) {
    lines.push('_（本區間無符合的機會）_');
  } else {
    lines.push('| 搜尋詞 | 曝光 | 點擊 | 目前排名 | 機會分數 | 對應頁面 |');
    lines.push('|---|--:|--:|--:|--:|---|');
    for (const r of striking.slice(0, 15)) {
      const p = r.page ? r.page.replace(/^https?:\/\/[^/]+/, '') || '/' : '—';
      lines.push(`| ${r.query} | ${r.impressions} | ${r.clicks} | ${r.position.toFixed(1)} | ${r.opportunity} | ${p} |`);
    }
  }
  lines.push('');

  lines.push('### 📝 點擊落差（排名不錯但沒人點，改標題/描述）');
  lines.push('');
  lines.push('排名已在前 5 名，但 CTR 明顯低於該名次的預期水準。通常是 title、meta description 不吸引人，或缺可被摘錄的答案段落。');
  lines.push('');
  if (ctrGap.length === 0) {
    lines.push('_（本區間無符合的機會）_');
  } else {
    lines.push('| 搜尋詞 | 曝光 | 目前排名 | 目前CTR | 預期CTR | 損失點擊 | 對應頁面 |');
    lines.push('|---|--:|--:|--:|--:|--:|---|');
    for (const r of ctrGap.slice(0, 10)) {
      const p = r.page ? r.page.replace(/^https?:\/\/[^/]+/, '') || '/' : '—';
      lines.push(`| ${r.query} | ${r.impressions} | ${r.position.toFixed(1)} | ${fmtPct(r.ctr)} | ${fmtPct(r.expectedCtr)} | ${r.missedClicks} | ${p} |`);
    }
  }
  lines.push('');

  lines.push('### 🆕 內容缺口（有需求但排名落後，考慮寫新頁）');
  lines.push('');
  lines.push('有曝光但排名 20 名外，代表主題相關但內容深度不夠。是新文章／新落地頁的選題來源。');
  lines.push('');
  if (content.length === 0) {
    lines.push('_（本區間無符合的機會）_');
  } else {
    lines.push('| 搜尋詞 | 曝光 | 目前排名 |');
    lines.push('|---|--:|--:|');
    for (const r of content.slice(0, 15)) {
      lines.push(`| ${r.query} | ${r.impressions} | ${r.position.toFixed(1)} |`);
    }
  }
  lines.push('');

  return lines;
}

function renderReport(bySite, skippedSites, config) {
  const lines = [];
  lines.push('# 潤讀成長機會週報');
  lines.push('');
  lines.push(
    `_產生於 ${new Date().toISOString().slice(0, 10)}・資料源：Google Search Console（${bySite.map((s) => s.site.label).join('、')}）_`
  );
  lines.push('');
  lines.push(
    `門檻：最低曝光 ${config.minImpressions} 次。以下建議皆為規則式分析結果，需人工判斷後執行。` +
      '本期僅涵蓋 SEO 三層機會分析；AI 引擎能見度追蹤留待後續階段推出。'
  );
  lines.push('');

  for (const { site, snapshot, result } of bySite) {
    lines.push(...renderSiteSection(site, snapshot, result));
    lines.push('---');
    lines.push('');
  }

  if (skippedSites.length > 0) {
    lines.push(
      `_本期未涵蓋：${skippedSites.map((s) => s.label).join('、')}（尚未取得 GSC 存取權限或無快照，權限到位後執行 npm run growth:refresh 即可補上）_`
    );
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  const config = loadGrowthConfig();
  const sites = loadGrowthSites();
  const prisma = new PrismaClient();

  try {
    const bySite = [];
    const skippedSites = [];
    for (const site of sites) {
      const snapshot = await prisma.growthSnapshot.findFirst({
        where: { site: site.site },
        orderBy: { endDate: 'desc' },
      });
      if (!snapshot) {
        // 寬容處理：缺哪站列哪站，不因單站尚未取得 GSC 權限而擋住整份週報
        // （2026-09-04 決定，見 docs/growth-weekly-report-migration.md）。
        console.warn(`⚠️  找不到 ${site.label}（${site.site}）的 GrowthSnapshot，本期週報將略過此站。`);
        skippedSites.push(site);
        continue;
      }
      const result = classify(snapshot.rawRows, config);
      bySite.push({ site, snapshot, result });
      console.log(
        `${site.label}：臨門一腳 ${result.striking.length}　點擊落差 ${result.ctrGap.length}　內容缺口 ${result.content.length}`
      );
    }

    if (bySite.length === 0) {
      throw new Error('所有站都沒有 GrowthSnapshot，請先執行 npm run growth:ingest');
    }

    const report = renderReport(bySite, skippedSites, config);
    const endDate = bySite.reduce((max, s) => (s.snapshot.endDate > max ? s.snapshot.endDate : max), bySite[0].snapshot.endDate);
    const startDate = bySite.reduce((min, s) => (s.snapshot.startDate < min ? s.snapshot.startDate : min), bySite[0].snapshot.startDate);

    await prisma.growthReport.upsert({
      where: { endDate },
      create: { id: `report-${endDate}`, startDate, endDate, markdown: report },
      update: { startDate, markdown: report },
    });

    console.log(`\n✅ 週報已寫入 GrowthReport（endDate=${endDate}）`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('\n❌ analyze 失敗：', e.message);
  process.exit(1);
});
