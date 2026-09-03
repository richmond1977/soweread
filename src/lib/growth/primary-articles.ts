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
    intro:
      "從除草劑殘留到畜禽用藥，這一組談的是「用了什麼、殘留多少、誰在管」。想先弄清楚法規怎麼定義的，可以搭配知識站的主題頁一起看。",
    topicSlug: "pesticides-and-veterinary-drugs",
  },
  {
    group: "food-production",
    name: "飼養方式與生產現場",
    intro:
      "蛋雞怎麼養、禽流感怎麼防、友善生產跟一般飼養差在哪。這一組多半寫的是產業現場，法規上的定義在知識站的主題頁。",
    topicSlug: "food-production",
  },
  {
    group: "gmo",
    name: "基因改造與基因編輯",
    intro:
      "從大宗進口原料到 CRISPR 與基因逃逸，這一組橫跨科學、法規與國際貿易，是主站篇數最多的系列之一。",
    topicSlug: "food-labeling",
  },
  {
    group: "produce",
    name: "產地、品種與挑選",
    intro: "洋蔥與青蔥的品種、產地、產銷歷程與挑選方式，偏向實用與產業觀察。",
    topicSlug: null,
  },
  {
    group: "eating-out",
    name: "外食與營養",
    intro: "外食比例、營養餐盤、飲食心理與代謝。這一組從日常餐桌出發，談的是長期累積的影響。",
    topicSlug: null,
  },
  {
    group: "food-safety-culture",
    name: "餐飲文化與食安",
    intro: "夜市、街頭美食與連鎖餐廳的衛生條件，以及美食文化背後容易被忽略的取捨。",
    topicSlug: null,
  },
  {
    group: "other",
    name: "其他",
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
