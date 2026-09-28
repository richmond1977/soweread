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
// 三層分析之前先放一節「收錄進度」（ingest 從 URL Inspection API 取數，渲染在
// lib/coverage.mjs）：三層分析的輸入是曝光，站台還沒被收錄時三區必然全空，
// 那是資料不足而非沒有機會，兩者在報告上要看得出差別。
//
// Phase 4：若有已完成的 GEO citation batch job，會在報告末尾接上「AI 知識能見度」
// 章節（見 lib/render-geo.mjs）；沒有已完成的 job 就整段省略，不放空章節佔位符。

import './lib/env.mjs';
import { PrismaClient } from '@prisma/client';
import { loadGrowthConfig, loadGrowthSites } from './lib/load-config.mjs';
import { classify } from './lib/opportunity-classify.mjs';
import { CONTENT_TYPE_LABEL } from './lib/serp-intent.mjs';
import { renderGeoSection } from './lib/render-geo.mjs';
import { renderCoverageSection } from './lib/coverage.mjs';
import { findDeclines, findCannibalization } from './lib/gsc-signals.mjs';
import { isDue, canCompare, compareExperiment } from './lib/experiments.mjs';
import { freshestEndDate, staleNotice } from './lib/staleness.mjs';

function fmtPct(x) {
  return (x * 100).toFixed(1) + '%';
}

function fmtDelta(n, isCtr) {
  if (n === null || n === undefined) return '—';
  const sign = n > 0 ? '+' : '';
  return isCtr ? `${sign}${(n * 100).toFixed(1)}pp` : `${sign}${Number.isInteger(n) ? n : n.toFixed(1)}`;
}

// 純規則訊號（下滑警示／自家頁面互搶）：不呼叫 AI，只是既有 GrowthSnapshot 的規則比對，
// 產出的是「待檢查候選」而非改寫建議——是否要動頁面仍需人工判斷。
function renderDeclineSection(declines, hasPrevSnapshot) {
  const lines = [];
  lines.push('### 📉 下滑警示');
  lines.push('');
  lines.push('_純規則訊號，為待檢查候選，非改寫建議。_');
  lines.push('');
  if (!hasPrevSnapshot) {
    lines.push('_無前期資料，不做升降判斷。_');
    lines.push('');
    return lines;
  }
  lines.push('與前一份快照相比，排名／點擊／曝光明顯變差的搜尋詞。');
  lines.push('');
  if (declines.length === 0) {
    lines.push('_（本區間無符合的下滑警示）_');
  } else {
    lines.push('| 搜尋詞 | 前期排名 | 目前排名 | 前期點擊 | 目前點擊 | 前期曝光 | 目前曝光 |');
    lines.push('|---|--:|--:|--:|--:|--:|--:|');
    for (const r of declines) {
      const curPos = r.position === null ? '（消失）' : r.position.toFixed(1);
      lines.push(
        `| ${r.query} | ${r.prevPosition.toFixed(1)} | ${curPos} | ${r.prevClicks} | ${r.clicks} | ${r.prevImpressions} | ${r.impressions} |`
      );
    }
  }
  lines.push('');
  return lines;
}

function renderCannibalizationSection(cannibals) {
  const lines = [];
  lines.push('### 🔀 自家頁面互搶');
  lines.push('');
  lines.push('_純規則訊號，為待檢查候選，非改寫建議。_');
  lines.push('');
  lines.push('同一搜尋詞被本站多個頁面各自吃到曝光，可能互相競爭排名（keyword cannibalization）。');
  lines.push('');
  if (cannibals.length === 0) {
    lines.push('_（本區間無符合的互搶情形）_');
  } else {
    lines.push('| 搜尋詞 | 對應頁面（曝光／排名） |');
    lines.push('|---|---|');
    for (const r of cannibals) {
      const pagesLabel = r.pages
        .map((p) => `${p.page.replace(/^https?:\/\/[^/]+/, '') || '/'}（${p.impressions}／${p.position.toFixed(1)}）`)
        .join('<br>');
      lines.push(`| ${r.query} | ${pagesLabel} |`);
    }
  }
  lines.push('');
  return lines;
}

// 改版成效追蹤：純規則量測與前後比對，不做「算不算成功」的判斷——結果由人決定。
function renderExperimentsSection(experiments, latestSnapshot, site) {
  const lines = [];
  lines.push('### 🧪 改版成效追蹤');
  lines.push('');

  if (!experiments || experiments.length === 0) {
    lines.push('_目前沒有任何改版成效追蹤紀錄。用法範例：_');
    lines.push('');
    lines.push('```');
    lines.push(`npm run growth:exp -- add --site ${site} --page /topics/xxx --change "改標題" --hypothesis "提升 CTR"`);
    lines.push('```');
    lines.push('');
    lines.push('_前後差異可能受季節、演算法更新影響，決定由人做。_');
    lines.push('');
    return lines;
  }

  const today = new Date().toISOString().slice(0, 10);
  const running = [];
  const dueList = [];
  const decidedRecent = [];

  for (const e of experiments) {
    if (e.status === 'running') {
      if (isDue(e, today)) dueList.push(e);
      else running.push(e);
    } else if (e.decidedAt) {
      const daysSinceDecided = Math.round((new Date(today) - new Date(e.decidedAt)) / 86400000);
      if (daysSinceDecided <= 56) decidedRecent.push(e);
    }
  }

  lines.push('**進行中**：');
  lines.push('');
  if (running.length === 0) {
    lines.push('_（無）_');
  } else {
    lines.push('| page | 改了什麼 | 還剩幾天到期 |');
    lines.push('|---|---|--:|');
    for (const e of running) {
      const remain = e.reviewAfterDays - Math.round((new Date(today) - new Date(e.changedAt)) / 86400000);
      lines.push(`| ${e.page} | ${e.change} | ${remain} |`);
    }
  }
  lines.push('');

  lines.push('**已到期，待決定**：');
  lines.push('');
  if (dueList.length === 0) {
    lines.push('_（無）_');
  } else {
    for (const e of dueList) {
      const baseline = e.baselineJson;
      const experiment = { changedAt: e.changedAt, page: e.page, queries: e.queriesJson, baseline };
      const cmp = compareExperiment(experiment, latestSnapshot);
      lines.push(`- **${e.id}**　${e.page}　${e.change}（假設：${e.hypothesis}）`);
      lines.push('');
      const check = canCompare(experiment, latestSnapshot);
      if (!check.ok) {
        lines.push(`  _${check.reason}，暫不比較。_`);
        lines.push('');
        continue;
      }
      lines.push('  | 對象 | 指標 | 改版前 | 改版後 | 差值 |');
      lines.push('  |---|---|--:|--:|--:|');
      if (cmp.page.comparable) {
        const { before, after, delta } = cmp.page;
        lines.push(`  | page | clicks | ${before.clicks} | ${after.clicks} | ${fmtDelta(delta.clicks)} |`);
        lines.push(`  | page | impressions | ${before.impressions} | ${after.impressions} | ${fmtDelta(delta.impressions)} |`);
        lines.push(`  | page | ctr | ${fmtPct(before.ctr)} | ${fmtPct(after.ctr)} | ${fmtDelta(delta.ctr, true)} |`);
        lines.push(`  | page | position | ${before.position.toFixed(1)} | ${after.position.toFixed(1)} | ${fmtDelta(delta.position)} |`);
      } else {
        lines.push(`  | page | — | — | — | ${cmp.page.reason} |`);
      }
      for (const q of cmp.queries) {
        if (!q.comparable) {
          lines.push(`  | ${q.query} | — | — | — | ${q.reason} |`);
          continue;
        }
        lines.push(`  | ${q.query} | clicks | ${q.before.clicks} | ${q.after.clicks} | ${fmtDelta(q.delta.clicks)} |`);
        lines.push(`  | ${q.query} | impressions | ${q.before.impressions} | ${q.after.impressions} | ${fmtDelta(q.delta.impressions)} |`);
        lines.push(`  | ${q.query} | ctr | ${fmtPct(q.before.ctr)} | ${fmtPct(q.after.ctr)} | ${fmtDelta(q.delta.ctr, true)} |`);
        lines.push(`  | ${q.query} | position | ${q.before.position.toFixed(1)} | ${q.after.position.toFixed(1)} | ${fmtDelta(q.delta.position)} |`);
      }
      lines.push('');
      lines.push(`  _決定：\`npm run growth:exp -- decide --id ${e.id} --result keep|revert|iterate\`_`);
      lines.push('');
    }
  }

  lines.push('**近 8 週已決定**：');
  lines.push('');
  if (decidedRecent.length === 0) {
    lines.push('_（無）_');
  } else {
    lines.push('| page | 改了什麼 | 結果 | 備註 |');
    lines.push('|---|---|---|---|');
    for (const e of decidedRecent) {
      lines.push(`| ${e.page} | ${e.change} | ${e.status} | ${e.decision ?? '—'} |`);
    }
  }
  lines.push('');

  lines.push('_前後差異可能受季節、演算法更新影響，決定由人做。_');
  lines.push('');
  return lines;
}

function renderSiteSection(site, snapshot, result, config, serpSnapshot, signals, freshest) {
  const { startDate, endDate, rawRows } = snapshot;
  const { striking, ctrGap, content } = result;
  const tc = rawRows.byQuery.reduce((s, r) => s + r.clicks, 0);
  const ti = rawRows.byQuery.reduce((s, r) => s + r.impressions, 0);

  const lines = [];
  lines.push(`## ${site.label}　${site.domain}`);
  lines.push('');
  const notice = staleNotice(endDate, freshest);
  if (notice) {
    lines.push(notice);
    lines.push('');
  }
  lines.push(`區間：${startDate} ~ ${endDate}・資料源：Google Search Console`);
  lines.push('');
  lines.push(`**區間總覽**：${ti} 次曝光、${tc} 次點擊、整體 CTR ${fmtPct(ti ? tc / ti : 0)}`);
  lines.push('');

  lines.push(
    ...renderCoverageSection(snapshot.coverage, {
      impressions: ti,
      minImpressions: config.minImpressions,
      opportunityCount: striking.length + ctrGap.length + content.length,
    })
  );

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

  lines.push('### 🔎 搜尋需求候選（SERP 待驗證）');
  lines.push('');
  lines.push(
    '有曝光但排名 20 名外。這只證明「Google 認為這個詞跟本站有點關係」，不能直接證明' +
      '「內容深度不夠」——排名落後也可能是頁型不符、意圖不符、或 Google 偏好其他來源。' +
      '下表用 Serper 查證 Top 10 之後才給「知識物件」建議；沒查證的維持純 GSC 曝光數字，' +
      '不代表已確認需要新內容。'
  );
  lines.push('');
  if (content.length === 0) {
    lines.push('_（本區間無符合的機會）_');
  } else {
    const serpByQuery = new Map((serpSnapshot?.resultsJson?.results ?? []).map((r) => [r.query, r]));
    const hasSerp = serpByQuery.size > 0;
    if (hasSerp) {
      lines.push(
        `_已用 Serper 查證前 ${serpSnapshot.resultsJson.results.length} 個查詢的 Google Top 10` +
          '（其餘因免費額度有限尚未查證，「SERP 型態／建議」欄顯示「—」代表沒查，不代表沒有需求）。_'
      );
      lines.push('');
      lines.push('| 搜尋詞 | 曝光 | 目前排名 | SERP 型態 | 建議動作（需人工判斷） |');
      lines.push('|---|--:|--:|---|---|');
      for (const r of content.slice(0, 15)) {
        const s = serpByQuery.get(r.query);
        const type = s ? CONTENT_TYPE_LABEL[s.contentType] ?? s.contentType : '—';
        const action = s ? s.action : '—（尚未查證）';
        lines.push(`| ${r.query} | ${r.impressions} | ${r.position.toFixed(1)} | ${type} | ${action} |`);
      }
    } else {
      lines.push('_尚未執行 SERP 查證（`npm run growth:serp`）：以下僅為 GSC 曝光缺口。_');
      lines.push('');
      lines.push('| 搜尋詞 | 曝光 | 目前排名 |');
      lines.push('|---|--:|--:|');
      for (const r of content.slice(0, 15)) {
        lines.push(`| ${r.query} | ${r.impressions} | ${r.position.toFixed(1)} |`);
      }
    }
  }
  lines.push('');
  lines.push(...renderDeclineSection(signals.declines, signals.hasPrevSnapshot));
  lines.push(...renderCannibalizationSection(signals.cannibals));
  lines.push(...renderExperimentsSection(signals.experiments, snapshot, site.site));

  return lines;
}

function renderReport(bySite, skippedSites, config, latestGeoJob) {
  const lines = [];
  lines.push('# 潤讀成長機會週報');
  lines.push('');
  lines.push(
    `_產生於 ${new Date().toISOString().slice(0, 10)}・資料源：Google Search Console（${bySite.map((s) => s.site.label).join('、')}）_`
  );
  lines.push('');
  lines.push(
    `門檻：最低曝光 ${config.minImpressions} 次。以下建議皆為規則式分析結果，需人工判斷後執行。` +
      '每站先列收錄進度（Google 收了幾頁），再列 SEO 三層機會分析。' +
      (latestGeoJob
        ? '文末另有 GEO AI 知識能見度章節。'
        : 'GEO AI 知識能見度追蹤本期無已完成的批次結果，未列入。')
  );
  lines.push('');

  const freshest = freshestEndDate(bySite.map((s) => s.snapshot.endDate));
  for (const { site, snapshot, result, serpSnapshot, signals } of bySite) {
    lines.push(...renderSiteSection(site, snapshot, result, config, serpSnapshot, signals, freshest));
    lines.push('---');
    lines.push('');
  }

  if (skippedSites.length > 0) {
    lines.push(
      `_本期未涵蓋：${skippedSites.map((s) => s.label).join('、')}（尚未取得 GSC 存取權限或無快照，權限到位後執行 npm run growth:refresh 即可補上）_`
    );
    lines.push('');
  }

  if (latestGeoJob) {
    lines.push(...renderGeoSection(latestGeoJob));
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
      // 選配：同一站、同一區間若已跑過 SERP 查證（npm run growth:serp）就撈來合併；
      // 沒有就是 undefined，renderSiteSection 會落回純 GSC 版本，不擋整份週報。
      const serpSnapshot = await prisma.serpSnapshot.findUnique({
        where: { site_endDate: { site: site.site, endDate: snapshot.endDate } },
      });

      // 前一份快照：同站依 endDate 排序，取本期之前最近的一份（供下滑警示比較用）。
      const prevSnapshot = await prisma.growthSnapshot.findFirst({
        where: { site: site.site, endDate: { lt: snapshot.endDate } },
        orderBy: { endDate: 'desc' },
      });
      const experiments = await prisma.experiment.findMany({
        where: { site: site.site },
        orderBy: { createdAt: 'asc' },
      });
      const signals = {
        declines: findDeclines(snapshot.rawRows, prevSnapshot ? prevSnapshot.rawRows : null, config),
        cannibals: findCannibalization(snapshot.rawRows, config),
        hasPrevSnapshot: Boolean(prevSnapshot),
        experiments,
      };

      bySite.push({ site, snapshot, result, serpSnapshot, signals });
      console.log(
        `${site.label}：臨門一腳 ${result.striking.length}　點擊落差 ${result.ctrGap.length}　內容缺口 ${result.content.length}`
      );
    }

    if (bySite.length === 0) {
      throw new Error('所有站都沒有 GrowthSnapshot，請先執行 npm run growth:ingest');
    }

    // Phase 4：撿最新一筆已完成的 GEO citation batch job（若有）。查無資料是
    // 正常情況（Phase 4 尚未跑過、或本週還在等 batch job 完成），不當成錯誤。
    const latestGeoJob = await prisma.citationBatchJob.findFirst({
      where: { status: 'completed' },
      orderBy: { completedAt: 'desc' },
    });

    const report = renderReport(bySite, skippedSites, config, latestGeoJob);
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
