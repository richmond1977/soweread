import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GrowthSiteJsonLd } from "@/components/growth-json-ld";
import { GrowthShell } from "@/components/growth-shell";
import { getGrowthKnowledge } from "@/lib/growth/knowledge";
import { publishedTopics } from "@/lib/growth/knowledge-core";

export const dynamic = "force-dynamic";

const TITLE = "知識主題";
const DESCRIPTION = "潤讀知識站的主題中心列表：每個主題整理定義、核心問題、相關實體與來源。";

export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) return { robots: { index: false, follow: false } };

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${config.canonicalBaseUrl}/topics` },
    robots: config.metaRobots,
  };
}

export default async function TopicsIndexPage() {
  const { config, knowledge } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) notFound();

  const topics = publishedTopics(knowledge);
  const breadcrumbs = [
    { name: "首頁", href: "/" },
    { name: TITLE, href: "/topics" },
  ];

  return (
    <>
      <GrowthSiteJsonLd baseUrl={config.canonicalBaseUrl} breadcrumbs={breadcrumbs} />
      <GrowthShell isFixture={knowledge.isFixture} breadcrumbs={breadcrumbs}>
        <h1>{TITLE}</h1>
        <p className="growth-lede">{DESCRIPTION}</p>

        {topics.length ? (
          <ul className="growth-topic-list">
            {topics.map((topic) => (
              <li key={topic.slug}>
                <h2>
                  <Link href={`/topics/${topic.slug}`}>{topic.name}</Link>
                </h2>
                <p>{topic.summary}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>目前尚未發布任何主題。</p>
        )}
      </GrowthShell>
    </>
  );
}
