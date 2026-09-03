import type { GrowthKnowledge } from "@/lib/growth/knowledge-core";

/**
 * Verifiable fixture for the growth deployment.
 *
 * This is TEST DATA, not reviewed editorial content. It exists so the growth
 * routes, canonical tags, JSON-LD, internal links and sitemap can be verified
 * end to end before any real content is written.
 *
 * Every source below is a PLACEHOLDER: it names a real institution but points
 * at that institution's site root, because no specific document has been
 * retrieved and checked yet. Nothing here may be presented as a verified claim.
 *
 * It is only loaded when `GROWTH_USE_FIXTURE=true`, so it can never reach a
 * production growth domain by accident.
 */
export const FIXTURE_NOTICE =
  "測試資料：本頁為 growth deployment 的技術驗證用範例，內容與來源尚未經過查證，不得作為食品安全或營養建議。";

export const growthFixture: GrowthKnowledge = {
  isFixture: true,
  sources: [
    {
      id: "src-tfda-placeholder",
      title: "【佔位來源】衛生福利部食品藥物管理署",
      publisher: "衛生福利部食品藥物管理署",
      url: "https://www.fda.gov.tw/",
      sourceType: "government",
      publishedAt: null,
      retrievedAt: "2026-09-03",
      note: "佔位來源：正式上線前必須替換為實際查證過的法規或公告頁面 URL，並補上發布日期。",
    },
    {
      id: "src-who-placeholder",
      title: "【佔位來源】World Health Organization",
      publisher: "World Health Organization",
      url: "https://www.who.int/",
      sourceType: "international-organisation",
      publishedAt: null,
      retrievedAt: "2026-09-03",
      note: "佔位來源：正式上線前必須替換為實際查證過的文件 URL，並補上發布日期。",
    },
  ],
  topics: [
    {
      id: "topic-food-labeling",
      slug: "food-labeling",
      name: "食品標示與消費選擇",
      summary:
        "包裝食品上的標示是消費者在購買當下唯一能取得的結構化資訊。這個主題整理標示欄位的定義、法規要求，以及標示能回答與不能回答的問題。",
      definition:
        "食品標示指依法必須標於包裝上的品名、成分、淨重、營養標示、有效日期、廠商資訊與過敏原提示等欄位。標示是法規要求的資訊揭露，不是健康評價。",
      keyQuestions: [
        "營養標示的每份與每 100 公克有什麼差別？",
        "成分表的排列順序代表什麼？",
        "哪些標示欄位是法規強制、哪些是自願標示？",
        "標示可以證明一項食品比較健康嗎？",
      ],
      publicationStatus: "published",
      seoTitle: "食品標示與消費選擇",
      seoDescription:
        "整理包裝食品標示的欄位定義、法規範圍與判讀限制，說明標示能回答與不能回答的問題。",
      sortOrder: 10,
      reviewedAt: null,
    },
  ],
  entities: [
    {
      id: "entity-nutrition-facts-label",
      slug: "nutrition-facts-label",
      entityType: "labeling-requirement",
      name: "營養標示",
      aliases: ["營養標示欄", "Nutrition Facts", "營養成分表"],
      description:
        "營養標示是包裝食品上以固定格式列出熱量與特定營養素含量的欄位。它揭露的是含量數據，不對食品做健康評價，也不涵蓋所有營養素。",
      canonicalUrl: null,
      publicationStatus: "published",
      seoTitle: "營養標示",
      seoDescription:
        "營養標示的定義、揭露範圍與判讀限制：它提供哪些數據、不提供哪些資訊。",
      reviewedAt: null,
      topicSlugs: ["food-labeling"],
      sourceIds: ["src-tfda-placeholder"],
    },
    {
      id: "entity-tfda",
      slug: "tfda",
      entityType: "institution",
      name: "衛生福利部食品藥物管理署",
      aliases: ["食藥署", "TFDA"],
      description:
        "台灣主管食品、藥物與化粧品安全的中央機關，負責訂定並公告食品標示相關規定。",
      canonicalUrl: "https://www.fda.gov.tw/",
      publicationStatus: "published",
      seoTitle: "衛生福利部食品藥物管理署（食藥署）",
      seoDescription: "食藥署的職掌範圍，以及它在食品標示規範上的角色。",
      reviewedAt: null,
      topicSlugs: ["food-labeling"],
      sourceIds: ["src-tfda-placeholder"],
    },
    {
      id: "entity-draft-example",
      slug: "draft-not-public",
      entityType: "nutrient",
      name: "（草稿範例）尚未審核的實體",
      aliases: [],
      description: "這筆資料用來驗證 draft 狀態不會出現在公開頁面與 sitemap。",
      canonicalUrl: null,
      publicationStatus: "draft",
      seoTitle: "",
      seoDescription: "",
      reviewedAt: null,
      topicSlugs: ["food-labeling"],
      sourceIds: [],
    },
  ],
  relations: [
    {
      id: "rel-nutrition-label-regulated-by-tfda",
      subjectSlug: "nutrition-facts-label",
      predicate: "由…規範",
      objectSlug: "tfda",
      sourceId: "src-tfda-placeholder",
      confidence: "reported",
      note: "佔位關係：正式上線前需引用具體法規條文。",
    },
    {
      id: "rel-unsourced-example",
      subjectSlug: "nutrition-facts-label",
      predicate: "（無來源範例）關聯於",
      objectSlug: "tfda",
      sourceId: null,
      confidence: "unverified",
      note: "這筆關係沒有來源，用來驗證無來源關係不會顯示給讀者。",
    },
  ],
  articles: [
    {
      id: "article-reading-nutrition-labels",
      slug: "reading-nutrition-labels",
      title: "營養標示能回答什麼、不能回答什麼",
      summary:
        "營養標示提供的是含量數據，不是健康結論。這篇整理標示欄位的判讀方式，以及它在設計上就無法回答的問題。",
      content: [
        "營養標示是包裝食品上少數以固定格式呈現的資訊。它讓不同產品之間可以比較，但可比較的範圍比多數人想像的窄。",
        "第一個常見誤讀是份量基準。同一項產品若以「每份」與「每 100 公克」分別標示，數字可能相差數倍。比較兩項產品之前，必須先確認兩者採用同一個基準。",
        "第二個限制是揭露範圍。營養標示只列出法規要求的項目，未列出的營養素不代表不存在，也不代表含量為零。標示的沉默不是資訊。",
        "第三個限制更根本：標示揭露含量，不做評價。一項食品的營養標示數字「好看」，並不等於它在整體飲食中是合適的選擇；那需要考慮攝取頻率、總量與個人狀況，而這些都不在包裝上。",
        "把標示當成篩選工具而不是結論工具，是比較務實的用法：先用它排除明顯不符需求的選項，再用其他資訊做判斷。",
      ].join("\n\n"),
      editorialStatus: "published",
      authorName: "潤讀知識站（測試資料）",
      reviewerName: "",
      seoTitle: "營養標示能回答什麼、不能回答什麼",
      seoDescription:
        "營養標示提供含量數據而非健康結論。整理份量基準、揭露範圍與評價限制三個判讀重點。",
      primaryCtaUrl: "https://soweread.com/",
      primaryCtaLabel: "前往潤讀主站閱讀更多飲食與食品安全長文",
      datePublished: "2026-09-03",
      dateModified: "2026-09-03",
      topicSlug: "food-labeling",
      entitySlugs: ["nutrition-facts-label", "tfda"],
      sourceIds: ["src-tfda-placeholder", "src-who-placeholder"],
    },
    {
      id: "article-draft-example",
      slug: "draft-article-not-public",
      title: "（草稿範例）尚未發布的文章",
      summary: "用來驗證 draft 文章不會出現在公開頁面與 sitemap。",
      content: "草稿內容。",
      editorialStatus: "draft",
      authorName: "潤讀知識站（測試資料）",
      reviewerName: "",
      seoTitle: "",
      seoDescription: "",
      primaryCtaUrl: null,
      primaryCtaLabel: "",
      datePublished: null,
      dateModified: null,
      topicSlug: "food-labeling",
      entitySlugs: [],
      sourceIds: [],
    },
  ],
};
