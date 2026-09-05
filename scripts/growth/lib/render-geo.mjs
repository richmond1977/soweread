// GEO（Generative Engine Optimization）章節渲染：把最新一筆已完成的
// CitationBatchJob.resultsJson 轉成週報裡的一段 Markdown。
//
// 重要：這裡量的是 Gemini Batch API（不帶 google_search grounding）回答時，
// 模型既有知識裡有沒有提及潤讀——不是「AI 引擎引用追蹤」那種暗示即時搜尋
// grounding 的字面說法。章節開頭固定放一句免責聲明，理由見
// docs/growth-weekly-report-migration.md 第 2 節。
//
// 若沒有已完成的 job，呼叫端（analyze.mjs）就整段不放這個章節——不渲染空章節。

function fmtPct(n, d) {
  if (!d) return '—';
  return `${((n / d) * 100).toFixed(1)}%`;
}

/**
 * @param {{resultsJson: object, completedAt: Date, batchJobId: string}} job 已完成的 CitationBatchJob
 * @returns {string[]} 要接在週報 Markdown 後面的行陣列
 */
export function renderGeoSection(job) {
  const r = job.resultsJson;
  const lines = [];

  lines.push('## 🤖 GEO：AI 知識能見度');
  lines.push('');
  lines.push(
    '> 本節量的是 Gemini 模型「既有知識」裡是否已經提及潤讀，方法是用 Batch API 送出一批問題、' +
      '**不帶即時搜尋（google_search grounding）工具**，只看模型憑訓練資料直接回答的內容——' +
      '不是使用者在 Google AI Overview 或 ChatGPT 搜尋模式下，AI 即時檢索並引用潤讀網頁後的引用率。' +
      '兩者是不同的量測對象，這裡呈現的數字偏保守，僅供追蹤品牌在模型參數化知識中滲透的長期趨勢。'
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
