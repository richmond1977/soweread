import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopicJsonLd } from "@/components/growth-json-ld";
import { GrowthShell, PrimaryCta } from "@/components/growth-shell";
import { entityTypeLabel } from "@/lib/growth/entity-type-label";
import { getLocalizedKnowledge, growthContentEn } from "@/lib/growth/knowledge-locale";
import {
  articlesForTopic,
  entitiesForTopic,
  findPublicTopic,
  publishedTopics,
} from "@/lib/growth/knowledge-core";
import {
  type GrowthLocale,
  languageAlternates,
  localePath,
  OG_LOCALE,
  UI,
} from "@/lib/growth/locale";
import { hasEnglishTopic } from "@/lib/growth/localize";

const TEXT = {
  zh: {
    reviewed: "最後審閱：",
    covers: "這個主題涵蓋什麼",
    questions: "核心問題",
    entities: "重要實體",
    noEntities: "這個主題尚未發布任何實體頁。",
    articles: "延伸閱讀",
    noArticles: "這個主題尚未發布文章。",
    next: "下一步",
    ctaHref: "https://soweread.com/",
    ctaLabel: "潤讀主站有更多食品安全與飲食文化的長篇評論",
  },
  en: {
    reviewed: "Last reviewed: ",
    covers: "What this topic covers",
    questions: "Key questions",
    entities: "Key terms",
    noEntities: "No terms have been published under this topic yet.",
    articles: "",
    noArticles: "",
    next: "Other topics",
    ctaHref: "https://soweread.com/en/",
    ctaLabel: "Read long-form essays on food safety and food culture at So We Read",
  },
} as const;

export async function topicStaticParams(locale: GrowthLocale) {
  const { knowledge } = await getLocalizedKnowledge(locale);
  return publishedTopics(knowledge).map((topic) => ({ slug: topic.slug }));
}

export async function topicMetadata(locale: GrowthLocale, slug: string): Promise<Metadata> {
  const { config, knowledge } = await getLocalizedKnowledge(locale);
  if (!config.canServeGrowthContent) return { robots: { index: false, follow: false } };

  const topic = findPublicTopic(knowledge, slug);
  if (!topic) return { robots: { index: false, follow: false } };

  const alternates = languageAlternates(
    config.canonicalBaseUrl,
    locale,
    `/topics/${topic.slug}`,
    hasEnglishTopic(growthContentEn, topic.slug)
  );

  return {
    title: topic.seoTitle || topic.name,
    description: topic.seoDescription || topic.summary,
    alternates,
    robots: config.metaRobots,
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      url: alternates.canonical,
      siteName: UI[locale].siteName,
      title: topic.seoTitle || topic.name,
      description: topic.seoDescription || topic.summary,
    },
  };
}

export async function TopicPageView({ locale, slug }: { locale: GrowthLocale; slug: string }) {
  const { config, knowledge } = await getLocalizedKnowledge(locale);
  if (!config.canServeGrowthContent) notFound();

  const topic = findPublicTopic(knowledge, slug);
  if (!topic) notFound();

  const ui = UI[locale];
  const text = TEXT[locale];
  const entities = entitiesForTopic(knowledge, topic.slug);
  const articles = articlesForTopic(knowledge, topic.slug);
  const otherTopics = publishedTopics(knowledge).filter((item) => item.slug !== topic.slug);
  const path = `/topics/${topic.slug}`;
  const alternateHref =
    locale === "zh"
      ? hasEnglishTopic(growthContentEn, topic.slug)
        ? localePath("en", path)
        : null
      : path;

  const breadcrumbs = [
    { name: ui.home, href: localePath(locale, "/") },
    { name: ui.topics, href: localePath(locale, "/topics") },
    { name: topic.name, href: localePath(locale, path) },
  ];

  return (
    <>
      <TopicJsonLd
        baseUrl={config.canonicalBaseUrl}
        topic={topic}
        breadcrumbs={breadcrumbs}
        entities={entities}
        locale={locale}
      />
      <GrowthShell
        isFixture={knowledge.isFixture}
        breadcrumbs={breadcrumbs}
        locale={locale}
        alternateHref={alternateHref}
      >
        <article className="growth-topic">
          <h1>{topic.name}</h1>
          {topic.reviewedAt ? (
            <p className="growth-reviewed">
              {text.reviewed}
              {topic.reviewedAt}
            </p>
          ) : null}
          <p className="growth-lede">{topic.summary}</p>

          <section aria-labelledby="topic-definition">
            <h2 id="topic-definition">{text.covers}</h2>
            <p>{topic.definition}</p>
          </section>

          {topic.keyQuestions.length ? (
            <section aria-labelledby="topic-questions">
              <h2 id="topic-questions">{text.questions}</h2>
              <ul>
                {topic.keyQuestions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="topic-entities">
            <h2 id="topic-entities">{text.entities}</h2>
            {entities.length ? (
              <ul className="growth-entity-list">
                {entities.map((entity) => {
                  const label = entityTypeLabel(entity.entityType);
                  return (
                    <li key={entity.slug}>
                      <Link href={localePath(locale, `/entities/${entity.slug}`)}>{entity.name}</Link>
                      <span className="growth-entity-type">{locale === "zh" ? label.zh : label.en}</span>
                      <p>{entity.description}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>{text.noEntities}</p>
            )}
          </section>

          {/* 知識整理文章目前只有中文，英文版不列這一節。 */}
          {text.articles ? (
            <section aria-labelledby="topic-articles">
              <h2 id="topic-articles">{text.articles}</h2>
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
                <p>{text.noArticles}</p>
              )}
            </section>
          ) : null}

          {otherTopics.length ? (
            <section aria-labelledby="topic-next">
              <h2 id="topic-next">{text.next}</h2>
              <ul>
                {otherTopics.map((item) => (
                  <li key={item.slug}>
                    <Link href={localePath(locale, `/topics/${item.slug}`)}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <PrimaryCta href={text.ctaHref} label={text.ctaLabel} locale={locale} />
        </article>
      </GrowthShell>
    </>
  );
}
