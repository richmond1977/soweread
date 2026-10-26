import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchPropertyTotals } from './gsc-totals.mjs';
import { renderOverview, renderLandingPages, verifiedPropertyTotals } from './report-metrics.mjs';

const range = { startDate: '2026-09-26', endDate: '2026-10-23' };
const metrics = { clicks: 5, impressions: 400, ctr: 0.0125, position: 7 };
test('property totals come from an unfiltered dimensionless final query', async () => {
  const totals = await fetchPropertyTotals('https://example.org/', range, async (url, body) => {
    assert.ok(url.includes(encodeURIComponent('https://example.org/')));
    assert.deepEqual(body, { ...range, dimensions: [], type: 'web', aggregationType: 'byProperty', rowLimit: 1, dataState: 'final' });
    return { rows: [metrics], responseAggregationType: 'byProperty' };
  });
  const snapshot = { ...range, rawRows: { propertyTotals: totals, byQuery: [{ clicks: 4, impressions: 297 }] } };
  const report = renderOverview(snapshot).join('\n');
  assert.match(report, /400 次曝光、5 次點擊/);
  assert.match(report, /297 次曝光、4 次點擊/);
  assert.equal(verifiedPropertyTotals({ ...snapshot, endDate: '2026-10-24' }), null);
});
test('old snapshots show query subtotal and UNKNOWN rather than invented site totals', () => {
  const report = renderOverview({ ...range, rawRows: { byQuery: [{ clicks: 4, impressions: 297 }], byPage: [{ clicks: 50, impressions: 999 }] } }).join('\n');
  assert.match(report, /全站區間總量：UNKNOWN/);
  assert.match(report, /已取得搜尋詞資料小計/);
  assert.doesNotMatch(report, /999/);
});
test('empty responses remain UNKNOWN and invalid aggregation fails', async () => {
  const empty = await fetchPropertyTotals('x', range, async () => ({}));
  assert.equal(empty.status, 'UNKNOWN');
  assert.equal(empty.impressions, undefined);
  await assert.rejects(fetchPropertyTotals('x', range, async () => ({ rows: [metrics], responseAggregationType: 'byPage' })), /聚合/);
  const zero = await fetchPropertyTotals('x', range, async () => ({ rows: [{ clicks: 0, impressions: 0, ctr: 0, position: 0 }], responseAggregationType: 'byProperty' }));
  assert.equal(zero.status, 'OBSERVED');
});
test('each landing page displays its own metrics and escapes table delimiters', () => {
  const rendered = renderLandingPages({ landingPages: [{ page: 'https://x/entities/enriched-cage', impressions: 92, clicks: 0, position: 8.67 }, { page: 'https://x/articles/a|b', impressions: 8, clicks: 0, position: 8.5 }] });
  assert.match(rendered, /enriched-cage（92 曝光/);
  assert.match(rendered, /a\\\|b（8 曝光/);
  assert.doesNotMatch(rendered, /100 曝光/);
  assert.match(renderLandingPages({}), /UNKNOWN/);
});
