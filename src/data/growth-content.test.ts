import assert from "node:assert/strict";
import test from "node:test";

import {
  entitiesForTopic,
  articlesForTopic,
  growthSitemapPaths,
  publicRelationsForEntity,
  publishedArticles,
  publishedEntities,
  publishedTopics,
  sourcesByIds,
} from "../lib/growth/knowledge-core.ts";

import { growthContent } from "./growth-content.ts";

/**
 * 這些測試守的是「不得建立假來源、不得產生公開薄頁」這條發布紀律。
 *
 * 它們檢查的是內容本身的完整性，不是渲染結果——因為一旦引用關係斷掉
 * （來源 id 打錯、實體 slug 改名），頁面上會安靜地少掉一整個來源區塊，
 * 而那正是最不該安靜失敗的地方。
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

test("內容模組不是 fixture", () => {
  assert.equal(growthContent.isFixture, false);
});

test("沒有任何佔位來源殘留", () => {
  for (const source of growthContent.sources) {
    assert.ok(!source.title.includes("佔位"), `來源 ${source.id} 的標題仍標示為佔位`);
    assert.ok(!source.note.includes("佔位"), `來源 ${source.id} 的備註仍標示為佔位`);

    // 機構首頁（結尾只有網域）不足以支撐主張，除非該頁本身就是引用標的。
    const path = new URL(source.url).pathname;
    assert.notEqual(path, "/", `來源 ${source.id} 指向機構首頁，不是具體文件`);
  }
});

test("每一筆來源都有 publisher 與合法的擷取日期", () => {
  for (const source of growthContent.sources) {
    assert.ok(source.publisher.length > 0, `來源 ${source.id} 缺少 publisher`);
    assert.match(source.retrievedAt, DATE_PATTERN, `來源 ${source.id} 的 retrievedAt 格式不合法`);
    if (source.publishedAt !== null) {
      assert.match(source.publishedAt, DATE_PATTERN, `來源 ${source.id} 的 publishedAt 格式不合法`);
    }
  }
});

test("slug 與 id 都不重複", () => {
  const collect = (values: string[], label: string) => {
    assert.equal(new Set(values).size, values.length, `${label} 有重複值`);
  };

  collect(growthContent.topics.map((topic) => topic.slug), "topic slug");
  collect(growthContent.entities.map((entity) => entity.slug), "entity slug");
  collect(growthContent.articles.map((article) => article.slug), "article slug");
  collect(growthContent.sources.map((source) => source.id), "source id");
});

test("所有來源引用都解析得到，沒有斷掉的 id", () => {
  const known = new Set(growthContent.sources.map((source) => source.id));

  for (const entity of growthContent.entities) {
    for (const id of entity.sourceIds) {
      assert.ok(known.has(id), `實體 ${entity.slug} 引用了不存在的來源 ${id}`);
    }
  }

  for (const article of growthContent.articles) {
    for (const id of article.sourceIds) {
      assert.ok(known.has(id), `文章 ${article.slug} 引用了不存在的來源 ${id}`);
    }
  }

  for (const relation of growthContent.relations) {
    if (relation.sourceId !== null) {
      assert.ok(known.has(relation.sourceId), `關係 ${relation.id} 引用了不存在的來源`);
    }
  }
});

test("公開的實體一定帶著來源", () => {
  for (const entity of publishedEntities(growthContent)) {
    assert.ok(entity.sourceIds.length > 0, `公開實體 ${entity.slug} 沒有任何來源`);
    assert.equal(
      sourcesByIds(growthContent, entity.sourceIds).length,
      entity.sourceIds.length,
      `公開實體 ${entity.slug} 的來源無法全部解析`
    );
  }
});

test("公開的實體與文章都有實質內容，不是薄頁", () => {
  for (const entity of publishedEntities(growthContent)) {
    assert.ok(entity.description.length >= 60, `公開實體 ${entity.slug} 的敘述過短`);
    assert.ok(entity.seoTitle.length > 0, `公開實體 ${entity.slug} 缺少 seoTitle`);
    assert.ok(entity.seoDescription.length > 0, `公開實體 ${entity.slug} 缺少 seoDescription`);
  }

  for (const article of publishedArticles(growthContent)) {
    assert.ok(article.content.length >= 600, `公開文章 ${article.slug} 的內文過短`);
    assert.ok(article.summary.length > 0, `公開文章 ${article.slug} 缺少摘要`);
  }
});

test("公開文章有作者與發布日期", () => {
  for (const article of publishedArticles(growthContent)) {
    assert.ok(article.authorName.length > 0, `公開文章 ${article.slug} 沒有作者`);
    assert.ok(article.datePublished !== null, `公開文章 ${article.slug} 沒有發布日`);
    assert.match(article.datePublished, DATE_PATTERN);
    assert.ok(article.dateModified !== null, `公開文章 ${article.slug} 沒有更新日`);
  }
});

test("文章的主題與實體關聯都指向存在且公開的資料", () => {
  const publicTopicSlugs = new Set(publishedTopics(growthContent).map((topic) => topic.slug));
  const publicEntitySlugs = new Set(publishedEntities(growthContent).map((entity) => entity.slug));

  for (const article of publishedArticles(growthContent)) {
    assert.ok(
      article.topicSlug !== null && publicTopicSlugs.has(article.topicSlug),
      `文章 ${article.slug} 的主題不存在或未公開`
    );
    for (const slug of article.entitySlugs) {
      assert.ok(publicEntitySlugs.has(slug), `文章 ${article.slug} 連到未公開的實體 ${slug}`);
    }
  }
});

test("每個公開主題都有實體與文章可看，不會是空的 hub", () => {
  const topics = publishedTopics(growthContent);
  assert.ok(topics.length >= 1);

  for (const topic of topics) {
    assert.ok(
      entitiesForTopic(growthContent, topic.slug).length >= 1,
      `主題 ${topic.slug} 沒有任何公開實體`
    );
    assert.ok(
      articlesForTopic(growthContent, topic.slug).length >= 1,
      `主題 ${topic.slug} 沒有任何公開文章`
    );
    assert.ok(topic.keyQuestions.length >= 2, `主題 ${topic.slug} 的核心問題太少`);
    assert.ok(topic.definition.length >= 60, `主題 ${topic.slug} 缺少足夠的定義`);
  }
});

test("關係的主客體都存在，且公開頁只顯示有來源的關係", () => {
  const slugs = new Set(growthContent.entities.map((entity) => entity.slug));

  for (const relation of growthContent.relations) {
    assert.ok(slugs.has(relation.subjectSlug), `關係 ${relation.id} 的主體不存在`);
    assert.ok(slugs.has(relation.objectSlug), `關係 ${relation.id} 的客體不存在`);
  }

  for (const entity of publishedEntities(growthContent)) {
    for (const relation of publicRelationsForEntity(growthContent, entity.slug)) {
      assert.ok(relation.sourceId !== null, `實體 ${entity.slug} 顯示了沒有來源的關係`);
    }
  }
});

test("draft 資料不會進入公開頁面或 sitemap", () => {
  const drafts = growthContent.entities.filter((entity) => entity.publicationStatus !== "published");
  assert.ok(drafts.length >= 1, "應保留至少一筆 draft，證明未公開資料確實被擋下");

  const paths = growthSitemapPaths(growthContent);
  for (const draft of drafts) {
    assert.ok(
      !paths.includes(`/entities/${draft.slug}`),
      `draft 實體 ${draft.slug} 出現在 sitemap`
    );
  }
});

test("sitemap 涵蓋所有公開頁且沒有重複", () => {
  const paths = growthSitemapPaths(growthContent);
  assert.equal(new Set(paths).size, paths.length, "sitemap 有重複路徑");

  for (const topic of publishedTopics(growthContent)) {
    assert.ok(paths.includes(`/topics/${topic.slug}`), `sitemap 少了主題 ${topic.slug}`);
  }
  for (const entity of publishedEntities(growthContent)) {
    assert.ok(paths.includes(`/entities/${entity.slug}`), `sitemap 少了實體 ${entity.slug}`);
  }
  for (const article of publishedArticles(growthContent)) {
    assert.ok(paths.includes(`/articles/${article.slug}`), `sitemap 少了文章 ${article.slug}`);
  }
});

test("導向主站的 CTA 指向具體文章，不是首頁", () => {
  for (const article of publishedArticles(growthContent)) {
    if (article.primaryCtaUrl === null) continue;

    const url = new URL(article.primaryCtaUrl);
    assert.equal(url.hostname, "soweread.com", `文章 ${article.slug} 的 CTA 不是指向主站`);
    assert.notEqual(url.pathname, "/", `文章 ${article.slug} 的 CTA 只指向主站首頁`);
    assert.ok(article.primaryCtaLabel.length > 0, `文章 ${article.slug} 的 CTA 沒有標籤`);
  }
});
