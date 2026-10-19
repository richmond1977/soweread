import test from 'node:test';
import assert from 'node:assert/strict';

import { isObservationOnly, renderAbsorbCandidates } from './render-observation.mjs';

const row = (query, impressions, position, page) => ({ query, impressions, clicks: 0, position, page });

test('isObservationOnly 只認 config.observationOnlySites 列出的站', () => {
  const config = { observationOnlySites: ['primary'] };
  assert.equal(isObservationOnly('primary', config), true);
  assert.equal(isObservationOnly('growth', config), false);
});

test('isObservationOnly 在 config 沒有該欄位時一律為 false（舊設定照舊產出完整報告）', () => {
  assert.equal(isObservationOnly('primary', {}), false);
  assert.equal(isObservationOnly('primary', { observationOnlySites: 'primary' }), false);
});

test('renderAbsorbCandidates 合併臨門一腳與內容缺口，依曝光由高到低排序', () => {
  const md = renderAbsorbCandidates({
    striking: [row('蔥產季', 20, 4.9, 'https://soweread.com/a/'), row('分蔥', 44, 8.8, 'https://soweread.com/a/')],
    content: [row('土雞品種', 30, 25.3, 'https://soweread.com/b/')],
    ctrGap: [row('不該出現', 99, 2.0, 'https://soweread.com/c/')],
  }).join('\n');
  const order = ['分蔥', '土雞品種', '蔥產季'].map((q) => md.indexOf(`| ${q} |`));
  assert.ok(order.every((i) => i > 0), '三個候選都要出現');
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.doesNotMatch(md, /不該出現/);
});

test('renderAbsorbCandidates 把 percent-encoded 的中文網址解成可讀路徑', () => {
  const page = 'https://soweread.com/%E5%88%86%E8%94%A5/';
  const md = renderAbsorbCandidates({ striking: [row('分蔥', 44, 8.8, page)], content: [] }).join('\n');
  assert.match(md, /\| \/分蔥\/ \|/);
});

test('renderAbsorbCandidates 遇到不合法的編碼不炸，原樣輸出', () => {
  const md = renderAbsorbCandidates({ striking: [row('x', 10, 5, 'https://soweread.com/%E5%/')], content: [] }).join('\n');
  assert.match(md, /\/%E5%\//);
});

test('renderAbsorbCandidates 沒有候選時明講，不渲染空表', () => {
  const md = renderAbsorbCandidates({ striking: [], content: [] }).join('\n');
  assert.match(md, /本區間無符合的搜尋詞/);
  assert.doesNotMatch(md, /\|---/);
});
