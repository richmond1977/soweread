// GEO 引用追蹤的純函式：判定一題回答有沒有引用／提及潤讀，並彙總成
// CitationBatchJob.resultsJson（render-geo.mjs 讀的就是這個格式）。
// 不碰網路、不碰資料庫；實際呼叫 Gemini 的部分在 gemini-grounded.mjs，
// 執行入口在 scripts/growth/geo_citations.mjs。
//
// 兩級判定：
//   cited     — grounding 來源（groundingChunks）裡有自家網域的網頁。這是「AI 即時
//               搜尋後拿潤讀當依據」的訊號，也是 GEO 真正要追的指標。
//   mentioned — 回答文字裡出現品牌詞（config.brandTerms）或自家網域字串。
// cited 不一定 mentioned（模型引用了卻沒在文字裡點名），反之亦然，兩者分開計。
//
// grounding 來源的 uri 通常是 vertexaisearch.cloud.google.com 的轉址連結，看不出
// 原站；Gemini 會把原站網域放在 title（例如 "soweread.com"），所以 uri 主機與
// title 兩者都要比對。

/** 自家網域（含所有子網域，例如 knowledge.soweread.com）。 */
export const OWN_DOMAINS = ['soweread.com'];

function hostOf(uri) {
  try {
    return new URL(uri).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function matchesDomain(value, domain) {
  const v = String(value ?? '').toLowerCase().trim();
  if (!v) return false;
  // title 可能是 "soweread.com"、"knowledge.soweread.com"，也可能是網頁標題全文。
  return v === domain || v.endsWith(`.${domain}`) || new RegExp(`(^|[^a-z0-9-])([a-z0-9-]+\\.)*${domain.replace(/\./g, '\\.')}($|[^a-z0-9-])`).test(v);
}

/** 一個 grounding 來源的「網域標籤」：優先用真實主機，轉址連結則退回 title。 */
export function sourceDomain(source) {
  const host = hostOf(source?.uri);
  if (host && !host.endsWith('vertexaisearch.cloud.google.com')) return host.replace(/^www\./, '');
  const title = String(source?.title ?? '').trim().toLowerCase();
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(title) ? title.replace(/^www\./, '') : title || host;
}

/**
 * @param {{text?: string, sources?: Array<{uri?: string, title?: string}>, error?: string}} result
 * @param {{brandTerms: string[], ownDomains?: string[]}} opts
 */
export function classifyAnswer(result, { brandTerms, ownDomains = OWN_DOMAINS }) {
  if (result?.error) return { answered: false, cited: false, mentioned: false, ownSources: [], sourceDomains: [] };

  const sources = Array.isArray(result?.sources) ? result.sources : [];
  const ownSources = sources.filter((s) =>
    ownDomains.some((d) => matchesDomain(hostOf(s.uri), d) || matchesDomain(s.title, d))
  );
  const text = String(result?.text ?? '').toLowerCase();
  const mentioned =
    brandTerms.some((t) => t && text.includes(String(t).toLowerCase())) ||
    ownDomains.some((d) => text.includes(d));

  return {
    answered: Boolean(result?.text) || sources.length > 0,
    cited: ownSources.length > 0,
    mentioned,
    ownSources: ownSources.map((s) => ({ uri: s.uri ?? '', title: s.title ?? '' })),
    sourceDomains: [...new Set(sources.map(sourceDomain).filter(Boolean))],
  };
}

/**
 * @param {Array<{id: string, cluster: string, query: string}>} queries
 * @param {Array<{key: string, text?: string, sources?: object[], error?: string}>} results askGroundedMany 的輸出，key = query id
 * @param {{model: string, brandTerms: string[], ownDomains?: string[]}} opts
 */
export function summarizeCitations(queries, results, { model, brandTerms, ownDomains = OWN_DOMAINS }) {
  const byKey = new Map(results.map((r) => [r.key, r]));
  const perQuery = [];
  const byCluster = {};
  const errors = [];
  let answeredCount = 0;
  let citedCount = 0;
  let mentionedCount = 0;

  for (const q of queries) {
    const r = byKey.get(q.id) ?? { error: '沒有回應' };
    const c = classifyAnswer(r, { brandTerms, ownDomains });
    const bucket = (byCluster[q.cluster] ??= { total: 0, answered: 0, cited: 0, mentioned: 0 });
    bucket.total += 1;
    if (r.error) errors.push({ id: q.id, error: String(r.error).slice(0, 300) });
    if (c.answered) {
      answeredCount += 1;
      bucket.answered += 1;
    }
    if (c.cited) {
      citedCount += 1;
      bucket.cited += 1;
    }
    if (c.mentioned) {
      mentionedCount += 1;
      bucket.mentioned += 1;
    }
    perQuery.push({
      id: q.id,
      cluster: q.cluster,
      query: q.query,
      answered: c.answered,
      cited: c.cited,
      mentioned: c.mentioned,
      ownSources: c.ownSources,
      sourceDomains: c.sourceDomains,
      ...(r.error ? { error: String(r.error).slice(0, 300) } : {}),
    });
  }

  return {
    method: 'grounded',
    model,
    totalQueries: queries.length,
    answeredCount,
    citedCount,
    mentionedCount,
    byCluster,
    perQuery,
    errors,
  };
}

/** 所有題目裡最常被 Gemini 拿來當依據的網域（不含自家），用來看誰佔住了答案。 */
export function topCompetitorDomains(perQuery, { ownDomains = OWN_DOMAINS, limit = 10 } = {}) {
  const counts = new Map();
  for (const q of perQuery ?? []) {
    for (const d of q.sourceDomains ?? []) {
      if (ownDomains.some((own) => matchesDomain(d, own))) continue;
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit);
}
