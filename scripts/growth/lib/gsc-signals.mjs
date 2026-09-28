// GSC 純規則訊號（不用 AI、不連外網）：補上機會分類之外的兩類候選——
//   decline   下滑警示：對比前一份快照，排名／點擊／曝光明顯變差的搜尋詞
//   cannibal  自家頁面互搶：同一搜尋詞被多個頁面各自吃到曝光，可能互搶排名
// 沿用 opportunity-classify.mjs 的品牌詞／雜訊過濾，避免同一批詞被重複濾除邏輯分岔。
//
// 移植自 WISECODE_Website scripts/growth/lib/gsc-signals.mjs（2026-09-24）。
// 差異：WISECODE 的快照是單站 JSON 檔（snapshot.byQuery 等在頂層），SOWEREAD
// 是多站 Prisma GrowthSnapshot（欄位在 snapshot.rawRows.byQuery 等），呼叫端
// （analyze.mjs）需先取出 rawRows 再傳進來；品牌詞來自 config/growth.json
// 的 brandTerms，經 isBrandOrNoiseQuery(query, config) 判斷，門檻同樣可用
// 環境變數覆寫。
//
// 這裡只產生「候選」，不做任何改寫建議或定案判斷——是否要動頁面仍需人工檢查。

import { isBrandOrNoiseQuery } from './opportunity-classify.mjs';

// 門檻（可用環境變數覆寫，維持與 opportunity-classify 一致的可調整慣例）
export const DECLINE_MIN_PREV_IMPRESSIONS = Number(process.env.GROWTH_DECLINE_MIN_PREV_IMPRESSIONS || 20);
export const DECLINE_MIN_POSITION_DROP = Number(process.env.GROWTH_DECLINE_MIN_POSITION_DROP || 3); // 排名數字變大（變差）達此值
export const DECLINE_MIN_CLICKS_DROP_RATIO = Number(process.env.GROWTH_DECLINE_MIN_CLICKS_DROP_RATIO || 0.3); // 點擊下降比例
export const DECLINE_MIN_IMPRESSIONS_DROP_RATIO = Number(process.env.GROWTH_DECLINE_MIN_IMPRESSIONS_DROP_RATIO || 0.3); // 曝光下降比例
// 點擊基數太小時比例無意義（4→2 就是 -50%），前期點擊未達此值不看點擊條件
export const DECLINE_MIN_PREV_CLICKS = Number(process.env.GROWTH_DECLINE_MIN_PREV_CLICKS || 5);
export const DECLINE_MAX_ROWS = 15;

export const CANNIBAL_MIN_IMPRESSIONS_PER_PAGE = Number(process.env.GROWTH_CANNIBAL_MIN_IMPRESSIONS_PER_PAGE || 10);
export const CANNIBAL_MAX_ROWS = 15;

/**
 * 下滑警示：比對本期與前期 rawRows.byQuery，找出前期曝光達門檻、且本期出現顯著下滑的搜尋詞。
 * 若某詞本期完全消失（曝光掉到 0），仍視為下滑（點擊/曝光下降比例達 100%）。
 *
 * @param {{byQuery: Array}} currentRawRows 本期 GrowthSnapshot.rawRows
 * @param {{byQuery: Array}|null} prevRawRows 前一份快照的 rawRows；null 代表沒有前期資料
 * @param {object} config config/growth.json（供品牌詞過濾）
 * @returns {Array} 依「前期點擊或曝光」排序、最多 DECLINE_MAX_ROWS 筆
 */
export function findDeclines(currentRawRows, prevRawRows, config) {
  if (!prevRawRows) return [];

  const curByQuery = new Map(currentRawRows.byQuery.map((r) => [r.query, r]));
  const rows = [];

  for (const prev of prevRawRows.byQuery) {
    if (isBrandOrNoiseQuery(prev.query, config)) continue;
    if (prev.impressions < DECLINE_MIN_PREV_IMPRESSIONS) continue;

    const cur = curByQuery.get(prev.query);
    const curClicks = cur ? cur.clicks : 0;
    const curImpressions = cur ? cur.impressions : 0;
    const curPosition = cur ? cur.position : null;

    const positionDrop = curPosition === null ? null : curPosition - prev.position; // 變大＝變差
    const clicksDropRatio = prev.clicks > 0 ? (prev.clicks - curClicks) / prev.clicks : 0;
    const impressionsDropRatio = prev.impressions > 0 ? (prev.impressions - curImpressions) / prev.impressions : 0;

    const positionWorsened = positionDrop !== null && positionDrop >= DECLINE_MIN_POSITION_DROP;
    const clicksWorsened = prev.clicks >= DECLINE_MIN_PREV_CLICKS && clicksDropRatio >= DECLINE_MIN_CLICKS_DROP_RATIO;
    const impressionsWorsened = impressionsDropRatio >= DECLINE_MIN_IMPRESSIONS_DROP_RATIO;

    // 完全消失（本期無此詞）：視為排名下滑無法計算，但點擊/曝光下降比例已是 100%，仍應列入。
    if (!positionWorsened && !clicksWorsened && !impressionsWorsened) continue;

    rows.push({
      query: prev.query,
      prevClicks: prev.clicks,
      prevImpressions: prev.impressions,
      prevPosition: prev.position,
      clicks: curClicks,
      impressions: curImpressions,
      position: curPosition,
      positionDrop,
      clicksDropRatio,
      impressionsDropRatio,
      disappeared: !cur,
    });
  }

  rows.sort((a, b) => (b.prevClicks + b.prevImpressions) - (a.prevClicks + a.prevImpressions));
  return rows.slice(0, DECLINE_MAX_ROWS);
}

/**
 * 自家頁面互搶：用本期 rawRows.byQueryPage，找出同一搜尋詞底下有 ≥2 個頁面各自曝光達門檻的情況。
 *
 * @param {{byQueryPage: Array}} rawRows 本期 GrowthSnapshot.rawRows
 * @param {object} config config/growth.json（供品牌詞過濾）
 * @returns {Array<{query: string, pages: Array<{page:string, impressions:number, position:number}>}>}
 *   依「涉及頁面加總曝光」排序、最多 CANNIBAL_MAX_ROWS 筆；每筆的 pages 依曝光排序
 */
export function findCannibalization(rawRows, config) {
  const byQuery = new Map();
  for (const r of rawRows.byQueryPage) {
    if (isBrandOrNoiseQuery(r.query, config)) continue;
    if (r.impressions < CANNIBAL_MIN_IMPRESSIONS_PER_PAGE) continue;
    if (!byQuery.has(r.query)) byQuery.set(r.query, []);
    byQuery.get(r.query).push({ page: r.page, impressions: r.impressions, position: r.position });
  }

  const rows = [];
  for (const [query, pages] of byQuery) {
    if (pages.length < 2) continue;
    pages.sort((a, b) => b.impressions - a.impressions);
    rows.push({ query, pages, totalImpressions: pages.reduce((s, p) => s + p.impressions, 0) });
  }

  rows.sort((a, b) => b.totalImpressions - a.totalImpressions);
  return rows.slice(0, CANNIBAL_MAX_ROWS);
}
