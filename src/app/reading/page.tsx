import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrimaryArticleIndexJsonLd } from "@/components/growth-json-ld";
import { GrowthShell } from "@/components/growth-shell";
import { primaryArticles } from "@/data/primary-articles";
import { getGrowthKnowledge } from "@/lib/growth/knowledge";
import { publishedTopics } from "@/lib/growth/knowledge-core";
import { groupPrimaryArticles } from "@/lib/growth/primary-articles";

export const dynamic = "force-dynamic";

const TITLE = "潤讀主站文章總覽";
const DESCRIPTION =
  "潤讀主站（soweread.com）目前公開的長文一覽，依主題分組並附發布日期。這裡只列標題與連結，內文請至主站閱讀。";

export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) return { robots: { index: false, follow: false } };

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${config.canonicalBaseUrl}/reading` },
    robots: config.metaRobots,
    openGraph: {
      type: "website",
      locale: "zh_TW",
      url: `${config.canonicalBaseUrl}/reading`,
      title: TITLE,
      description: DESCRIPTION,
    },
  };
}

export default async function PrimaryArticleIndexPage() {
  const { config, knowledge } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) notFound();

  const sections = groupPrimaryArticles(primaryArticles);
  const topicSlugs = new Set(publishedTopics(knowledge).map((topic) => topic.slug));
  const latest = primaryArticles.reduce(
    (newest, article) => (article.datePublished > newest ? article.datePublished : newest),
    ""
  );

  const breadcrumbs = [
    { name: "首頁", href: "/" },
    { name: TITLE, href: "/reading" },
  ];

  return (
    <>
      <PrimaryArticleIndexJsonLd
        baseUrl={config.canonicalBaseUrl}
        breadcrumbs={breadcrumbs}
        name={TITLE}
        description={DESCRIPTION}
        articles={primaryArticles}
      />
      <GrowthShell isFixture={knowledge.isFixture} breadcrumbs={breadcrumbs}>
        <h1>{TITLE}</h1>
        <p className="growth-lede">{DESCRIPTION}</p>

        <p className="growth-index-meta">
          共 {primaryArticles.length} 篇，最新一篇發布於 {latest}。
        </p>

        {sections.map((section) => (
          <section key={section.group} aria-labelledby={`section-${section.group}`}>
            <h2 id={`section-${section.group}`}>
              {section.name}
              <span className="growth-entity-type">{section.articles.length} 篇</span>
            </h2>
            <p>{section.intro}</p>

            {section.topicSlug && topicSlugs.has(section.topicSlug) ? (
              <p className="growth-parent-topic">
                知識站對應主題：
                <Link href={`/topics/${section.topicSlug}`}>
                  {publishedTopics(knowledge).find((topic) => topic.slug === section.topicSlug)?.name}
                </Link>
              </p>
            ) : null}

            <ul className="growth-primary-list">
              {section.articles.map((article) => (
                <li key={article.url}>
                  <a href={article.url} rel="noopener">
                    {article.title}
                  </a>
                  <time dateTime={article.datePublished}>{article.datePublished}</time>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="reading-next">
          <h2 id="reading-next">下一步</h2>
          <p>
            想先弄清楚法規上的定義與用詞，再回頭讀主站的長文，可以從
            <Link href="/topics">知識主題</Link>開始。
          </p>
        </section>
      </GrowthShell>
    </>
  );
}
