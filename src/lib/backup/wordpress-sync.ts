import "server-only";

import { revalidatePath } from "next/cache";
import type { PrismaClient } from "@prisma/client";
import { getPrismaForRole } from "../prisma";
import { getBackupSiteConfig } from "../site-config";
import {
  buildWordPressHash,
  reconcileWordPressPosts,
  type WpPost,
} from "./wordpress-sync-core";

const WORDPRESS_SYNC_KEY = "wordpress";
const DEFAULT_AUTHOR_ID = "author-editorial";
const DEFAULT_CATEGORY_ID = "food-health";

export async function syncWordPressPosts() {
  const config = getBackupSiteConfig();
  // The mirror is only ever written to the backup database. A growth-only
  // deployment has nothing to sync, so it reports a deliberate skip rather than
  // a failure: `vercel.json` is shared by every project, and a daily 503 would
  // show up as a broken cron and hide real sync failures.
  if (!config.isBackup && !config.isPrimary) {
    return {
      ok: true as const,
      skipped: true as const,
      status: 200,
      message: `WordPress sync does not apply to the "${config.siteRole}" role; nothing was written.`,
    };
  }
  if (!config.cronSecretConfigured) {
    return { ok: false as const, status: 503, message: "CRON_SECRET is not configured." };
  }
  if (config.issues.length) {
    return { ok: false as const, status: 503, message: config.issues.join(" ") };
  }
  // A backup role that cannot reach its own database is a real failure and must
  // stay loud, never a skip.
  if (!config.canServeMirrorContent) {
    return {
      ok: false as const,
      status: 503,
      message: "The backup role cannot serve mirror content; refusing to sync.",
    };
  }

  const prisma = getPrismaForRole(config.isBackup ? "backup" : config.siteRole);
  const startedAt = Date.now();

  try {
    const remotePosts = await fetchAllWordPressPosts(config.wordpressApiUrl);
    const normalizedPosts = remotePosts
      .map((post) => normalizeWordPressPost(post, config.primarySiteUrl))
      .filter((post): post is NonNullable<ReturnType<typeof normalizeWordPressPost>> => post !== null);
    const existingPosts = await prisma.post.findMany({
      where: { OR: [{ sourceType: "wordpress" }, { externalSourceId: { not: null } }] },
      select: {
        id: true,
        externalSourceId: true,
        sourceType: true,
        sourceModifiedAt: true,
        sourceHash: true,
        status: true,
      },
    });

    const decision = reconcileWordPressPosts(remotePosts, existingPosts);

    const durationMs = Date.now() - startedAt;
    const summary = `Fetched ${remotePosts.length} published posts, updated ${decision.upsertIds.length}, archived ${decision.archiveIds.length}.`;
    const upsertIds = new Set(decision.upsertIds);
    const upsertTargets = normalizedPosts.filter((post) => upsertIds.has(post.post.externalSourceId));
    const revalidatedSlugs = upsertTargets.map((post) => post.post.slug);

    await prisma.$transaction(async (tx) => {
      await tx.syncState.upsert({
        where: { key: WORDPRESS_SYNC_KEY },
        update: { lastAttemptAt: new Date() },
        create: { key: WORDPRESS_SYNC_KEY, lastAttemptAt: new Date() },
      });

      await ensureDefaults(tx);

      for (const normalized of upsertTargets) {
        await tx.author.upsert({
          where: { id: normalized.author.id },
          update: normalized.author,
          create: normalized.author,
        });

        await tx.category.upsert({
          where: { id: normalized.category.id },
          update: {
            name: normalized.category.name,
            slug: normalized.category.slug,
            description: normalized.category.description,
          },
          create: normalized.category,
        });

        await tx.post.upsert({
          where: { id: normalized.post.id },
          update: normalized.post,
          create: normalized.post,
        });
      }

      if (decision.archiveIds.length) {
        await tx.post.updateMany({
          where: { id: { in: decision.archiveIds } },
          data: { status: "archived" },
        });
      }

      await tx.syncState.upsert({
        where: { key: WORDPRESS_SYNC_KEY },
        update: {
          lastAttemptAt: new Date(),
          lastSuccessAt: new Date(),
          lastError: null,
          lastSuccessSummary: summary,
          syncedItemCount: remotePosts.length,
          lastDurationMs: durationMs,
        },
        create: {
          key: WORDPRESS_SYNC_KEY,
          lastAttemptAt: new Date(),
          lastSuccessAt: new Date(),
          lastError: null,
          lastSuccessSummary: summary,
          syncedItemCount: remotePosts.length,
          lastDurationMs: durationMs,
        },
      });
    });

    revalidateAllContent(revalidatedSlugs);

    return {
      ok: true as const,
      status: 200,
      message: summary,
      counts: {
        fetched: remotePosts.length,
        updated: decision.upsertIds.length,
        unchanged: decision.unchangedIds.length,
        archived: decision.archiveIds.length,
      },
    };
  } catch (error) {
    await prisma.syncState.upsert({
      where: { key: WORDPRESS_SYNC_KEY },
      update: { lastAttemptAt: new Date(), lastError: toErrorMessage(error) },
      create: { key: WORDPRESS_SYNC_KEY, lastAttemptAt: new Date(), lastError: toErrorMessage(error) },
    });

    return {
      ok: false as const,
      status: 502,
      message: `WordPress sync failed: ${toErrorMessage(error)}`,
    };
  }
}

async function fetchAllWordPressPosts(wordpressApiUrl: string) {
  const posts: WpPost[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = new URL(`${wordpressApiUrl}/posts`);
    url.searchParams.set("status", "publish");
    url.searchParams.set("_embed", "author,wp:featuredmedia,wp:term");
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`WordPress API responded ${response.status} ${response.statusText}`);
    }

    const pageItems = (await response.json()) as WpPost[];
    posts.push(...pageItems);
    totalPages = Number(response.headers.get("X-WP-TotalPages") || "1");
    page += 1;
  } while (page <= totalPages);

  return posts;
}

type SyncTransactionClient = Parameters<PrismaClient["$transaction"]>[0] extends (arg: infer T) => Promise<unknown> ? T : never;

async function ensureDefaults(prisma: SyncTransactionClient) {
  await prisma.author.upsert({
    where: { id: DEFAULT_AUTHOR_ID },
    update: {
      name: "潤讀編輯",
      email: "editor@soweread.com",
      role: "admin",
      bio: "以食品安全、營養知識與飲食文化為核心，整理值得慢讀也能落地生活的內容。",
    },
    create: {
      id: DEFAULT_AUTHOR_ID,
      name: "潤讀編輯",
      email: "editor@soweread.com",
      role: "admin",
      bio: "以食品安全、營養知識與飲食文化為核心，整理值得慢讀也能落地生活的內容。",
    },
  });

  await prisma.category.upsert({
    where: { id: DEFAULT_CATEGORY_ID },
    update: {
      name: "食品與健康",
      slug: "food-health",
      description: "食品安全、營養知識、外食文化與日常飲食選擇。",
      sortOrder: 1,
    },
    create: {
      id: DEFAULT_CATEGORY_ID,
      name: "食品與健康",
      slug: "food-health",
      description: "食品安全、營養知識、外食文化與日常飲食選擇。",
      sortOrder: 1,
    },
  });
}

function normalizeWordPressPost(post: WpPost, primarySiteUrl: string) {
  const title = cleanText(post.title?.rendered ?? "");
  if (!title) return null;

  const content = wpHtmlToMarkdown(post.content?.rendered ?? "");
  const plain = cleanText(post.content?.rendered ?? "");
  const excerpt = buildExcerpt(post.excerpt?.rendered, plain || title);
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const author = post._embedded?.author?.[0];
  const taxonomyTerms = (post._embedded?.["wp:term"] ?? []).flat();
  const categoryTerm = taxonomyTerms.find((term) => term.taxonomy === "category") ?? null;
  const tags = taxonomyTerms
    .filter((term) => term.taxonomy === "post_tag")
    .map((term) => term.name.trim())
    .filter(Boolean)
    .slice(0, 20);
  const sourceCanonicalUrl = normalizeUrl(post.link) ?? `${primarySiteUrl}/?p=${post.id}`;
  const sourceModifiedAt = toDate(post.modified_gmt ?? post.date_gmt) ?? new Date();
  const publishedAt = toDate(post.date_gmt) ?? sourceModifiedAt;
  const readingMinutes = Math.max(3, Math.ceil(plain.length / 520));
  const normalizedAuthor = {
    id: author ? `wp-author-${author.id}` : DEFAULT_AUTHOR_ID,
    name: cleanText(author?.name ?? "潤讀編輯"),
    email: author ? `wp-author-${author.id}@soweread.invalid` : "editor@soweread.com",
    role: "author",
    bio: "由主站 WordPress 同步而來的作者資料。",
  } as const;
  const normalizedCategory = categoryTerm
    ? {
        id: `wp-category-${categoryTerm.id}`,
        name: cleanText(categoryTerm.name),
        slug: cleanSlug(categoryTerm.slug),
        description: "由主站 WordPress 同步而來的分類。",
        sortOrder: 99,
      }
    : {
        id: DEFAULT_CATEGORY_ID,
        name: "食品與健康",
        slug: "food-health",
        description: "食品安全、營養知識、外食文化與日常飲食選擇。",
        sortOrder: 1,
      };

  const sourceHash = buildWordPressHash(post);

  return {
    author: normalizedAuthor,
    category: normalizedCategory,
    post: {
      id: `wp-${post.id}`,
      title,
      slug: cleanSlug(post.slug) || `wp-${post.id}`,
      excerpt,
      coverImage: normalizeUrl(media?.source_url),
      coverImageAlt: cleanText(media?.alt_text ?? "") || title,
      categoryId: normalizedCategory.id,
      authorId: normalizedAuthor.id,
      status: "published",
      publishedAt,
      contentUpdatedAt: sourceModifiedAt,
      sourceType: "wordpress",
      externalSourceId: String(post.id),
      sourceCanonicalUrl,
      sourceModifiedAt,
      sourceHash,
      lastSyncedAt: new Date(),
      readingMinutes,
      views: 0,
      comments: 0,
      featured: false,
      tagsJson: JSON.stringify(tags),
      faqJson: JSON.stringify([]),
      showFaq: false,
      sourcesJson: JSON.stringify([{ label: "原始 WordPress 文章", url: sourceCanonicalUrl }]),
      content,
      seoTitle: title,
      seoDescription: excerpt,
    },
  };
}

function revalidateAllContent(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/story");
  revalidatePath("/sitemap.xml");
  revalidatePath("/rss.xml");
  revalidatePath("/status");
  for (const slug of slugs) {
    revalidatePath(`/blog/${slug}`);
  }
}

function toDate(value: string | undefined | null) {
  if (!value) return null;
  const normalized = value.endsWith("Z") ? value : `${value}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeUrl(value: string | undefined | null) {
  if (!value?.trim()) return null;
  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

function cleanSlug(value: string | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function wpHtmlToMarkdown(html: string) {
  return html
    .replace(/<figure[\s\S]*?<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>[\s\S]*?<\/figure>/gi, (_, src, alt) => {
      return `\n\n![${decodeHtml(alt)}](${decodeHtml(src)})\n\n`;
    })
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, text) => `\n\n### ${cleanText(text)}\n\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, text) => `\n- ${cleanText(text)}`)
    .replace(/<\/ul>|<\/ol>/gi, "\n\n")
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, text) => `\n\n> ${cleanText(text)}\n\n`)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => `\n\n${cleanText(text)}\n\n`)
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildExcerpt(excerptHtml: string | undefined, fallback: string) {
  const excerpt = cleanText(excerptHtml ?? "").replace(/\s*\[…]\s*$/, "");
  return (excerpt || fallback).slice(0, 160);
}

function cleanText(value: string) {
  return decodeHtml(value)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value: string) {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
