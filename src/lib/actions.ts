"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import type { Category, Post, PostStatus } from "@/types/content";

async function getDefaultContent() {
  const prisma = getPrisma();
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.author.findMany({ orderBy: { createdAt: "asc" } }),
  ]);
  return { categories, authors };
}

export async function savePostAction(_prevState: string | null, formData: FormData): Promise<string | null> {
  const { categories, authors } = await getDefaultContent();
  const prisma = getPrisma();
  const id = String(formData.get("id") || `post-${Date.now()}`);
  const intent = String(formData.get("submitIntent") || "");
  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const selectedStatus = String(formData.get("status") || "draft") as PostStatus;
  const status = intent === "draft" || intent === "published" ? (intent as PostStatus) : selectedStatus;

  if (!title || !slug) {
    return "文章標題與 slug 為必填欄位。";
  }

  const duplicateSlug = await prisma.post.findFirst({
    where: { slug, NOT: { id } },
    select: { id: true },
  });
  if (duplicateSlug) {
    return "這個 slug 已被其他文章使用，請換一個網址代稱。";
  }

  const existing = await prisma.post.findUnique({ where: { id } });
  const post: Post = {
    id,
    title,
    slug,
    excerpt: String(formData.get("excerpt") || "").trim(),
    coverImage: String(formData.get("coverImage") || "").trim() || undefined,
    categoryId: String(formData.get("categoryId") || categories[0]?.id),
    authorId: String(formData.get("authorId") || authors[0]?.id),
    status,
    publishedAt: String(formData.get("publishedAt") || new Date().toISOString().slice(0, 10)),
    readingMinutes: Number(formData.get("readingMinutes") || existing?.readingMinutes || 5),
    views: Number(formData.get("views") || existing?.views || 0),
    comments: Number(formData.get("comments") || existing?.comments || 0),
    featured: formData.get("featured") === "on",
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    content: String(formData.get("content") || "").trim(),
    seoTitle: String(formData.get("seoTitle") || title).trim(),
    seoDescription: String(formData.get("seoDescription") || formData.get("excerpt") || "").trim(),
  };

  try {
    await prisma.post.upsert({
      where: { id },
      update: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        categoryId: post.categoryId,
        authorId: post.authorId,
        status: post.status,
        publishedAt: new Date(`${post.publishedAt}T00:00:00.000Z`),
        readingMinutes: post.readingMinutes,
        views: post.views,
        comments: post.comments,
        featured: post.featured,
        tagsJson: JSON.stringify(post.tags),
        content: post.content,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
      },
      create: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        categoryId: post.categoryId,
        authorId: post.authorId,
        status: post.status,
        publishedAt: new Date(`${post.publishedAt}T00:00:00.000Z`),
        readingMinutes: post.readingMinutes,
        views: post.views,
        comments: post.comments,
        featured: post.featured,
        tagsJson: JSON.stringify(post.tags),
        content: post.content,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
      },
    });
  } catch {
    return "文章儲存失敗，請確認欄位內容後再試一次。";
  }

  revalidatePath("/");
  revalidatePath("/blog");
  if (existing?.slug && existing.slug !== slug) revalidatePath(`/blog/${existing.slug}`);
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function saveCategoryAction(formData: FormData) {
  const prisma = getPrisma();
  const id = String(formData.get("id") || `category-${Date.now()}`);
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!name || !slug) {
    throw new Error("分類名稱與 slug 為必填欄位。");
  }

  const category: Category = {
    id,
    name,
    slug,
    description: String(formData.get("description") || "").trim(),
  };

  await prisma.category.upsert({
    where: { id },
    update: category,
    create: { ...category, sortOrder: 99 },
  });
  revalidatePath("/blog");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}
