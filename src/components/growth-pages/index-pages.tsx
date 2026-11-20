import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GrowthSiteJsonLd } from "@/components/growth-json-ld";
import { GrowthShell } from "@/components/growth-shell";
import { splitEntityDescription } from "@/lib/growth/entity-type-label";
import { getLocalizedKnowledge } from "@/lib/growth/knowledge-locale";
import { entitiesForTopic, publishedEntities, publishedTopics } from "@/lib/growth/knowledge-core";
import { type GrowthLocale, languageAlternates, localePath, UI } from "@/lib/growth/locale";

const TOPICS_TEXT = {
  zh: {
    title: "知識主題",
    description: "潤讀知識站的主題中心列表：每個主題整理定義、核心問題、相關實體與來源。",
    empty: "目前尚未發布任何主題。",
  },
  en: {
    title: "Topics",
    description:
      "Topic hubs on So We Read Knowledge: each one sets out definitions, key questions, related terms and sources on Taiwanese food safety, labelling and nutrition.",
    empty: "No topics have been published yet.",
  },
} as const;

const GLOSSARY_TEXT = {
  zh: {
    title: "知識名詞索引",
    description:
      "潤讀知識站收錄的名詞總覽：食品安全、農藥與動物用藥、標示規定、驗證標章與相關機關，依主題分組，每則都附定義與可追溯的來源。",
    empty: "目前尚未發布任何名詞。",
    count: (n: number) => `目前收錄 ${n} 則名詞。`,
    other: "其他名詞",
  },
  en: {
    title: "Glossary",
    description:
      "Every term on So We Read Knowledge, from food safety and pesticides to labelling rules, certification marks and the agencies behind them, grouped by topic, each with a definition and traceable sources.",
    empty: "No terms have been published yet.",
    count: (n: number) => `${n} terms so far.`,
    other: "Other terms",
  },
} as const;

export async function topicsIndexMetadata(locale: GrowthLocale): Promise<Metadata> {
  const { config } = await getLocalizedKnowledge(locale);
  if (!config.canServeGrowthContent) return { robots: { index: false, follow: false } };
  const text = TOPICS_TEXT[locale];
  return {
    title: text.title,
    description: text.description,
    alternates: languageAlternates(config.canonicalBaseUrl, locale, "/topics"),
    robots: config.metaRobots,
  };
}

export async function TopicsIndexView({ locale }: { locale: GrowthLocale }) {
  const { config, knowledge } = await getLocalizedKnowledge(locale);
  if (!config.canServeGrowthContent) notFound();

  const text = TOPICS_TEXT[locale];
  const topics = publishedTopics(knowledge);
  const breadcrumbs = [
    { name: UI[locale].home, href: localePath(locale, "/") },
    { name: text.title, href: localePath(locale, "/topics") },
  ];

  return (
    <>
      <GrowthSiteJsonLd baseUrl={config.canonicalBaseUrl} breadcrumbs={breadcrumbs} locale={locale} />
      <GrowthShell
        isFixture={knowledge.isFixture}
        breadcrumbs={breadcrumbs}
        locale={locale}
        alternateHref={localePath(locale === "zh" ? "en" : "zh", "/topics")}
      >
        <h1>{text.title}</h1>
        <p className="growth-lede">{text.description}</p>

        {topics.length ? (
          <ul className="growth-topic-list">
            {topics.map((topic) => (
              <li key={topic.slug}>
                <h2>
                  <Link href={localePath(locale, `/topics/${topic.slug}`)}>{topic.name}</Link>
                </h2>
                <p>{topic.summary}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>{text.empty}</p>
        )}
      </GrowthShell>
    </>
  );
}

export async function glossaryMetadata(locale: GrowthLocale): Promise<Metadata> {
  const { config } = await getLocalizedKnowledge(locale);
  if (!config.canServeGrowthContent) return { robots: { index: false, follow: false } };
  const text = GLOSSARY_TEXT[locale];
  return {
    title: text.title,
    description: text.description,
    alternates: languageAlternates(config.canonicalBaseUrl, locale, "/entities"),
    robots: config.metaRobots,
  };
}

export async function GlossaryView({ locale }: { locale: GrowthLocale }) {
  const { config, knowledge } = await getLocalizedKnowledge(locale);
  if (!config.canServeGrowthContent) notFound();

  const text = GLOSSARY_TEXT[locale];
  const all = publishedEntities(knowledge);
  const topics = publishedTopics(knowledge);

  // 依主題分組，讓索引頁同時是一張知識地圖，而不是一串扁平連結。
  // 一個名詞可能掛在多個主題下；沒有已發布主題的名詞收進「其他名詞」，
  // 確保每一則都至少從這頁被連到一次——這頁存在的理由就是不讓任何
  // 名詞頁只能靠深層路徑被找到。
  const grouped = topics
    .map((topic) => ({ topic, entities: entitiesForTopic(knowledge, topic.slug) }))
    .filter((group) => group.entities.length > 0);

  const groupedSlugs = new Set(grouped.flatMap((g) => g.entities.map((e) => e.slug)));
  const ungrouped = all.filter((entity) => !groupedSlugs.has(entity.slug));

  const breadcrumbs = [
    { name: UI[locale].home, href: localePath(locale, "/") },
    { name: text.title, href: localePath(locale, "/entities") },
  ];

  return (
    <>
      <GrowthSiteJsonLd baseUrl={config.canonicalBaseUrl} breadcrumbs={breadcrumbs} locale={locale} />
      <GrowthShell
        isFixture={knowledge.isFixture}
        breadcrumbs={breadcrumbs}
        locale={locale}
        alternateHref={localePath(locale === "zh" ? "en" : "zh", "/entities")}
      >
        <h1>{text.title}</h1>
        <p className="growth-lede">{text.description}</p>

        {all.length === 0 ? (
          <p>{text.empty}</p>
        ) : (
          <>
            <p className="growth-entity-index-count">{text.count(all.length)}</p>

            {grouped.map(({ topic, entities }) => (
              <section key={topic.slug} aria-labelledby={`entity-group-${topic.slug}`}>
                <h2 id={`entity-group-${topic.slug}`}>
                  <Link href={localePath(locale, `/topics/${topic.slug}`)}>{topic.name}</Link>
                </h2>
                <EntityList entities={entities} locale={locale} />
              </section>
            ))}

            {ungrouped.length > 0 ? (
              <section aria-labelledby="entity-group-other">
                <h2 id="entity-group-other">{text.other}</h2>
                <EntityList entities={ungrouped} locale={locale} />
              </section>
            ) : null}
          </>
        )}
      </GrowthShell>
    </>
  );
}

// 索引頁只帶讀者去對應的名詞頁，不重印完整敘述——完整敘述已經是
// 詳情頁的正文，兩頁都放整段文字會變成重複內容。只取第一句當作
// 索引頁的線索，其餘留給詳情頁。
function EntityList({
  entities,
  locale,
}: {
  entities: Array<{
    slug: string;
    name: string;
    aliases: string[];
    description: string;
    originalName?: string;
  }>;
  locale: GrowthLocale;
}) {
  return (
    <ul className="growth-entity-list">
      {entities.map((entity) => {
        // 英文版的括號附註放中文名稱，讓讀者能對照台灣的官方用語。
        const note =
          locale === "en"
            ? entity.originalName
            : entity.aliases.length
              ? entity.aliases.join("、")
              : null;
        return (
          <li key={entity.slug}>
            <Link href={localePath(locale, `/entities/${entity.slug}`)}>{entity.name}</Link>
            {note ? (
              <span className="growth-entity-aliases" lang={locale === "en" ? "zh-Hant" : undefined}>
                （{note}）
              </span>
            ) : null}
            <p>{splitEntityDescription(entity.description).definition}</p>
          </li>
        );
      })}
    </ul>
  );
}
