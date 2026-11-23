import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyAnswer, summarizeCitations, sourceDomain, topCompetitorDomains } from './geo-citations.mjs';

const BRAND = ['潤讀', 'so we read', 'soweread'];
const REDIRECT = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc';

test('classifyAnswer：轉址連結靠 title 認出自家子網域 → cited', () => {
  const c = classifyAnswer(
    { text: 'MRL 是農藥殘留容許量。', sources: [{ uri: REDIRECT, title: 'knowledge.soweread.com' }, { uri: REDIRECT, title: 'fda.gov.tw' }] },
    { brandTerms: BRAND }
  );
  assert.equal(c.cited, true);
  assert.equal(c.mentioned, false);
  assert.deepEqual(c.sourceDomains, ['knowledge.soweread.com', 'fda.gov.tw']);
});

test('classifyAnswer：文字點名品牌但來源沒有 → mentioned 不 cited', () => {
  const c = classifyAnswer({ text: '根據潤讀的整理…', sources: [{ uri: 'https://www.fda.gov.tw/x', title: '食藥署' }] }, { brandTerms: BRAND });
  assert.equal(c.cited, false);
  assert.equal(c.mentioned, true);
  assert.deepEqual(c.sourceDomains, ['fda.gov.tw']);
});

test('classifyAnswer：不把 notsoweread.com 這類網域誤判成自家', () => {
  const c = classifyAnswer({ text: 'x', sources: [{ uri: REDIRECT, title: 'notsoweread.com' }] }, { brandTerms: [] });
  assert.equal(c.cited, false);
});

test('classifyAnswer：錯誤回應不算作答', () => {
  const c = classifyAnswer({ error: 'HTTP 429' }, { brandTerms: BRAND });
  assert.deepEqual(c, { answered: false, cited: false, mentioned: false, ownSources: [], sourceDomains: [] });
});

test('sourceDomain：真實主機去掉 www，轉址連結退回 title', () => {
  assert.equal(sourceDomain({ uri: 'https://www.mohw.gov.tw/a', title: '衛福部' }), 'mohw.gov.tw');
  assert.equal(sourceDomain({ uri: REDIRECT, title: 'www.Example.com' }), 'example.com');
});

test('summarizeCitations：分群彙總、錯誤另列、缺回應記為未作答', () => {
  const queries = [
    { id: 'a', cluster: 'X', query: 'qa' },
    { id: 'b', cluster: 'X', query: 'qb' },
    { id: 'c', cluster: 'Y', query: 'qc' },
  ];
  const results = [
    { key: 'a', text: 't', sources: [{ uri: REDIRECT, title: 'soweread.com' }] },
    { key: 'b', error: 'HTTP 500' },
  ];
  const s = summarizeCitations(queries, results, { model: 'm', brandTerms: BRAND });
  assert.equal(s.totalQueries, 3);
  assert.equal(s.answeredCount, 1);
  assert.equal(s.citedCount, 1);
  assert.deepEqual(s.byCluster.X, { total: 2, answered: 1, cited: 1, mentioned: 0 });
  assert.deepEqual(s.byCluster.Y, { total: 1, answered: 0, cited: 0, mentioned: 0 });
  assert.deepEqual(s.errors.map((e) => e.id), ['b', 'c']);
});

test('topCompetitorDomains：排除自家，依出現題數排序', () => {
  const top = topCompetitorDomains([
    { sourceDomains: ['fda.gov.tw', 'soweread.com'] },
    { sourceDomains: ['fda.gov.tw', 'wikipedia.org'] },
  ]);
  assert.deepEqual(top, [['fda.gov.tw', 2], ['wikipedia.org', 1]]);
});

test('renderGeoSection：grounded 格式列出引用率、引用題目與其他網域', async () => {
  const { renderGeoSection } = await import('./render-geo.mjs');
  const queries = [{ id: 'a', cluster: 'X', query: 'MRL 是什麼？' }, { id: 'b', cluster: 'X', query: 'qb' }];
  const resultsJson = summarizeCitations(
    queries,
    [
      { key: 'a', text: 't', sources: [{ uri: REDIRECT, title: 'knowledge.soweread.com' }, { uri: REDIRECT, title: 'fda.gov.tw' }] },
      { key: 'b', text: 't', sources: [{ uri: REDIRECT, title: 'fda.gov.tw' }] },
    ],
    { model: 'gemini-x', brandTerms: BRAND }
  );
  const md = renderGeoSection({ resultsJson, completedAt: new Date('2026-11-23T00:00:00Z'), batchJobId: 'sync-1' }).join('\n');
  assert.match(md, /AI 引用能見度/);
  assert.match(md, /\*\*引用率\*\*：1\/2 題（50\.0%）/);
  assert.match(md, /- MRL 是什麼？（knowledge\.soweread\.com）/);
  assert.match(md, /fda\.gov\.tw（2）/);
});

test('renderGeoSection：舊 Batch 格式仍可渲染', async () => {
  const { renderGeoSection } = await import('./render-geo.mjs');
  const md = renderGeoSection({
    resultsJson: { model: 'm', totalQueries: 2, answeredCount: 2, mentionedCount: 1, byCluster: { X: { mentioned: 1, total: 2 } } },
    completedAt: new Date('2026-09-01T00:00:00Z'),
    batchJobId: 'batches/1',
  }).join('\n');
  assert.match(md, /AI 知識能見度/);
  assert.match(md, /1\/2 題（50\.0%）/);
});
