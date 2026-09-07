import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GrowthSiteJsonLd } from "@/components/growth-json-ld";
import { GrowthShell } from "@/components/growth-shell";
import { getGrowthKnowledge } from "@/lib/growth/knowledge";
import {
  entitiesForTopic,
  publishedEntities,
  publishedTopics,
} from "@/lib/growth/knowledge-core";

// Same rendering strategy as the other growth index routes: this page is a
// full listing of everything published, so it must not be baked at build time
// from whatever the database happened to hold then.
export const dynamic = "force-dynamic";

const TITLE = "知識名詞索引";
const DESCRIPTION =
  "潤讀知識站收錄的名詞總覽：食品安全、農藥與動物用藥、標示規定、驗證標章與相關機關，依主題分組，每則都附定義與可追溯的來源。";

export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) return { robots: { index: false, follow: false } };

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${config.canonicalBaseUrl}/entities` },
    robots: config.metaRobots,
  };
}

export default async function EntitiesIndexPage() {
  const { config, knowledge } = await getGrowthKnowledge();
  if (!config.canServeGrowthContent) notFound();

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
    { name: "首頁", href: "/" },
    { name: TITLE, href: "/entities" },
  ];

  return (
    <>
      <GrowthSiteJsonLd baseUrl={config.canonicalBaseUrl} breadcrumbs={breadcrumbs} />
      <GrowthShell isFixture={knowledge.isFixture} breadcrumbs={breadcrumbs}>
        <h1>{TITLE}</h1>
        <p className="growth-lede">{DESCRIPTION}</p>

        {all.length === 0 ? (
          <p>目前尚未發布任何名詞。</p>
        ) : (
          <>
            <p className="growth-entity-index-count">目前收錄 {all.length} 則名詞。</p>

            {grouped.map(({ topic, entities }) => (
              <section key={topic.slug} aria-labelledby={`entity-group-${topic.slug}`}>
                <h2 id={`entity-group-${topic.slug}`}>
                  <Link href={`/topics/${topic.slug}`}>{topic.name}</Link>
                </h2>
                <EntityList entities={entities} />
              </section>
            ))}

            {ungrouped.length > 0 ? (
              <section aria-labelledby="entity-group-other">
                <h2 id="entity-group-other">其他名詞</h2>
                <EntityList entities={ungrouped} />
              </section>
            ) : null}
          </>
        )}
      </GrowthShell>
    </>
  );
}

function EntityList({
  entities,
}: {
  entities: Array<{ slug: string; name: string; aliases: string[]; description: string }>;
}) {
  return (
    <ul className="growth-entity-list">
      {entities.map((entity) => (
        <li key={entity.slug}>
          <Link href={`/entities/${entity.slug}`}>{entity.name}</Link>
          {entity.aliases.length ? (
            <span className="growth-entity-aliases">（{entity.aliases.join("、")}）</span>
          ) : null}
          <p>{entity.description}</p>
        </li>
      ))}
    </ul>
  );
}
