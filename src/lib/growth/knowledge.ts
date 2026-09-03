import "server-only";

import { growthFixture } from "@/data/growth-fixture";
import { getPrismaForRole } from "@/lib/prisma";
import { getRequestSiteConfig } from "@/lib/request-site-config";
import type { SiteConfig } from "@/lib/site-config";
import {
  EMPTY_KNOWLEDGE,
  type GrowthKnowledge,
  type PublicationStatus,
} from "./knowledge-core";

/**
 * Load the growth knowledge graph for the current request.
 *
 * Fails closed twice over:
 *  1. A deployment that is not a healthy growth role gets nothing at all, so a
 *     misconfigured host can never surface growth content.
 *  2. The datasource is selected by role, so the growth pages physically cannot
 *     read the backup database that holds the WordPress mirror.
 */
export async function getGrowthKnowledge(
  config?: SiteConfig
): Promise<{ config: SiteConfig; knowledge: GrowthKnowledge }> {
  const resolved = config ?? (await getRequestSiteConfig());

  if (!resolved.canServeGrowthContent) {
    return { config: resolved, knowledge: EMPTY_KNOWLEDGE };
  }

  const knowledge = await loadKnowledge(resolved);
  return { config: resolved, knowledge };
}

async function loadKnowledge(config: SiteConfig): Promise<GrowthKnowledge> {
  try {
    const prisma = getPrismaForRole(config.siteRole);
    const [topics, entities, relations, sources, articles] = await Promise.all([
      prisma.topic.findMany({ include: { entities: true } }),
      prisma.entity.findMany({ include: { topics: true, sources: true } }),
      prisma.entityRelation.findMany({
        include: { subjectEntity: true, objectEntity: true },
      }),
      prisma.source.findMany(),
      prisma.growthArticle.findMany({
        include: { topic: true, entities: { include: { entity: true } }, sources: true },
      }),
    ]);

    if (!topics.length && !entities.length && !articles.length) {
      return fixtureOrEmpty();
    }

    return {
      isFixture: false,
      topics: topics.map((topic) => ({
        id: topic.id,
        slug: topic.slug,
        name: topic.name,
        summary: topic.summary,
        definition: topic.definition,
        keyQuestions: parseStringArray(topic.keyQuestionsJson),
        publicationStatus: topic.publicationStatus as PublicationStatus,
        seoTitle: topic.seoTitle,
        seoDescription: topic.seoDescription,
        sortOrder: topic.sortOrder,
        reviewedAt: topic.reviewedAt?.toISOString().slice(0, 10) ?? null,
      })),
      entities: entities.map((entity) => ({
        id: entity.id,
        slug: entity.slug,
        entityType: entity.entityType,
        name: entity.name,
        aliases: parseStringArray(entity.aliasesJson),
        description: entity.description,
        canonicalUrl: entity.canonicalUrl,
        publicationStatus: entity.publicationStatus as PublicationStatus,
        seoTitle: entity.seoTitle,
        seoDescription: entity.seoDescription,
        reviewedAt: entity.reviewedAt?.toISOString().slice(0, 10) ?? null,
        topicSlugs: topics
          .filter((topic) => topic.entities.some((link) => link.entityId === entity.id))
          .map((topic) => topic.slug),
        sourceIds: entity.sources.map((link) => link.sourceId),
      })),
      relations: relations.map((relation) => ({
        id: relation.id,
        subjectSlug: relation.subjectEntity.slug,
        predicate: relation.predicate,
        objectSlug: relation.objectEntity.slug,
        sourceId: relation.sourceId,
        confidence: relation.confidence,
        note: relation.note,
      })),
      sources: sources.map((source) => ({
        id: source.id,
        title: source.title,
        publisher: source.publisher,
        url: source.url,
        sourceType: source.sourceType,
        publishedAt: source.publishedAt?.toISOString().slice(0, 10) ?? null,
        retrievedAt: source.retrievedAt.toISOString().slice(0, 10),
        note: source.note,
      })),
      articles: articles.map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        summary: article.summary,
        content: article.content,
        editorialStatus: article.editorialStatus as PublicationStatus,
        authorName: article.authorName,
        reviewerName: article.reviewerName,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        primaryCtaUrl: article.primaryCtaUrl,
        primaryCtaLabel: article.primaryCtaLabel,
        datePublished: article.datePublished?.toISOString().slice(0, 10) ?? null,
        dateModified: article.dateModified?.toISOString().slice(0, 10) ?? null,
        topicSlug: article.topic?.slug ?? null,
        entitySlugs: article.entities.map((link) => link.entity.slug),
        sourceIds: article.sources.map((link) => link.sourceId),
      })),
    };
  } catch {
    // A growth database that is unreachable must not fall back to any other
    // deployment's data. Serve the fixture only when it was explicitly enabled.
    return fixtureOrEmpty();
  }
}

function fixtureOrEmpty(): GrowthKnowledge {
  return process.env.GROWTH_USE_FIXTURE === "true" ? growthFixture : EMPTY_KNOWLEDGE;
}

function parseStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
