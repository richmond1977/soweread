import type { GrowthContentEn } from "../../data/growth-content-en";
import type { GrowthKnowledge } from "./knowledge-core";
import type { GrowthLocale } from "./locale";

/**
 * 把（中文）知識圖譜換成指定語系的版本。
 *
 * 英文版一律 fail closed：沒有英文翻譯的主題、名詞、關係就不出現在英文站，
 * 而不是退回顯示中文或半翻譯的內容。知識整理文章目前只有中文，英文站不列出。
 *
 * 中文名稱與來源原標題保留在 originalName／originalTitle，英文頁面用來標示
 * 「中文名稱」與「原標題」，讓讀者能拿去核對台灣的官方文件。
 */
export function localizeKnowledge(
  knowledge: GrowthKnowledge,
  locale: GrowthLocale,
  english: GrowthContentEn
): GrowthKnowledge {
  if (locale === "zh") return knowledge;

  const topics = knowledge.topics.flatMap((topic) => {
    const en = english.topics[topic.slug];
    if (!en) return [];
    return [
      {
        ...topic,
        name: en.name,
        summary: en.summary,
        definition: en.definition,
        keyQuestions: en.keyQuestions,
        seoTitle: en.seoTitle,
        seoDescription: en.seoDescription,
      },
    ];
  });

  const entities = knowledge.entities.flatMap((entity) => {
    const en = english.entities[entity.slug];
    if (!en) return [];
    return [
      {
        ...entity,
        originalName: entity.name,
        name: en.name,
        aliases: en.aliases,
        description: en.description,
        seoTitle: en.seoTitle,
        seoDescription: en.seoDescription,
      },
    ];
  });

  const relations = knowledge.relations.flatMap((relation) => {
    const en = english.relations[relation.id];
    if (!en) return [];
    return [{ ...relation, predicate: en.predicate, note: en.note }];
  });

  const sources = knowledge.sources.flatMap((source) => {
    const en = english.sources[source.id];
    if (!en) return [];
    return [
      {
        ...source,
        title: en.title ?? source.title,
        originalTitle: en.title ? source.title : undefined,
        publisher: en.publisher,
        note: en.note,
      },
    ];
  });

  return { ...knowledge, topics, entities, relations, sources, articles: [] };
}

/** 有沒有這個名詞的英文版：用來決定中文頁要不要宣告 hreflang="en"。 */
export function hasEnglishEntity(english: GrowthContentEn, slug: string): boolean {
  return Boolean(english.entities[slug]);
}

export function hasEnglishTopic(english: GrowthContentEn, slug: string): boolean {
  return Boolean(english.topics[slug]);
}

/**
 * 中文欄位的摘要（FNV-1a 32-bit）。翻譯檔記下翻譯當時的摘要，
 * 中文改了而英文沒跟著改時，測試會指出是哪一則。
 */
export function zhDigest(fields: unknown[]): string {
  const text = JSON.stringify(fields);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

type ZhTopic = GrowthKnowledge["topics"][number];
type ZhEntity = GrowthKnowledge["entities"][number];
type ZhRelation = GrowthKnowledge["relations"][number];
type ZhSource = GrowthKnowledge["sources"][number];

export const digestTopic = (t: ZhTopic) =>
  zhDigest([t.name, t.summary, t.definition, t.keyQuestions, t.seoTitle, t.seoDescription]);
export const digestEntity = (e: ZhEntity) =>
  zhDigest([e.name, e.aliases, e.description, e.seoTitle, e.seoDescription]);
export const digestRelation = (r: ZhRelation) => zhDigest([r.predicate, r.note]);
export const digestSource = (s: ZhSource) => zhDigest([s.title, s.publisher, s.note]);
