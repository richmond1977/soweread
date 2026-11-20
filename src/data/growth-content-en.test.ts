import test from "node:test";
import assert from "node:assert/strict";
import { growthContent } from "./growth-content.ts";
import { growthContentEn } from "./growth-content-en.ts";
import {
  digestEntity,
  digestRelation,
  digestSource,
  digestTopic,
  localizeKnowledge,
} from "../lib/growth/localize.ts";

const publishedTopics = growthContent.topics.filter((t) => t.publicationStatus === "published");
const publishedEntities = growthContent.entities.filter((e) => e.publicationStatus === "published");
const publishedSlugs = new Set(publishedEntities.map((e) => e.slug));

test("每個已發布主題都有英文版，且翻譯時的中文摘要與現行中文一致", () => {
  for (const topic of publishedTopics) {
    const en = growthContentEn.topics[topic.slug];
    assert.ok(en, `主題 ${topic.slug} 缺英文翻譯`);
    assert.equal(en.zhDigest, digestTopic(topic), `主題 ${topic.slug} 的中文已修改，英文需要同步更新`);
  }
});

test("每個已發布名詞都有英文版，且翻譯時的中文摘要與現行中文一致", () => {
  for (const entity of publishedEntities) {
    const en = growthContentEn.entities[entity.slug];
    assert.ok(en, `名詞 ${entity.slug} 缺英文翻譯`);
    assert.equal(en.zhDigest, digestEntity(entity), `名詞 ${entity.slug} 的中文已修改，英文需要同步更新`);
  }
});

test("兩端都已發布的知識關係都有英文版，且中文摘要一致", () => {
  for (const relation of growthContent.relations) {
    if (!publishedSlugs.has(relation.subjectSlug) || !publishedSlugs.has(relation.objectSlug)) continue;
    const en = growthContentEn.relations[relation.id];
    assert.ok(en, `關係 ${relation.id} 缺英文翻譯`);
    assert.equal(en.zhDigest, digestRelation(relation), `關係 ${relation.id} 的中文已修改`);
  }
});

test("已發布名詞與關係引用的來源都有英文版，且中文摘要一致", () => {
  const cited = new Set([
    ...publishedEntities.flatMap((e) => e.sourceIds),
    ...growthContent.relations.flatMap((r) => (r.sourceId ? [r.sourceId] : [])),
  ]);
  for (const source of growthContent.sources.filter((s) => cited.has(s.id))) {
    const en = growthContentEn.sources[source.id];
    assert.ok(en, `來源 ${source.id} 缺英文翻譯`);
    assert.equal(en.zhDigest, digestSource(source), `來源 ${source.id} 的中文已修改`);
  }
});

test("英文版不含中文字，也沒有多出中文已不存在的條目", () => {
  const cjk = /[一-鿿]/;
  const sections = Object.entries(growthContentEn) as [string, Record<string, unknown>][];
  for (const [section, records] of sections) {
    for (const [key, record] of Object.entries(records)) {
      assert.ok(!cjk.test(JSON.stringify(record)), `${section}.${key} 含有中文字`);
    }
  }
  const zhKeys = {
    topics: new Set(growthContent.topics.map((t) => t.slug)),
    entities: new Set(growthContent.entities.map((e) => e.slug)),
    relations: new Set(growthContent.relations.map((r) => r.id)),
    sources: new Set(growthContent.sources.map((s) => s.id)),
  };
  for (const [section, keys] of Object.entries(zhKeys)) {
    for (const key of Object.keys(growthContentEn[section as keyof typeof zhKeys])) {
      assert.ok(keys.has(key), `英文 ${section}.${key} 在中文內容中不存在`);
    }
  }
});

test("英文名詞名稱與別名不互相重疊（避免 alternateName 互搶同一搜尋詞）", () => {
  const owner = new Map<string, string>();
  for (const [slug, entity] of Object.entries(growthContentEn.entities)) {
    for (const term of [entity.name, ...entity.aliases].map((t) => t.toLowerCase())) {
      const previous = owner.get(term);
      assert.ok(!previous || previous === slug, `「${term}」同時屬於 ${previous} 與 ${slug}`);
      owner.set(term, slug);
    }
  }
});

test("localizeKnowledge 換上英文內容、保留中文原名，並且不列出只有中文的文章", () => {
  const en = localizeKnowledge(growthContent, "en", growthContentEn);
  const cage = en.entities.find((e) => e.slug === "enriched-cage");
  assert.ok(cage);
  assert.equal(cage.name, growthContentEn.entities["enriched-cage"].name);
  assert.equal(cage.originalName, "豐富化籠飼");
  assert.equal(en.articles.length, 0);
  assert.equal(localizeKnowledge(growthContent, "zh", growthContentEn), growthContent);
});

test("沒有英文翻譯的名詞不會出現在英文版（fail closed）", () => {
  const rest = Object.fromEntries(
    Object.entries(growthContentEn.entities).filter(([slug]) => slug !== "glyphosate")
  );
  const en = localizeKnowledge(growthContent, "en", { ...growthContentEn, entities: rest });
  assert.ok(!en.entities.some((e) => e.slug === "glyphosate"));
});
