/**
 * 知識站的語系：中文是正本（網址不帶前綴），英文版掛在 /en 之下，
 * 比照主站 soweread.com 與 soweread.com/en/ 的做法。
 */
export type GrowthLocale = "zh" | "en";

export const GROWTH_LOCALES: GrowthLocale[] = ["zh", "en"];

/** hreflang 值與主站一致：中文 zh-Hant-TW、英文 en，x-default 指向中文。 */
export const HREFLANG: Record<GrowthLocale, string> = { zh: "zh-Hant-TW", en: "en" };

/** schema.org inLanguage 與 Open Graph locale。 */
export const IN_LANGUAGE: Record<GrowthLocale, string> = { zh: "zh-TW", en: "en" };
export const OG_LOCALE: Record<GrowthLocale, string> = { zh: "zh_TW", en: "en_GB" };

/** 把站內路徑轉成該語系的路徑：localePath("en", "/topics") === "/en/topics"。 */
export function localePath(locale: GrowthLocale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === "zh") return normalized;
  return normalized === "/" ? "/en" : `/en${normalized}`;
}

/**
 * 一頁的 canonical 與 hreflang。`hasEnglish` 為 false 時（該頁沒有英文翻譯）
 * 只宣告中文，避免 hreflang 指向不存在的頁面。
 */
export function languageAlternates(
  baseUrl: string,
  locale: GrowthLocale,
  path: string,
  hasEnglish = true
): { canonical: string; languages?: Record<string, string> } {
  const canonical = `${baseUrl}${localePath(locale, path) === "/" ? "" : localePath(locale, path)}`;
  if (!hasEnglish) return { canonical };
  const zhUrl = `${baseUrl}${path === "/" ? "" : path}`;
  const enUrl = `${baseUrl}${localePath("en", path)}`;
  return {
    canonical,
    languages: { [HREFLANG.zh]: zhUrl, [HREFLANG.en]: enUrl, "x-default": zhUrl },
  };
}

/** 介面文字。內容（名詞、主題）的翻譯在 src/data/growth-content-en.ts。 */
export const UI = {
  zh: {
    siteName: "潤讀知識站",
    strip: "潤讀知識站 · 名詞、定義與可追溯的來源",
    backToPrimary: "回潤讀主站 ↗",
    primaryUrl: "https://soweread.com/",
    brandSuffix: "知識站",
    brandAria: "潤讀知識站首頁",
    motto: "讀食安新聞之前，先查清楚定義。",
    switchLabel: "EN",
    switchAria: "English version",
    navAria: "主要導覽",
    navGlossary: "名詞索引",
    navTopics: "議題",
    navReading: "主站文章",
    navPrimary: "潤讀主站",
    breadcrumbAria: "麵包屑",
    home: "首頁",
    topics: "知識主題",
    glossary: "知識名詞索引",
    footerEyebrow: "So We Read · Knowledge",
    footerAbout: ["潤讀知識站是獨立的知識整理站台，與", "潤讀 So We Read 主站", "同屬一個編輯團隊。"],
    footerFollow: "追蹤我們：",
    sourcesEyebrow: "Sources",
    sourcesHeading: "來源",
    published: "發布",
    publishedUnknown: "發布日期未確認",
    retrieved: "擷取",
    originalTitle: "",
    furtherReading: "Further Reading",
    translationNote: "",
  },
  en: {
    siteName: "So We Read Knowledge",
    strip: "So We Read Knowledge · Terms, definitions and traceable sources",
    backToPrimary: "So We Read ↗",
    primaryUrl: "https://soweread.com/en/",
    brandSuffix: "Knowledge",
    brandAria: "So We Read Knowledge home",
    motto: "Check the definition before you read the headline.",
    switchLabel: "中文",
    switchAria: "中文版",
    navAria: "Main navigation",
    navGlossary: "Glossary",
    navTopics: "Topics",
    navReading: "",
    navPrimary: "So We Read",
    breadcrumbAria: "Breadcrumb",
    home: "Home",
    topics: "Topics",
    glossary: "Glossary",
    footerEyebrow: "So We Read · Knowledge",
    footerAbout: ["So We Read Knowledge is an independent reference site run by the same editorial team as", "So We Read", "."],
    footerFollow: "Follow us:",
    sourcesEyebrow: "References",
    sourcesHeading: "Sources",
    published: "Published",
    publishedUnknown: "Publication date unconfirmed",
    retrieved: "Retrieved",
    originalTitle: "Original title",
    furtherReading: "Further Reading",
    translationNote:
      "Translated from the Chinese edition, which prevails where the two differ. The laws, agencies and labels described are Taiwanese; English names are descriptive unless an official English title exists.",
  },
} as const;

export type GrowthUi = (typeof UI)[GrowthLocale];
