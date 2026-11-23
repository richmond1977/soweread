// GEO（Generative Engine Optimization）章節渲染：把最新一筆已完成的
// CitationBatchJob.resultsJson 轉成週報裡的一段 Markdown。
//
// 兩種資料格式：
//   method === 'grounded'（2026-11-23 起，scripts/growth/geo_citations.mjs）：
//     同步 generateContent + google_search grounding，量「Gemini 即時搜尋後，
//     拿潤讀網頁當依據」的引用率，另計文字提及率。
//   舊格式（無 method，Batch API、不帶 grounding）：只有提及率，量的是模型
//     既有知識。保留渲染，避免歷史資料讀不出來。
//
// 若沒有已完成的 job，呼叫端（analyze.mjs）就整段不放這個章節——不渲染空章節。

import { topCompetitorDomains } from './geo-citations.mjs';

function fmtPct(n, d) {
  if (!d) return '—';
  return `${((n / d) * 100).toFixed(1)}%`;
}

function escapeCell(s) {
  return String(s ?? '').replace(/\|/g, '｜').replace(/\n/g, ' ');
}

function renderGrounded(job, r) {
  const lines = [];
  lines.push('## 🤖 GEO：AI 引用能見度');
  lines.push('');
  lines.push(
    '> 本節用 Gemini 搭配 Google 即時搜尋（google_search grounding）回答題庫裡的問題，' +
      '看它列出的參考來源裡有沒有潤讀網頁（**引用**），以及回答文字有沒有點名潤讀（**提及**）。' +
      '這是 AI 搜尋情境的代理指標：單一模型、單次抽樣，結果會隨搜尋結果浮動，看趨勢比看單週數字可靠；' +
      '不代表 ChatGPT、Perplexity 或 Google AI Overview 的實際引用率。'
  );
  lines.push('');
  lines.push(`資料來源：${job.completedAt.toISOString().slice(0, 10)} 執行・模型：${r.model}`);
  lines.push('');
  lines.push(
    `**引用率**：${r.citedCount}/${r.answeredCount} 題（${fmtPct(r.citedCount, r.answeredCount)}）・` +
      `**提及率**：${r.mentionedCount}/${r.answeredCount} 題（${fmtPct(r.mentionedCount, r.answeredCount)}）` +
      (r.answeredCount < r.totalQueries ? `・另有 ${r.totalQueries - r.answeredCount} 題無回應` : '')
  );
  lines.push('');

  const clusters = Object.entries(r.byCluster ?? {});
  if (clusters.length > 0) {
    lines.push('| 主題分群 | 引用 | 提及 |');
    lines.push('|---|--:|--:|');
    for (const [cluster, s] of clusters) {
      lines.push(`| ${escapeCell(cluster)} | ${s.cited}/${s.answered}（${fmtPct(s.cited, s.answered)}） | ${s.mentioned}/${s.answered} |`);
    }
    lines.push('');
  }

  const cited = (r.perQuery ?? []).filter((q) => q.cited);
  if (cited.length > 0) {
    lines.push('**有引用潤讀的題目**：');
    lines.push('');
    for (const q of cited) {
      const pages = q.ownSources.map((s) => s.title || s.uri).filter(Boolean);
      lines.push(`- ${escapeCell(q.query)}${pages.length ? `（${escapeCell([...new Set(pages)].join('、'))}）` : ''}`);
    }
    lines.push('');
  }

  const top = topCompetitorDomains(r.perQuery, { limit: 8 });
  if (top.length > 0) {
    lines.push('**Gemini 最常拿來當依據的其他網域**（出現題數）：' + top.map(([d, n]) => `${escapeCell(d)}（${n}）`).join('、'));
    lines.push('');
  }

  if (Array.isArray(r.errors) && r.errors.length > 0) {
    lines.push(`_註：${r.errors.length} 題呼叫失敗未計入統計，詳見資料庫 CitationBatchJob.resultsJson。_`);
    lines.push('');
  }
  return lines;
}

function renderLegacy(job, r) {
  const lines = [];
  lines.push('## 🤖 GEO：AI 知識能見度');
  lines.push('');
  lines.push(
    '> 本節量的是 Gemini 模型「既有知識」裡是否已經提及潤讀（Batch API、**不帶即時搜尋**），' +
      '不是 AI 即時檢索並引用潤讀網頁後的引用率。'
  );
  lines.push('');
  lines.push(
    `資料來源：${job.completedAt.toISOString().slice(0, 10)} 完成的批次（batch job ${job.batchJobId}）` +
      (r.model ? `・模型：${r.model}` : '')
  );
  lines.push('');
  lines.push(
    `**整體提及率**：${r.mentionedCount}/${r.answeredCount} 題（${fmtPct(r.mentionedCount, r.answeredCount)}）` +
      (r.answeredCount < r.totalQueries ? `・另有 ${r.totalQueries - r.answeredCount} 題無回應` : '')
  );
  lines.push('');
  const clusters = Object.entries(r.byCluster ?? {});
  if (clusters.length > 0) {
    lines.push('| 主題分群 | 提及率 |');
    lines.push('|---|--:|');
    for (const [cluster, stat] of clusters) {
      lines.push(`| ${cluster} | ${stat.mentioned}/${stat.total}（${fmtPct(stat.mentioned, stat.total)}） |`);
    }
    lines.push('');
  }
  if (Array.isArray(r.parseErrors) && r.parseErrors.length > 0) {
    lines.push(`_註：${r.parseErrors.length} 題因回應解析失敗未計入統計，詳見資料庫 CitationBatchJob.resultsJson。_`);
    lines.push('');
  }
  return lines;
}

/**
 * @param {{resultsJson: object, completedAt: Date, batchJobId: string}} job 已完成的 CitationBatchJob
 * @returns {string[]} 要接在週報 Markdown 後面的行陣列
 */
export function renderGeoSection(job) {
  const r = job.resultsJson ?? {};
  return r.method === 'grounded' ? renderGrounded(job, r) : renderLegacy(job, r);
}
