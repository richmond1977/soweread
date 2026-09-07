import test from 'node:test';
import assert from 'node:assert/strict';

import { parseSitemapUrls, summarizeCoverage, renderCoverageSection } from './coverage.mjs';

const URLSET = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://soweread.vercel.app</loc><priority>1</priority></url>
<url><loc>https://soweread.vercel.app/topics</loc></url>
<url>
<loc>
  https://soweread.vercel.app/topics/food-labeling
</loc>
</url>
</urlset>`;

const SITEMAP_INDEX = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>https://soweread.com/wp-sitemap-posts-post-1.xml</loc></sitemap>
<sitemap><loc>https://soweread.com/wp-sitemap-taxonomies-category-1.xml</loc></sitemap>
</sitemapindex>`;

test('parseSitemapUrls 解析 urlset，並吃掉 loc 前後空白', () => {
  const { urls, sitemaps } = parseSitemapUrls(URLSET);
  assert.deepEqual(urls, [
    'https://soweread.vercel.app',
    'https://soweread.vercel.app/topics',
    'https://soweread.vercel.app/topics/food-labeling',
  ]);
  assert.deepEqual(sitemaps, []);
});

test('parseSitemapUrls 把 sitemapindex 的 loc 當成子 sitemap，不當成頁面', () => {
  const { urls, sitemaps } = parseSitemapUrls(SITEMAP_INDEX);
  assert.deepEqual(urls, []);
  assert.equal(sitemaps.length, 2);
  assert.ok(sitemaps[0].endsWith('wp-sitemap-posts-post-1.xml'));
});

test('parseSitemapUrls 解 XML 實體，且對非 sitemap 內容回傳空陣列', () => {
  const { urls } = parseSitemapUrls('<urlset><url><loc>https://a.test/?a=1&amp;b=2</loc></url></urlset>');
  assert.deepEqual(urls, ['https://a.test/?a=1&b=2']);

  const empty = parseSitemapUrls('<html><body>404 Not Found</body></html>');
  assert.deepEqual(empty, { urls: [], sitemaps: [] });
});

test('summarizeCoverage 只把 verdict=PASS 算成已收錄，其餘進未收錄清單', () => {
  const s = summarizeCoverage([
    { url: 'https://a.test/', verdict: 'PASS', coverageState: 'Submitted and indexed', lastCrawlTime: '2026-09-01T00:00:00Z' },
    { url: 'https://a.test/x', verdict: 'NEUTRAL', coverageState: 'Discovered - currently not indexed' },
    { url: 'https://a.test/y', verdict: 'FAIL', coverageState: 'Crawled - currently not indexed', lastCrawlTime: '2026-09-05T00:00:00Z' },
  ]);

  assert.equal(s.total, 3);
  assert.equal(s.indexed, 1);
  assert.equal(s.notIndexed, 2);
  assert.equal(s.errored, 0);
  assert.deepEqual(s.notIndexedUrls.map((r) => r.url), ['https://a.test/x', 'https://a.test/y']);
  assert.equal(s.byState['Crawled - currently not indexed'], 1);
  // 取最新的一次抓取時間，不是第一筆
  assert.equal(s.lastCrawlTime, '2026-09-05T00:00:00Z');
});

test('summarizeCoverage 把失敗的查詢排除在收錄率分母外', () => {
  const s = summarizeCoverage([
    { url: 'https://a.test/', verdict: 'PASS', coverageState: 'Submitted and indexed' },
    { url: 'https://a.test/x', error: '403 permission denied' },
  ]);

  assert.equal(s.total, 2);
  assert.equal(s.errored, 1);
  assert.equal(s.indexed, 1);
  // 失敗的那筆既不算已收錄、也不算未收錄
  assert.equal(s.notIndexed, 0);
  assert.deepEqual(s.notIndexedUrls, []);
  assert.equal(s.lastCrawlTime, null);
});

test('summarizeCoverage 對空輸入不炸，回傳全零', () => {
  const s = summarizeCoverage([]);
  assert.deepEqual(
    { total: s.total, indexed: s.indexed, notIndexed: s.notIndexed, errored: s.errored, lastCrawlTime: s.lastCrawlTime },
    { total: 0, indexed: 0, notIndexed: 0, errored: 0, lastCrawlTime: null }
  );
});

// 兩種典型情境：資料不足（曝光未達門檻且三層全空）與資料充足。
const STARVED = { impressions: 1, minImpressions: 8, opportunityCount: 0 };
const FULL_DATA = { impressions: 120, minImpressions: 8, opportunityCount: 3 };

function coverageFixture() {
  return {
    checkedAt: '2026-09-07T08:00:00.000Z',
    sitemapUrlCount: 23,
    truncated: false,
    summary: summarizeCoverage([
      { url: 'https://soweread.vercel.app/', verdict: 'PASS', coverageState: 'Submitted and indexed', lastCrawlTime: '2026-09-03T00:00:00Z' },
      { url: 'https://soweread.vercel.app/topics', verdict: 'NEUTRAL', coverageState: 'Discovered - currently not indexed' },
    ]),
  };
}

test('renderCoverageSection 列出收錄率、狀態分佈與未收錄頁面', () => {
  const md = renderCoverageSection(coverageFixture(), FULL_DATA).join('\n');

  assert.match(md, /收錄進度/);
  assert.match(md, /sitemap 宣告 23 個 URL/);
  assert.match(md, /已收錄 1 個（50%）/);
  assert.match(md, /Discovered - currently not indexed/);
  assert.match(md, /最近一次被 Google 抓取：2026-09-03/);
  // 資料充足時不加那句提醒
  assert.doesNotMatch(md, /總曝光僅/);
});

test('renderCoverageSection 在資料不足時提醒三層分析必然全空', () => {
  const md = renderCoverageSection(coverageFixture(), STARVED).join('\n');
  assert.match(md, /本區間總曝光僅 1 次（未達單一搜尋詞門檻 8 次）/);
  assert.match(md, /不是沒有機會/);
});

test('renderCoverageSection 在三層分析有產出時不提醒，即使曝光低於門檻', () => {
  const md = renderCoverageSection(coverageFixture(), { ...STARVED, opportunityCount: 2 }).join('\n');
  assert.doesNotMatch(md, /總曝光僅/);
});

test('renderCoverageSection 在曝光已過門檻但三層全空時不提醒（那是真的沒機會）', () => {
  const ctx = { impressions: 40, minImpressions: 8, opportunityCount: 0 };
  assert.doesNotMatch(renderCoverageSection(coverageFixture(), ctx).join('\n'), /總曝光僅/);
});

test('renderCoverageSection 對缺資料與取數失敗都如實說明，不渲染假表', () => {
  const missing = renderCoverageSection(null, STARVED).join('\n');
  assert.match(missing, /本期無收錄資料/);
  assert.doesNotMatch(missing, /已收錄/);

  const failed = renderCoverageSection({ error: '讀取 sitemap 失敗：GET … 回應 404' }, STARVED).join('\n');
  assert.match(failed, /本期無收錄資料：讀取 sitemap 失敗/);
});

test('renderCoverageSection 標示抽驗被上限截斷', () => {
  const c = coverageFixture();
  c.sitemapUrlCount = 500;
  c.truncated = true;
  const md = renderCoverageSection(c, STARVED).join('\n');
  assert.match(md, /sitemap 宣告 500 個 URL，本次抽驗 2 個（達單次上限 2，其餘未驗）/);
});
