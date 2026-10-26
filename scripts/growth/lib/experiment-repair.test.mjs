import { test } from 'node:test';
import assert from 'node:assert/strict';
import { preChangeRange, availablePreChangeRange, gscCalendarDate, needsBaselineRepair, fetchBaselineSnapshot, repairedBaseline, applyBaselineRepair } from './experiment-repair.mjs';

const experiment = () => ({ id: 'synthetic', status: 'running', changedAt: '2026-09-28', site: 'growth', page: '/topics/foo',
  queriesJson: ['missing'], baselineJson: { startDate: '2026-09-05', endDate: '2026-10-02', includesPostChange: true } });
const site = { gscSiteUrl: 'https://example.com/', domain: 'https://example.com' };

test('改版前28日範圍：包含月界、閏年並排除改版日', () => {
  assert.deepEqual(preChangeRange('2026-09-28'), { startDate: '2026-08-31', endDate: '2026-09-27' });
  assert.deepEqual(preChangeRange('2024-03-01'), { startDate: '2024-02-02', endDate: '2024-02-29' });
  assert.throws(() => preChangeRange('2026-02-30'));
});

test('只選running污染基準', () => {
  assert.equal(needsBaselineRepair(experiment()), true);
  assert.equal(needsBaselineRepair({ ...experiment(), status: 'keep' }), false);
  assert.equal(needsBaselineRepair({ ...experiment(), baselineJson: { endDate: '2026-09-27' } }), false);
});

test('近期基準只用已過三日緩衝的PT日曆日，未來日期拒絕', async () => {
  const now = new Date('2026-10-27T02:00:00Z'); // PT 仍為10/26
  const defaultChangedAt = gscCalendarDate(now);
  assert.equal(defaultChangedAt, '2026-10-26');
  assert.doesNotThrow(() => availablePreChangeRange(defaultChangedAt, now));
  assert.deepEqual(availablePreChangeRange('2026-10-26', now), { startDate: '2026-09-26', endDate: '2026-10-23' });
  assert.deepEqual(availablePreChangeRange('2026-09-28', now), { startDate: '2026-08-31', endDate: '2026-09-27' });
  assert.throws(() => availablePreChangeRange('2026-10-27', now), /不能晚於/);
  const calls = [];
  const snapshot = await fetchBaselineSnapshot(site, '/topics/foo', [], '2026-10-26', async (_url, body) => { calls.push(body); return {}; }, now);
  assert.equal(calls[0].endDate, '2026-10-23');
  assert.equal(snapshot.startDate, '2026-09-26');
});

test('精確page/query取數且空資料維持UNKNOWN並保留原始基準', async () => {
  const calls = [];
  const snapshot = await fetchBaselineSnapshot(site, '/topics/foo', ['missing'], '2026-09-28', async (url, body) => {
    calls.push({ url, body });
    return {};
  });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].body.dimensionFilterGroups[0].filters[0].expression, 'https://example.com/topics/foo');
  assert.deepEqual(calls[1].body.dimensions, ['query', 'page']);
  assert.equal(calls[1].body.dimensionFilterGroups[0].filters[1].expression, 'missing');
  assert.equal(calls[0].body.startDate, '2026-08-31');
  assert.equal(calls[0].body.endDate, '2026-09-27');
  const baseline = repairedBaseline(experiment(), snapshot, 'synthetic-time');
  assert.equal(baseline.empty, true);
  assert.equal(baseline.page, null);
  assert.equal(baseline.queries[0].missing, true);
  assert.deepEqual(baseline.repairProvenance.originalBaseline, experiment().baselineJson);
  assert.equal(baseline.includesPostChange, undefined);
  const repairedExperiment = { ...experiment(), baselineJson: baseline };
  assert.equal(needsBaselineRepair(repairedExperiment), false);
  assert.deepEqual(repairedBaseline(repairedExperiment, snapshot).repairProvenance.originalBaseline, experiment().baselineJson);
});

test('回應缺指標或API失敗均拒絕修復', async () => {
  await assert.rejects(fetchBaselineSnapshot(site, '/topics/foo', [], '2026-09-28', async () => ({ rows: [{ keys: ['https://example.com/topics/foo'], clicks: 0 }] })), /缺漏/);
  await assert.rejects(fetchBaselineSnapshot(site, '/topics/foo', [], '2026-09-28', async () => ({ rows: [{ keys: ['https://example.com/wrong'], clicks: 0, impressions: 1, ctr: 0, position: 1 }] })), /不符 exact filter/);
  await assert.rejects(fetchBaselineSnapshot(site, '/topics/foo', [], '2026-09-28', async () => { throw new Error('synthetic API error'); }), /synthetic API error/);
});

test('CAS僅更新baseline，併發變更拒絕覆蓋', async () => {
  let call;
  const baseline = { empty: true };
  await applyBaselineRepair({ experiment: { updateMany: async (input) => { call = input; return { count: 1 }; } } }, experiment(), baseline);
  assert.deepEqual(call.data, { baselineJson: baseline });
  assert.deepEqual(call.where.baselineJson, { equals: experiment().baselineJson });
  assert.equal(call.where.status, 'running');
  await assert.rejects(applyBaselineRepair({ experiment: { updateMany: async () => ({ count: 0 }) } }, experiment(), baseline), /未覆寫/);
});
