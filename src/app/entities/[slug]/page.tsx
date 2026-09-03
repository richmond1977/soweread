import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityJsonLd } from "@/components/growth-json-ld";
import { GrowthShell, PrimaryCta, SourceList } from "@/components/growth-shell";
import { getGrowthKnowledge } from "@/lib/growth/knowledge";
import {
  articlesForEntity,
  findPublicEntity,
  findPublicTopic,
  publicRelationsForEntity,
  sourcesByIds,
} from "@/lib/growth/knowledge-core";

export const dynamic = "force-dynamic";

type EntityPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: EntityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { config, knowledge } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) return { robots: { index: false, follow: false } };

  const entity = findPublicEntity(knowledge, slug);
  if (!entity) return { robots: { index: false, follow: false } };

  return {
    title: entity.seoTitle || entity.name,
    description: entity.seoDescription || entity.description,
    keywords: entity.aliases,
    // Self-canonical: the growth site must rank for its own pages, so it never
    // canonicalises an original entity page to soweread.com (plan §5.1).
    alternates: { canonical: `${config.canonicalBaseUrl}/entities/${entity.slug}` },
    robots: config.metaRobots,
    openGraph: {
      type: "article",
      locale: "zh_TW",
      url: `${config.canonicalBaseUrl}/entities/${entity.slug}`,
      title: entity.seoTitle || entity.name,
      description: entity.seoDescription || entity.description,
    },
  };
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { slug } = await params;
  const { config, knowledge } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) notFound();

  const entity = findPublicEntity(knowledge, slug);
  if (!entity) notFound();

  const parentTopic = entity.topicSlugs
    .map((topicSlug) => findPublicTopic(knowledge, topicSlug))
    .find((topic) => topic !== null);
  const relations = publicRelationsForEntity(knowledge, entity.slug);
  const articles = articlesForEntity(knowledge, entity.slug);
  const sources = sourcesByIds(knowledge, entity.sourceIds);

  const breadcrumbs = [
    { name: "首頁", href: "/" },
    { name: "知識主題", href: "/topics" },
    ...(parentTopic ? [{ name: parentTopic.name, href: `/topics/${parentTopic.slug}` }] : []),
    { name: entity.name, href: `/entities/${entity.slug}` },
  ];

  return (
    <>
      <EntityJsonLd
        baseUrl={config.canonicalBaseUrl}
        entity={entity}
        breadcrumbs={breadcrumbs}
        sources={sources}
      />
      <GrowthShell isFixture={knowledge.isFixture} breadcrumbs={breadcrumbs}>
        <article className="growth-entity">
          <h1>{entity.name}</h1>
          <p className="growth-entity-type">類型：{entity.entityType}</p>
          {entity.aliases.length ? (
            <p className="growth-entity-aliases">別名：{entity.aliases.join("、")}</p>
          ) : null}

          <p className="growth-lede">{entity.description}</p>

          {parentTopic ? (
            <p className="growth-parent-topic">
              所屬主題：<Link href={`/topics/${parentTopic.slug}`}>{parentTopic.name}</Link>
            </p>
          ) : null}

          <section aria-labelledby="entity-relations">
            <h2 id="entity-relations">知識關係</h2>
            {relations.length ? (
              <ul className="growth-relation-list">
                {relations.map((relation) => (
                  <li key={relation.id}>
                    <Link href={`/entities/${relation.subject.slug}`}>{relation.subject.name}</Link>
                    <span className="growth-predicate"> {relation.predicate} </span>
                    <Link href={`/entities/${relation.object.slug}`}>{relation.object.name}</Link>
                    <span className="growth-relation-source">
                      （來源：
                      <a href={relation.source.url} rel="noopener nofollow">
                        {relation.source.publisher}
                      </a>
                      ）
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>目前沒有已附上來源的公開關係。</p>
            )}
          </section>

          {articles.length ? (
            <section aria-labelledby="entity-articles">
              <h2 id="entity-articles">相關文章</h2>
              <ul className="growth-article-list">
                {articles.map((article) => (
                  <li key={article.slug}>
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                    <p>{article.summary}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <SourceList sources={sources} />

          {entity.canonicalUrl ? (
            <p className="growth-official-link">
              官方資訊：
              <a href={entity.canonicalUrl} rel="noopener nofollow">
                {entity.canonicalUrl}
              </a>
            </p>
          ) : null}

          <PrimaryCta
            href="https://soweread.com/"
            label="想讀更完整的脈絡分析，請前往潤讀主站"
          />
        </article>
      </GrowthShell>
    </>
  );
}
