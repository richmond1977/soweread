// SERP 型態判斷（純規則，不用 AI）：把 Google Top 10 的標題/摘要粗分成
// 「知識物件」型態，供 serp_validate.mjs／analyze.mjs 產生建議動作。
//
// 跟 WiseCode 的 serp-intent.mjs 判斷邏輯（教學型 vs 商業型）不同——潤讀是內容媒體，
// 讀者搜尋這類查詢是要「答案」而非「服務」，所以這裡分的是答案該長成哪種知識物件，
// 對應到 prisma/schema.prisma 已有的 Topic／Entity／GrowthArticle 模型，不發明新頁型
// （2026-09-19 與 Richmond 討論：知識架構不該先跑在搜尋需求前面，但也不該無限上綱成
// 六種頁型的 Content Type Router——先讓人工判斷跑幾輪，值得抽象化了再寫進 schema）。
//
// 刻意用關鍵字計分而非叫模型判斷：可外化成規則的分類工作交給程式碼，錯了可以直接改、
// 可測試，模型判斷每次可能不一樣（dev-standards「確定性工作由程式碼處理」）。
// 分數只到「哪種知識物件」為止，不做「該不該寫」的最終決定——那句仍需人工判斷
// （報告固定標注「建議動作皆需人工判斷後執行」）。

const DEFINITION_PATTERNS = [
  /是什麼|的定義|定義是|意思是|代表什麼|科普|懶人包/,
  /what\s+is|definition|means?\b|explained/i,
];

const COMPARISON_PATTERNS = [
  /差在哪|差別|不一樣|有什麼不同|比較/,
  /\bvs\.?\b|difference between|compared?\b/i,
];

// 高爭議物質類查詢：安全性、致癌性、風險判讀——這類 Top 10 常是官方單位／新聞／
// 國際機構混雜，適合做「共識 + hazard/risk 分述 + 佐證來源」的證據型內容，
// 而不是單一結論的長文（見 config/growth.json 的「高爭議物質」cluster）。
const CONTROVERSY_PATTERNS = [
  /致癌|有害|安全嗎|安不安全|安全性|有沒有危害|危害|風險|爭議|超標|檢出/,
  /carcinogen|carcinogenic|\brisk\b|\bhazard\b|controvers/i,
];

const HOWTO_PATTERNS = [
  /怎麼看|怎麼判斷|如何判斷|如何辨識|怎麼查|流程|申請|辦理|須知|注意事項|常見問題|faq/i,
  /how\s?to|step[-\s]by[-\s]step|guide\b/i,
];

// 潤讀是內容媒體，商業意圖查詢極少，留這組主要是讓「查了但四類都不像」時
// 有個更準確的落點，而不是全部塞進 unclear。
const COMMERCIAL_PATTERNS = [
  /價格|費用|收費|哪裡買|推薦|排行|評比|開箱|ptt/i,
  /price|pricing|cost|best\b|top\s?\d|review/i,
];

const CATEGORY_PATTERNS = {
  definition: DEFINITION_PATTERNS,
  comparison: COMPARISON_PATTERNS,
  controversy: CONTROVERSY_PATTERNS,
  howto: HOWTO_PATTERNS,
  commercial: COMMERCIAL_PATTERNS,
};

export const CONTENT_TYPE_LABEL = {
  definition: '定義型',
  comparison: '比較型',
  controversy: '爭議證據型',
  howto: '教學／判讀型',
  commercial: '商業型',
  mixed: '混合',
  unclear: '訊號不足',
};

function score(text, patterns) {
  if (!text) return 0;
  return patterns.reduce((n, re) => n + (re.test(text) ? 1 : 0), 0);
}

function domainOf(link) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// 官方／學術／百科網域佔比：Top 10 若被這類網域主導，通常代表 Google 對這個查詢
// 偏好「權威共識」而非一般部落格長文，適合 Entity 頁的證據段落直接引用，而不是
// 另寫一篇長文跟官方來源搶排名。
const AUTHORITY_DOMAIN_PATTERNS = [
  /\.gov(\.\w+)?$/, // .gov.tw、.gov 等
  /\.edu(\.\w+)?$/,
  /^(zh\.)?wikipedia\.org$/,
  /who\.int$/,
  /^tfda\.gov\.tw$|^fda\.gov$|^efsa\.europa\.eu$/,
];

function isAuthorityDomain(domain) {
  return AUTHORITY_DOMAIN_PATTERNS.some((re) => re.test(domain ?? ''));
}

/**
 * 依 Top 10 的標題＋摘要判斷主流知識物件型態。
 * @param {{organic?: Array<{title: string, snippet: string, link: string}>}} serp
 * @returns {{
 *   contentType: 'definition'|'comparison'|'controversy'|'howto'|'commercial'|'mixed'|'unclear',
 *   scores: Record<string, number>,
 *   totalConsidered: number,
 *   topDomains: string[],
 *   authorityDomainCount: number,
 * }}
 */
export function classifyIntent(serp) {
  const organic = serp?.organic ?? [];
  const scores = { definition: 0, comparison: 0, controversy: 0, howto: 0, commercial: 0 };

  for (const r of organic) {
    const text = `${r.title ?? ''} ${r.snippet ?? ''}`;
    for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
      scores[category] += score(text, patterns) > 0 ? 1 : 0;
    }
  }

  const topDomains = [...new Set(organic.map((r) => domainOf(r.link)).filter(Boolean))].slice(0, 10);
  const authorityDomainCount = topDomains.filter(isAuthorityDomain).length;
  const totalConsidered = organic.length;

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topCategory, topScore] = ranked[0];
  const secondScore = ranked[1]?.[1] ?? 0;

  let contentType = 'unclear';
  if (totalConsidered === 0 || topScore === 0) {
    contentType = 'unclear';
  } else if (secondScore >= topScore) {
    contentType = 'mixed';
  } else {
    contentType = topCategory;
  }

  return { contentType, scores, totalConsidered, topDomains, authorityDomainCount };
}

const ACTION_LABEL = {
  'definition:has-page': '既有 Entity/Topic 頁補強定義段落，確認與 Top 10 的用詞一致',
  'definition:no-page': '適合新增 Entity 頁（一句直接定義起手）',
  'comparison:has-page': '既有頁補比較表／差異段落',
  'comparison:no-page': '適合寫成比較型文章或 Entity 頁的比較區塊，而非單一長文',
  'controversy:has-page': '既有 Entity 頁補證據段落：共識、hazard vs risk 分述、來源與更新日期',
  'controversy:no-page': '適合走證據型 Entity 頁（共識→機構立場分述→台灣法規→來源），不宜寫成單一結論長文',
  'howto:has-page': '既有頁補步驟／常見問題',
  'howto:no-page': '適合寫成教學／判讀型 GrowthArticle',
  'commercial:has-page': '商業意圖查詢，人工確認是否符合潤讀內容媒體定位',
  'commercial:no-page': '商業意圖查詢，非典型潤讀選題，人工判斷是否要做',
  'mixed:has-page': '型態混合，既有頁可能需要拆分或補多段落，人工判斷優先順序',
  'mixed:no-page': '型態混合，人工判斷該走哪種知識物件',
  'unclear:has-page': 'Top 10 訊號不足以判斷型態，維持現有頁面觀察',
  'unclear:no-page': 'Top 10 訊號不足以判斷型態，暫不建議動作',
};

/**
 * 把型態判斷轉成建議動作文字。不是最終決定，只是給人工判斷的起點。
 * @param {{contentType: string, hasLandingPage: boolean}} params
 */
export function recommendAction({ contentType, hasLandingPage }) {
  const key = `${contentType}:${hasLandingPage ? 'has-page' : 'no-page'}`;
  return ACTION_LABEL[key] ?? '需人工判斷';
}
