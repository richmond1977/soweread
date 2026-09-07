// 收錄進度取數：讀站台自己的 sitemap.xml，逐一送 Search Console URL Inspection
// API，回傳可直接寫進 GrowthSnapshot.coverage 的物件。
//
// API：POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect
//      body { inspectionUrl, siteUrl }
//      scope 沿用既有的 webmasters.readonly，不需要重跑 growth:auth。
//      配額（Google 公告值）：每站每日 2000 次、每分鐘 600 次。潤讀目前 sitemap
//      只有 20 多個 URL，離配額很遠；仍設 MAX_URLS 上限，避免日後 sitemap 長大
//      之後某週無聲把配額吃光。
//
// 純函式（sitemap 解析、統計、渲染）在 coverage.mjs，這裡只放有副作用的部分。

import { googlePost } from './google-auth.mjs';
import { parseSitemapUrls, summarizeCoverage } from './coverage.mjs';

const INSPECT_ENDPOINT = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
const MAX_URLS = Number(process.env.GROWTH_COVERAGE_MAX_URLS || 100);
const CONCURRENCY = Number(process.env.GROWTH_COVERAGE_CONCURRENCY || 4);
const MAX_CHILD_SITEMAPS = 5; // sitemap index 只往下展開這麼多個子 sitemap
const FETCH_TIMEOUT_MS = 20_000;

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'soweread-growth-report' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`GET ${url} 回應 ${res.status}`);
  return res.text();
}

/**
 * 取得站台 sitemap 裡的頁面 URL。遇到 sitemap index 會往下展開一層。
 *
 * @param {string} domain 例如 https://soweread.vercel.app
 * @returns {Promise<string[]>} 去重後的頁面 URL
 */
export async function fetchSitemapUrls(domain) {
  const root = new URL('/sitemap.xml', domain).toString();
  const parsed = parseSitemapUrls(await fetchText(root));

  let urls = parsed.urls;
  if (parsed.sitemaps.length > 0) {
    for (const child of parsed.sitemaps.slice(0, MAX_CHILD_SITEMAPS)) {
      try {
        urls = urls.concat(parseSitemapUrls(await fetchText(child)).urls);
      } catch (e) {
        // 子 sitemap 讀不到就少驗那幾頁，不讓整站的收錄檢查掛掉；
        // 明確印出來，不靜默略過。
        console.warn(`  ⚠️  子 sitemap 讀取失敗，略過：${child}（${e.message}）`);
      }
    }
  }

  if (urls.length === 0) throw new Error(`${root} 解析不出任何頁面 URL`);
  return [...new Set(urls)];
}

async function inspectOne(gscSiteUrl, url) {
  try {
    const data = await googlePost(INSPECT_ENDPOINT, { inspectionUrl: url, siteUrl: gscSiteUrl });
    const r = data.inspectionResult?.indexStatusResult ?? {};
    return {
      url,
      verdict: r.verdict,
      coverageState: r.coverageState,
      robotsTxtState: r.robotsTxtState,
      indexingState: r.indexingState,
      lastCrawlTime: r.lastCrawlTime,
      googleCanonical: r.googleCanonical,
    };
  } catch (e) {
    return { url, error: e.message };
  }
}

/** 固定併發數的工作佇列；URL Inspection 有每分鐘配額，不要一次全灌出去。 */
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * 對一個站台跑完整的收錄檢查。
 *
 * @param {{ gscSiteUrl: string, domain: string, label: string }} site
 * @returns {Promise<object>} 寫進 GrowthSnapshot.coverage 的物件；
 *          取數失敗時回傳 { error, checkedAt }，讓週報如實顯示「本期無收錄資料」。
 */
export async function collectCoverage(site) {
  const checkedAt = new Date().toISOString();
  let allUrls;
  try {
    allUrls = await fetchSitemapUrls(site.domain);
  } catch (e) {
    return { error: `讀取 sitemap 失敗：${e.message}`, checkedAt };
  }

  const urls = allUrls.slice(0, MAX_URLS);
  console.log(`  收錄檢查：sitemap ${allUrls.length} 個 URL，抽驗 ${urls.length} 個`);

  const results = await mapWithConcurrency(urls, CONCURRENCY, (u) => inspectOne(site.gscSiteUrl, u));
  const summary = summarizeCoverage(results);

  // 全部都失敗＝這站根本沒查成（多半是權限或 API 未啟用），如實回報成錯誤，
  // 不要交出一張「已收錄 0 / 100」的假表。
  if (summary.errored === results.length && results.length > 0) {
    return { error: `URL Inspection 全數失敗：${results[0].error}`, checkedAt };
  }

  console.log(`  收錄檢查結果：已收錄 ${summary.indexed}／未收錄 ${summary.notIndexed}／失敗 ${summary.errored}`);

  return {
    checkedAt,
    sitemapUrlCount: allUrls.length,
    truncated: allUrls.length > urls.length,
    summary,
    results,
  };
}
