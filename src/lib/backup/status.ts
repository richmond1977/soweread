import "server-only";

import { getPrismaForRole } from "../prisma";
import { getRequestSiteConfig } from "../request-site-config";

const WORDPRESS_SYNC_KEY = "wordpress";

export async function getBackupStatusSummary() {
  const config = await getRequestSiteConfig();

  try {
    const prisma = getPrismaForRole(config.siteRole);
    const [syncState, wordpressPublishedCount] = await Promise.all([
      prisma.syncState.findUnique({ where: { key: WORDPRESS_SYNC_KEY } }),
      prisma.post.count({ where: { sourceType: "wordpress", status: "published" } }),
    ]);

    return {
      role: config.siteRole,
      mode: config.backupMode,
      indexable: config.indexable,
      configHealthy: config.siteRole !== "unresolved" && config.issues.length === 0,
      shouldRedirectInProxy: config.shouldRedirectInProxy,
      shouldServeBackupContent: config.shouldServeBackupContent,
      lastSuccessAt: syncState?.lastSuccessAt?.toISOString() ?? null,
      lastAttemptAt: syncState?.lastAttemptAt?.toISOString() ?? null,
      syncedItemCount: syncState?.syncedItemCount ?? wordpressPublishedCount,
      syncHealthy: !syncState?.lastError,
      hasSyncError: Boolean(syncState?.lastError),
      syncState:
        syncState?.lastSuccessAt ? (syncState?.lastError ? "error" : "ok") : "never-run",
    };
  } catch {
    return {
      role: config.siteRole,
      mode: config.backupMode,
      indexable: config.indexable,
      configHealthy: false,
      shouldRedirectInProxy: config.shouldRedirectInProxy,
      shouldServeBackupContent: config.shouldServeBackupContent,
      lastSuccessAt: null,
      lastAttemptAt: null,
      syncedItemCount: 0,
      syncHealthy: false,
      hasSyncError: true,
      syncState: "error",
    };
  }
}
