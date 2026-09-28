import assert from "node:assert/strict";
import test from "node:test";

import { primaryArticles } from "../../data/primary-articles.ts";
import type { PrimaryArticle } from "./primary-articles.ts";
import { groupPrimaryArticles, primaryArticlesForTopic } from "./primary-articles.ts";

/**
 * 主站文章索引的守門測試。
 *
 * 最重要的一條是「索引裡不得出現內文」——計畫書 §8.2 禁止把主站全文或
 * 改寫版發布到 growth 站，而產生索引的腳本只要多帶一個欄位就會違反它。
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_FIELDS = ["title", "url", "datePublished", "group"];

test("索引只保存標題、連結、日期與分組，沒有任何內文欄位", () => {
  for (const article of primaryArticles) {
    const fields = Object.keys(article).sort();
    assert.deepEqual(
      fields,
      [...ALLOWED_FIELDS].sort(),
      `文章「${article.title}」帶了預期外的欄位：${fields.join(", ")}`
    );
  }
});

test("每一篇都指向主站，且不是主站首頁", () => {
  for (const article of primaryArticles) {
    const url = new URL(article.url);
    assert.equal(url.hostname, "soweread.com", `「${article.title}」不是指向主站`);
    assert.notEqual(url.pathname, "/", `「${article.title}」只指向主站首頁`);
  }
});

test("標題與日期都有值，且日期格式合法", () => {
  assert.ok(primaryArticles.length > 0, "索引是空的");

  for (const article of primaryArticles) {
    assert.ok(article.title.length > 0, "有文章沒有標題");
    assert.match(article.datePublished, DATE_PATTERN, `「${article.title}」的日期格式不合法`);
  }
});

test("標題不含未還原的 HTML entity 或標籤", () => {
  for (const article of primaryArticles) {
    assert.ok(!article.title.includes("<"), `「${article.title}」殘留 HTML 標籤`);
    assert.ok(!/&[a-z]+;|&#\d+;/i.test(article.title), `「${article.title}」殘留 HTML entity`);
  }
});

test("網址不重複", () => {
  const urls = primaryArticles.map((article) => article.url);
  assert.equal(new Set(urls).size, urls.length, "索引裡有重複的網址");
});

test("分組不會遺漏或重複任何一篇", () => {
  const sections = groupPrimaryArticles(primaryArticles);
  const grouped = sections.flatMap((section) => section.articles);

  assert.equal(grouped.length, primaryArticles.length, "分組後篇數與原始不符");
  assert.equal(
    new Set(grouped.map((article) => article.url)).size,
    primaryArticles.length,
    "有文章被分到一個以上的組"
  );
});

test("每一組內依發布日期由新到舊排序", () => {
  for (const section of groupPrimaryArticles(primaryArticles)) {
    const dates = section.articles.map((article) => article.datePublished);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    assert.deepEqual(dates, sorted, `${section.name} 的排序不是由新到舊`);
  }
});

test("沒有文章的分組不會產生空區塊", () => {
  for (const section of groupPrimaryArticles(primaryArticles)) {
    assert.ok(section.articles.length > 0, `${section.name} 是空的區塊`);
    assert.ok(section.intro.length > 0, `${section.name} 缺少導讀文字`);
  }
});

test("空索引不會產生任何區塊", () => {
  assert.deepEqual(groupPrimaryArticles([]), []);
});

// 文章頁的「潤讀主站延伸閱讀」：依知識站主題挑同組主站文章，給 Google 一條
// 從已收錄的知識站頁面走到主站舊文的路（2026-09-28：主站 3–6 月外食與基改系列
// 在 sitemap 裡卻一直是 URL is unknown to Google，首頁與分類頁都沒連到它們）。

function fixture(title: string, group: PrimaryArticle["group"], datePublished: string): PrimaryArticle {
  return { title, url: `https://soweread.com/${encodeURIComponent(title)}/`, datePublished, group };
}

const FIXTURE: PrimaryArticle[] = [
  fixture("外食一", "eating-out", "2026-03-13"),
  fixture("外食二", "eating-out", "2026-03-27"),
  fixture("外食三", "eating-out", "2026-04-03"),
  fixture("基改一", "gmo", "2026-05-01"),
  fixture("其他一", "other", "2026-06-01"),
];

test("primaryArticlesForTopic 只回傳對應主題分組的文章，由新到舊", () => {
  const titles = primaryArticlesForTopic(FIXTURE, "nutrition-and-eating-out").map((a) => a.title);
  assert.deepEqual(titles, ["外食三", "外食二", "外食一"]);
});

test("primaryArticlesForTopic 排除已當作主要 CTA 的那一篇，不重複連結", () => {
  const cta = FIXTURE[1].url;
  const urls = primaryArticlesForTopic(FIXTURE, "nutrition-and-eating-out", { excludeUrl: cta }).map((a) => a.url);
  assert.ok(!urls.includes(cta));
  assert.equal(urls.length, 2);
});

test("primaryArticlesForTopic 依 limit 截斷", () => {
  assert.equal(primaryArticlesForTopic(FIXTURE, "nutrition-and-eating-out", { limit: 1 }).length, 1);
});

test("primaryArticlesForTopic：沒有對應分組的主題、或 topicSlug 缺值時回空陣列", () => {
  assert.deepEqual(primaryArticlesForTopic(FIXTURE, "no-such-topic"), []);
  assert.deepEqual(primaryArticlesForTopic(FIXTURE, null), []);
});

test("「其他」分組不會被當成任何主題的延伸閱讀", () => {
  for (const slug of ["nutrition-and-eating-out", "food-labeling", "food-production", "pesticides-and-veterinary-drugs"]) {
    assert.ok(primaryArticlesForTopic(FIXTURE, slug).every((a) => a.group !== "other"));
  }
});

test("真實索引：外食主題至少挑得出 5 篇主站外食文章", () => {
  assert.ok(primaryArticlesForTopic(primaryArticles, "nutrition-and-eating-out").length >= 5);
});
