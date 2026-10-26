/**
 * 機會分類（純規則，不用 AI）：把一站的 GSC rawRows 分成三類，供 analyze.mjs
 * 渲染週報、serp_validate.mjs 挑「內容缺口」候選去查 SERP。
 *
 * 抽成獨立檔案而非留在 analyze.mjs：analyze.mjs 底部沒有 entry-point 判斷，
 * import 它會連帶跑一次 main()（連 Neon、寫 GrowthReport）。這個坑 WiseCode
 * 那邊的 opportunity-classify.mjs 已經踩過一次（2026-09-19 與 Richmond 討論
 * 移植 SERP 驗證層時複查確認）。
 *
 *   striking  臨門一腳：排名 4–20、有曝光 → 既有頁面優化候選
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

// 頁面指標保留 query/page 維度；不可把主要頁面與 query 總曝光混為一談。
// 主要承接頁依曝光、點擊、排名、URL 排序；不更動原始輸入。
function landingPagesFor(query, byQueryPage) {
  return byQueryPage
    .filter((r) => r.query === query)
    .map(({ page, clicks, impressions, ctr, position }) => ({ page, clicks, impressions, ctr, position }))
    .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks || a.position - b.position ||
      (a.page < b.page ? -1 : a.page > b.page ? 1 : 0));
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

    const landingPages = landingPagesFor(r.query, byQueryPage);
    const base = { ...r, page: landingPages[0]?.page ?? null, landingPages };

    if (r.position > strikingMinPosition && r.position <= strikingMaxPosition) {
      // 規則排序分數，非預測收益；曝光越高、排名越接近前段，分數越高。
      const proximity = Math.max(0, strikingMaxPosition + 0.5 - r.position) / proximityDenominator;
      striking.push({ ...base, opportunity: Math.round(r.impressions * proximity) });
    }
    // 與排名機會獨立判斷，避免排名 4–5 的低 CTR 被前一類遮蔽。
    if (r.position <= ctrGapMaxPosition && r.ctr < expectedCtr(r.position, config) * 0.6) {
      const benchmark = expectedCtr(r.position, config);
      ctrGap.push({ ...base, expectedCtr: benchmark,
        missedClicks: Math.round(r.impressions * (benchmark - r.ctr)) });
    }
    if (r.position > strikingMaxPosition) {
      content.push({ ...base, opportunity: r.impressions });
    }
  }

  striking.sort((a, b) => b.opportunity - a.opportunity);
  ctrGap.sort((a, b) => b.missedClicks - a.missedClicks);
  content.sort((a, b) => b.opportunity - a.opportunity);
  return { striking, ctrGap, content };
}
