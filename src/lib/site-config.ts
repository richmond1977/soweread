export type SiteRole = "primary" | "backup" | "growth";
export type ResolvedSiteRole = SiteRole | "unresolved";
export type BackupMode = "serve" | "redirect";
export type RoleResolution = "env" | "host";
export type DatabaseUrlKey = "DATABASE_URL" | "GROWTH_DATABASE_URL" | "BACKUP_DATABASE_URL";

export type SiteConfig = {
  /** Raw resolution result. `unresolved` means the request host matched no configured role. */
  siteRole: ResolvedSiteRole;
  roleResolution: RoleResolution;
  backupMode: BackupMode;
  publicSiteUrl: string;
  primarySiteUrl: string;
  growthSiteUrl: string | null;
  backupSiteUrl: string | null;
  /** Base URL every self-canonical on this deployment must be built from. */
  canonicalBaseUrl: string;
  /** Host of canonicalBaseUrl, or null when it cannot be parsed. */
  canonicalHost: string | null;
  /**
   * Redirect growth requests that arrive on a non-canonical host. A Vercel
   * project is reachable on more than one `*.vercel.app` alias, all serving the
   * same deployment, so without this the growth site duplicates itself.
   */
  enforceCanonicalHost: boolean;
  wordpressApiUrl: string;
  cronSecretConfigured: boolean;
  isPrimary: boolean;
  isBackup: boolean;
  isGrowth: boolean;
  shouldRedirectInProxy: boolean;
  shouldServeBackupContent: boolean;
  /** Growth knowledge pages may render. False = 404 the growth routes. */
  canServeGrowthContent: boolean;
  /** WordPress mirror content may render. False = never expose the mirror. */
  canServeMirrorContent: boolean;
  indexable: boolean;
  sitemapEnabled: boolean;
  metaRobots: { index: boolean; follow: boolean };
  databaseUrlKey: DatabaseUrlKey;
  issues: string[];
};

const FALLBACK_PRIMARY_SITE_URL = "https://soweread.com";
const FALLBACK_WORDPRESS_API_URL = `${FALLBACK_PRIMARY_SITE_URL}/wp-json/wp/v2`;

export type SiteConfigOptions = {
  /** Request `Host` header. Only consulted when SITE_ROLE_RESOLUTION=host. */
  host?: string | null;
};

export function getSiteConfig(
  env: NodeJS.ProcessEnv = process.env,
  options: SiteConfigOptions = {}
): SiteConfig {
  const issues: string[] = [];
  const roleResolution = parseRoleResolution(env.SITE_ROLE_RESOLUTION, issues);
  const backupMode = parseBackupMode(env.BACKUP_MODE, issues);

  const parsedPublicSiteUrl = parseUrl(env.NEXT_PUBLIC_SITE_URL, "NEXT_PUBLIC_SITE_URL", issues);
  const primarySiteUrl =
    parseUrl(env.PRIMARY_SITE_URL, "PRIMARY_SITE_URL", issues) ??
    parseUrl(env.NEXT_PUBLIC_SITE_URL, "NEXT_PUBLIC_SITE_URL", []) ??
    FALLBACK_PRIMARY_SITE_URL;
  const growthSiteUrl = parseUrl(env.GROWTH_SITE_URL, "GROWTH_SITE_URL", issues);
  const backupSiteUrl = parseUrl(env.BACKUP_SITE_URL, "BACKUP_SITE_URL", issues);
  const wordpressApiUrl =
    parseUrl(env.WORDPRESS_API_URL, "WORDPRESS_API_URL", issues) ?? FALLBACK_WORDPRESS_API_URL;
  const cronSecretConfigured = Boolean(env.CRON_SECRET?.trim());

  const siteRole =
    roleResolution === "host"
      ? resolveRoleFromHost({
          host: options.host,
          growthSiteUrl,
          backupSiteUrl,
          primarySiteUrl: parseUrl(env.PRIMARY_SITE_URL, "PRIMARY_SITE_URL", []),
          fallback: env.SITE_ROLE_FALLBACK,
          issues,
        })
      : parseSiteRole(env.SITE_ROLE, issues);

  const isPrimary = siteRole === "primary";
  const isBackup = siteRole === "backup";
  const isGrowth = siteRole === "growth";

  // In host mode the deployment holds every role's credentials at once, so the
  // "growth and backup never share a database" rule has to be enforced in code.
  const databaseIsolationOk = checkDatabaseIsolation({
    env,
    roleResolution,
    growthSiteUrl,
    backupSiteUrl,
    issues,
  });

  // ── Backup role validation ────────────────────────────────────────────────
  const backupPublicSiteUrl =
    roleResolution === "host" ? backupSiteUrl : parsedPublicSiteUrl;
  const backupPublicSiteValid =
    Boolean(backupPublicSiteUrl) && !hasSameHost(backupPublicSiteUrl ?? "", primarySiteUrl);
  const backupRuntimeValid =
    backupPublicSiteValid &&
    isAbsoluteHttpUrl(primarySiteUrl) &&
    isAbsoluteHttpUrl(wordpressApiUrl) &&
    cronSecretConfigured;

  if (isBackup && !cronSecretConfigured) {
    issues.push("CRON_SECRET is required when SITE_ROLE=backup.");
  }
  if (isBackup && !backupPublicSiteUrl) {
    issues.push(
      roleResolution === "host"
        ? "BACKUP_SITE_URL must be a valid backup site URL when the backup role is active."
        : "NEXT_PUBLIC_SITE_URL must be a valid backup site URL when SITE_ROLE=backup."
    );
  }
  if (isBackup && backupPublicSiteUrl && hasSameHost(backupPublicSiteUrl, primarySiteUrl)) {
    issues.push(
      "NEXT_PUBLIC_SITE_URL must not share the same host as PRIMARY_SITE_URL when SITE_ROLE=backup."
    );
  }
  if (isBackup && !isAbsoluteHttpUrl(primarySiteUrl)) {
    issues.push("PRIMARY_SITE_URL must be an absolute http/https URL when SITE_ROLE=backup.");
  }
  if (isBackup && !isAbsoluteHttpUrl(wordpressApiUrl)) {
    issues.push("WORDPRESS_API_URL must be an absolute http/https URL when SITE_ROLE=backup.");
  }

  // ── Growth role validation ────────────────────────────────────────────────
  const growthPublicSiteUrl =
    roleResolution === "host" ? growthSiteUrl : parsedPublicSiteUrl;
  const growthHostDistinct =
    Boolean(growthPublicSiteUrl) &&
    !hasSameHost(growthPublicSiteUrl ?? "", primarySiteUrl) &&
    (!backupSiteUrl || !hasSameHost(growthPublicSiteUrl ?? "", backupSiteUrl));

  if (isGrowth && !growthPublicSiteUrl) {
    issues.push(
      roleResolution === "host"
        ? "GROWTH_SITE_URL must be a valid growth site URL when the growth role is active."
        : "NEXT_PUBLIC_SITE_URL must be a valid growth site URL when SITE_ROLE=growth."
    );
  }
  if (isGrowth && growthPublicSiteUrl && hasSameHost(growthPublicSiteUrl, primarySiteUrl)) {
    issues.push(
      "The growth site must not share the same host as PRIMARY_SITE_URL; growth needs its own indexable domain."
    );
  }
  if (
    isGrowth &&
    growthPublicSiteUrl &&
    backupSiteUrl &&
    hasSameHost(growthPublicSiteUrl, backupSiteUrl)
  ) {
    issues.push("GROWTH_SITE_URL and BACKUP_SITE_URL must not share the same host.");
  }

  const canServeGrowthContent = isGrowth && growthHostDistinct && databaseIsolationOk;

  // Backup keeps its existing MVP behaviour; growth and unresolved never redirect.
  const shouldRedirectInProxy = isBackup && backupMode === "redirect" && backupRuntimeValid;
  const shouldServeBackupContent =
    isPrimary || (isBackup && (backupMode === "serve" || !backupRuntimeValid));
  const canServeMirrorContent = (isPrimary || isBackup) && databaseIsolationOk;

  const publicSiteUrl =
    (isGrowth ? growthPublicSiteUrl : isBackup ? backupPublicSiteUrl : parsedPublicSiteUrl) ??
    parsedPublicSiteUrl ??
    primarySiteUrl;

  // Growth self-canonicalises to its own domain; the mirror canonicalises upstream.
  const canonicalBaseUrl = canServeGrowthContent ? publicSiteUrl : primarySiteUrl;
  const canonicalHost = hostOfOrNull(canonicalBaseUrl);
  const enforceCanonicalHost =
    canServeGrowthContent && env.GROWTH_ENFORCE_CANONICAL_HOST === "true" && Boolean(canonicalHost);

  // Only primary and a healthy growth deployment may be indexed. Backup stays
  // `noindex, follow` so crawlers can actually read the directive (plan §5.2).
  const indexable = isPrimary || canServeGrowthContent;
  const metaRobots = indexable
    ? { index: true, follow: true }
    : { index: false, follow: siteRole !== "unresolved" };

  return {
    siteRole,
    roleResolution,
    backupMode,
    publicSiteUrl,
    primarySiteUrl,
    growthSiteUrl,
    backupSiteUrl,
    canonicalBaseUrl,
    canonicalHost,
    enforceCanonicalHost,
    wordpressApiUrl,
    cronSecretConfigured,
    isPrimary,
    isBackup,
    isGrowth,
    shouldRedirectInProxy,
    shouldServeBackupContent,
    canServeGrowthContent,
    canServeMirrorContent,
    indexable,
    sitemapEnabled: indexable,
    metaRobots,
    databaseUrlKey: databaseUrlKeyForRole(siteRole),
    issues,
  };
}

export function databaseUrlKeyForRole(role: ResolvedSiteRole): DatabaseUrlKey {
  if (role === "growth") return "GROWTH_DATABASE_URL";
  if (role === "backup") return "BACKUP_DATABASE_URL";
  return "DATABASE_URL";
}

function checkDatabaseIsolation({
  env,
  roleResolution,
  growthSiteUrl,
  backupSiteUrl,
  issues,
}: {
  env: NodeJS.ProcessEnv;
  roleResolution: RoleResolution;
  growthSiteUrl: string | null;
  backupSiteUrl: string | null;
  issues: string[];
}) {
  // Two separate Vercel Projects each carry a single DATABASE_URL, so there is
  // nothing to cross-check. Only the single-project topology can collide.
  if (roleResolution !== "host") return true;
  if (!growthSiteUrl || !backupSiteUrl) return true;

  const growthDb = (env.GROWTH_DATABASE_URL ?? env.DATABASE_URL ?? "").trim();
  const backupDb = (env.BACKUP_DATABASE_URL ?? env.DATABASE_URL ?? "").trim();

  if (!growthDb) {
    issues.push("GROWTH_DATABASE_URL is required when growth and backup share one deployment.");
    return false;
  }
  if (!backupDb) {
    issues.push("BACKUP_DATABASE_URL is required when growth and backup share one deployment.");
    return false;
  }
  if (growthDb === backupDb) {
    issues.push(
      "GROWTH_DATABASE_URL and BACKUP_DATABASE_URL must point at different databases; the WordPress mirror must never be reachable from the growth domain."
    );
    return false;
  }

  return true;
}

function resolveRoleFromHost({
  host,
  growthSiteUrl,
  backupSiteUrl,
  primarySiteUrl,
  fallback,
  issues,
}: {
  host: string | null | undefined;
  growthSiteUrl: string | null;
  backupSiteUrl: string | null;
  primarySiteUrl: string | null;
  fallback: string | undefined;
  issues: string[];
}): ResolvedSiteRole {
  if (!growthSiteUrl && !backupSiteUrl) {
    issues.push(
      "SITE_ROLE_RESOLUTION=host requires at least one of GROWTH_SITE_URL or BACKUP_SITE_URL."
    );
    return "unresolved";
  }

  const normalizedHost = normalizeHostHeader(host);
  if (normalizedHost) {
    if (growthSiteUrl && normalizedHost === hostOf(growthSiteUrl)) return "growth";
    if (backupSiteUrl && normalizedHost === hostOf(backupSiteUrl)) return "backup";
    if (primarySiteUrl && normalizedHost === hostOf(primarySiteUrl)) return "primary";
  }

  if (!fallback?.trim()) {
    // Unknown host (preview URL, misconfigured alias, direct IP). Fail closed.
    return "unresolved";
  }

  const parsedFallback = parseSiteRole(fallback, issues);
  return parsedFallback;
}

function hostOf(url: string) {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return "";
  }
}

function parseRoleResolution(value: string | undefined, issues: string[]): RoleResolution {
  if (!value) return "env";
  if (value === "env" || value === "host") return value;
  issues.push(`Unsupported SITE_ROLE_RESOLUTION: ${value}`);
  return "env";
}

function parseSiteRole(value: string | undefined, issues: string[]): SiteRole {
  if (!value) return "primary";
  if (value === "primary" || value === "backup" || value === "growth") return value;
  issues.push(`Unsupported SITE_ROLE: ${value}`);
  return "primary";
}

function parseBackupMode(value: string | undefined, issues: string[]): BackupMode {
  if (!value) return "serve";
  if (value === "serve" || value === "redirect") return value;
  issues.push(`Unsupported BACKUP_MODE: ${value}`);
  return "serve";
}

function parseUrl(value: string | undefined, key: string, issues: string[]): string | null {
  if (!value?.trim()) return null;

  try {
    const parsed = new URL(value);
    if (!/^https?:$/.test(parsed.protocol)) {
      issues.push(`${key} must use http or https.`);
      return null;
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    issues.push(`${key} must be a valid absolute URL.`);
    return null;
  }
}

function isAbsoluteHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return /^https?:$/.test(parsed.protocol);
  } catch {
    return false;
  }
}

export function normalizeHostHeader(host: string | null | undefined): string | null {
  if (!host?.trim()) return null;
  return host.trim().toLowerCase().split(",")[0].trim();
}

function hostOfOrNull(url: string): string | null {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

function hasSameHost(left: string, right: string) {
  try {
    return new URL(left).host === new URL(right).host;
  } catch {
    return false;
  }
}

/**
 * Config for the backup role regardless of which host the request arrived on.
 *
 * The daily WordPress sync is a backup-only operation, so it must never infer
 * its role (and therefore its database) from whichever domain the cron happened
 * to call. In the single-project topology it is pinned to BACKUP_SITE_URL; if
 * that is not configured the role stays `unresolved` and the sync refuses.
 */
export function getBackupSiteConfig(env: NodeJS.ProcessEnv = process.env): SiteConfig {
  if (env.SITE_ROLE_RESOLUTION !== "host") {
    return getSiteConfig(env);
  }

  let backupHost: string | null = null;
  try {
    backupHost = env.BACKUP_SITE_URL ? new URL(env.BACKUP_SITE_URL).host : null;
  } catch {
    backupHost = null;
  }

  return getSiteConfig(env, { host: backupHost });
}
