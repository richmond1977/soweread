import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isDue, canCompare, buildBaseline, compareExperiment } from './experiments.mjs';

// 移植自 WISECODE_Website scripts/growth/__tests__/experiments.test.mjs（2026-09-24）。
// 差異：SOWEREAD 快照是 { startDate, endDate, rawRows } 而非 { period/range, byPage,
// byQueryPage }，這裡的 snapshot() helper 對齊 Prisma GrowthSnapshot 的形狀。
// CLI（experiment.mjs）改用 Prisma／Neon，不再是本機 JSON 檔，故不移植原本那個
// spawnSync 起 CLI 子行程、比對 JSON 檔案是否被寫入的測試——那會需要連真正的
// growth 資料庫，且會在資料庫留下測試紀錄；純規則邏輯已由下列測試覆蓋，
// CLI 那層的「不合法 result 值就不落庫」由 cmdDecide 裡的 validResults 檢查與
// process.exit(1) 保證（先驗證再呼叫 prisma.experiment.update）。

function snapshot(overrides = {}) {
  return {
    startDate: '2026-09-01',
    endDate: '2026-09-08',
    rawRows: {
      byPage: [
        { page: 'https://knowledge.soweread.com/topics/foo', clicks: 10, impressions: 200, ctr: 0.05, position: 8 },
      ],
      byQueryPage: [
        { query: '關鍵字a', page: 'https://knowledge.soweread.com/topics/foo', clicks: 5, impressions: 100, ctr: 0.05, position: 7 },
      ],
    },
    ...overrides,
  };
}

// isDue -----------------------------------------------------------------

test('isDue：剛好等於 reviewAfterDays → 到期', () => {
  const exp = { changedAt: '2026-09-01', reviewAfterDays: 28 };
  assert.equal(isDue(exp, '2026-09-29'), true);
});

test('isDue：差一天未到 reviewAfterDays → 未到期', () => {
  const exp = { changedAt: '2026-09-01', reviewAfterDays: 28 };
  assert.equal(isDue(exp, '2026-09-28'), false);
});

// canCompare --------------------------------------------------------------

test('canCompare：最新快照期間早於改版日 → 不可比較，附原因', () => {
  const exp = { changedAt: '2026-09-15' };
  const latest = { startDate: '2026-09-01', endDate: '2026-09-08' };
  const result = canCompare(exp, latest);
  assert.equal(result.ok, false);
  assert.equal(result.reason, '資料尚未涵蓋改版後期間');
});

test('canCompare：快照期間涵蓋改版後 → 可比較', () => {
  const exp = { changedAt: '2026-09-01' };
  const latest = { startDate: '2026-09-01', endDate: '2026-09-08' };
  assert.equal(canCompare(exp, latest).ok, true);
});

test('canCompare：沒有快照 → 不可比較', () => {
  const exp = { changedAt: '2026-09-01' };
  assert.equal(canCompare(exp, null).ok, false);
});

// buildBaseline -----------------------------------------------------------

test('buildBaseline：page 在快照 rawRows.byPage 找不到 → 空基準 empty:true', () => {
  const snap = snapshot();
  const baseline = buildBaseline('https://knowledge.soweread.com/topics/not-exist', [], snap);
  assert.equal(baseline.empty, true);
  assert.equal(baseline.page, null);
});

test('buildBaseline：page 找得到 → 記錄 page 指標與 queries', () => {
  const snap = snapshot();
  const baseline = buildBaseline('https://knowledge.soweread.com/topics/foo', ['關鍵字a', '不存在詞'], snap);
  assert.equal(baseline.empty, undefined);
  assert.equal(baseline.page.clicks, 10);
  assert.equal(baseline.queries.find((q) => q.query === '關鍵字a').clicks, 5);
  assert.equal(baseline.queries.find((q) => q.query === '不存在詞').missing, true);
});

// compareExperiment ---------------------------------------------------------

test('compareExperiment：資料未涵蓋改版後 → 回傳 ok:false 不強算', () => {
  const snap = snapshot();
  const baseline = buildBaseline('https://knowledge.soweread.com/topics/foo', ['關鍵字a'], snap, '2026-09-08');
  const exp = { changedAt: '2026-09-20', page: 'https://knowledge.soweread.com/topics/foo', queries: ['關鍵字a'], baseline };
  const latest = snapshot({ startDate: '2026-09-01', endDate: '2026-09-08' });
  const cmp = compareExperiment(exp, latest);
  assert.equal(cmp.ok, false);
  assert.equal(cmp.reason, '資料尚未涵蓋改版後期間');
});

test('compareExperiment：可比較時計算 page 與 query 前後差值', () => {
  const before = snapshot();
  const baseline = buildBaseline('https://knowledge.soweread.com/topics/foo', ['關鍵字a'], before, '2026-09-08');
  const exp = { changedAt: '2026-09-08', page: 'https://knowledge.soweread.com/topics/foo', queries: ['關鍵字a'], baseline };

  const after = snapshot({
    startDate: '2026-09-08',
    endDate: '2026-09-15',
    rawRows: {
      byPage: [
        { page: 'https://knowledge.soweread.com/topics/foo', clicks: 15, impressions: 220, ctr: 0.068, position: 6 },
      ],
      byQueryPage: [
        { query: '關鍵字a', page: 'https://knowledge.soweread.com/topics/foo', clicks: 8, impressions: 110, ctr: 0.07, position: 5 },
      ],
    },
  });

  const cmp = compareExperiment(exp, after);
  assert.equal(cmp.ok, true);
  assert.equal(cmp.page.comparable, true);
  assert.equal(cmp.page.delta.clicks, 5);
  const q = cmp.queries.find((r) => r.query === '關鍵字a');
  assert.equal(q.comparable, true);
  assert.equal(q.delta.clicks, 3);
});
