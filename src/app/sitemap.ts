import type { MetadataRoute } from "next";
import { getContent, getPublishedPosts } from "@/lib/content";
import { getGrowthKnowledge } from "@/lib/growth/knowledge";
import {
  publishedArticles,
  publishedEntities,
  publishedTopics,
} from "@/lib/growth/knowledge-core";
import { getRequestSiteConfig } from "@/lib/request-site-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = await getRequestSiteConfig();

  // The WordPress mirror is never submitted for indexing, and an unresolved
  // host gets nothing at all.
  if (!config.sitemapEnabled) {
    return [];
  }

  if (config.isGrowth) {
    return growthSitemap(config.canonicalBaseUrl);
  }

  return primarySitemap(config.primarySiteUrl);
}

async function growthSitemap(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  const { knowledge } = await getGrowthKnowledge();
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/topics`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...publishedTopics(knowledge).map((topic) => ({
      url: `${baseUrl}/topics/${topic.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...publishedEntities(knowledge).map((entity) => ({
      url: `${baseUrl}/entities/${entity.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...publishedArticles(knowledge).map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: new Date(article.dateModified ?? article.datePublished ?? now),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

async function primarySitemap(siteUrl: string): Promise<MetadataRoute.Sitemap> {
  const [posts, content] = await Promise.all([getPublishedPosts(), getContent()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/story`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.contentUpdatedAt ?? post.updatedAt ?? post.publishedAt),
    changeFrequency: "weekly",
    priority: post.featured ? 0.9 : 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = content.categories.map((cat) => ({
    url: `${siteUrl}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes, ...categoryRoutes];
}
