import type { MetadataRoute } from "next";
import { getContent, getPublishedPosts } from "@/lib/content";
import { growthContentEn } from "@/data/growth-content-en";
import { getGrowthKnowledge } from "@/lib/growth/knowledge";
import { HREFLANG, localePath } from "@/lib/growth/locale";
import { localizeKnowledge } from "@/lib/growth/localize";
import {
  publishedArticles,
  publishedEntities,
  publishedTopics,
  siteLastModified,
  topicLastModified,
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

// Unknown dates omit lastmod rather than claim "now"; see latestDate().
function lastModifiedOf(date: string | null): { lastModified?: Date } {
  return date ? { lastModified: new Date(date) } : {};
}

async function growthSitemap(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  const { knowledge } = await getGrowthKnowledge();
  const siteModified = lastModifiedOf(siteLastModified(knowledge));

  // 有英文版的頁面，中英兩筆都列出並互相宣告 hreflang；沒有英文版的只列中文。
  type Entry = MetadataRoute.Sitemap[number];
  const pair = (path: string, rest: Omit<Entry, "url">, hasEnglish: boolean): Entry[] => {
    const zhUrl = `${baseUrl}${path === "/" ? "" : path}`;
    if (!hasEnglish) return [{ url: zhUrl, ...rest }];
    const enUrl = `${baseUrl}${localePath("en", path)}`;
    const alternates = {
      languages: { [HREFLANG.zh]: zhUrl, [HREFLANG.en]: enUrl, "x-default": zhUrl },
    };
    return [
      { url: zhUrl, ...rest, alternates },
      { url: enUrl, ...rest, alternates },
    ];
  };

  const english = localizeKnowledge(knowledge, "en", growthContentEn);
  const englishTopics = new Set(publishedTopics(english).map((topic) => topic.slug));
  const englishEntities = new Set(publishedEntities(english).map((entity) => entity.slug));

  return [
    ...pair("/", { ...siteModified, changeFrequency: "weekly", priority: 1 }, true),
    ...pair("/topics", { ...siteModified, changeFrequency: "weekly", priority: 0.9 }, true),
    ...pair("/entities", { ...siteModified, changeFrequency: "weekly", priority: 0.9 }, true),
    // /reading and /en/reading list the primary site's articles; we hold no change date for them.
    ...pair("/reading", { changeFrequency: "weekly", priority: 0.6 }, true),
    ...publishedTopics(knowledge).flatMap((topic) =>
      pair(
        `/topics/${topic.slug}`,
        {
          ...lastModifiedOf(topicLastModified(knowledge, topic.slug)),
          changeFrequency: "weekly",
          priority: 0.8,
        },
        englishTopics.has(topic.slug)
      )
    ),
    ...publishedEntities(knowledge).flatMap((entity) =>
      pair(
        `/entities/${entity.slug}`,
        { ...lastModifiedOf(entity.dateModified), changeFrequency: "monthly", priority: 0.7 },
        englishEntities.has(entity.slug)
      )
    ),
    ...publishedArticles(knowledge).map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      ...lastModifiedOf(article.dateModified ?? article.datePublished),
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
