/**
 * 「僅觀察」站台的週報章節（純規則，不用 AI）。
 *
 * 潤讀主站 soweread.com 是 WordPress，這個 repo 改不到，Richmond 目前也無法修改
 * （2026-10-19 決定）。把主站的臨門一腳、點擊落差、下滑、互搶照常列出，等於每週
 * 重複產出沒人能執行的待辦。所以列在 config/growth.json 的 observationOnlySites
 * 裡的站，只保留曝光與收錄數字，機會分析改成「成長站可承接的搜尋詞」：主站已經
 * 證明有搜尋需求的詞，由 knowledge.soweread.com 新增內容來接。
 */

export function isObservationOnly(site, config) {
  return Array.isArray(config.observationOnlySites) && config.observationOnlySites.includes(site);
}

// WordPress 的中文 slug 是 percent-encoded，週報直接印出來沒人看得懂；解不開就原樣保留。
function readablePath(url) {
  const path = url ? url.replace(/^https?:\/\/[^/]+/, '') || '/' : '—';
  let decoded;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    decoded = path;
  }
  return decoded.length > 40 ? `${decoded.slice(0, 40)}…` : decoded;
}

/**
 * 把 classify() 的 striking 與 content 合併成承接候選，依曝光由高到低排序。
 * ctrGap 不列：排名已在前 5 的詞，問題出在主站自己的標題描述，成長站另開頁面接不到。
 *
 * @param {{ striking: object[], content: object[] }} result classify() 的輸出
 * @returns {string[]} Markdown 行陣列
 */
export function renderAbsorbCandidates(result) {
  const lines = [];
  lines.push('### 🔁 成長站可承接的搜尋詞');
  lines.push('');
  lines.push(
    '主站已有曝光、但排名在前三名之外的搜尋詞，代表這些題目確實有人在搜。' +
      '可評估在成長站新增實體頁或文章來承接，再連回主站原文。'
  );
  lines.push('');

  const candidates = [...result.striking, ...result.content].sort((a, b) => b.impressions - a.impressions);
  if (candidates.length === 0) {
    lines.push('_（本區間無符合的搜尋詞）_');
    lines.push('');
    return lines;
  }

  lines.push('| 搜尋詞 | 曝光 | 點擊 | 主站排名 | 主站頁面 |');
  lines.push('|---|--:|--:|--:|---|');
  for (const r of candidates.slice(0, 15)) {
    lines.push(`| ${r.query} | ${r.impressions} | ${r.clicks} | ${r.position.toFixed(1)} | ${readablePath(r.page)} |`);
  }
  lines.push('');
  return lines;
}
