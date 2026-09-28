// 資料過期偵測：ingest 單站取數失敗時只印警告、不擋其他站（見 ingest_gsc.mjs），
// analyze 於是會拿該站「最後一份成功的快照」排版。2026-09-21、09-28 兩週 growth
// 站 GSC 403，週報照常寄出且看不出異狀——失敗不能靜默，落後就要在報告上明講。
//
// 基準取「本期各站最新快照中最晚的 endDate」而非「今天 − LAG_DAYS」：analyze 可能
// 在非排程日手動重跑，用今天推算會誤報；同一次 ingest 寫入的各站 endDate 必然相同，
// 某站落後就代表它這次沒抓到。所有站都失敗時 ingest 本身會 exit 1，不會走到這裡。

const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoDate(s) {
  const t = Date.parse(`${s}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(t)) {
    throw new Error(`不合法的日期：${s}（預期 YYYY-MM-DD）`);
  }
  return t;
}

export function freshestEndDate(endDates) {
  if (endDates.length === 0) return null;
  return endDates.reduce((max, d) => (d > max ? d : max));
}

export function staleNotice(endDate, freshest) {
  if (!freshest) return null;
  const lagDays = Math.round((parseIsoDate(freshest) - parseIsoDate(endDate)) / DAY_MS);
  if (lagDays <= 0) return null;
  return (
    `> ⚠️ **資料過期**：本站最新快照只到 ${endDate}，比本期其他站（${freshest}）落後 ${lagDays} 天。` +
    '最近的 GSC 取數很可能失敗了（權限、property 設定），以下數字與建議皆為舊資料，' +
    '請先查 GitHub Actions「Ingest GSC data」步驟的 log。'
  );
}
