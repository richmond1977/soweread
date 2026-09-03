import { createHash } from "node:crypto";

type SecretCheckInput = {
  authorizationHeader: string | null;
  querySecret: string | null;
  configuredSecret: string | undefined;
};

type WpRenderedField = { rendered?: string };

type WpTerm = {
  id: number;
  name: string;
  slug: string;
  taxonomy?: string;
};

type WpEmbedded = {
  author?: Array<{ id: number; name?: string; slug?: string }>;
  "wp:featuredmedia"?: Array<{ source_url?: string; alt_text?: string }>;
  "wp:term"?: WpTerm[][];
};

export type WpPost = {
  id: number;
  date_gmt?: string;
  modified_gmt?: string;
  slug?: string;
  link?: string;
  title?: WpRenderedField;
  excerpt?: WpRenderedField;
  content?: WpRenderedField;
  _embedded?: WpEmbedded;
};

export type ReconcileExistingPost = {
  id: string;
  externalSourceId: string | null;
  sourceType: string;
  sourceModifiedAt: Date | null;
  sourceHash: string | null;
  status: string;
};

export type SyncDecision = {
  upsertIds: string[];
  archiveIds: string[];
  unchangedIds: string[];
};

export function authorizeSyncRequest(input: SecretCheckInput) {
  const secret = input.configuredSecret?.trim();
  if (!secret) {
    return { ok: false, status: 503 as const, reason: "CRON_SECRET is not configured." };
  }

  const bearer = input.authorizationHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const provided = bearer || input.querySecret?.trim() || null;

  if (!provided || provided !== secret) {
    return { ok: false, status: 401 as const, reason: "Unauthorized sync request." };
  }

  return { ok: true as const };
}

export function reconcileWordPressPosts(remotePosts: WpPost[], existingPosts: ReconcileExistingPost[]): SyncDecision {
  const remoteIds = new Set(remotePosts.map((post) => String(post.id)));
  const existingByExternalId = new Map(existingPosts.map((post) => [post.externalSourceId, post]));
  const upsertIds: string[] = [];
  const unchangedIds: string[] = [];

  for (const remotePost of remotePosts) {
    const externalId = String(remotePost.id);
    const existing = existingByExternalId.get(externalId);
    const remoteHash = buildWordPressHash(remotePost);
    const modifiedGmt = remotePost.modified_gmt ?? remotePost.date_gmt ?? null;

    if (
      existing &&
      existing.sourceType === "wordpress" &&
      existing.sourceHash === remoteHash &&
      normalizeIsoTimestamp(existing.sourceModifiedAt) === normalizeIsoTimestamp(modifiedGmt) &&
      existing.status === "published"
    ) {
      unchangedIds.push(externalId);
      continue;
    }

    upsertIds.push(externalId);
  }

  const archiveIds = existingPosts
    .filter((post) => post.sourceType === "wordpress" && post.externalSourceId && !remoteIds.has(post.externalSourceId))
    .map((post) => post.id);

  return { upsertIds, archiveIds, unchangedIds };
}

export function buildWordPressHash(post: WpPost) {
  return createHash("sha256")
    .update(JSON.stringify({
      id: post.id,
      slug: post.slug ?? "",
      link: post.link ?? "",
      title: post.title?.rendered ?? "",
      excerpt: post.excerpt?.rendered ?? "",
      content: post.content?.rendered ?? "",
      modified_gmt: post.modified_gmt ?? "",
    }))
    .digest("hex");
}

function normalizeIsoTimestamp(value: Date | string | null) {
  if (!value) return null;
  const date = typeof value === "string" ? toDate(value) : value;
  return date?.toISOString() ?? null;
}

function toDate(value: string | undefined | null) {
  if (!value) return null;
  const normalized = value.endsWith("Z") ? value : `${value}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}
