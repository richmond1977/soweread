import "server-only";

import { seedContent } from "@/data/seed-content";
import { getPrisma } from "@/lib/prisma";
import type { Category, CmsContent, FaqItem, Post, PostStatus, SourceItem } from "@/types/content";

export async function getContent(): Promise<CmsContent> {
  try {
    const prisma = getPrisma();
    const [authors, categories, posts] = await Promise.all([
      prisma.author.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
      prisma.post.findMany({ orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }] }),
    ]);

    if (!authors.length || !categories.length || !posts.length) {
      return seedContent;
    }

    return {
      authors: authors.map((author) => ({
        id: author.id,
        name: author.name,
        email: author.email,
        role: author.role as "admin" | "editor" | "author",
        bio: author.bio,
      })),
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
      })),
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage ?? undefined,
        coverImageAlt: post.coverImageAlt,
        categoryId: post.categoryId,
        authorId: post.authorId,
        status: post.status as PostStatus,
        publishedAt: post.publishedAt.toISOString().slice(0, 10),
        contentUpdatedAt: post.contentUpdatedAt?.toISOString().slice(0, 10),
        updatedAt: post.updatedAt.toISOString().slice(0, 10),
        readingMinutes: post.readingMinutes,
        views: post.views,
        comments: post.comments,
        featured: post.featured,
        tags: parseTags(post.tagsJson),
        faq: parseFaq(post.faqJson),
        showFaq: post.showFaq,
        sources: parseSources(post.sourcesJson),
        sourceType: post.sourceType as "native" | "wordpress",
        sourceCanonicalUrl: post.sourceCanonicalUrl ?? undefined,
        content: post.content,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
      })),
    };
  } catch {
    return seedContent;
  }
}

export async function getPublishedPosts() {
  const content = await getContent();
  return content.posts
    .filter((post) => isPostPublic(post))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPostBySlug(slug: string) {
  const content = await getContent();
  return content.posts.find((post) => post.slug === slug && isPostPublic(post)) ?? null;
}

export function categoryFor(post: Post, categories: Category[]) {
  return categories.find((category) => category.id === post.categoryId) ?? categories[0];
}

export function isPostPublic(post: Post, now = new Date()) {
  if (post.status !== "published" && post.status !== "scheduled") return false;
  return post.publishedAt <= formatTaipeiDate(now);
}

function formatTaipeiDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function parseTags(tagsJson: string) {
  try {
    const parsed = JSON.parse(tagsJson) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return [];
  }

  return [];
}

function parseFaq(faqJson: string): FaqItem[] {
  try {
    const parsed = JSON.parse(faqJson) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is FaqItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as Record<string, unknown>).question === "string" &&
          typeof (item as Record<string, unknown>).answer === "string"
      );
    }
  } catch {
    return [];
  }

  return [];
}

function parseSources(sourcesJson: string): SourceItem[] {
  try {
    const parsed = JSON.parse(sourcesJson) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is SourceItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as Record<string, unknown>).label === "string" &&
          ((item as Record<string, unknown>).url === undefined ||
            typeof (item as Record<string, unknown>).url === "string")
      );
    }
  } catch {
    return [];
  }

  return [];
}
