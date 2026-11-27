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

test("每份中文讀者指南都有英文版，中文摘要一致，結構與中文對齊", async () => {
  const { entityReaderGuides, readerGuideSources, nutritionTeachingExamples, sodiumForGrams } = await import("./entity-reader-guides.ts");
  const { entityReaderGuidesEn, readerGuideSourcesEn } = await import("./entity-reader-guides-en.ts");
  const { digestReaderGuide } = await import("../lib/growth/localize.ts");
  assert.deepEqual(Object.keys(entityReaderGuidesEn).sort(), entityReaderGuides.map((g) => g.slug).sort());
  for (const zh of entityReaderGuides) {
    const en = entityReaderGuidesEn[zh.slug];
    assert.equal(en.slug, zh.slug);
    assert.equal(en.zhDigest, digestReaderGuide(zh), `讀者指南 ${zh.slug} 的中文已修改，英文需要同步更新`);
    assert.deepEqual(en.sections.map((s) => s.id), zh.sections.map((s) => s.id), `${zh.slug}: 章節不一致`);
    en.sections.forEach((section, index) => {
      const zhSection = zh.sections[index];
      assert.deepEqual(section.sourceIds, zhSection.sourceIds, `${zh.slug}/${section.id}: 來源不一致`);
      assert.equal(section.paragraphs.length, zhSection.paragraphs.length, `${zh.slug}/${section.id}: 段落數不一致`);
      assert.equal(section.steps?.length, zhSection.steps?.length, `${zh.slug}/${section.id}: 步驟數不一致`);
      assert.equal(section.table?.rows.length, zhSection.table?.rows.length, `${zh.slug}/${section.id}: 表格列數不一致`);
      if (section.table) for (const row of section.table.rows) assert.equal(row.length, section.table.columns.length);
    });
    assert.equal(en.questions.length, zh.questions.length, `${zh.slug}: 問答數不一致`);
    for (const link of en.links) {
      const match = link.href.match(/^\/en\/(entities|topics)\/([a-z0-9-]+)$/);
      assert.ok(match, `${zh.slug}: 英文連結必須指向 /en/entities 或 /en/topics：${link.href}`);
      const pool = match[1] === "entities" ? growthContentEn.entities : growthContentEn.topics;
      assert.ok(pool[match[2]], `${zh.slug}: 連結目標沒有英文版：${link.href}`);
      if (match[1] === "entities") assert.ok(publishedSlugs.has(match[2]), `${zh.slug}: 連結目標未發布：${link.href}`);
    }
  }
  for (const source of readerGuideSources) assert.ok(readerGuideSourcesEn[source.id], `指南來源 ${source.id} 缺英文標題`);
  const table = entityReaderGuidesEn["nutrition-facts-label"].sections.find((s) => s.id === "compare-same-weight")?.table;
  nutritionTeachingExamples.forEach((example, index) => {
    assert.deepEqual(table?.rows[index].slice(1), [
      `${example.servingGrams} g`,
      `${example.sodiumMgPerServing} mg`,
      `${sodiumForGrams(example.sodiumMgPerServing, example.servingGrams, 100)} mg`,
      `${sodiumForGrams(example.sodiumMgPerServing, example.servingGrams, 60)} mg`,
    ]);
  });
});
