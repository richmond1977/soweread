// Serper.dev（google.serper.dev）薄封裝：查一個字的 Google Top 10 + People Also Ask +
// Related Searches。用途僅止於「SERP 型態判斷」的原始資料，不做任何排序或內容決策——
// 決策邏輯在 serp-intent.mjs。
//
// 免費試用額度是一次性 2,500 次，不是每月重置，所以呼叫端必須自己節制查詢數量
// （serp_validate.mjs 用 GROWTH_SERP_MAX 上限做控管），這支只負責單次呼叫與重試。
//
// 與 WiseCode 那邊同名檔案幾乎相同（同一份底層邏輯，2026-09-19 移植）；
// 差異只在上層怎麼用查回來的資料——WiseCode 判商業意圖，這裡判知識物件型態。

const BASE = 'https://google.serper.dev/search';
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getKey() {
  return process.env.SERPER_API_KEY || '';
}

async function callOnce({ key, query, gl, hl, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'X-API-KEY': key, 'content-type': 'application/json' },
      body: JSON.stringify({ q: query, gl, hl, num: 10 }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      const err = new Error(`HTTP ${res.status}: ${detail.slice(0, 240)}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    return {
      organic: (data.organic ?? []).map((r) => ({
        title: r.title ?? '',
        link: r.link ?? '',
        snippet: r.snippet ?? '',
        position: r.position ?? null,
      })),
      peopleAlsoAsk: (data.peopleAlsoAsk ?? []).map((p) => p.question ?? '').filter(Boolean),
      relatedSearches: (data.relatedSearches ?? []).map((r) => r.query ?? '').filter(Boolean),
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 查一個字的 SERP。單次查詢失敗會重試（429/5xx/逾時），其餘錯誤直接拋出。
 * @param {string} query
 * @param {{gl?: string, hl?: string, timeoutMs?: number, maxRetries?: number}} [opts]
 */
export async function fetchSerp(query, { gl = 'tw', hl = 'zh-tw', timeoutMs = 15000, maxRetries = 3 } = {}) {
  const key = getKey();
  if (!key) throw new Error('SERPER_API_KEY 未設定');

  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callOnce({ key, query, gl, hl, timeoutMs });
    } catch (err) {
      lastErr = err;
      const isAbort = err?.name === 'AbortError';
      const isRetryable = isAbort || RETRYABLE_STATUS.has(err?.status);
      if (!isRetryable || attempt === maxRetries) throw err;
      const waitMs = Math.min(1000 * 2 ** attempt, 10_000);
      process.stderr.write(`[serper-client] 第 ${attempt + 1}/${maxRetries} 次重試前等待 ${Math.round(waitMs / 1000)}s\n`);
      await sleep(waitMs);
    }
  }
  throw lastErr;
}

/**
 * 多個字依序查詢（同步、逐一節流），單題失敗不影響其他題。
 * @param {string[]} queries
 * @returns {Promise<Array<{query: string, organic?: object[], peopleAlsoAsk?: string[], relatedSearches?: string[], error?: string}>>}
 */
export async function fetchSerpMany(queries, opts = {}) {
  const results = [];
  for (const query of queries) {
    try {
      const r = await fetchSerp(query, opts);
      results.push({ query, ...r });
    } catch (e) {
      results.push({ query, error: e.message });
    }
    await sleep(500); // 溫和節流
  }
  return results;
}
