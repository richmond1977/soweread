import type { GrowthArticle, GrowthEntity, GrowthSource, GrowthTopic } from "@/lib/growth/knowledge-core";
import type { PrimaryArticle } from "@/lib/growth/primary-articles";

type Breadcrumb = { name: string; href: string };

function JsonLd({ schema }: { schema: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function organizationNode(baseUrl: string) {
  return {
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "潤讀知識站",
    url: baseUrl,
    inLanguage: "zh-TW",
    // 與頁首實際顯示的標誌是同一個檔案，structured data 不得宣稱頁面上沒有的東西。
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/soweread-logo.png`,
      width: 600,
      height: 400,
    },
    parentOrganization: {
      "@type": "Organization",
      name: "潤讀 So We Read",
      url: "https://soweread.com/",
    },
  };
}

function breadcrumbNode(baseUrl: string, breadcrumbs: Breadcrumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.href === "/" ? "" : crumb.href}`,
    })),
  };
}

function citationNodes(sources: GrowthSource[]) {
  return sources.map((source) => ({
    "@type": "CreativeWork",
    name: source.title,
    url: source.url,
    publisher: { "@type": "Organization", name: source.publisher },
    ...(source.publishedAt ? { datePublished: source.publishedAt } : {}),
  }));
}

interface GrowthSiteJsonLdProps {
  baseUrl: string;
  /** Omit on the home page, where the visible breadcrumb is a single item. */
  breadcrumbs?: Breadcrumb[];
}

export function GrowthSiteJsonLd({ baseUrl, breadcrumbs }: GrowthSiteJsonLdProps) {
  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@graph": [
          organizationNode(baseUrl),
          {
            "@type": "WebSite",
            "@id": `${baseUrl}/#website`,
            url: baseUrl,
            name: "潤讀知識站",
            publisher: { "@id": `${baseUrl}/#organization` },
            inLanguage: "zh-TW",
          },
          ...(breadcrumbs && breadcrumbs.length > 1
            ? [breadcrumbNode(baseUrl, breadcrumbs)]
            : []),
        ],
      }}
    />
  );
}

interface PrimaryArticleIndexJsonLdProps {
  baseUrl: string;
  breadcrumbs: Breadcrumb[];
  name: string;
  description: string;
  articles: PrimaryArticle[];
}

/**
 * 主站文章總覽的結構化資料。
 *
 * 這一頁的每個項目都指向 soweread.com，所以 ItemList 的 url 也指向那裡——
 * structured data 必須與頁面上看得到的連結一致（計畫書 §9.1）。這裡不宣稱
 * 這些文章是本站的作品，只描述它們是本站整理的一份清單。
 */
export function PrimaryArticleIndexJsonLd({
  baseUrl,
  breadcrumbs,
  name,
  description,
  articles,
}: PrimaryArticleIndexJsonLdProps) {
  const url = `${baseUrl}/reading`;

  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@graph": [
          organizationNode(baseUrl),
          {
            "@type": "CollectionPage",
            "@id": `${url}#collection`,
            url,
            name,
            description,
            inLanguage: "zh-TW",
            isPartOf: { "@id": `${baseUrl}/#website` },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: articles.length,
              itemListElement: articles.map((article, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: article.title,
                url: article.url,
              })),
            },
          },
          breadcrumbNode(baseUrl, breadcrumbs),
        ],
      }}
    />
  );
}

interface TopicJsonLdProps {
  baseUrl: string;
  topic: GrowthTopic;
  breadcrumbs: Breadcrumb[];
  entities: GrowthEntity[];
}

export function TopicJsonLd({ baseUrl, topic, breadcrumbs, entities }: TopicJsonLdProps) {
  const url = `${baseUrl}/topics/${topic.slug}`;

  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            "@id": `${url}#collectionpage`,
            url,
            name: topic.seoTitle || topic.name,
            description: topic.seoDescription || topic.summary,
            about: { "@type": "Thing", name: topic.name, description: topic.definition },
            inLanguage: "zh-TW",
            isPartOf: { "@id": `${baseUrl}/#website` },
            publisher: { "@id": `${baseUrl}/#organization` },
            hasPart: entities.map((entity) => ({
              "@type": "WebPage",
              url: `${baseUrl}/entities/${entity.slug}`,
              name: entity.name,
            })),
          },
          breadcrumbNode(baseUrl, breadcrumbs),
        ],
      }}
    />
  );
}

interface EntityJsonLdProps {
  baseUrl: string;
  entity: GrowthEntity;
  breadcrumbs: Breadcrumb[];
  sources: GrowthSource[];
}

export function EntityJsonLd({ baseUrl, entity, breadcrumbs, sources }: EntityJsonLdProps) {
  const url = `${baseUrl}/entities/${entity.slug}`;

  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "DefinedTerm",
            "@id": `${url}#term`,
            url,
            name: entity.name,
            alternateName: entity.aliases,
            description: entity.description,
            inDefinedTermSet: { "@type": "DefinedTermSet", name: "潤讀知識站詞彙", url: `${baseUrl}/topics` },
            ...(entity.canonicalUrl ? { sameAs: [entity.canonicalUrl] } : {}),
          },
          {
            "@type": "WebPage",
            "@id": `${url}#webpage`,
            url,
            name: entity.seoTitle || entity.name,
            description: entity.seoDescription || entity.description,
            mainEntity: { "@id": `${url}#term` },
            inLanguage: "zh-TW",
            isPartOf: { "@id": `${baseUrl}/#website` },
            publisher: { "@id": `${baseUrl}/#organization` },
            citation: citationNodes(sources),
          },
          breadcrumbNode(baseUrl, breadcrumbs),
        ],
      }}
    />
  );
}

interface ArticleJsonLdProps {
  baseUrl: string;
  article: GrowthArticle;
  breadcrumbs: Breadcrumb[];
  sources: GrowthSource[];
  mentionedEntities: GrowthEntity[];
}

export function GrowthArticleJsonLd({
  baseUrl,
  article,
  breadcrumbs,
  sources,
  mentionedEntities,
}: ArticleJsonLdProps) {
  const url = `${baseUrl}/articles/${article.slug}`;

  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Article",
            "@id": `${url}#article`,
            url,
            headline: article.title,
            description: article.seoDescription || article.summary,
            inLanguage: "zh-TW",
            ...(article.datePublished ? { datePublished: article.datePublished } : {}),
            ...(article.dateModified ? { dateModified: article.dateModified } : {}),
            author: { "@type": "Organization", name: article.authorName },
            publisher: { "@id": `${baseUrl}/#organization` },
            isPartOf: { "@id": `${baseUrl}/#website` },
            citation: citationNodes(sources),
            mentions: mentionedEntities.map((entity) => ({
              "@type": "DefinedTerm",
              "@id": `${baseUrl}/entities/${entity.slug}#term`,
              name: entity.name,
              url: `${baseUrl}/entities/${entity.slug}`,
            })),
          },
          breadcrumbNode(baseUrl, breadcrumbs),
        ],
      }}
    />
  );
}
