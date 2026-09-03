import { getPublishedPosts } from "@/lib/content";
import { getRequestSiteConfig } from "@/lib/request-site-config";
import { getSiteConfig } from "@/lib/site-config";

const SITE_URL = getSiteConfig().primarySiteUrl;

export const dynamic = "force-dynamic";

export async function GET() {
  // This feed lists soweread.com articles. The growth domain has its own
  // content tree and must not republish the primary feed.
  const config = await getRequestSiteConfig();
  if (config.isGrowth || config.siteRole === "unresolved") {
    return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex, follow" } });
  }

  const posts = await getPublishedPosts();

  const items = posts
    .slice(0, 20)
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid>${SITE_URL}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>潤讀 So We Read</title>
    <link>${SITE_URL}</link>
    <description>探索食品安全、營養知識與飲食文化的精選文章。</description>
    <language>zh-TW</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
