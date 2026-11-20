import type { Metadata } from "next";
import { TopicPageView, topicMetadata, topicStaticParams } from "@/components/growth-pages/topic-page";

// ISR, not force-dynamic: this page's content changes only when the growth
// knowledge base is re-seeded, but every crawl used to cost a fresh SSR plus a
// Neon round trip. A new site gets very little crawl budget, and slow responses
// spend it faster than anything else — as of 2026-09-07 twelve of these pages
// were still "Discovered - currently not indexed" with no crawl recorded at all.
//
// `revalidate` alone is not enough: an App Router dynamic segment without
// generateStaticParams is server-rendered on every request and never cached
// (verified against `next start` — the responses came back `no-store`), so the
// params have to be enumerated here.
//
// Prerendering at build time is safe in both failure modes because the params
// and the page body come from the same gate: an unhealthy growth role or an
// unreachable database yields EMPTY_KNOWLEDGE, generateStaticParams returns [],
// and nothing is baked at all — the route simply falls back to rendering on
// demand with the correct runtime env, exactly as it does today.
export const revalidate = 3600;
export async function generateStaticParams() {
  return topicStaticParams("zh");
}

type TopicPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  return topicMetadata("zh", slug);
}

export default async function TopicHubPage({ params }: TopicPageProps) {
  const { slug } = await params;
  return <TopicPageView locale="zh" slug={slug} />;
}
