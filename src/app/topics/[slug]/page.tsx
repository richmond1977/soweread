import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopicJsonLd } from "@/components/growth-json-ld";
import { GrowthShell, PrimaryCta } from "@/components/growth-shell";
import { getGrowthKnowledge } from "@/lib/growth/knowledge";
import {
  articlesForTopic,
  entitiesForTopic,
  findPublicTopic,
  publishedTopics,
} from "@/lib/growth/knowledge-core";

export const dynamic = "force-dynamic";

type TopicPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { config, knowledge } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) return { robots: { index: false, follow: false } };

  const topic = findPublicTopic(knowledge, slug);
  if (!topic) return { robots: { index: false, follow: false } };

  return {
    title: topic.seoTitle || topic.name,
    description: topic.seoDescription || topic.summary,
    alternates: { canonical: `${config.canonicalBaseUrl}/topics/${topic.slug}` },
    robots: config.metaRobots,
    openGraph: {
      type: "website",
      locale: "zh_TW",
      url: `${config.canonicalBaseUrl}/topics/${topic.slug}`,
      title: topic.seoTitle || topic.name,
      description: topic.seoDescription || topic.summary,
    },
  };
}

export default async function TopicHubPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const { config, knowledge } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) notFound();

  const topic = findPublicTopic(knowledge, slug);
  if (!topic) notFound();

  const entities = entitiesForTopic(knowledge, topic.slug);
  const articles = articlesForTopic(knowledge, topic.slug);
  const otherTopics = publishedTopics(knowledge).filter((item) => item.slug !== topic.slug);

  const breadcrumbs = [
    { name: "首頁", href: "/" },
    { name: "知識主題", href: "/topics" },
    { name: topic.name, href: `/topics/${topic.slug}` },
  ];

  return (
    <>
      <TopicJsonLd
        baseUrl={config.canonicalBaseUrl}
        topic={topic}
        breadcrumbs={breadcrumbs}
        entities={entities}
      />
      <GrowthShell isFixture={knowledge.isFixture} breadcrumbs={breadcrumbs}>
        <article className="growth-topic">
          <h1>{topic.name}</h1>
          <p className="growth-lede">{topic.summary}</p>

          <section aria-labelledby="topic-definition">
            <h2 id="topic-definition">這個主題涵蓋什麼</h2>
            <p>{topic.definition}</p>
          </section>

          {topic.keyQuestions.length ? (
            <section aria-labelledby="topic-questions">
              <h2 id="topic-questions">核心問題</h2>
              <ul>
                {topic.keyQuestions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="topic-entities">
            <h2 id="topic-entities">重要實體</h2>
            {entities.length ? (
              <ul className="growth-entity-list">
                {entities.map((entity) => (
                  <li key={entity.slug}>
                    <Link href={`/entities/${entity.slug}`}>{entity.name}</Link>
                    <span className="growth-entity-type">{entity.entityType}</span>
                    <p>{entity.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>這個主題尚未發布任何實體頁。</p>
            )}
          </section>

          <section aria-labelledby="topic-articles">
            <h2 id="topic-articles">延伸閱讀</h2>
            {articles.length ? (
              <ul className="growth-article-list">
                {articles.map((article) => (
                  <li key={article.slug}>
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                    <p>{article.summary}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>這個主題尚未發布文章。</p>
            )}
          </section>

          {otherTopics.length ? (
            <section aria-labelledby="topic-next">
              <h2 id="topic-next">下一步</h2>
              <ul>
                {otherTopics.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/topics/${item.slug}`}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <PrimaryCta
            href="https://soweread.com/"
            label="潤讀主站有更多食品安全與飲食文化的長篇評論"
          />
        </article>
      </GrowthShell>
    </>
  );
}
