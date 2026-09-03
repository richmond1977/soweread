import test from "node:test";
import assert from "node:assert/strict";
import { getBackupSiteConfig, getSiteConfig, normalizeHostHeader } from "./site-config.ts";

test("getSiteConfig defaults to primary serve without accidental backup redirect", () => {
  const config = getSiteConfig({});

  assert.equal(config.siteRole, "primary");
  assert.equal(config.backupMode, "serve");
  assert.equal(config.shouldRedirectInProxy, false);
  assert.equal(config.shouldServeBackupContent, true);
  assert.deepEqual(config.issues, []);
});

test("getSiteConfig fail-closes backup redirect when CRON_SECRET is missing", () => {
  const config = getSiteConfig({
    SITE_ROLE: "backup",
    BACKUP_MODE: "redirect",
    PRIMARY_SITE_URL: "https://soweread.com",
    WORDPRESS_API_URL: "https://soweread.com/wp-json/wp/v2",
  });

  assert.equal(config.shouldRedirectInProxy, false);
  assert.equal(config.shouldServeBackupContent, true);
  assert.match(config.issues.join(" "), /CRON_SECRET/);
});

test("getSiteConfig enables backup redirect only with valid required env", () => {
  const config = getSiteConfig({
    SITE_ROLE: "backup",
    BACKUP_MODE: "redirect",
    NEXT_PUBLIC_SITE_URL: "https://backup.example.com",
    PRIMARY_SITE_URL: "https://soweread.com",
    WORDPRESS_API_URL: "https://soweread.com/wp-json/wp/v2",
    CRON_SECRET: "top-secret",
  });

  assert.equal(config.shouldRedirectInProxy, true);
  assert.equal(config.shouldServeBackupContent, false);
  assert.deepEqual(config.issues, []);
});

test("getSiteConfig fail-closes backup redirect when backup host is missing or matches primary host", () => {
  const missingPublicUrl = getSiteConfig({
    SITE_ROLE: "backup",
    BACKUP_MODE: "redirect",
    PRIMARY_SITE_URL: "https://soweread.com",
    WORDPRESS_API_URL: "https://soweread.com/wp-json/wp/v2",
    CRON_SECRET: "top-secret",
  });

  assert.equal(missingPublicUrl.shouldRedirectInProxy, false);
  assert.equal(missingPublicUrl.shouldServeBackupContent, true);
  assert.match(missingPublicUrl.issues.join(" "), /NEXT_PUBLIC_SITE_URL/);

  const sameHost = getSiteConfig({
    SITE_ROLE: "backup",
    BACKUP_MODE: "redirect",
    NEXT_PUBLIC_SITE_URL: "https://soweread.com",
    PRIMARY_SITE_URL: "https://soweread.com",
    WORDPRESS_API_URL: "https://soweread.com/wp-json/wp/v2",
    CRON_SECRET: "top-secret",
  });

  assert.equal(sameHost.shouldRedirectInProxy, false);
  assert.equal(sameHost.shouldServeBackupContent, true);
  assert.match(sameHost.issues.join(" "), /must not share the same host/);
});

// ── SITE_ROLE=growth (env resolution / two Vercel Projects) ──────────────────

const GROWTH_ENV = {
  SITE_ROLE: "growth",
  NEXT_PUBLIC_SITE_URL: "https://knowledge.example.com",
  PRIMARY_SITE_URL: "https://soweread.com",
};

test("getSiteConfig serves growth content with an indexable self-canonical", () => {
  const config = getSiteConfig(GROWTH_ENV);

  assert.equal(config.siteRole, "growth");
  assert.equal(config.isGrowth, true);
  assert.equal(config.isBackup, false);
  assert.equal(config.isPrimary, false);
  assert.equal(config.canServeGrowthContent, true);
  assert.equal(config.canonicalBaseUrl, "https://knowledge.example.com");
  assert.equal(config.indexable, true);
  assert.equal(config.sitemapEnabled, true);
  assert.deepEqual(config.metaRobots, { index: true, follow: true });
  assert.deepEqual(config.issues, []);
});

test("growth never performs a site-wide redirect to the primary site", () => {
  const config = getSiteConfig({ ...GROWTH_ENV, BACKUP_MODE: "redirect" });

  assert.equal(config.shouldRedirectInProxy, false);
});

test("growth fail-closes when its host is missing", () => {
  const config = getSiteConfig({ SITE_ROLE: "growth", PRIMARY_SITE_URL: "https://soweread.com" });

  assert.equal(config.canServeGrowthContent, false);
  assert.equal(config.indexable, false);
  assert.equal(config.sitemapEnabled, false);
  assert.match(config.issues.join(" "), /NEXT_PUBLIC_SITE_URL/);
});

test("growth fail-closes when it shares the primary host", () => {
  const config = getSiteConfig({
    SITE_ROLE: "growth",
    NEXT_PUBLIC_SITE_URL: "https://soweread.com",
    PRIMARY_SITE_URL: "https://soweread.com",
  });

  assert.equal(config.canServeGrowthContent, false);
  assert.equal(config.indexable, false);
  assert.match(config.issues.join(" "), /must not share the same host as PRIMARY_SITE_URL/);
});

test("growth fail-closes when it shares the backup host", () => {
  const config = getSiteConfig({
    ...GROWTH_ENV,
    BACKUP_SITE_URL: "https://knowledge.example.com",
  });

  assert.equal(config.canServeGrowthContent, false);
  assert.match(config.issues.join(" "), /must not share the same host/);
});

test("backup stays crawlable but noindex, follow", () => {
  const config = getSiteConfig({
    SITE_ROLE: "backup",
    BACKUP_MODE: "serve",
    NEXT_PUBLIC_SITE_URL: "https://backup.example.com",
    PRIMARY_SITE_URL: "https://soweread.com",
    WORDPRESS_API_URL: "https://soweread.com/wp-json/wp/v2",
    CRON_SECRET: "top-secret",
  });

  assert.equal(config.indexable, false);
  assert.equal(config.sitemapEnabled, false);
  assert.deepEqual(config.metaRobots, { index: false, follow: true });
  assert.equal(config.canServeGrowthContent, false);
});

// ── Host resolution (single Vercel Project serving both domains) ─────────────

const HOST_ENV = {
  SITE_ROLE_RESOLUTION: "host",
  GROWTH_SITE_URL: "https://knowledge.example.com",
  BACKUP_SITE_URL: "https://backup.example.com",
  PRIMARY_SITE_URL: "https://soweread.com",
  WORDPRESS_API_URL: "https://soweread.com/wp-json/wp/v2",
  CRON_SECRET: "top-secret",
  GROWTH_DATABASE_URL: "postgresql://growth",
  BACKUP_DATABASE_URL: "postgresql://backup",
};

test("host resolution routes the growth domain to the growth role", () => {
  const config = getSiteConfig(HOST_ENV, { host: "knowledge.example.com" });

  assert.equal(config.siteRole, "growth");
  assert.equal(config.canServeGrowthContent, true);
  assert.equal(config.canServeMirrorContent, false);
  assert.equal(config.canonicalBaseUrl, "https://knowledge.example.com");
  assert.equal(config.databaseUrlKey, "GROWTH_DATABASE_URL");
  assert.equal(config.indexable, true);
  assert.deepEqual(config.issues, []);
});

test("host resolution routes the backup domain to the backup role", () => {
  const config = getSiteConfig(HOST_ENV, { host: "backup.example.com" });

  assert.equal(config.siteRole, "backup");
  assert.equal(config.canServeGrowthContent, false);
  assert.equal(config.canServeMirrorContent, true);
  assert.equal(config.databaseUrlKey, "BACKUP_DATABASE_URL");
  assert.equal(config.indexable, false);
  assert.equal(config.sitemapEnabled, false);
});

test("host resolution ignores port and letter case", () => {
  const config = getSiteConfig(
    { ...HOST_ENV, GROWTH_SITE_URL: "https://knowledge.example.com:8443" },
    { host: "KNOWLEDGE.EXAMPLE.COM:8443" }
  );

  assert.equal(config.siteRole, "growth");
});

test("an unknown host fails closed instead of guessing a role", () => {
  const config = getSiteConfig(HOST_ENV, { host: "some-preview.vercel.app" });

  assert.equal(config.siteRole, "unresolved");
  assert.equal(config.isGrowth, false);
  assert.equal(config.isBackup, false);
  assert.equal(config.isPrimary, false);
  assert.equal(config.canServeGrowthContent, false);
  assert.equal(config.canServeMirrorContent, false);
  assert.equal(config.indexable, false);
  assert.equal(config.sitemapEnabled, false);
  assert.deepEqual(config.metaRobots, { index: false, follow: false });
});

test("SITE_ROLE_FALLBACK only applies when it is explicitly configured", () => {
  const config = getSiteConfig(
    { ...HOST_ENV, SITE_ROLE_FALLBACK: "growth" },
    { host: "some-preview.vercel.app" }
  );

  assert.equal(config.siteRole, "growth");
  assert.equal(config.canServeGrowthContent, true);
});

test("host resolution without any configured host mapping fails closed", () => {
  const config = getSiteConfig(
    { SITE_ROLE_RESOLUTION: "host", PRIMARY_SITE_URL: "https://soweread.com" },
    { host: "knowledge.example.com" }
  );

  assert.equal(config.siteRole, "unresolved");
  assert.match(config.issues.join(" "), /requires at least one of GROWTH_SITE_URL or BACKUP_SITE_URL/);
});

// ── Role conflict: growth and backup must never share a database ────────────

test("growth and backup sharing one database URL fails closed on both roles", () => {
  const shared = {
    ...HOST_ENV,
    GROWTH_DATABASE_URL: "postgresql://same",
    BACKUP_DATABASE_URL: "postgresql://same",
  };

  const growth = getSiteConfig(shared, { host: "knowledge.example.com" });
  assert.equal(growth.canServeGrowthContent, false);
  assert.equal(growth.indexable, false);
  assert.match(growth.issues.join(" "), /must point at different databases/);

  const backup = getSiteConfig(shared, { host: "backup.example.com" });
  assert.equal(backup.canServeMirrorContent, false);
  assert.match(backup.issues.join(" "), /must point at different databases/);
});

test("a shared deployment falling back to a single DATABASE_URL fails closed", () => {
  const config = getSiteConfig(
    {
      SITE_ROLE_RESOLUTION: "host",
      GROWTH_SITE_URL: "https://knowledge.example.com",
      BACKUP_SITE_URL: "https://backup.example.com",
      PRIMARY_SITE_URL: "https://soweread.com",
      WORDPRESS_API_URL: "https://soweread.com/wp-json/wp/v2",
      CRON_SECRET: "top-secret",
      DATABASE_URL: "postgresql://only-one",
    },
    { host: "knowledge.example.com" }
  );

  assert.equal(config.canServeGrowthContent, false);
  assert.match(config.issues.join(" "), /must point at different databases/);
});

test("two separate Vercel Projects need no cross-role database check", () => {
  const config = getSiteConfig({ ...GROWTH_ENV, DATABASE_URL: "postgresql://growth-project" });

  assert.equal(config.canServeGrowthContent, true);
  assert.deepEqual(config.issues, []);
});

test("an unsupported SITE_ROLE is reported and falls back to primary", () => {
  const config = getSiteConfig({ SITE_ROLE: "growh" });

  assert.equal(config.siteRole, "primary");
  assert.match(config.issues.join(" "), /Unsupported SITE_ROLE: growh/);
});

// ── Canonical host enforcement (Vercel gives one project several aliases) ────

test("canonical host enforcement is off unless explicitly enabled", () => {
  const config = getSiteConfig(GROWTH_ENV);

  assert.equal(config.canonicalHost, "knowledge.example.com");
  assert.equal(config.enforceCanonicalHost, false);
});

test("canonical host enforcement turns on with GROWTH_ENFORCE_CANONICAL_HOST", () => {
  const config = getSiteConfig({ ...GROWTH_ENV, GROWTH_ENFORCE_CANONICAL_HOST: "true" });

  assert.equal(config.enforceCanonicalHost, true);
  assert.equal(config.canonicalHost, "knowledge.example.com");
});

test("canonical host enforcement never activates for a non-growth role", () => {
  for (const env of [
    { GROWTH_ENFORCE_CANONICAL_HOST: "true" },
    {
      SITE_ROLE: "backup",
      BACKUP_MODE: "serve",
      NEXT_PUBLIC_SITE_URL: "https://backup.example.com",
      PRIMARY_SITE_URL: "https://soweread.com",
      WORDPRESS_API_URL: "https://soweread.com/wp-json/wp/v2",
      CRON_SECRET: "top-secret",
      GROWTH_ENFORCE_CANONICAL_HOST: "true",
    },
  ]) {
    assert.equal(getSiteConfig(env).enforceCanonicalHost, false);
  }
});

test("canonical host enforcement never activates for an unhealthy growth role", () => {
  const config = getSiteConfig({
    SITE_ROLE: "growth",
    PRIMARY_SITE_URL: "https://soweread.com",
    GROWTH_ENFORCE_CANONICAL_HOST: "true",
  });

  assert.equal(config.enforceCanonicalHost, false);
});

test("a growth site on a Vercel-provided host canonicalises to that host", () => {
  const config = getSiteConfig({
    SITE_ROLE: "growth",
    NEXT_PUBLIC_SITE_URL: "https://soweread-growth.vercel.app",
    PRIMARY_SITE_URL: "https://soweread.com",
    GROWTH_ENFORCE_CANONICAL_HOST: "true",
  });

  assert.equal(config.canServeGrowthContent, true);
  assert.equal(config.canonicalBaseUrl, "https://soweread-growth.vercel.app");
  assert.equal(config.canonicalHost, "soweread-growth.vercel.app");
  assert.equal(config.enforceCanonicalHost, true);
  assert.equal(config.indexable, true);
  assert.deepEqual(config.issues, []);
});

test("normalizeHostHeader lowercases and takes the first forwarded host", () => {
  assert.equal(normalizeHostHeader("Knowledge.Example.COM:8443"), "knowledge.example.com:8443");
  assert.equal(normalizeHostHeader("a.example.com, b.example.com"), "a.example.com");
  assert.equal(normalizeHostHeader(""), null);
  assert.equal(normalizeHostHeader(undefined), null);
});

// ── Growth-only deployment (single Project, single database) ────────────────

const GROWTH_ONLY_ENV = {
  SITE_ROLE: "growth",
  NEXT_PUBLIC_SITE_URL: "https://soweread-growth.vercel.app",
  PRIMARY_SITE_URL: "https://soweread.com",
  DATABASE_URL: "postgresql://the-one-and-only",
};

test("a growth-only deployment works with a single DATABASE_URL and no backup vars", () => {
  const config = getSiteConfig(GROWTH_ONLY_ENV);

  assert.equal(config.siteRole, "growth");
  assert.equal(config.canServeGrowthContent, true);
  assert.equal(config.indexable, true);
  assert.equal(config.sitemapEnabled, true);
  assert.equal(config.canonicalBaseUrl, "https://soweread-growth.vercel.app");
  assert.deepEqual(config.issues, []);
});

test("a growth-only deployment never serves mirror content or redirects", () => {
  const config = getSiteConfig(GROWTH_ONLY_ENV);

  assert.equal(config.canServeMirrorContent, false);
  assert.equal(config.shouldRedirectInProxy, false);
  assert.equal(config.shouldServeBackupContent, false);
});

test("getBackupSiteConfig on a growth-only deployment does not become the backup role", () => {
  const config = getBackupSiteConfig(GROWTH_ONLY_ENV);

  assert.equal(config.isBackup, false);
  assert.equal(config.isPrimary, false);
  assert.equal(config.siteRole, "growth");
});

test("getBackupSiteConfig fails closed in host mode with no BACKUP_SITE_URL", () => {
  const config = getBackupSiteConfig({
    SITE_ROLE_RESOLUTION: "host",
    GROWTH_SITE_URL: "https://soweread-growth.vercel.app",
    PRIMARY_SITE_URL: "https://soweread.com",
  });

  assert.equal(config.siteRole, "unresolved");
  assert.equal(config.isBackup, false);
});

test("getBackupSiteConfig pins the backup role in host mode regardless of caller", () => {
  const config = getBackupSiteConfig(HOST_ENV);

  assert.equal(config.siteRole, "backup");
  assert.equal(config.databaseUrlKey, "BACKUP_DATABASE_URL");
});
