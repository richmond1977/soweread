export type PublicationStatus = "draft" | "review" | "published";

export type GrowthSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: string;
  publishedAt: string | null;
  retrievedAt: string;
  note: string;
};

export type GrowthEntity = {
  id: string;
  slug: string;
  entityType: string;
  name: string;
  aliases: string[];
  description: string;
  canonicalUrl: string | null;
  publicationStatus: PublicationStatus;
  seoTitle: string;
  seoDescription: string;
  reviewedAt: string | null;
  topicSlugs: string[];
  sourceIds: string[];
};

export type GrowthRelation = {
  id: string;
  subjectSlug: string;
  predicate: string;
  objectSlug: string;
  sourceId: string | null;
  confidence: string;
  note: string;
};

export type GrowthTopic = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  definition: string;
  keyQuestions: string[];
  publicationStatus: PublicationStatus;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  reviewedAt: string | null;
};

export type GrowthArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  editorialStatus: PublicationStatus;
  authorName: string;
  reviewerName: string;
  seoTitle: string;
  seoDescription: string;
  primaryCtaUrl: string | null;
  primaryCtaLabel: string;
  datePublished: string | null;
  dateModified: string | null;
  topicSlug: string | null;
  entitySlugs: string[];
  sourceIds: string[];
};

export type GrowthKnowledge = {
  topics: GrowthTopic[];
  entities: GrowthEntity[];
  relations: GrowthRelation[];
  sources: GrowthSource[];
  articles: GrowthArticle[];
  /** True when the data came from the checked-in fixture rather than a database. */
  isFixture: boolean;
};

export const EMPTY_KNOWLEDGE: GrowthKnowledge = {
  topics: [],
  entities: [],
  relations: [],
  sources: [],
  articles: [],
  isFixture: false,
};

/**
 * Nothing reaches a public growth page unless it is explicitly `published`.
 * Draft and review rows exist so the WordPress research import can create
 * candidates without ever publishing them (plan §8.2).
 */
export function isPublic(status: PublicationStatus | string): boolean {
  return status === "published";
}

export function publishedTopics(knowledge: GrowthKnowledge): GrowthTopic[] {
  return knowledge.topics
    .filter((topic) => isPublic(topic.publicationStatus))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function publishedEntities(knowledge: GrowthKnowledge): GrowthEntity[] {
  return knowledge.entities
    .filter((entity) => isPublic(entity.publicationStatus))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function publishedArticles(knowledge: GrowthKnowledge): GrowthArticle[] {
  return knowledge.articles
    .filter((article) => isPublic(article.editorialStatus) && Boolean(article.datePublished))
    .sort((a, b) => (b.datePublished ?? "").localeCompare(a.datePublished ?? ""));
}

export function findPublicTopic(knowledge: GrowthKnowledge, slug: string): GrowthTopic | null {
  return publishedTopics(knowledge).find((topic) => topic.slug === slug) ?? null;
}

export function findPublicEntity(knowledge: GrowthKnowledge, slug: string): GrowthEntity | null {
  return publishedEntities(knowledge).find((entity) => entity.slug === slug) ?? null;
}

export function findPublicArticle(knowledge: GrowthKnowledge, slug: string): GrowthArticle | null {
  return publishedArticles(knowledge).find((article) => article.slug === slug) ?? null;
}

export function entitiesForTopic(knowledge: GrowthKnowledge, topicSlug: string): GrowthEntity[] {
  return publishedEntities(knowledge).filter((entity) => entity.topicSlugs.includes(topicSlug));
}

export function articlesForTopic(knowledge: GrowthKnowledge, topicSlug: string): GrowthArticle[] {
  return publishedArticles(knowledge).filter((article) => article.topicSlug === topicSlug);
}

export function articlesForEntity(knowledge: GrowthKnowledge, entitySlug: string): GrowthArticle[] {
  return publishedArticles(knowledge).filter((article) => article.entitySlugs.includes(entitySlug));
}

export function sourcesByIds(knowledge: GrowthKnowledge, ids: string[]): GrowthSource[] {
  return ids
    .map((id) => knowledge.sources.find((source) => source.id === id))
    .filter((source): source is GrowthSource => Boolean(source));
}

/**
 * Only relations whose subject *and* object are both publicly published are
 * shown. A relation must also be traceable back to a readable source, so
 * source-less relations are hidden from readers (plan §7.2).
 */
export function publicRelationsForEntity(
  knowledge: GrowthKnowledge,
  entitySlug: string
): Array<GrowthRelation & { subject: GrowthEntity; object: GrowthEntity; source: GrowthSource }> {
  const visible = publishedEntities(knowledge);
  const bySlug = new Map(visible.map((entity) => [entity.slug, entity]));

  return knowledge.relations
    .filter(
      (relation) => relation.subjectSlug === entitySlug || relation.objectSlug === entitySlug
    )
    .map((relation) => {
      const subject = bySlug.get(relation.subjectSlug);
      const object = bySlug.get(relation.objectSlug);
      if (!subject || !object) return null;

      const source = relation.sourceId
        ? knowledge.sources.find((item) => item.id === relation.sourceId) ?? null
        : null;
      if (!source) return null;

      return { ...relation, subject, object, source };
    })
    .filter((relation): relation is NonNullable<typeof relation> => Boolean(relation));
}

/** Every canonical URL a growth sitemap may contain, relative to the site root. */
export function growthSitemapPaths(knowledge: GrowthKnowledge): string[] {
  return [
    "/",
    "/topics",
    ...publishedTopics(knowledge).map((topic) => `/topics/${topic.slug}`),
    ...publishedEntities(knowledge).map((entity) => `/entities/${entity.slug}`),
    ...publishedArticles(knowledge).map((article) => `/articles/${article.slug}`),
  ];
}
