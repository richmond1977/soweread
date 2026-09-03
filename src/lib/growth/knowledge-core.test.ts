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
  publicRelationsForEntity,
  publishedArticles,
  publishedEntities,
  publishedTopics,
  sourcesByIds,
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
