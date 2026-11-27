/**
 * 潤讀主站文章索引的型別與分組。
 *
 * 這裡刻意只處理「標題、連結、日期」——growth 站不保存也不顯示主站內文
 * （計畫書 §8.2）。索引的用途是導流與導覽，不是內容再發布。
 */

export type PrimaryArticleGroup =
  | "pesticides-and-veterinary-drugs"
  | "food-production"
  | "gmo"
  | "produce"
  | "eating-out"
  | "food-safety-culture"
  | "other";

export type PrimaryArticle = {
  title: string;
  url: string;
  datePublished: string;
  group: PrimaryArticleGroup;
};

export type PrimaryArticleSection = {
  group: PrimaryArticleGroup;
  name: string;
  /** 英文版 /en/reading 用的名稱與說明。 */
  nameEn: string;
  introEn: string;
  /** 這一群在讀什麼、為什麼放在一起。索引頁的編輯價值來自這幾句話。 */
  intro: string;
  /** 對應的知識站主題，讓索引頁連得回站內內容（計畫書 §9.2）。 */
  topicSlug: string | null;
  articles: PrimaryArticle[];
};

const SECTION_DEFINITIONS: Omit<PrimaryArticleSection, "articles">[] = [
  {
    group: "pesticides-and-veterinary-drugs",
    name: "農藥、動物用藥與抗藥性",
    nameEn: "Pesticides, veterinary drugs and resistance",
    introEn:
      "From herbicide residues to drugs used on livestock and poultry, these articles ask what is used, how much residue remains and who regulates it. Read them alongside the matching topic page here for the legal definitions.",
    intro:
      "從除草劑殘留到畜禽用藥，這一組談的是「用了什麼、殘留多少、誰在管」。想先弄清楚法規怎麼定義的，可以搭配知識站的主題頁一起看。",
    topicSlug: "pesticides-and-veterinary-drugs",
  },
  {
    group: "food-production",
    name: "飼養方式與生產現場",
    nameEn: "How food is produced and animals are raised",
    introEn:
      "How laying hens are kept, how avian flu is controlled and how welfare-friendly farming differs from conventional systems. These are mostly reports from the industry; the legal definitions are on the topic pages here.",
    intro:
      "蛋雞怎麼養、禽流感怎麼防、友善生產跟一般飼養差在哪。這一組多半寫的是產業現場，法規上的定義在知識站的主題頁。",
    topicSlug: "food-production",
  },
  {
    group: "gmo",
    name: "基因改造與基因編輯",
    nameEn: "Genetic modification and gene editing",
    introEn:
      "From bulk imported ingredients to CRISPR and gene flow, these articles span science, regulation and international trade, one of the largest series on So We Read.",
    intro:
      "從大宗進口原料到 CRISPR 與基因逃逸，這一組橫跨科學、法規與國際貿易，是主站篇數最多的系列之一。",
    topicSlug: "food-labeling",
  },
  {
    group: "produce",
    name: "產地、品種與挑選",
    nameEn: "Origins, varieties and how to choose",
    introEn:
      "Varieties, origins, supply chains and buying tips for onions, scallions, native chicken, eggs and spices such as pepper and vanilla: practical guides and industry observations.",
    intro: "洋蔥、青蔥、土雞、雞蛋與胡椒、香草等香料的品種、產地、產銷歷程與挑選方式，偏向實用與產業觀察。",
    topicSlug: null,
  },
  {
    group: "eating-out",
    name: "外食與營養",
    nameEn: "Eating out and nutrition",
    introEn:
      "How often people eat out, balanced plates, the psychology of eating and metabolism: starting from the everyday table, these articles look at effects that build up over time.",
    intro: "外食比例、營養餐盤、飲食心理與代謝。這一組從日常餐桌出發，談的是長期累積的影響。",
    topicSlug: "nutrition-and-eating-out",
  },
  {
    group: "food-safety-culture",
    name: "餐飲文化與食安",
    nameEn: "Food culture and food safety",
    introEn:
      "Hygiene at night markets, street food stalls and chain restaurants, and the trade-offs behind food culture that are easy to overlook.",
    intro: "夜市、街頭美食與連鎖餐廳的衛生條件，以及美食文化背後容易被忽略的取捨。",
    topicSlug: null,
  },
  {
    group: "other",
    name: "其他",
    nameEn: "Other",
    introEn:
      "Articles not yet placed in one of the groups above.",
    intro: "尚未歸入上列主題的文章。",
    topicSlug: null,
  },
];

/**
 * 依主題分組，並在每一組內依發布日期由新到舊排序。
 * 沒有文章的分組不會產生空區塊。
 */
export function groupPrimaryArticles(articles: PrimaryArticle[]): PrimaryArticleSection[] {
  return SECTION_DEFINITIONS.map((section) => ({
    ...section,
    articles: articles
      .filter((article) => article.group === section.group)
      .sort((a, b) => b.datePublished.localeCompare(a.datePublished)),
  })).filter((section) => section.articles.length > 0);
}

/**
 * 文章頁「潤讀主站延伸閱讀」用：挑出對應知識站主題的主站文章，由新到舊。
 *
 * 對應關係沿用 SECTION_DEFINITIONS 的 topicSlug（與 /reading 索引頁同一份），
 * 不另立一張表。excludeUrl 用來排除已經當主要 CTA 的那一篇，避免同頁重複。
 */
export function primaryArticlesForTopic(
  articles: PrimaryArticle[],
  topicSlug: string | null,
  { excludeUrl, limit = 6 }: { excludeUrl?: string | null; limit?: number } = {}
): PrimaryArticle[] {
  if (!topicSlug) return [];
  const groups = new Set(
    SECTION_DEFINITIONS.filter((section) => section.topicSlug === topicSlug).map((section) => section.group)
  );
  return articles
    .filter((article) => groups.has(article.group) && article.url !== excludeUrl)
    .sort((a, b) => b.datePublished.localeCompare(a.datePublished))
    .slice(0, limit);
}
