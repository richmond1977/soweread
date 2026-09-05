// Gemini + Google Search grounding client（Phase 4 GEO 引用追蹤專用）。
//
// 2026-09-05 決定沿革，見 docs/growth-weekly-report-migration.md 第 2 節：
// 前一版用 Batch API（不帶 grounding）以壓低成本，但實測 GEMINI_API_KEY 打 Batch API
// 一律得到 400 FAILED_PRECONDITION（Google 已知限制：Batch API 需要專案已啟用付費計費
// 層級，免費層 key 完全用不了）。Richmond 因此放棄 Batch API，改回同步 generateContent；
// 「不帶 grounding」原本唯一的理由（batch 下 grounding 會靜默失效）隨 batch 一起消失，
// 故本檔恢復 `google_search` grounding，技術路線對齊移植來源端同名檔案（唯讀參考，未修改，
// 出處見 docs/growth-weekly-report-migration.md 第 3 節「先讀」清單）。
//
// 量到的訊號因此是「即時搜尋 grounding 後的引用率」，不是模型參數化知識代理指標。

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 節流秒數沿用來源端 askGroundedMany 的 1500ms，避免撞免費層 QPM 限制。
const THROTTLE_MS = 1500;

function getKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
}

// 沿用 gemini-batch.mjs 原本的預設模型選擇理由：簡單問答＋文字/網域比對不需要旗艦模型。
export const DEFAULT_MODEL = 'gemini-3.1-flash-lite';

export function getCitationModel() {
  return process.env.GEMINI_MODEL_CITATIONS || DEFAULT_MODEL;
}

async function callOnce({ key, model, question, timeoutMs }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: question }] }],
        tools: [{ google_search: {} }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.3 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      const err = new Error(`HTTP ${res.status}: ${detail.slice(0, 500)}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json();
    const cand = data.candidates?.[0];
    const text = (cand?.content?.parts ?? [])
      .map((p) => p.text ?? '')
      .join('')
      .trim();
    const sources = (cand?.groundingMetadata?.groundingChunks ?? [])
      .map((c) => ({ uri: c.web?.uri ?? '', title: c.web?.title ?? '' }))
      .filter((s) => s.uri || s.title);
    return { text, sources, usage: data.usageMetadata ?? null };
  } finally {
    clearTimeout(timer);
  }
}

async function askGroundedOne(question, { model, timeoutMs = 60000, maxRetries = 3 } = {}) {
  const key = getKey();
  if (!key) throw new Error('GEMINI_API_KEY 未設定');

  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callOnce({ key, model, question, timeoutMs });
    } catch (err) {
      lastErr = err;
      const isAbort = err?.name === 'AbortError';
      const isRetryable = isAbort || RETRYABLE_STATUS.has(err?.status);
      if (!isRetryable || attempt === maxRetries) throw err;
      const waitMs = Math.min(2000 * 2 ** attempt + Math.floor(Math.random() * 1000), 30_000);
      process.stderr.write(`[gemini-grounded] 第 ${attempt + 1}/${maxRetries} 次重試前等待 ${Math.round(waitMs / 1000)}s（${err.message}）\n`);
      await sleep(waitMs);
    }
  }
  throw lastErr;
}

/**
 * 多題逐一詢問（同步 API），照輸入順序回傳結果。單題失敗不影響其他題：
 * 該題回傳 { key, error } 而非丟出整個函式。
 * @param {Array<{key: string, question: string}>} items
 * @param {{model?: string}} [opts]
 * @returns {Promise<Array<{key: string, text?: string, sources?: object[], usage?: object|null, error?: string}>>}
 */
export async function askGroundedMany(items, { model = getCitationModel() } = {}) {
  const results = [];
  for (const it of items) {
    try {
      const { text, sources, usage } = await askGroundedOne(it.question, { model });
      results.push({ key: it.key, text, sources, usage });
    } catch (e) {
      results.push({ key: it.key, error: e.message });
    }
    await sleep(THROTTLE_MS); // 溫和節流，免撞免費額度 QPM
  }
  return results;
}

// 單題版本（供小規模驗證呼叫使用，例如新環境上線前先測 1-2 題）。
export async function askGrounded(question, opts = {}) {
  const [result] = await askGroundedMany([{ key: 'q', question }], opts);
  if (result.error) throw new Error(result.error);
  return { text: result.text, sources: result.sources, usage: result.usage };
}
