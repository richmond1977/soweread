// 收錄進度（index coverage）的純函式：sitemap 解析、統計彙總、週報章節渲染。
// 不碰網路、不碰資料庫，方便測試；實際打 API 的部分在 url-inspection.mjs。
//
// 為什麼需要這一節：三層機會分析（analyze.mjs）的輸入是 GSC 曝光資料，站台
// 曝光趨近 0 時三個區塊必然全空——那不是「沒有機會」，是「還沒被收錄」。
// 這兩件事在原本的週報裡長得一模一樣，看報告的人分不出來。收錄進度就是拿來
// 分辨這兩者的：在有曝光之前，它是唯一有訊號的指標。

/** verdict === 'PASS' 視為已收錄；其餘（FAIL / PARTIAL / NEUTRAL）皆未收錄。 */
const INDEXED_VERDICT = 'PASS';

/**
 * 解析 sitemap XML。Google 的 sitemap 有兩種：<urlset>（頁面清單）與
 * <sitemapindex>（子 sitemap 清單）；兩者的節點都叫 <loc>，靠根元素分辨。
 *
 * @param {string} xml
 * @returns {{ urls: string[], sitemaps: string[] }} 二選一非空；解析不出來則兩者皆空
 */
export function parseSitemapUrls(xml) {
  const locs = [...xml.matchAll(/<loc>\s*([^<\s][^<]*?)\s*<\/loc>/gi)].map((m) => decodeXmlEntities(m[1]));
  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  return isIndex ? { urls: [], sitemaps: locs } : { urls: locs, sitemaps: [] };
}

function decodeXmlEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * 把逐筆 URL Inspection 結果彙總成報告要用的數字。
 *
 * @param {Array<{url: string, verdict?: string, coverageState?: string, lastCrawlTime?: string, error?: string}>} results
 * @returns {{
 *   total: number, indexed: number, notIndexed: number, errored: number,
 *   byState: Record<string, number>,
 *   notIndexedUrls: Array<{url: string, coverageState: string}>,
 *   lastCrawlTime: string | null,
 * }}
 */
export function summarizeCoverage(results) {
  const byState = {};
  const notIndexedUrls = [];
  let indexed = 0;
  let errored = 0;
  let lastCrawlTime = null;

  for (const r of results) {
    if (r.error) {
      errored++;
      continue;
    }
    const state = r.coverageState || '（未知）';
    byState[state] = (byState[state] ?? 0) + 1;

    if (r.verdict === INDEXED_VERDICT) {
      indexed++;
    } else {
      notIndexedUrls.push({ url: r.url, coverageState: state });
    }

    // 全站最近一次被 Google 實際抓取的時間：判斷「有沒有在往前走」的粗略訊號。
    if (r.lastCrawlTime && (lastCrawlTime === null || r.lastCrawlTime > lastCrawlTime)) {
      lastCrawlTime = r.lastCrawlTime;
    }
  }

  const inspected = results.length - errored;
  return {
    total: results.length,
    indexed,
    notIndexed: inspected - indexed,
    errored,
    byState,
    notIndexedUrls,
    lastCrawlTime,
  };
}

function fmtPct(n, d) {
  if (!d) return '—';
  return `${((n / d) * 100).toFixed(0)}%`;
}

function pathOf(url) {
  return url.replace(/^https?:\/\/[^/]+/, '') || '/';
}

/**
 * 渲染「收錄進度」章節。
 *
 * @param {object} coverage ingest 寫進 GrowthSnapshot.coverage 的物件
 * @param {{ impressions: number, minImpressions: number, opportunityCount: number }} context
 *        本區間該站的總曝光、分析門檻與三層分析共產出幾條機會，用來決定要不要提醒
 * @returns {string[]} Markdown 行陣列
 */
export function renderCoverageSection(coverage, context) {
  const lines = [];
  lines.push('### 📥 收錄進度（Google 到底收了幾頁）');
  lines.push('');

  if (!coverage || coverage.error) {
    lines.push(
      `_本期無收錄資料：${coverage?.error ?? '尚未取得（本站的快照是加入這一節之前產生的，下次 growth:ingest 後即有）'}_`
    );
    lines.push('');
    return lines;
  }

  const s = coverage.summary;
  lines.push(
    `sitemap 宣告 ${coverage.sitemapUrlCount} 個 URL，本次抽驗 ${s.total} 個` +
      (coverage.truncated ? `（達單次上限 ${s.total}，其餘未驗）` : '') +
      `：**已收錄 ${s.indexed} 個（${fmtPct(s.indexed, s.total - s.errored)}）**、未收錄 ${s.notIndexed} 個` +
      (s.errored > 0 ? `、查詢失敗 ${s.errored} 個` : '') +
      '。'
  );
  lines.push('');

  if (s.lastCrawlTime) {
    lines.push(`最近一次被 Google 抓取：${s.lastCrawlTime.slice(0, 10)}`);
    lines.push('');
  }

  const states = Object.entries(s.byState).sort((a, b) => b[1] - a[1]);
  if (states.length > 0) {
    lines.push('| 收錄狀態（GSC 原文） | 頁數 |');
    lines.push('|---|--:|');
    for (const [state, count] of states) {
      lines.push(`| ${state} | ${count} |`);
    }
    lines.push('');
  }

  if (s.notIndexedUrls.length > 0) {
    lines.push('未收錄的頁面：');
    lines.push('');
    lines.push('| 頁面 | 狀態 |');
    lines.push('|---|---|');
    for (const r of s.notIndexedUrls.slice(0, 25)) {
      lines.push(`| ${pathOf(r.url)} | ${r.coverageState} |`);
    }
    if (s.notIndexedUrls.length > 25) {
      lines.push(`| …另有 ${s.notIndexedUrls.length - 25} 頁 | |`);
    }
    lines.push('');
  }

  // 三層分析全空、且總曝光還沒到單一搜尋詞的門檻＝資料不足，不是沒機會。
  // 明講一次，免得看報告的人把「無符合的機會」讀成「已經優化到沒東西可做」。
  // 用曝光總量而非「等於 0」來判斷，是因為一次 site: 之類的運算子查詢就會
  // 讓曝光變成 1，把這句最該出現的提醒關掉。
  if (context.opportunityCount === 0 && context.impressions < context.minImpressions) {
    lines.push(
      `> 本區間總曝光僅 ${context.impressions} 次（未達單一搜尋詞門檻 ${context.minImpressions} 次），` +
        '下方三層機會分析必然全空——那是資料不足，不是沒有機會。' +
        '在有曝光之前，這一節的收錄數才是該追的指標。'
    );
    lines.push('');
  }

  return lines;
}
