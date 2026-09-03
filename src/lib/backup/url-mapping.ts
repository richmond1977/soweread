/**
 * Paths that only exist on the primary/backup deployments. The growth site has
 * its own content tree; serving the soweread.com blog on the growth domain
 * would create exactly the duplicate content the plan forbids (plan §2).
 */
export function isPrimaryOnlyPath(pathname: string) {
  return (
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/categories" ||
    pathname.startsWith("/categories/") ||
    pathname === "/story" ||
    pathname === "/contact" ||
    pathname === "/privacy" ||
    pathname === "/rss.xml"
  );
}

/** Paths that only exist on the growth deployment. */
export function isGrowthOnlyPath(pathname: string) {
  return (
    pathname === "/topics" ||
    pathname.startsWith("/topics/") ||
    pathname.startsWith("/entities/") ||
    pathname.startsWith("/articles/")
  );
}

export function shouldBypassBackupProxy(pathname: string) {
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/admin") ||
    pathname === "/status" ||
    pathname === "/api/health" ||
    pathname === "/api/sync/wordpress" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/rss.xml"
  ) {
    return true;
  }

  return hasStaticAssetExtension(pathname);
}

export function mapPrimaryRedirectPath(pathname: string, search = ""): string | null {
  if (pathname === "/") {
    return `/${search}`;
  }

  if (pathname === "/blog") {
    return `/home/%E6%96%87%E7%AB%A0%E9%83%A8%E8%90%BDblog/${search}`;
  }

  if (pathname === "/story") {
    return `/about/${search}`;
  }

  if (pathname === "/contact") {
    return `/home/contact/${search}`;
  }

  if (pathname === "/privacy") {
    return `/home/privacy-policy/${search}`;
  }

  if (pathname.startsWith("/categories/")) {
    const slug = pathname.slice("/categories/".length);
    return `/category/${slug}/${search}`;
  }

  if (pathname.startsWith("/blog/")) {
    return null;
  }

  return "/";
}

export function isPrimaryHostLoop(requestUrl: string, primarySiteUrl: string) {
  try {
    return new URL(requestUrl).host === new URL(primarySiteUrl).host;
  } catch {
    return false;
  }
}

function hasStaticAssetExtension(pathname: string) {
  return /\.(?:css|js|mjs|json|png|jpg|jpeg|gif|webp|svg|ico|txt|xml|map|woff2?)$/i.test(pathname);
}
