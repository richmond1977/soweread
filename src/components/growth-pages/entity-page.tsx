import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityJsonLd } from "@/components/growth-json-ld";
import { EntityReaderGuide } from "@/components/entity-reader-guide";
import { GrowthShell, PrimaryCta, SourceList } from "@/components/growth-shell";
import { findEntityReaderGuide } from "@/data/entity-reader-guides";
import { findEnglishReaderGuide } from "@/data/entity-reader-guides-en";
import { entityTypeLabel, splitEntityDescription } from "@/lib/growth/entity-type-label";
import { getLocalizedKnowledge, growthContentEn } from "@/lib/growth/knowledge-locale";
import {
  articlesForEntity,
  findPublicEntity,
  findPublicTopic,
  publicRelationsForEntity,
  publishedEntities,
  sourcesByIds,
} from "@/lib/growth/knowledge-core";
import {
  type GrowthLocale,
  languageAlternates,
  localePath,
  OG_LOCALE,
  UI,
} from "@/lib/growth/locale";
import { hasEnglishEntity } from "@/lib/growth/localize";

const TEXT = {
  zh: {
    alsoKnownAs: "又稱 ",
    aliasJoin: "、",
    topic: "所屬主題：",
    reviewed: "最後審閱：",
    definitionLabel: "釋義",
    notesLabel: "說明",
    relations: "知識關係",
    relationSourceOpen: "（來源：",
    relationSourceClose: "）",
    noRelations: "目前沒有已附上來源的公開關係。",
    articles: "相關文章",
    official: "官方資訊：",
    ctaHref: "https://soweread.com/",
    ctaLabel: "想讀更完整的脈絡分析，請前往潤讀主站",
    sourcesAria: "本詞條引用來源",
    chineseName: "",
    guideInChinese: "",
  },
  en: {
    alsoKnownAs: "Also known as ",
    aliasJoin: ", ",
    topic: "Topic: ",
    reviewed: "Last reviewed: ",
    definitionLabel: "",
    notesLabel: "",
    relations: "Related terms",
    relationSourceOpen: " (Source: ",
    relationSourceClose: ")",
    noRelations: "No sourced relations have been published for this term yet.",
    articles: "",
    official: "Official information: ",
    ctaHref: "https://soweread.com/en/",
    ctaLabel: "For the wider story, read So We Read in English",
    sourcesAria: "Sources cited for this term",
    chineseName: "Chinese: ",
    guideInChinese:
      "A step-by-step reader’s guide to this term, with worked examples, is available in the Chinese edition.",
  },
} as const;

export async function entityStaticParams(locale: GrowthLocale) {
  const { knowledge } = await getLocalizedKnowledge(locale);
  return publishedEntities(knowledge).map((entity) => ({ slug: entity.slug }));
}

export async function entityMetadata(locale: GrowthLocale, slug: string): Promise<Metadata> {
  const { config, knowledge } = await getLocalizedKnowledge(locale);
  if (!config.canServeGrowthContent) return { robots: { index: false, follow: false } };

  const entity = findPublicEntity(knowledge, slug);
  if (!entity) return { robots: { index: false, follow: false } };

  const path = `/entities/${entity.slug}`;
  const alternates = languageAlternates(
    config.canonicalBaseUrl,
    locale,
    path,
    hasEnglishEntity(growthContentEn, entity.slug)
  );

  return {
    title: entity.seoTitle || entity.name,
    description: entity.seoDescription || entity.description,
    keywords: entity.originalName ? [...entity.aliases, entity.originalName] : entity.aliases,
    // Self-canonical: the growth site must rank for its own pages, so it never
    // canonicalises an original entity page to soweread.com (plan §5.1).
    alternates,
    robots: config.metaRobots,
    openGraph: {
      type: "article",
      locale: OG_LOCALE[locale],
      url: alternates.canonical,
      siteName: UI[locale].siteName,
      title: entity.seoTitle || entity.name,
      description: entity.seoDescription || entity.description,
    },
  };
}

export async function EntityPageView({ locale, slug }: { locale: GrowthLocale; slug: string }) {
  const { config, knowledge } = await getLocalizedKnowledge(locale);
  if (!config.canServeGrowthContent) notFound();

  const entity = findPublicEntity(knowledge, slug);
  if (!entity) notFound();

  const ui = UI[locale];
  const text = TEXT[locale];
  const parentTopic = entity.topicSlugs
    .map((topicSlug) => findPublicTopic(knowledge, topicSlug))
    .find((topic) => topic !== null);
  const relations = publicRelationsForEntity(knowledge, entity.slug);
  const articles = articlesForEntity(knowledge, entity.slug);
  const sources = sourcesByIds(knowledge, entity.sourceIds);
  // 讀者指南（含表格與步驟）：英文頁用英文版；還沒翻譯的才放一行指引連到中文版。
  const readerGuide = findEntityReaderGuide(entity.slug);
  const englishGuide = locale === "en" ? findEnglishReaderGuide(entity.slug) : undefined;
  const typeLabel = entityTypeLabel(entity.entityType);
  const description = splitEntityDescription(entity.description);
  const path = `/entities/${entity.slug}`;
  const alternateHref =
    locale === "zh"
      ? hasEnglishEntity(growthContentEn, entity.slug)
        ? localePath("en", path)
        : null
      : path;

  const breadcrumbs = [
    { name: ui.home, href: localePath(locale, "/") },
    { name: ui.topics, href: localePath(locale, "/topics") },
    ...(parentTopic
      ? [{ name: parentTopic.name, href: localePath(locale, `/topics/${parentTopic.slug}`) }]
      : []),
    { name: entity.name, href: localePath(locale, path) },
  ];

  return (
    <>
      <EntityJsonLd
        baseUrl={config.canonicalBaseUrl}
        entity={entity}
        breadcrumbs={breadcrumbs}
        sources={sources}
        relations={relations}
        locale={locale}
      />
      <GrowthShell
        isFixture={knowledge.isFixture}
        breadcrumbs={breadcrumbs}
        locale={locale}
        alternateHref={alternateHref}
      >
        <article className="growth-entity growth-wide">
          {/* 辭典詞條的詞頭：類型眉標、詞目、別名與英文對照 */}
          <header className="growth-entity-head">
            <span className="growth-eyebrow">
              {locale === "zh"
                ? `${typeLabel.en} · ${readerGuide?.typeLabel ?? typeLabel.zh}`
                : typeLabel.en}
            </span>
            <h1>{entity.name}</h1>
            <p className="growth-entity-headline">
              {entity.originalName ? (
                <span>
                  {text.chineseName}
                  <span lang="zh-Hant">{entity.originalName}</span>
                </span>
              ) : null}
              {entity.aliases.length ? (
                <span>
                  {text.alsoKnownAs}
                  {entity.aliases.join(text.aliasJoin)}
                </span>
              ) : null}
              {parentTopic ? (
                <span>
                  {text.topic}
                  <Link href={localePath(locale, `/topics/${parentTopic.slug}`)}>{parentTopic.name}</Link>
                </span>
              ) : null}
              {/* 沒有審閱紀錄時保持沉默，而不是宣告「尚未審閱」——
                  與文章頁 reviewerName 的顯示規則一致（growth-article page.tsx）。 */}
              {entity.reviewedAt ? (
                <span>
                  {text.reviewed}
                  {entity.reviewedAt}
                </span>
              ) : null}
            </p>
          </header>

          <div className="growth-entity-body">
            <section className="growth-entity-section" aria-label={text.definitionLabel || "Definition"}>
              <p className="growth-entity-section-label" aria-hidden="true">
                <span className="growth-eyebrow">Definition</span>
                {text.definitionLabel}
              </p>
              <p className="growth-lede">{description.definition}</p>
            </section>

            {description.paragraphs.length ? (
              <section className="growth-entity-section" aria-label={text.notesLabel || "Notes"}>
                <p className="growth-entity-section-label" aria-hidden="true">
                  <span className="growth-eyebrow">Notes</span>
                  {text.notesLabel}
                </p>
                {description.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </section>
            ) : null}

            {readerGuide && locale === "zh" ? <EntityReaderGuide guide={readerGuide} /> : null}
            {englishGuide ? <EntityReaderGuide guide={englishGuide} locale="en" /> : null}
            {readerGuide && locale === "en" && !englishGuide ? (
              <p className="growth-parent-topic">
                {text.guideInChinese}{" "}
                <Link href={`${path}#reader-guide-title`} hrefLang="zh-Hant-TW">
                  <span lang="zh-Hant">{readerGuide.title}</span> →
                </Link>
              </p>
            ) : null}

            <section aria-labelledby="entity-relations">
              <h2 id="entity-relations">{text.relations}</h2>
              {relations.length ? (
                <ul className="growth-relation-list">
                  {relations.map((relation) => (
                    <li key={relation.id}>
                      <Link href={localePath(locale, `/entities/${relation.subject.slug}`)}>
                        {relation.subject.name}
                      </Link>
                      <span className="growth-predicate"> {relation.predicate} </span>
                      <Link href={localePath(locale, `/entities/${relation.object.slug}`)}>
                        {relation.object.name}
                      </Link>
                      <span className="growth-relation-source">
                        {text.relationSourceOpen}
                        <a href={relation.source.url} rel="noopener nofollow">
                          {relation.source.publisher}
                        </a>
                        {text.relationSourceClose}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{text.noRelations}</p>
              )}
            </section>

            {articles.length && text.articles ? (
              <section aria-labelledby="entity-articles">
                <h2 id="entity-articles">{text.articles}</h2>
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

            {entity.canonicalUrl ? (
              <p className="growth-official-link">
                {text.official}
                <a href={entity.canonicalUrl} rel="noopener nofollow">
                  {entity.canonicalUrl}
                </a>
              </p>
            ) : null}

            <PrimaryCta href={text.ctaHref} label={text.ctaLabel} locale={locale} />
          </div>

          {/* 來源放在邊欄：與編輯撰寫的正文在版面上分開 */}
          {sources.length ? (
            <aside className="growth-entity-aside" aria-label={text.sourcesAria}>
              <SourceList sources={sources} locale={locale} />
            </aside>
          ) : null}
        </article>
      </GrowthShell>
    </>
  );
}
