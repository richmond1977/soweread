import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyIntent, recommendAction } from './serp-intent.mjs';

function serp(organic) {
  return { organic };
}

test('classifyIntent: 定義型查詢（是什麼、維基百科主導）', () => {
  const result = classifyIntent(
    serp([
      { title: 'MRL 是什麼？農藥殘留容許量科普', snippet: '定義說明', link: 'https://zh.wikipedia.org/wiki/MRL' },
      { title: 'MRL 的定義與計算方式', snippet: '', link: 'https://example.com/a' },
    ])
  );
  assert.equal(result.contentType, 'definition');
  assert.ok(result.authorityDomainCount >= 1);
});

test('classifyIntent: 爭議證據型查詢（致癌、安全性）', () => {
  const result = classifyIntent(
    serp([
      { title: '嘉磷塞致癌嗎？IARC 與 EFSA 立場不同', snippet: '風險評估', link: 'https://tfda.gov.tw/x' },
      { title: '嘉磷塞有害嗎？最新研究一次看', snippet: '', link: 'https://news.example.com/y' },
    ])
  );
  assert.equal(result.contentType, 'controversy');
});

test('classifyIntent: 比較型查詢', () => {
  const result = classifyIntent(
    serp([
      { title: '平飼 vs 放牧雞蛋差在哪？', snippet: '', link: 'https://example.com/a' },
      { title: '有機認證與產銷履歷的差別', snippet: '', link: 'https://example.com/b' },
    ])
  );
  assert.equal(result.contentType, 'comparison');
});

test('classifyIntent: 教學／判讀型查詢', () => {
  const result = classifyIntent(
    serp([
      { title: '食品標示怎麼看？成分表判讀教學', snippet: '', link: 'https://example.com/a' },
      { title: '營養標示怎麼看：常見問題', snippet: '', link: 'https://example.com/b' },
    ])
  );
  assert.equal(result.contentType, 'howto');
});

test('classifyIntent: 訊號不足時回傳 unclear', () => {
  const result = classifyIntent(serp([]));
  assert.equal(result.contentType, 'unclear');
  assert.equal(result.totalConsidered, 0);
});

test('classifyIntent: 無任何分類命中時回傳 unclear 而非誤判', () => {
  const result = classifyIntent(
    serp([{ title: '完全不相干的標題文字', snippet: '沒有任何關鍵字命中', link: 'https://example.com/z' }])
  );
  assert.equal(result.contentType, 'unclear');
});

test('recommendAction: 依 contentType 與是否已有落地頁給出不同建議', () => {
  assert.match(recommendAction({ contentType: 'controversy', hasLandingPage: false }), /證據型 Entity/);
  assert.match(recommendAction({ contentType: 'controversy', hasLandingPage: true }), /補證據段落/);
  assert.match(recommendAction({ contentType: 'definition', hasLandingPage: false }), /新增 Entity/);
});

test('recommendAction: 未知組合落回人工判斷而不拋錯', () => {
  assert.equal(recommendAction({ contentType: 'not-a-real-type', hasLandingPage: false }), '需人工判斷');
});
