// 改版成效追蹤（純規則，不用 AI）：從 GrowthSnapshot 擷取改版前基準，之後與最新快照比對前後差值。
// 只做「量測與比對」，不做「這次改版算不算成功」的判斷——結果好壞由人（Richmond）決定。
//
// 移植自 WISECODE_Website scripts/growth/lib/experiments.mjs（2026-09-24）。差異：
//   - WISECODE 的快照是單站 JSON 檔，欄位是 snapshot.period／snapshot.byPage；
//     SOWEREAD 是多站 Prisma GrowthSnapshot，欄位是 snapshot.startDate／
//     snapshot.endDate／snapshot.rawRows.byPage，因此這裡的 snapshot 參數一律
//     指 { startDate, endDate, rawRows }（Prisma row 本身或等價的 plain object）。
//   - 一筆改版紀錄多綁一個 site（growth／primary），因為 SOWEREAD 兩站的 GSC
//     資料分開存，同一個 page 路徑理論上不會跨站撞名，但比對時仍須指定 site
//     避免抓錯站的快照。
//
// 資料結構（Experiment 資料列，見 prisma/schema.prisma 的 Experiment model）：
//   { id, site, page, queries[], change, hypothesis, changedAt, reviewAfterDays,
//     baseline: { snapshotDate, startDate, endDate, page:{clicks,impressions,ctr,position}|null,
//                 queries: [{query, clicks,impressions,ctr,position}|{query, missing:true}], empty? },
//     status, decision, decidedAt }
//
// 這裡全是純函式，不做檔案 I/O／不連 Prisma，方便單元測試；I/O 留給 experiment.mjs（CLI）。

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(fromISODate, toISODate) {
  const from = new Date(`${fromISODate}T00:00:00Z`).getTime();
  const to = new Date(`${toISODate}T00:00:00Z`).getTime();
  return Math.round((to - from) / MS_PER_DAY);
}

function todayISODate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

/**
 * 到期判斷：today >= changedAt + reviewAfterDays 天。
 * @param {{changedAt:string, reviewAfterDays:number}} experiment
 * @param {string} [today] YYYY-MM-DD，預設今天（UTC）
 * @returns {boolean}
 */
export function isDue(experiment, today = todayISODate()) {
  const elapsed = daysBetween(experiment.changedAt, today);
  return elapsed >= experiment.reviewAfterDays;
}

/**
 * 可比較條件：最新快照的 startDate 必須 >= experiment.changedAt，
 * 否則快照涵蓋的期間還在改版之前，比較沒有意義。
 * @param {{changedAt:string}} experiment
 * @param {{startDate:string,endDate:string}|null} latestSnapshot
 * @returns {{ok:boolean, reason?:string}}
 */
export function canCompare(experiment, latestSnapshot) {
  if (!latestSnapshot) {
    return { ok: false, reason: '沒有可用的 GSC 快照' };
  }
  if (!latestSnapshot.startDate) {
    return { ok: false, reason: '快照缺少期間資訊' };
  }
  if (latestSnapshot.startDate < experiment.changedAt) {
    return { ok: false, reason: '資料尚未涵蓋改版後期間' };
  }
  return { ok: true };
}

function pagePathOf(url) {
  return typeof url === 'string' ? url.replace(/^https?:\/\/[^/]+/, '') || '/' : url;
}

function findPageRow(rawRows, page) {
  const rows = rawRows.byPage ?? [];
  return (
    rows.find((r) => r.page === page) ??
    rows.find((r) => pagePathOf(r.page) === pagePathOf(page)) ??
    null
  );
}

function findQueryPageRow(rawRows, page, query) {
  const rows = rawRows.byQueryPage ?? [];
  return (
    rows.find((r) => r.query === query && r.page === page) ??
    rows.find((r) => r.query === query && pagePathOf(r.page) === pagePathOf(page)) ??
    null
  );
}

function metricsOf(row) {
  if (!row) return null;
  return { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position };
}

/**
 * 從快照擷取 page/queries 層級指標，組成 baseline 結構。
 * page 在快照 rawRows.byPage 完全找不到時回傳 { empty:true, ... }，呼叫端決定是否允許建立
 * （對應 CLI 的 --allow-empty-baseline）。
 *
 * @param {string} page
 * @param {string[]} queries
 * @param {{startDate:string, endDate:string, rawRows:{byPage:Array, byQueryPage:Array}}} snapshot
 * @param {string} [snapshotDate] 快照對應日期，未提供時取 snapshot.endDate
 * @returns {object}
 */
export function buildBaseline(page, queries, snapshot, snapshotDate) {
  const { rawRows } = snapshot;
  const pageRow = findPageRow(rawRows, page);
  const pageMetrics = metricsOf(pageRow);

  const queryRows = (queries ?? []).map((q) => {
    const row = findQueryPageRow(rawRows, page, q);
    if (!row) return { query: q, missing: true };
    return { query: q, ...metricsOf(row) };
  });

  const baseline = {
    snapshotDate: snapshotDate ?? snapshot.endDate ?? null,
    startDate: snapshot.startDate ?? null,
    endDate: snapshot.endDate ?? null,
    page: pageMetrics,
    queries: queryRows,
  };

  if (!pageMetrics) {
    return { ...baseline, empty: true };
  }
  return baseline;
}

function delta(before, after) {
  if (before === null || before === undefined || after === null || after === undefined) return null;
  return after - before;
}

function comparePair(beforeMetrics, afterMetrics) {
  if (!beforeMetrics || !afterMetrics) return null;
  return {
    before: beforeMetrics,
    after: afterMetrics,
    delta: {
      clicks: delta(beforeMetrics.clicks, afterMetrics.clicks),
      impressions: delta(beforeMetrics.impressions, afterMetrics.impressions),
      ctr: delta(beforeMetrics.ctr, afterMetrics.ctr),
      position: delta(beforeMetrics.position, afterMetrics.position),
    },
  };
}

/**
 * 回傳 page 與各 query 的前後差值。先過 canCompare 檢查，不可比較時回傳對應狀態不強算。
 * @param {object} experiment 含 baseline、page、queries
 * @param {{startDate:string,endDate:string,rawRows:object}|null} latestSnapshot
 * @returns {{ok:boolean, reason?:string, page?:object|null, queries?:Array}}
 */
export function compareExperiment(experiment, latestSnapshot) {
  const check = canCompare(experiment, latestSnapshot);
  if (!check.ok) return { ok: false, reason: check.reason };

  const { baseline, page, queries } = experiment;
  const rawRows = latestSnapshot.rawRows;

  const afterPageRow = findPageRow(rawRows, page);
  const afterPageMetrics = metricsOf(afterPageRow);
  const pageComparison = baseline.page && afterPageMetrics ? comparePair(baseline.page, afterPageMetrics) : null;

  const queryComparisons = (queries ?? []).map((q) => {
    const baselineRow = (baseline.queries ?? []).find((r) => r.query === q);
    const afterRow = findQueryPageRow(rawRows, page, q);
    const afterMetrics = metricsOf(afterRow);
    if (!baselineRow || baselineRow.missing || !afterMetrics) {
      return {
        query: q,
        comparable: false,
        reason: !baselineRow || baselineRow.missing ? '改版前無此詞資料' : '改版後尚無此詞資料',
      };
    }
    const cmp = comparePair(
      { clicks: baselineRow.clicks, impressions: baselineRow.impressions, ctr: baselineRow.ctr, position: baselineRow.position },
      afterMetrics
    );
    return { query: q, comparable: true, ...cmp };
  });

  return {
    ok: true,
    page: pageComparison ? { comparable: true, ...pageComparison } : { comparable: false, reason: baseline.empty ? '改版前無此頁資料' : '改版後尚無此頁資料' },
    queries: queryComparisons,
  };
}
