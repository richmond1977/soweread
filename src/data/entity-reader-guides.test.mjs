import assert from "node:assert/strict";
import test from "node:test";
import { entityReaderGuides, findEntityReaderGuide, nutritionTeachingExamples, readerGuideSources, sodiumForGrams } from "./entity-reader-guides.ts";
import { growthContent } from "./growth-content.ts";
import { findPublicEntity, growthSitemapPaths } from "../lib/growth/knowledge-core.ts";

test("三份指南保留既有公開頁，未虛構人工審查", () => {
  assert.deepEqual(entityReaderGuides.map((guide) => guide.slug).sort(), ["allergen-labeling", "egg-friendly-production-system", "nutrition-facts-label"]);
  for (const guide of entityReaderGuides) {
    const entity = findPublicEntity(growthContent, guide.slug);
    assert.ok(entity);
    assert.equal(entity.reviewedAt, null);
  }
  assert.equal(findEntityReaderGuide("not-a-public-entity"), undefined);
});

test("章節來源與閱讀連結可解析，表格欄位完整", () => {
  const paths = new Set(growthSitemapPaths(growthContent));
  for (const guide of entityReaderGuides) {
    const ids = guide.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const section of guide.sections) {
      for (const id of section.sourceIds) assert.ok(readerGuideSources.some((source) => source.id === id), `${guide.slug}: missing ${id}`);
      if (section.table) for (const row of section.table.rows) assert.equal(row.length, section.table.columns.length);
    }
    for (const link of guide.links) assert.ok(paths.has(link.href), `broken public link: ${link.href}`);
  }
  for (const source of readerGuideSources) {
    assert.equal(new URL(source.url).protocol, "https:");
    assert.match(source.url, /#page=\d+$/);
    assert.equal(source.retrievedAt, "2026-09-08");
  }
});

test("假設算例統一重量後反轉每份比較，實吃份量亦正確", () => {
  const [a, b] = nutritionTeachingExamples;
  assert.ok(a.sodiumMgPerServing < b.sodiumMgPerServing);
  assert.equal(sodiumForGrams(a.sodiumMgPerServing, a.servingGrams, 100), 400);
  assert.equal(sodiumForGrams(b.sodiumMgPerServing, b.servingGrams, 100), 300);
  assert.equal(sodiumForGrams(a.sodiumMgPerServing, a.servingGrams, 60), 240);
  assert.equal(sodiumForGrams(b.sodiumMgPerServing, b.servingGrams, 60), 180);
  for (const args of [[120, 0, 60], [120, -1, 60], [NaN, 30, 60], [120, 30, Infinity], [-1, 30, 60], [120, 30, -1]]) {
    assert.throws(() => sodiumForGrams(args[0], args[1], args[2]), RangeError);
  }
});

test("營養格式錯誤與四類友善系統說法不會回歸", () => {
  const entity = findPublicEntity(growthContent, "nutrition-facts-label");
  const article = growthContent.articles.find((item) => item.slug === "mandatory-food-labels");
  for (const content of [entity.description, article.content]) {
    assert.ok(content.includes("每份＋每日參考值百分比"));
    assert.ok(!content.includes("營養標示須同時呈現"));
  }
  assert.ok(!entity.seoDescription.includes("起同時標示"));
  assert.ok(article.sourceIds.includes("src-nutrition-format-qa"));
  const egg = growthContent.articles.find((item) => item.slug === "egg-production-systems");
  assert.ok(!egg.summary.includes("這四個詞"));
  assert.ok(egg.summary.includes("三類"));
  assert.ok(!article.content.includes("含麥麩之穀物"));
});
