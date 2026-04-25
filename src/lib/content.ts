import "server-only";

import { seedContent } from "@/data/seed-content";
import { getPrisma } from "@/lib/prisma";
import type { Category, CmsContent, Post, PostStatus } from "@/types/content";

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
        categoryId: post.categoryId,
        authorId: post.authorId,
        status: post.status as PostStatus,
        publishedAt: post.publishedAt.toISOString().slice(0, 10),
        readingMinutes: post.readingMinutes,
        views: post.views,
        comments: post.comments,
        featured: post.featured,
        tags: parseTags(post.tagsJson),
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
    .filter((post) => post.status === "published")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPostBySlug(slug: string) {
  const content = await getContent();
  return content.posts.find((post) => post.slug === slug && post.status === "published") ?? null;
}

export function categoryFor(post: Post, categories: Category[]) {
  return categories.find((category) => category.id === post.categoryId) ?? categories[0];
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
