import Link from "next/link";
import { GrowthSiteJsonLd } from "@/components/growth-json-ld";
import { GrowthShell, PrimaryCta } from "@/components/growth-shell";
import { entityTypeLabel, latinAlias, splitEntityDescription } from "@/lib/growth/entity-type-label";
import type { GrowthEntity, GrowthKnowledge } from "@/lib/growth/knowledge-core";
import {
  publishedArticles,
  publishedEntities,
  publishedTopics,
  siteLastModified,
} from "@/lib/growth/knowledge-core";
import { type GrowthLocale, localePath, UI } from "@/lib/growth/locale";

const TEXT = {
  zh: {
    h1: "潤讀知識站",
    lede: "以食品安全、營養科學與飲食標示為核心的知識整理站。每一頁都標明定義、適用範圍與可追溯的來源，並清楚區分已知、推論與仍有爭議的部分。",
    statsAria: "收錄概況",
    terms: "則名詞",
    topics: "個議題",
    revised: "最近修訂",
    lexiconAria: "知識名詞",
    groupCount: (n: number) => `${n} 則`,
    other: "其他名詞",
    allTerms: "查看完整名詞索引",
    termsHeading: "知識名詞",
    noTerms: "目前尚未發布任何名詞。",
    topicsHeading: "議題",
    noTopics: "目前尚未發布任何主題。",
    allTopics: "查看所有主題",
    latest: "最新知識整理",
    ctaHref: "https://soweread.com/",
    ctaLabel: "潤讀 So We Read 主站：食品安全與飲食文化的長篇評論",
  },
  en: {
    h1: "So We Read Knowledge",
    lede: "A reference site on food safety, nutrition science and food labelling in Taiwan. Every page states the definition, its scope and traceable sources, and keeps what is established apart from what is inferred or still disputed.",
    statsAria: "What the site covers",
    terms: "terms",
    topics: "topics",
    revised: "last revised",
    lexiconAria: "Glossary",
    groupCount: (n: number) => `${n} ${n === 1 ? "term" : "terms"}`,
    other: "Other terms",
    allTerms: "Browse the full glossary",
    termsHeading: "Glossary",
    noTerms: "No terms have been published yet.",
    topicsHeading: "Topics",
    noTopics: "No topics have been published yet.",
    allTopics: "All topics",
    latest: "",
    ctaHref: "https://soweread.com/en/",
    ctaLabel: "So We Read: long-form essays on food safety and food culture",
  },
} as const;

interface GrowthHomeProps {
  baseUrl: string;
  knowledge: GrowthKnowledge;
  locale?: GrowthLocale;
}

export function GrowthHome({ baseUrl, knowledge, locale = "zh" }: GrowthHomeProps) {
  const text = TEXT[locale];
  const topics = publishedTopics(knowledge);
  const articles = publishedArticles(knowledge).slice(0, 5);
  // 全部列出，不截斷：首頁是本站唯一已被 Google 收錄的入口，名詞頁能不能被
  // 爬到就取決於這裡有沒有連結。名詞數量成長到首頁放不下時，再改成節選＋
  // 索引頁連結（/entities 已經是完整清單）。
  const entities = publishedEntities(knowledge);
  const lastModified = siteLastModified(knowledge);

  // 依第一個已發布的議題分組，與 /entities 索引頁的分組規則一致，
  // 每則名詞只出現一次。
  const topicSlugs = new Set(topics.map((topic) => topic.slug));
  const groups = topics
    .map((topic) => ({
      topic,
      entities: entities.filter(
        (entity) => entity.topicSlugs.find((slug) => topicSlugs.has(slug)) === topic.slug
      ),
    }))
    .filter((group) => group.entities.length > 0);
  const ungrouped = entities.filter((entity) => !entity.topicSlugs.some((slug) => topicSlugs.has(slug)));

  return (
    <>
      <GrowthSiteJsonLd baseUrl={baseUrl} locale={locale} />
      <GrowthShell
        isFixture={knowledge.isFixture}
        breadcrumbs={[{ name: UI[locale].home, href: localePath(locale, "/") }]}
        locale={locale}
        alternateHref={localePath(locale === "zh" ? "en" : "zh", "/")}
      >
        <div className="growth-home-hero growth-wide">
          <div>
            <span className="growth-eyebrow">A Reader&apos;s Lexicon</span>
            <h1>{text.h1}</h1>
            <p className="growth-lede">{text.lede}</p>
          </div>
          <ul className="growth-home-stats" aria-label={text.statsAria}>
            <li>
              <b>{entities.length}</b>
              {text.terms}
            </li>
            <li>
              <b>{topics.length}</b>
              {text.topics}
            </li>
            {lastModified ? (
              <li>
                <b>{lastModified}</b>
                {text.revised}
              </li>
            ) : null}
          </ul>
        </div>

        <div className="growth-home-layout growth-wide">
          <section aria-label={text.lexiconAria}>
            {entities.length ? (
              <>
                {groups.map(({ topic, entities: groupEntities }) => (
                  <section
                    key={topic.slug}
                    className="growth-lexicon-group"
                    aria-labelledby={`home-group-${topic.slug}`}
                  >
                    <h2 id={`home-group-${topic.slug}`}>
                      <Link href={localePath(locale, `/topics/${topic.slug}`)}>{topic.name}</Link>
                      <span className="growth-lexicon-group-count">{text.groupCount(groupEntities.length)}</span>
                    </h2>
                    <LexiconList entities={groupEntities} locale={locale} />
                  </section>
                ))}
                {ungrouped.length ? (
                  <section className="growth-lexicon-group" aria-labelledby="home-group-other">
                    <h2 id="home-group-other">{text.other}</h2>
                    <LexiconList entities={ungrouped} locale={locale} />
                  </section>
                ) : null}
                <p>
                  <Link href={localePath(locale, "/entities")}>{text.allTerms}</Link>
                </p>
              </>
            ) : (
              <>
                <h2>{text.termsHeading}</h2>
                <p>{text.noTerms}</p>
              </>
            )}
          </section>

          <aside className="growth-home-aside">
            <section aria-labelledby="home-topics">
              <span className="growth-eyebrow">Topics</span>
              <h2 id="home-topics">{text.topicsHeading}</h2>
              {topics.length ? (
                <ol className="growth-numbered">
                  {topics.map((topic) => (
                    <li key={topic.slug}>
                      <Link href={localePath(locale, `/topics/${topic.slug}`)}>{topic.name}</Link>
                      <p>{topic.summary}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>{text.noTopics}</p>
              )}
              <p>
                <Link href={localePath(locale, "/topics")}>{text.allTopics}</Link>
              </p>
            </section>

            {/* 知識整理文章目前只有中文；英文版的 knowledge.articles 是空的。 */}
            {articles.length && text.latest ? (
              <section aria-labelledby="home-articles">
                <span className="growth-eyebrow">Latest</span>
                <h2 id="home-articles">{text.latest}</h2>
                <ol className="growth-numbered">
                  {articles.map((article) => (
                    <li key={article.slug}>
                      <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                      {article.datePublished ? <p>{article.datePublished}</p> : null}
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </aside>
        </div>

        <PrimaryCta href={text.ctaHref} label={text.ctaLabel} locale={locale} />
      </GrowthShell>
    </>
  );
}

function LexiconList({ entities, locale }: { entities: GrowthEntity[]; locale: GrowthLocale }) {
  return (
    <ul className="growth-lexicon">
      {entities.map((entity) => {
        // 中文版附英文對照；英文版附中文正式名稱，方便對照台灣的官方用語。
        const counterpart = locale === "zh" ? latinAlias(entity.aliases) : entity.originalName;
        const label = entityTypeLabel(entity.entityType);
        return (
          <li key={entity.slug}>
            <div className="growth-lexicon-head">
              <Link href={localePath(locale, `/entities/${entity.slug}`)}>{entity.name}</Link>
              {counterpart ? (
                <span className="growth-lexicon-latin" lang={locale === "en" ? "zh-Hant" : undefined}>
                  {counterpart}
                </span>
              ) : null}
              <span className="growth-lexicon-type">{locale === "zh" ? label.zh : label.en}</span>
            </div>
            <p>{splitEntityDescription(entity.description).definition}</p>
          </li>
        );
      })}
    </ul>
  );
}
