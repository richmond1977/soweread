import test from "node:test";
import assert from "node:assert/strict";
import { growthFixture } from "../../data/growth-fixture.ts";
import {
  articlesForEntity,
  articlesForTopic,
  entitiesForTopic,
  findPublicArticle,
  findPublicEntity,
  findPublicTopic,
  growthSitemapPaths,
  latestDate,
  publicRelationsForEntity,
  publishedArticles,
  publishedEntities,
  publishedTopics,
  siteLastModified,
  sourcesByIds,
  topicLastModified,
} from "./knowledge-core.ts";

test("only published rows are visible to readers", () => {
  assert.deepEqual(
    publishedTopics(growthFixture).map((topic) => topic.slug),
    ["food-labeling"]
  );
  assert.deepEqual(
    publishedEntities(growthFixture)
      .map((entity) => entity.slug)
      .sort(),
    ["nutrition-facts-label", "tfda"]
  );
  assert.deepEqual(
    publishedArticles(growthFixture).map((article) => article.slug),
    ["reading-nutrition-labels"]
  );
});

test("draft rows are not reachable by slug", () => {
  assert.equal(findPublicEntity(growthFixture, "draft-not-public"), null);
  assert.equal(findPublicArticle(growthFixture, "draft-article-not-public"), null);
});

test("a published article resolves its topic, entities and sources", () => {
  const article = findPublicArticle(growthFixture, "reading-nutrition-labels");
  assert.ok(article);
  assert.equal(article.topicSlug, "food-labeling");
  assert.ok(findPublicTopic(growthFixture, article.topicSlug ?? ""));
  assert.deepEqual(article.entitySlugs, ["nutrition-facts-label", "tfda"]);
  assert.equal(sourcesByIds(growthFixture, article.sourceIds).length, 2);
});

test("every published page has an upward link to a topic hub", () => {
  for (const entity of publishedEntities(growthFixture)) {
    const parents = entity.topicSlugs
      .map((slug) => findPublicTopic(growthFixture, slug))
      .filter(Boolean);
    assert.ok(parents.length > 0, `${entity.slug} has no published parent topic`);
  }
});

test("topic hubs list their published entities and articles only", () => {
  assert.deepEqual(
    entitiesForTopic(growthFixture, "food-labeling")
      .map((entity) => entity.slug)
      .sort(),
    ["nutrition-facts-label", "tfda"]
  );
  assert.deepEqual(
    articlesForTopic(growthFixture, "food-labeling").map((article) => article.slug),
    ["reading-nutrition-labels"]
  );
  assert.deepEqual(
    articlesForEntity(growthFixture, "tfda").map((article) => article.slug),
    ["reading-nutrition-labels"]
  );
});

test("relations without a readable source are hidden from readers", () => {
  const relations = publicRelationsForEntity(growthFixture, "nutrition-facts-label");

  assert.equal(relations.length, 1);
  assert.equal(relations[0].id, "rel-nutrition-label-regulated-by-tfda");
  assert.equal(relations[0].source.publisher, "衛生福利部食品藥物管理署");
});

test("the growth sitemap lists published canonical paths and nothing else", () => {
  const paths = growthSitemapPaths(growthFixture);

  assert.deepEqual([...paths].sort(), [
    "/",
    "/articles/reading-nutrition-labels",
    "/entities/nutrition-facts-label",
    "/entities/tfda",
    // 主站文章總覽是固定頁，不隨知識庫內容變動。
    "/reading",
    "/topics",
    "/topics/food-labeling",
  ]);
  assert.equal(
    paths.some((path) => path.startsWith("/blog")),
    false,
    "the WordPress mirror must never appear in the growth sitemap"
  );
  assert.equal(paths.includes("/entities/draft-not-public"), false);
  assert.equal(paths.includes("/articles/draft-article-not-public"), false);
});

test("every fixture source is explicitly marked as an unverified placeholder", () => {
  for (const source of growthFixture.sources) {
    assert.match(source.title, /佔位來源/);
    assert.ok(source.retrievedAt.length > 0);
  }
});

test("latestDate picks the newest known date and never invents one", () => {
  assert.equal(latestDate([]), null);
  assert.equal(latestDate([null, undefined]), null);
  assert.equal(latestDate(["2026-09-03", null, "2026-09-21", "2026-09-08"]), "2026-09-21");
});

function withEntityDates(dates: Record<string, string | null>) {
  return {
    ...growthFixture,
    entities: growthFixture.entities.map((entity) =>
      entity.slug in dates ? { ...entity, dateModified: dates[entity.slug] } : entity
    ),
  };
}

test("a topic's lastmod follows its newest public entity or article", () => {
  // The fixture article in food-labeling was modified 2026-09-03.
  assert.equal(topicLastModified(growthFixture, "food-labeling"), "2026-09-03");

  const knowledge = withEntityDates({ "nutrition-facts-label": "2026-09-21" });
  assert.equal(topicLastModified(knowledge, "food-labeling"), "2026-09-21");
});

test("draft rows never move lastmod", () => {
  const knowledge = withEntityDates({ "draft-example": "2026-12-31" });
  assert.equal(siteLastModified(knowledge), "2026-09-03");
});

test("site lastmod is the newest public change anywhere", () => {
  const knowledge = withEntityDates({ tfda: "2026-10-01", "nutrition-facts-label": "2026-09-21" });
  assert.equal(siteLastModified(knowledge), "2026-10-01");
  assert.equal(siteLastModified({ ...knowledge, entities: [], articles: [] }), null);
});
