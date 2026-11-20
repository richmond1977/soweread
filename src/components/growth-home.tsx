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

interface GrowthHomeProps {
  baseUrl: string;
  knowledge: GrowthKnowledge;
}

export function GrowthHome({ baseUrl, knowledge }: GrowthHomeProps) {
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
      <GrowthSiteJsonLd baseUrl={baseUrl} />
      <GrowthShell isFixture={knowledge.isFixture} breadcrumbs={[{ name: "首頁", href: "/" }]}>
        <div className="growth-home-hero growth-wide">
          <div>
            <span className="growth-eyebrow">A Reader&apos;s Lexicon</span>
            <h1>潤讀知識站</h1>
            <p className="growth-lede">
              以食品安全、營養科學與飲食標示為核心的知識整理站。每一頁都標明定義、適用範圍與可追溯的來源，
              並清楚區分已知、推論與仍有爭議的部分。
            </p>
          </div>
          <ul className="growth-home-stats" aria-label="收錄概況">
            <li>
              <b>{entities.length}</b>則名詞
            </li>
            <li>
              <b>{topics.length}</b>個議題
            </li>
            {lastModified ? (
              <li>
                <b>{lastModified}</b>最近修訂
              </li>
            ) : null}
          </ul>
        </div>

        <div className="growth-home-layout growth-wide">
          <section aria-label="知識名詞">
            {entities.length ? (
              <>
                {groups.map(({ topic, entities: groupEntities }) => (
                  <section
                    key={topic.slug}
                    className="growth-lexicon-group"
                    aria-labelledby={`home-group-${topic.slug}`}
                  >
                    <h2 id={`home-group-${topic.slug}`}>
                      <Link href={`/topics/${topic.slug}`}>{topic.name}</Link>
                      <span className="growth-lexicon-group-count">{groupEntities.length} 則</span>
                    </h2>
                    <LexiconList entities={groupEntities} />
                  </section>
                ))}
                {ungrouped.length ? (
                  <section className="growth-lexicon-group" aria-labelledby="home-group-other">
                    <h2 id="home-group-other">其他名詞</h2>
                    <LexiconList entities={ungrouped} />
                  </section>
                ) : null}
                <p>
                  <Link href="/entities">查看完整名詞索引</Link>
                </p>
              </>
            ) : (
              <>
                <h2>知識名詞</h2>
                <p>目前尚未發布任何名詞。</p>
              </>
            )}
          </section>

          <aside className="growth-home-aside">
            <section aria-labelledby="home-topics">
              <span className="growth-eyebrow">Topics</span>
              <h2 id="home-topics">議題</h2>
              {topics.length ? (
                <ol className="growth-numbered">
                  {topics.map((topic) => (
                    <li key={topic.slug}>
                      <Link href={`/topics/${topic.slug}`}>{topic.name}</Link>
                      <p>{topic.summary}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>目前尚未發布任何主題。</p>
              )}
              <p>
                <Link href="/topics">查看所有主題</Link>
              </p>
            </section>

            {articles.length ? (
              <section aria-labelledby="home-articles">
                <span className="growth-eyebrow">Latest</span>
                <h2 id="home-articles">最新知識整理</h2>
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

        <PrimaryCta
          href="https://soweread.com/"
          label="潤讀 So We Read 主站：食品安全與飲食文化的長篇評論"
        />
      </GrowthShell>
    </>
  );
}

function LexiconList({ entities }: { entities: GrowthEntity[] }) {
  return (
    <ul className="growth-lexicon">
      {entities.map((entity) => {
        const latin = latinAlias(entity.aliases);
        return (
          <li key={entity.slug}>
            <div className="growth-lexicon-head">
              <Link href={`/entities/${entity.slug}`}>{entity.name}</Link>
              {latin ? <span className="growth-lexicon-latin">{latin}</span> : null}
              <span className="growth-lexicon-type">{entityTypeLabel(entity.entityType).zh}</span>
            </div>
            <p>{splitEntityDescription(entity.description).definition}</p>
          </li>
        );
      })}
    </ul>
  );
}
