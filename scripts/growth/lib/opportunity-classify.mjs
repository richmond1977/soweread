/**
 * 機會分類（純規則，不用 AI）：把一站的 GSC rawRows 分成三類，供 analyze.mjs
 * 渲染週報、serp_validate.mjs 挑「內容缺口」候選去查 SERP。
 *
 * 抽成獨立檔案而非留在 analyze.mjs：analyze.mjs 底部沒有 entry-point 判斷，
 * import 它會連帶跑一次 main()（連 Neon、寫 GrowthReport）。這個坑 WiseCode
 * 那邊的 opportunity-classify.mjs 已經踩過一次（2026-09-19 與 Richmond 討論
 * 移植 SERP 驗證層時複查確認）。
 *
 *   striking  臨門一腳：排名 4–20、有曝光 → 強化既有頁面就能進前三
 *   ctrGap    點擊落差：排名已在前 5 但 CTR 偏低 → 改 title/description
 *   content   內容缺口：有曝光但排名 20+ → 新內容選題來源（GSC 曝光缺口，
 *             不代表已確認「內容深度不夠」——那個推論需要 SERP 查證，見
 *             scripts/growth/serp_validate.mjs）
 */
import { expectedCtr } from './load-config.mjs';

// 雜訊判斷：含搜尋運算子（-site: 等）的字串
export function isNoise(query) {
  return /-site:|site:|inurl:|\bfiletype:/i.test(query);
}

export function isBrand(query, brandTerms) {
  const q = query.toLowerCase();
  return brandTerms.some((t) => q.includes(t.toLowerCase()));
}

// 供 gsc-signals.mjs 共用：品牌詞／雜訊詞不當成下滑警示或互搶候選
// （與 classify() 用同一套過濾，避免同一批詞被重複濾除邏輯分岔）。
export function isBrandOrNoiseQuery(query, config) {
  return isNoise(query) || isBrand(query, config.brandTerms);
}

// 把 query 對應到目前排名最好的落地頁（供強化建議用）
function landingPageFor(query, byQueryPage) {
  const rows = byQueryPage.filter((r) => r.query === query);
  if (rows.length === 0) return null;
  rows.sort((a, b) => a.position - b.position);
  return rows[0].page;
}

export function classify(rawRows, config) {
  const { byQuery, byQueryPage } = rawRows;
  const striking = [];
  const ctrGap = [];
  const content = [];

  const { minImpressions, brandTerms, strikingMinPosition, strikingMaxPosition, ctrGapMaxPosition } = config;
  const proximityDenominator = strikingMaxPosition - strikingMinPosition;

  for (const r of byQuery) {
    if (isNoise(r.query)) continue;
    if (r.impressions < minImpressions) continue;
    if (isBrand(r.query, brandTerms)) continue; // 品牌詞不當成長機會（不論目前排名）

    const page = landingPageFor(r.query, byQueryPage);
    const base = { ...r, page };

    if (r.position > strikingMinPosition && r.position <= strikingMaxPosition) {
      // 臨門一腳；離第一頁越近、曝光越高 → 分數越高
      const proximity = Math.max(0, strikingMaxPosition + 0.5 - r.position) / proximityDenominator;
      base.opportunity = Math.round(r.impressions * proximity);
      striking.push(base);
    } else if (r.position <= ctrGapMaxPosition && r.ctr < expectedCtr(r.position, config) * 0.6) {
      base.expectedCtr = expectedCtr(r.position, config);
      base.missedClicks = Math.round(r.impressions * (base.expectedCtr - r.ctr));
      ctrGap.push(base);
    } else if (r.position > strikingMaxPosition) {
      base.opportunity = r.impressions;
      content.push(base);
    }
  }

  striking.sort((a, b) => b.opportunity - a.opportunity);
  ctrGap.sort((a, b) => b.missedClicks - a.missedClicks);
  content.sort((a, b) => b.opportunity - a.opportunity);
  return { striking, ctrGap, content };
}
