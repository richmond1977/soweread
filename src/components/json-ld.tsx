import { getSiteConfig } from "@/lib/site-config";

const SITE_URL = getSiteConfig().primarySiteUrl;

const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "潤讀 So We Read",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/assets/soweread-logo.png`,
    width: 350,
    height: 233,
  },
  description: "以食品安全、營養知識與飲食文化為核心的內容發表平台。",
  inLanguage: "zh-TW",
};

export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      ORGANIZATION,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "潤讀 So We Read",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "zh-TW",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/blog?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

type ArticleJsonLdProps = {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  modifiedAt: string;
  tags: string[];
  coverImage?: string | null;
  coverImageAlt?: string;
  categoryName: string;
};

export function ArticleJsonLd({
  title,
  description,
  slug,
  publishedAt,
  modifiedAt,
  tags,
  coverImage,
  coverImageAlt,
  categoryName,
}: ArticleJsonLdProps) {
  const url = `${SITE_URL}/blog/${slug}`;
  const image = coverImage
    ? coverImage.startsWith("http") ? coverImage : `${SITE_URL}${coverImage}`
    : `${SITE_URL}/assets/soweread-logo.png`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: title,
        description,
        url,
        datePublished: publishedAt,
        dateModified: modifiedAt,
        author: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: "潤讀編輯部",
        },
        publisher: { "@id": `${SITE_URL}/#organization` },
        image: { "@type": "ImageObject", url: image, width: 1200, height: 630, caption: coverImageAlt || title },
        keywords: tags.join(", "),
        articleSection: categoryName,
        inLanguage: "zh-TW",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首頁", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "文章", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: title, item: url },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function AboutPageJsonLd() {
  const url = `${SITE_URL}/story`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${url}#aboutpage`,
        url,
        name: "潤讀故事｜潤讀 So We Read",
        description: "潤讀誕生於慢下腳步、沉澱知識的需求，整合新舊知識、新聞脈絡與世界觀點，幫助讀者建立宏觀視角。",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "zh-TW",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首頁", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "潤讀故事", item: url },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

type FaqItem = { question: string; answer: string };

export function FaqPageJsonLd({ items = [] }: { items?: FaqItem[] }) {
  if (!items.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ContactPageJsonLd() {
  const url = `${SITE_URL}/contact`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${url}#contactpage`,
        url,
        name: "聯絡｜潤讀 So We Read",
        description: "有合作、投稿或訂閱需求，歡迎留下訊息。",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "zh-TW",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首頁", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "聯絡", item: url },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
