import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GrowthArticleJsonLd } from "@/components/growth-json-ld";
import { GrowthShell, PrimaryCta, SourceList } from "@/components/growth-shell";
import { getGrowthKnowledge } from "@/lib/growth/knowledge";
import {
  findPublicArticle,
  findPublicEntity,
  findPublicTopic,
  sourcesByIds,
} from "@/lib/growth/knowledge-core";

export const dynamic = "force-dynamic";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { config, knowledge } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) return { robots: { index: false, follow: false } };

  const article = findPublicArticle(knowledge, slug);
  if (!article) return { robots: { index: false, follow: false } };

  const url = `${config.canonicalBaseUrl}/articles/${article.slug}`;

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.summary,
    alternates: { canonical: url },
    robots: config.metaRobots,
    openGraph: {
      type: "article",
      locale: "zh_TW",
      url,
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.summary,
      ...(article.datePublished ? { publishedTime: article.datePublished } : {}),
      ...(article.dateModified ? { modifiedTime: article.dateModified } : {}),
    },
  };
}

export default async function GrowthArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { config, knowledge } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) notFound();

  const article = findPublicArticle(knowledge, slug);
  if (!article) notFound();

  const topic = article.topicSlug ? findPublicTopic(knowledge, article.topicSlug) : null;
  const entities = article.entitySlugs
    .map((entitySlug) => findPublicEntity(knowledge, entitySlug))
    .filter((entity): entity is NonNullable<typeof entity> => entity !== null);
  const sources = sourcesByIds(knowledge, article.sourceIds);

  const breadcrumbs = [
    { name: "首頁", href: "/" },
    { name: "知識主題", href: "/topics" },
    ...(topic ? [{ name: topic.name, href: `/topics/${topic.slug}` }] : []),
    { name: article.title, href: `/articles/${article.slug}` },
  ];

  return (
    <>
      <GrowthArticleJsonLd
        baseUrl={config.canonicalBaseUrl}
        article={article}
        breadcrumbs={breadcrumbs}
        sources={sources}
        mentionedEntities={entities}
      />
      <GrowthShell isFixture={knowledge.isFixture} breadcrumbs={breadcrumbs}>
        <article className="growth-article">
          <h1>{article.title}</h1>

          <p className="growth-byline">
            {article.authorName}
            {/* 審閱者只在真的有人審閱過時才顯示。沒有審閱者時保持沉默，
                而不是宣告「尚未審閱」——那對讀者沒有用，卻會出現在每一篇上。 */}
            {article.reviewerName ? `｜審閱：${article.reviewerName}` : ""}
            {article.datePublished ? `｜發布 ${article.datePublished}` : ""}
            {article.dateModified && article.dateModified !== article.datePublished
              ? `｜更新 ${article.dateModified}`
              : ""}
          </p>

          <p className="growth-lede">{article.summary}</p>

          <div className="growth-article-body">
            {article.content.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          {topic ? (
            <p className="growth-parent-topic">
              所屬主題：<Link href={`/topics/${topic.slug}`}>{topic.name}</Link>
            </p>
          ) : null}

          {entities.length ? (
            <section aria-labelledby="article-entities">
              <h2 id="article-entities">本文提到的實體</h2>
              <ul className="growth-entity-list">
                {entities.map((entity) => (
                  <li key={entity.slug}>
                    <Link href={`/entities/${entity.slug}`}>{entity.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <SourceList sources={sources} />

          {article.primaryCtaUrl ? (
            <PrimaryCta
              href={article.primaryCtaUrl}
              label={article.primaryCtaLabel || "前往潤讀主站"}
            />
          ) : null}
        </article>
      </GrowthShell>
    </>
  );
}
