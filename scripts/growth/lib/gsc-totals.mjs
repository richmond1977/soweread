import { googlePost } from './google-auth.mjs';

// 無維度、byProperty 的獨立統計，不能由 query/page rows 相加替代。
export async function fetchPropertyTotals(gscSiteUrl, range, request = googlePost) {
  const data = await request(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(gscSiteUrl)}/searchAnalytics/query`,
    { ...range, dimensions: [], type: 'web', aggregationType: 'byProperty', rowLimit: 1, dataState: 'final' }
  );
  const provenance = { ...range, aggregationType: 'byProperty', dataState: 'final', searchType: 'web', fetchedAt: new Date().toISOString() };
  if (!data.rows?.length) return { ...provenance, status: 'UNKNOWN', reason: 'GSC 未回傳全站統計資料' };
  const row = data.rows[0];
  if (data.responseAggregationType !== 'byProperty' || data.rows.length !== 1 ||
      !['clicks', 'impressions', 'ctr', 'position'].every(k => Number.isFinite(row[k]) && row[k] >= 0) || row.ctr > 1) {
    throw new Error('GSC 全站統計的聚合方式或指標不符預期');
  }
  return { ...provenance, status: 'OBSERVED', clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position };
}
