const pct = value => `${(value * 100).toFixed(1)}%`;
const cell = value => String(value).replace(/\|/g, '\\|').replace(/[\r\n]/g, ' ');

export function querySubtotal(rawRows) {
  const rows = rawRows.byQuery ?? [];
  return { clicks: rows.reduce((sum, row) => sum + row.clicks, 0), impressions: rows.reduce((sum, row) => sum + row.impressions, 0) };
}

export function verifiedPropertyTotals(snapshot) {
  const t = snapshot.rawRows.propertyTotals;
  return t?.status === 'OBSERVED' && t.aggregationType === 'byProperty' && t.dataState === 'final' && t.searchType === 'web' &&
    t.startDate === snapshot.startDate && t.endDate === snapshot.endDate &&
    ['clicks', 'impressions', 'ctr', 'position'].every(k => Number.isFinite(t[k]) && t[k] >= 0) && t.ctr <= 1 ? t : null;
}

export function renderOverview(snapshot) {
  const { clicks, impressions } = querySubtotal(snapshot.rawRows);
  const t = verifiedPropertyTotals(snapshot);
  return [
    t ? `**全站區間總覽（GSC 無維度／byProperty）**：${t.impressions} 次曝光、${t.clicks} 次點擊、CTR ${pct(t.ctr)}` :
      '**全站區間總量：UNKNOWN**（本期尚無同期間、已驗證的無維度 property 統計。）',
    '',
    `**已取得搜尋詞資料小計**：${impressions} 次曝光、${clicks} 次點擊、此批搜尋詞 CTR ${impressions ? pct(clicks / impressions) : 'UNKNOWN（無曝光）'}`,
    '',
    '_搜尋詞資料會省略匿名查詢，亦受 API 列數限制；此小計及各頁加總均不能代替全站總量。日期區間依 GSC 的 Pacific Time 日曆日。_',
    '',
  ];
}

export function renderLandingPages(row) {
  if (!row.landingPages?.length) return 'UNKNOWN（未取得同詞頁面資料）';
  return row.landingPages.map(p => {
    const path = p.page.replace(/^https?:\/\/[^/]+/, '') || '/';
    return `${cell(path)}（${p.impressions} 曝光／${p.clicks} 點擊／平均排名 ${p.position.toFixed(1)}）`;
  }).join('<br>');
}
