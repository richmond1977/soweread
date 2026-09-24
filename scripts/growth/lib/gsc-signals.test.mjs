import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  findDeclines,
  findCannibalization,
  DECLINE_MIN_PREV_IMPRESSIONS,
  DECLINE_MIN_POSITION_DROP,
  DECLINE_MIN_CLICKS_DROP_RATIO,
  DECLINE_MIN_IMPRESSIONS_DROP_RATIO,
  DECLINE_MAX_ROWS,
  CANNIBAL_MIN_IMPRESSIONS_PER_PAGE,
  CANNIBAL_MAX_ROWS,
} from './gsc-signals.mjs';

// 移植自 WISECODE_Website scripts/growth/__tests__/gsc-signals.test.mjs（2026-09-24）。
// 差異：SOWEREAD 的 findDeclines/findCannibalization 多吃一個 config 參數（品牌詞
// 來自 config/growth.json 而非硬編字串），這裡用最小 config stub 取代。

const CONFIG = { brandTerms: ['潤讀', 'soweread'] };

function q(query, overrides = {}) {
  return { query, clicks: 10, impressions: 100, ctr: 0.1, position: 5, ...overrides };
}

// findDeclines --------------------------------------------------------------

test('findDeclines：無前期資料 → 回傳空陣列', () => {
  const cur = { byQuery: [q('a')] };
  assert.deepEqual(findDeclines(cur, null, CONFIG), []);
});

test('findDeclines：前期曝光低於門檻 → 不列入即使排名大幅下滑', () => {
  const prev = { byQuery: [q('低曝光詞', { impressions: DECLINE_MIN_PREV_IMPRESSIONS - 1, position: 3 })] };
  const cur = { byQuery: [q('低曝光詞', { position: 30 })] };
  assert.deepEqual(findDeclines(cur, prev, CONFIG), []);
});

test('findDeclines：排名下滑達門檻（邊界值）→ 列入', () => {
  const prev = { byQuery: [q('排名下滑詞', { impressions: DECLINE_MIN_PREV_IMPRESSIONS, position: 5 })] };
  const cur = { byQuery: [q('排名下滑詞', { position: 5 + DECLINE_MIN_POSITION_DROP })] };
  const rows = findDeclines(cur, prev, CONFIG);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].query, '排名下滑詞');
  assert.equal(rows[0].positionDrop, DECLINE_MIN_POSITION_DROP);
});

test('findDeclines：排名下滑未達門檻（差 1）→ 不列入（其餘指標也未觸發）', () => {
  const prev = { byQuery: [q('小幅下滑詞', { impressions: 50, clicks: 10, position: 5 })] };
  const cur = { byQuery: [q('小幅下滑詞', { clicks: 10, impressions: 50, position: 5 + DECLINE_MIN_POSITION_DROP - 1 })] };
  assert.deepEqual(findDeclines(cur, prev, CONFIG), []);
});

test('findDeclines：點擊下降達門檻比例（邊界值）→ 列入', () => {
  const prevClicks = 100;
  const curClicks = prevClicks * (1 - DECLINE_MIN_CLICKS_DROP_RATIO); // 剛好達到門檻比例
  const prev = { byQuery: [q('點擊下降詞', { impressions: 50, clicks: prevClicks, position: 5 })] };
  const cur = { byQuery: [q('點擊下降詞', { impressions: 50, clicks: curClicks, position: 5 })] };
  const rows = findDeclines(cur, prev, CONFIG);
  assert.equal(rows.length, 1);
});

test('findDeclines：曝光下降達門檻比例（邊界值）→ 列入', () => {
  const prevImpressions = 100;
  const curImpressions = prevImpressions * (1 - DECLINE_MIN_IMPRESSIONS_DROP_RATIO);
  const prev = { byQuery: [q('曝光下降詞', { impressions: prevImpressions, clicks: 5, position: 5 })] };
  const cur = { byQuery: [q('曝光下降詞', { impressions: curImpressions, clicks: 5, position: 5 })] };
  const rows = findDeclines(cur, prev, CONFIG);
  assert.equal(rows.length, 1);
});

test('findDeclines：本期完全消失 → 視為 100% 下降，列入且標記 disappeared', () => {
  const prev = { byQuery: [q('消失詞', { impressions: 50, clicks: 10, position: 5 })] };
  const cur = { byQuery: [] };
  const rows = findDeclines(cur, prev, CONFIG);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].disappeared, true);
  assert.equal(rows[0].clicksDropRatio, 1);
  assert.equal(rows[0].impressionsDropRatio, 1);
});

test('findDeclines：品牌詞與雜訊詞一律濾除', () => {
  const prev = {
    byQuery: [
      q('潤讀食安', { impressions: 100, clicks: 20, position: 3 }),
      q('foo -site:example.com', { impressions: 100, clicks: 20, position: 3 }),
    ],
  };
  const cur = {
    byQuery: [
      q('潤讀食安', { impressions: 100, clicks: 1, position: 30 }),
      q('foo -site:example.com', { impressions: 100, clicks: 1, position: 30 }),
    ],
  };
  assert.deepEqual(findDeclines(cur, prev, CONFIG), []);
});

test('findDeclines：依前期點擊+曝光排序、上限筆數', () => {
  const prev = { byQuery: [] };
  const cur = { byQuery: [] };
  for (let i = 0; i < DECLINE_MAX_ROWS + 5; i++) {
    const impressions = DECLINE_MIN_PREV_IMPRESSIONS + i; // 影響力遞增
    prev.byQuery.push(q(`詞${i}`, { impressions, clicks: i, position: 5 }));
    cur.byQuery.push(q(`詞${i}`, { impressions: 1, clicks: 0, position: 5 + DECLINE_MIN_POSITION_DROP }));
  }
  const rows = findDeclines(cur, prev, CONFIG);
  assert.equal(rows.length, DECLINE_MAX_ROWS);
  // 最大影響力（最後加入、impressions 最高）應排第一
  assert.equal(rows[0].query, `詞${DECLINE_MAX_ROWS + 4}`);
});

test('findDeclines: 前期 0 點擊且本期 0 點擊、曝光小幅下降，不列入', () => {
  const prev = { byQuery: [{ query: 'zero click term', clicks: 0, impressions: 3269, position: 10.0 }] };
  const cur = { byQuery: [{ query: 'zero click term', clicks: 0, impressions: 3118, position: 10.3 }] };
  assert.equal(findDeclines(cur, prev, CONFIG).length, 0);
});

test('findDeclines: 前期點擊低於 DECLINE_MIN_PREV_CLICKS 時不以點擊比例判定', () => {
  const prev = { byQuery: [{ query: 'small base term', clicks: 4, impressions: 1293, position: 9.6 }] };
  const cur = { byQuery: [{ query: 'small base term', clicks: 2, impressions: 1200, position: 9.7 }] };
  assert.equal(findDeclines(cur, prev, CONFIG).length, 0);
});

// findCannibalization ---------------------------------------------------------

function qp(query, page, overrides = {}) {
  return { query, page, clicks: 1, impressions: 20, ctr: 0.05, position: 10, ...overrides };
}

test('findCannibalization：同一詞只有一個頁面 → 不列入', () => {
  const rawRows = { byQueryPage: [qp('單頁詞', '/a')] };
  assert.deepEqual(findCannibalization(rawRows, CONFIG), []);
});

test('findCannibalization：同一詞兩頁曝光皆達門檻 → 列入，內含各頁明細', () => {
  const rawRows = {
    byQueryPage: [
      qp('互搶詞', '/a', { impressions: CANNIBAL_MIN_IMPRESSIONS_PER_PAGE, position: 8 }),
      qp('互搶詞', '/b', { impressions: CANNIBAL_MIN_IMPRESSIONS_PER_PAGE + 5, position: 12 }),
    ],
  };
  const rows = findCannibalization(rawRows, CONFIG);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].query, '互搶詞');
  assert.equal(rows[0].pages.length, 2);
  // 依曝光排序，曝光高者在前
  assert.equal(rows[0].pages[0].page, '/b');
});

test('findCannibalization：其中一頁曝光低於門檻 → 該頁不計入，剩一頁則整體不列入', () => {
  const rawRows = {
    byQueryPage: [
      qp('半互搶詞', '/a', { impressions: CANNIBAL_MIN_IMPRESSIONS_PER_PAGE }),
      qp('半互搶詞', '/b', { impressions: CANNIBAL_MIN_IMPRESSIONS_PER_PAGE - 1 }),
    ],
  };
  assert.deepEqual(findCannibalization(rawRows, CONFIG), []);
});

test('findCannibalization：品牌詞與雜訊詞濾除', () => {
  const rawRows = {
    byQueryPage: [
      qp('潤讀專欄', '/a', { impressions: 50 }),
      qp('潤讀專欄', '/b', { impressions: 50 }),
    ],
  };
  assert.deepEqual(findCannibalization(rawRows, CONFIG), []);
});

test('findCannibalization：依涉及頁面總曝光排序、上限筆數', () => {
  const rows = [];
  for (let i = 0; i < CANNIBAL_MAX_ROWS + 5; i++) {
    rows.push(qp(`詞${i}`, '/a', { impressions: CANNIBAL_MIN_IMPRESSIONS_PER_PAGE + i }));
    rows.push(qp(`詞${i}`, '/b', { impressions: CANNIBAL_MIN_IMPRESSIONS_PER_PAGE + i }));
  }
  const result = findCannibalization({ byQueryPage: rows }, CONFIG);
  assert.equal(result.length, CANNIBAL_MAX_ROWS);
  assert.equal(result[0].query, `詞${CANNIBAL_MAX_ROWS + 4}`);
});
