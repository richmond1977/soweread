import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderReport } from '../analyze.mjs';
import { classify } from './opportunity-classify.mjs';

test('weekly report separates query/page metrics, limits empty signals, and blocks polluted baseline', () => {
  const config = JSON.parse(readFileSync(new URL('../../../config/growth.json', import.meta.url), 'utf8'));
  const rawRows = { byQuery: [{ query: '豐富化籠飼', impressions: 100, clicks: 0, ctr: 0, position: 8.66 }], byQueryPage: [
    { query: '豐富化籠飼', page: 'https://example.com/articles/eggs', impressions: 8, clicks: 0, ctr: 0, position: 8.5 },
    { query: '豐富化籠飼', page: 'https://example.com/entities/enriched-cage', impressions: 92, clicks: 0, ctr: 0, position: 8.67 },
  ] };
  const experiment = { id: 'synthetic', site: 'growth', page: '/articles/eggs', changedAt: '2000-01-05', reviewAfterDays: 1,
    change: 'synthetic', hypothesis: 'synthetic', queriesJson: [], status: 'running',
    baselineJson: { startDate: '1999-12-10', endDate: '2000-01-06', includesPostChange: true } };
  const report = renderReport([{ site: { site: 'growth', label: '測試站', domain: 'https://example.com' },
    snapshot: { startDate: '2026-09-26', endDate: '2026-10-23', rawRows }, result: classify(rawRows, config),
    signals: { declines: [], cannibals: [], hasPrevSnapshot: false, experiments: [experiment] } }], [], config, null);
  assert.match(report, /全站區間總量：UNKNOWN/);
  assert.match(report, /entities\/enriched-cage（92 曝光/);
  assert.match(report, /articles\/eggs（8 曝光/);
  assert.match(report, /基準污染/);
  assert.doesNotMatch(report, /\| page \| clicks/);
  assert.match(report, /未發現達門檻候選/);
  assert.match(report, /至少兩個頁面各達 10 次曝光/);
  assert.match(report, /GEO AI 知識能見度：UNKNOWN/);
  assert.doesNotMatch(report, /投報最高|即可能進前三|損失點擊/);
});

test('unknown property totals never turn query subtotal into a site-wide low-data claim', () => {
  const config = JSON.parse(readFileSync(new URL('../../../config/growth.json', import.meta.url), 'utf8'));
  const report = renderReport([{ site: { site: 'growth', label: '測試站', domain: 'https://example.com' },
    snapshot: { startDate: '2026-09-26', endDate: '2026-10-23', rawRows: { byQuery: [] },
      coverage: { sitemapUrlCount: 1, summary: { total: 1, errored: 0, indexed: 1, notIndexed: 0, byState: {}, notIndexedUrls: [] } } },
    result: { striking: [], ctrGap: [], content: [] }, signals: { declines: [], cannibals: [], experiments: [], hasPrevSnapshot: false } }], [], config, null);
  assert.match(report, /全站區間總量：UNKNOWN/);
  assert.doesNotMatch(report, /本區間總曝光僅|三層機會分析必然全空/);
});
