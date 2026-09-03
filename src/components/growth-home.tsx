import Link from "next/link";
import { GrowthSiteJsonLd } from "@/components/growth-json-ld";
import { GrowthShell, PrimaryCta } from "@/components/growth-shell";
import type { GrowthKnowledge } from "@/lib/growth/knowledge-core";
import { publishedArticles, publishedTopics } from "@/lib/growth/knowledge-core";

interface GrowthHomeProps {
  baseUrl: string;
  knowledge: GrowthKnowledge;
}

export function GrowthHome({ baseUrl, knowledge }: GrowthHomeProps) {
  const topics = publishedTopics(knowledge);
  const articles = publishedArticles(knowledge).slice(0, 5);

  return (
    <>
      <GrowthSiteJsonLd baseUrl={baseUrl} />
      <GrowthShell isFixture={knowledge.isFixture} breadcrumbs={[{ name: "首頁", href: "/" }]}>
        <h1>潤讀知識站</h1>
        <p className="growth-lede">
          以食品安全、營養科學與飲食標示為核心的知識整理站。每一頁都標明定義、適用範圍與可追溯的來源，
          並清楚區分已知、推論與仍有爭議的部分。
        </p>

        <section aria-labelledby="home-topics">
          <h2 id="home-topics">主題中心</h2>
          {topics.length ? (
            <ul className="growth-topic-list">
              {topics.map((topic) => (
                <li key={topic.slug}>
                  <Link href={`/topics/${topic.slug}`}>{topic.name}</Link>
                  <p>{topic.summary}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>目前尚未發布任何主題。</p>
          )}
          <p>
            <Link href="/topics">查看所有主題</Link>
          </p>
        </section>

        {articles.length ? (
          <section aria-labelledby="home-articles">
            <h2 id="home-articles">最新知識整理</h2>
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

        <PrimaryCta
          href="https://soweread.com/"
          label="潤讀 So We Read 主站：食品安全與飲食文化的長篇評論"
        />
      </GrowthShell>
    </>
  );
}
