import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshestEndDate, staleNotice } from './staleness.mjs';

// 2026-09-28 事故：growth 站 GSC 取數連續兩週 403，ingest 只印警告、analyze 照樣
// 拿 09-11 的舊快照排版，週報看起來完全正常。這組測試鎖住「落後就要明講」。

test('freshestEndDate 取各站最新快照中最晚的 endDate', () => {
  assert.equal(freshestEndDate(['2026-09-11', '2026-09-25', '2026-09-18']), '2026-09-25');
});

test('freshestEndDate 空陣列回 null', () => {
  assert.equal(freshestEndDate([]), null);
});

test('staleNotice：與最新一致時不出警示', () => {
  assert.equal(staleNotice('2026-09-25', '2026-09-25'), null);
});

test('staleNotice：落後時回傳含舊區間終點、落後天數與最新終點的警示', () => {
  const notice = staleNotice('2026-09-11', '2026-09-25');
  assert.match(notice, /⚠️/);
  assert.match(notice, /2026-09-11/);
  assert.match(notice, /2026-09-25/);
  assert.match(notice, /14 天/);
});

test('staleNotice：落後 1 天也要警示（不設寬限）', () => {
  assert.match(staleNotice('2026-09-24', '2026-09-25'), /1 天/);
});

test('staleNotice：freshest 缺值時不出警示', () => {
  assert.equal(staleNotice('2026-09-25', null), null);
});

test('staleNotice：日期格式不合法時丟錯，不靜默略過', () => {
  assert.throws(() => staleNotice('not-a-date', '2026-09-25'));
});
