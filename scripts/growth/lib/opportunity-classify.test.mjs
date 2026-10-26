import test from 'node:test';
import assert from 'node:assert/strict';
import { classify } from './opportunity-classify.mjs';

const config = {
  minImpressions: 10, brandTerms: ['soweread'],
  strikingMinPosition: 3.5, strikingMaxPosition: 20, ctrGapMaxPosition: 5.5,
  ctrBenchmarkByPosition: { curve: [{ maxPosition: 5.5, ctr: 0.1 }, { maxPosition: 100, ctr: 0.01 }] },
};
const queryRow = (query, overrides = {}) => ({ query, clicks: 0, impressions: 100, ctr: 0, position: 8.66, ...overrides });

test('main landing page follows impressions while query and page metrics remain separate', () => {
  const rawRows = {
    byQuery: [queryRow('豐富化籠飼')],
    byQueryPage: [
      { query: '豐富化籠飼', page: '/article', clicks: 0, impressions: 8, ctr: 0, position: 8.5 },
      { query: '豐富化籠飼', page: '/entity', clicks: 0, impressions: 92, ctr: 0, position: 8.6739 },
    ],
  };
  const original = structuredClone(rawRows);
  const [row] = classify(rawRows, config).striking;
  assert.equal(row.page, '/entity');
  assert.equal(row.impressions, 100);
  assert.equal(row.position, 8.66);
  assert.deepEqual(row.landingPages, [
    { page: '/entity', clicks: 0, impressions: 92, ctr: 0, position: 8.6739 },
    { page: '/article', clicks: 0, impressions: 8, ctr: 0, position: 8.5 },
  ]);
  assert.deepEqual(rawRows, original);
});

test('page sorting uses clicks, rank and URL for deterministic ties without input mutation', () => {
  const pages = [
    { page: '/z', clicks: 1, position: 5 },
    { page: '/a', clicks: 1, position: 5 },
    { page: '/rank', clicks: 1, position: 4 },
    { page: '/clicks', clicks: 2, position: 10 },
  ].map((row) => ({ query: 'topic', impressions: 20, ctr: row.clicks / 20, ...row }));
  const original = structuredClone(pages);
  const run = (rows) => classify({ byQuery: [queryRow('topic')], byQueryPage: rows }, config).striking[0];
  assert.deepEqual(run(pages).landingPages.map((row) => row.page), ['/clicks', '/rank', '/a', '/z']);
  assert.deepEqual(run(pages).landingPages, run([...pages].reverse()).landingPages);
  assert.deepEqual(pages, original);
});

test('missing page rows produce null main page and empty landingPages without replacing query totals', () => {
  const [row] = classify({ byQuery: [queryRow('topic')], byQueryPage: [] }, config).striking;
  assert.equal(row.page, null);
  assert.deepEqual(row.landingPages, []);
  assert.equal(row.impressions, 100);
});

test('low CTR at overlapping ranks appears in both candidate lists with independent fields', () => {
  for (const position of [4, 5, 5.5]) {
    const result = classify({ byQuery: [queryRow('topic', { position })], byQueryPage: [] }, config);
    assert.equal(result.striking.length, 1);
    assert.equal(result.ctrGap.length, 1);
    assert.equal(result.ctrGap[0].expectedCtr, 0.1);
    assert.equal(result.ctrGap[0].missedClicks, 10);
    assert.equal(result.striking[0].expectedCtr, undefined);
    assert.equal(result.ctrGap[0].opportunity, undefined);
    assert.equal(result.content.length, 0);
  }
});

test('brand, noise and low-impression filters still apply across all candidate lists', () => {
  const byQuery = ['SOWEREAD topic', 'topic -site:example.com', 'site:example.com topic', 'inurl:topic', 'filetype:pdf topic']
    .map((query) => queryRow(query, { position: 4 }));
  byQuery.push(queryRow('small', { impressions: 9, position: 4 }));
  assert.deepEqual(classify({ byQuery, byQueryPage: [] }, config), { striking: [], ctrGap: [], content: [] });
});
