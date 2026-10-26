import { buildBaseline, isCalendarDate } from './experiments.mjs';

export function preChangeRange(changedAt) {
  if (!isCalendarDate(changedAt)) throw new Error('changedAt 必須是有效的 YYYY-MM-DD');
  const date = new Date(`${changedAt}T00:00:00Z`);
  const offset = (days) => new Date(date.getTime() + days * 86400000).toISOString().slice(0, 10);
  return { startDate: offset(-28), endDate: offset(-1) };
}

// final 資料仍有發布延遲；今日登記改版不能把尚未完整的昨天當作基準末日。
// 沿用 ingest 的三日緩衝，以 GSC 的 PT 日曆日計算，並如實記錄實際28日範圍。
export function gscCalendarDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function availablePreChangeRange(changedAt, now = new Date()) {
  const requested = preChangeRange(changedAt);
  const today = gscCalendarDate(now);
  if (changedAt > today) throw new Error('改版日期不能晚於目前 GSC PT 日曆日');
  const finalCutoff = new Date(new Date(`${today}T00:00:00Z`).getTime() - 3 * 86400000).toISOString().slice(0, 10);
  const endDate = requested.endDate < finalCutoff ? requested.endDate : finalCutoff;
  return { startDate: new Date(new Date(`${endDate}T00:00:00Z`).getTime() - 27 * 86400000).toISOString().slice(0, 10), endDate };
}

export function needsBaselineRepair(experiment) {
  const baseline = experiment.baselineJson;
  return experiment.status === 'running' && Boolean(baseline &&
    (baseline.includesPostChange || (isCalendarDate(baseline.endDate) && baseline.endDate >= experiment.changedAt)));
}

// Exact page/query filters avoid a site-wide top-row limit hiding the requested data.
// Empty responses remain absent metrics; malformed responses fail closed.
export async function fetchBaselineSnapshot(site, page, queries, changedAt, post, now = new Date()) {
  const range = availablePreChangeRange(changedAt, now);
  const pageUrl = new URL(page, site.domain).href;
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site.gscSiteUrl)}/searchAnalytics/query`;
  async function query(queryText) {
    const filters = [{ dimension: 'page', operator: 'equals', expression: pageUrl }];
    if (queryText !== undefined) filters.push({ dimension: 'query', operator: 'equals', expression: queryText });
    const dimensions = queryText === undefined ? ['page'] : ['query', 'page'];
    const data = await post(url, { ...range, dimensions, type: 'web', aggregationType: 'auto', dimensionFilterGroups: [{ groupType: 'and', filters }], rowLimit: 2, dataState: 'final' });
    if (!data || typeof data !== 'object' || Array.isArray(data) || (data.rows !== undefined && !Array.isArray(data.rows))) throw new Error('GSC 回應格式無效');
    const rows = data.rows ?? [];
    if (rows.length > 1) throw new Error('GSC exact filter 回傳多列，拒絕不明基準');
    return rows.map((row) => {
      if (!Array.isArray(row.keys) || dimensions.some((dim, index) => typeof row.keys[index] !== 'string') ||
        ['clicks', 'impressions', 'ctr', 'position'].some((key) => typeof row[key] !== 'number' || !Number.isFinite(row[key]) || row[key] < 0) || row.ctr > 1) {
        throw new Error('GSC 指標或維度缺漏，拒絕以零值取代');
      }
      const expectedKeys = queryText === undefined ? [pageUrl] : [queryText, pageUrl];
      if (row.keys.length !== expectedKeys.length || expectedKeys.some((key, index) => row.keys[index] !== key)) {
        throw new Error('GSC 回應維度不符 exact filter，拒絕不明基準');
      }
      return { ...Object.fromEntries(dimensions.map((dim, index) => [dim, row.keys[index]])),
        clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position };
    });
  }
  const byPage = await query();
  const byQueryPage = [];
  for (const text of queries) byQueryPage.push(...await query(text));
  return { ...range, rawRows: { byPage, byQueryPage } };
}

export function repairedBaseline(experiment, snapshot, repairedAt = new Date().toISOString()) {
  preChangeRange(experiment.changedAt);
  if (!isCalendarDate(snapshot.startDate) || !isCalendarDate(snapshot.endDate) ||
      snapshot.endDate >= experiment.changedAt ||
      (new Date(snapshot.endDate) - new Date(snapshot.startDate)) / 86400000 !== 27) throw new Error('修復期間不符完整改版前 28 日');
  return { ...buildBaseline(experiment.page, experiment.queriesJson, snapshot),
    repairProvenance: { version: 1, repairedAt, source: 'GSC Search Analytics final; exact page/query filters',
      changedAt: experiment.changedAt, finalityPolicy: 'GSC final; 3-day PT publication buffer',
      originalBaseline: experiment.baselineJson?.repairProvenance?.originalBaseline ?? experiment.baselineJson } };
}

export async function applyBaselineRepair(prisma, experiment, baseline) {
  const result = await prisma.experiment.updateMany({
    where: { id: experiment.id, status: 'running', changedAt: experiment.changedAt,
      page: experiment.page, site: experiment.site, queriesJson: { equals: experiment.queriesJson },
      baselineJson: { equals: experiment.baselineJson } },
    data: { baselineJson: baseline },
  });
  if (result.count !== 1) throw new Error(`${experiment.id} 同時更新或已停止，未覆寫基準`);
}
