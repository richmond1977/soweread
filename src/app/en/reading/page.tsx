import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrimaryArticleIndexJsonLd } from "@/components/growth-json-ld";
import { GrowthShell } from "@/components/growth-shell";
import { growthContentEn } from "@/data/growth-content-en";
import { primaryArticlesEn } from "@/data/primary-articles-en";
import { getGrowthKnowledge } from "@/lib/growth/knowledge";
import { publishedTopics } from "@/lib/growth/knowledge-core";
import { IN_LANGUAGE, languageAlternates, OG_LOCALE } from "@/lib/growth/locale";
import { localizeKnowledge } from "@/lib/growth/localize";
import { groupPrimaryArticles } from "@/lib/growth/primary-articles";

export const dynamic = "force-dynamic";

const TITLE = "Articles on So We Read";
const DESCRIPTION =
  "The long-form articles published in English on So We Read (soweread.com/en/), grouped by subject with their publication dates. Only titles and links are listed here; read the articles on So We Read.";

export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) return { robots: { index: false, follow: false } };

  const alternates = languageAlternates(config.canonicalBaseUrl, "en", "/reading");
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates,
    robots: config.metaRobots,
    openGraph: {
      type: "website",
      locale: OG_LOCALE.en,
      url: alternates.canonical,
      title: TITLE,
      description: DESCRIPTION,
    },
  };
}

export default async function PrimaryArticleIndexPageEn() {
  const { config, knowledge } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) notFound();

  const sections = groupPrimaryArticles(primaryArticlesEn);
  const englishTopics = publishedTopics(localizeKnowledge(knowledge, "en", growthContentEn));
  const latest = primaryArticlesEn.reduce(
    (newest, article) => (article.datePublished > newest ? article.datePublished : newest),
    ""
  );

  const breadcrumbs = [
    { name: "Home", href: "/en" },
    { name: TITLE, href: "/en/reading" },
  ];

  return (
    <>
      <PrimaryArticleIndexJsonLd
        baseUrl={config.canonicalBaseUrl}
        breadcrumbs={breadcrumbs}
        name={TITLE}
        description={DESCRIPTION}
        articles={primaryArticlesEn}
        path="/en/reading"
        inLanguage={IN_LANGUAGE.en}
      />
      <GrowthShell isFixture={knowledge.isFixture} breadcrumbs={breadcrumbs} locale="en" alternateHref="/reading">
        <h1>{TITLE}</h1>
        <p className="growth-lede">{DESCRIPTION}</p>

        <p className="growth-index-meta">
          {primaryArticlesEn.length} articles; the most recent was published on {latest}.
        </p>

        {sections.map((section) => {
          const topic = section.topicSlug
            ? englishTopics.find((candidate) => candidate.slug === section.topicSlug)
            : undefined;
          return (
            <section key={section.group} aria-labelledby={`section-${section.group}`}>
              <h2 id={`section-${section.group}`}>
                {section.nameEn}
                <span className="growth-entity-type">{section.articles.length}</span>
              </h2>
              <p>{section.introEn}</p>

              {topic ? (
                <p className="growth-parent-topic">
                  Related topic on this site: <Link href={`/en/topics/${topic.slug}`}>{topic.name}</Link>
                </p>
              ) : null}

              <ul className="growth-primary-list">
                {section.articles.map((article) => (
                  <li key={article.url}>
                    <a href={article.url} rel="noopener" hrefLang="en">
                      {article.title}
                    </a>
                    <time dateTime={article.datePublished}>{article.datePublished}</time>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section aria-labelledby="reading-next">
          <h2 id="reading-next">Next</h2>
          <p>
            To get the legal definitions and terms straight before reading the long-form articles, start with the{" "}
            <Link href="/en/topics">topics</Link>.
          </p>
        </section>
      </GrowthShell>
    </>
  );
}
