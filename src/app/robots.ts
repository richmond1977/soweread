import type { MetadataRoute } from "next";
import { getRequestSiteConfig } from "@/lib/request-site-config";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const config = await getRequestSiteConfig();

  // Unknown host, or a role whose required env vars are missing/conflicting.
  // Fail closed: block everything rather than risk indexing the wrong site.
  if (config.siteRole === "unresolved") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  // The backup mirror must stay crawlable so that crawlers can actually read
  // its `noindex, follow` directive. `Disallow: /` would hide the directive and
  // leave stale mirror URLs in the index (plan §5.2).
  if (config.isBackup) {
    return {
      rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/api/"] }],
      host: config.publicSiteUrl,
    };
  }

  if (config.isGrowth) {
    if (!config.canServeGrowthContent) {
      return { rules: [{ userAgent: "*", disallow: "/" }] };
    }

    // This site's entire purpose is AI answer-engine citation (Growth Plan
    // §GEO), so the default rule already allows every crawler. The explicit
    // entries below only carry the one distinction the plan calls out
    // (§8): OAI-SearchBot serves live ChatGPT Search citations and must stay
    // allowed, while GPTBot is a training-data crawler, which is a separate
    // decision from search visibility.
    const disallowAdmin = ["/admin", "/admin/", "/api/"];
    return {
      rules: [
        { userAgent: "*", allow: "/", disallow: disallowAdmin },
        { userAgent: "OAI-SearchBot", allow: "/", disallow: disallowAdmin },
        { userAgent: "PerplexityBot", allow: "/", disallow: disallowAdmin },
        { userAgent: "ClaudeBot", allow: "/", disallow: disallowAdmin },
        { userAgent: "Google-Extended", allow: "/", disallow: disallowAdmin },
        { userAgent: "GPTBot", disallow: "/" },
      ],
      sitemap: `${config.canonicalBaseUrl}/sitemap.xml`,
      host: config.canonicalBaseUrl,
    };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/api/"] }],
    sitemap: `${config.primarySiteUrl}/sitemap.xml`,
    host: config.primarySiteUrl,
  };
}
