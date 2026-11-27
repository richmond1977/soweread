/**
 * 由主站原始檔產生「潤讀主站文章索引」的資料檔（中文與英文各一份）。
 *
 * 只取標題、網址與發布日期——**不取任何內文**。計畫書 §8.2 禁止把主站
 * 全文或改寫版發布到 growth 站；標題與連結屬於 §11 允許的導流方式。
 *
 * 輸出是版控裡的 TypeScript 檔而不是執行期讀取主站，理由是計畫書 §8.2
 * 要求公開發布必須經過 human review gate——產生的檔案會出現在 PR diff 裡，
 * 那就是那道關卡。排程同步不得直接讓內容上線。
 *
 * 來源是主站 Astro repo（WordPress 已下線，舊的 wordpress-backup 快照不再更新）：
 *   中文 src/content/posts/<slug>/index.md → https://soweread.com/<slug>/
 *   英文 src/content/posts-en/<slug>.md    → https://soweread.com/en/<slug>/
 *
 *   SOWEREAD_WEB_DIR=../Soweread_Web npm run build:primary-index
 *
 * 也可以改讀主站公開的 RSS（中文 /feed.xml、英文 /en/feed.xml，兩者都列出全部文章）：
 *
 *   npm run build:primary-index -- --from-feeds
 *
 * GitHub Actions 的 primary-index-sync.yml 就是用這個模式定時檢查，有變動時開 PR，
 * 合併前仍由人檢視 diff——自動化只負責「發現新文章並備好 PR」，不會讓內容直接上線。
 *
 * 分組是確定性的關鍵字比對（以中文標題比對，先命中者勝），不是模型判斷；
 * 英文文章沿用對應中文文章的分組。比對不到的文章會落到「其他」並在執行時
 * 列出，由人決定要不要調整關鍵字表。
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const WEB_DIR = path.resolve(process.env.SOWEREAD_WEB_DIR ?? path.join("..", "Soweread_Web"));
const OUTPUT = path.join("src", "data", "primary-articles.ts");
const OUTPUT_EN = path.join("src", "data", "primary-articles-en.ts");
const SITE = "https://soweread.com";

/** 先命中者勝，順序即優先序。 */
const GROUP_RULES = [
  { group: "gmo", keywords: ["基改", "基因改造", "基因編輯", "CRISPR", "基因逃逸"] },
  {
    group: "pesticides-and-veterinary-drugs",
    keywords: ["嘉磷塞", "除草劑", "農藥", "抗生素", "無抗", "抗藥", "One Health", "速生雞"],
  },
  {
    group: "food-production",
    keywords: ["格子籠", "平飼", "放牧", "蛋雞", "養雞", "飼養", "禽流感", "H5N1", "蛋荒", "溫室", "有機"],
  },
  {
    group: "produce",
    keywords: ["洋蔥", "青蔥", "三星蔥", "蔬果", "土雞", "香草", "胡椒", "香料", "雞蛋", "好蛋", "洗選蛋"],
  },
  {
    group: "eating-out",
    keywords: ["外食", "營養", "餐盤", "飢餓", "代謝", "鹹", "飲食陷阱", "飲食文化", "減重"],
  },
  { group: "food-safety-culture", keywords: ["夜市", "街頭美食", "餐廳", "食安", "賣相", "美食"] },
];

/** 讀 Markdown frontmatter 的單行字串欄位（主站的 title / pubDate / source 都是單行）。 */
function frontmatterField(text, field) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const line = fm[1].match(new RegExp(`^${field}:\s*(.*)$`, "m"));
  if (!line) return null;
  const raw = line[1].trim();
  return raw.startsWith('"') ? JSON.parse(raw) : raw.replace(/^'(.*)'$/, "$1");
}

function groupFor(title) {
  for (const rule of GROUP_RULES) {
    if (rule.keywords.some((keyword) => title.includes(keyword))) return rule.group;
  }
  return "other";
}

const FROM_FEEDS = process.argv.includes("--from-feeds");

const XML_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

/** 解 RSS 文字節點：CDATA 與 XML 實體（含數字實體）。 */
export function decodeXmlText(raw) {
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  if (cdata) return cdata[1];
  return raw.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name) => {
    if (name[0] === "#") {
      const code = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      return String.fromCodePoint(code);
    }
    return XML_ENTITIES[name.toLowerCase()] ?? whole;
  });
}

/** 從 RSS 取出每篇的標題、連結與發布日期（UTC 日期；主站 pubDate 不帶時區，RSS 原樣輸出為 GMT）。 */
export function parseFeedItems(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const field = (name) => {
      const match = item.match(new RegExp(String.raw`<${name}>([\s\S]*?)</${name}>`));
      return match ? decodeXmlText(match[1].trim()) : null;
    };
    const title = field("title");
    const link = field("link");
    const pubDate = field("pubDate");
    if (!title || !link || !pubDate) throw new Error(`RSS 項目缺少 title、link 或 pubDate：${item.slice(0, 200)}`);
    const date = new Date(pubDate);
    if (Number.isNaN(date.getTime())) throw new Error(`無法解析 pubDate：${pubDate}`);
    return { title, link, datePublished: date.toISOString().slice(0, 10) };
  });
}

async function fetchFeed(url) {
  const response = await fetch(url, { headers: { "user-agent": "soweread-knowledge-index-sync" } });
  if (!response.ok) throw new Error(`讀取 ${url} 失敗：HTTP ${response.status}`);
  const items = parseFeedItems(await response.text());
  if (items.length === 0) throw new Error(`${url} 沒有任何文章，停止以免清空索引`);
  return items;
}

/** 文章網址的 slug：https://soweread.com/<slug>/ 或 https://soweread.com/en/<slug>/。 */
function slugOf(link) {
  const parts = new URL(link).pathname.split("/").filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1]);
}

async function collectFromFeeds() {
  const [zhItems, enItems] = await Promise.all([fetchFeed(`${SITE}/feed.xml`), fetchFeed(`${SITE}/en/feed.xml`)]);
  const zhBySlug = new Map();
  for (const item of zhItems) {
    const slug = slugOf(item.link);
    zhBySlug.set(slug, {
      title: item.title,
      url: `${SITE}/${encodeURI(slug)}/`,
      datePublished: item.datePublished,
      group: groupFor(item.title),
    });
  }
  // 英文版的網址 slug 與中文原文相同（主站 posts-en/<slug>.md 的 source 一律等於檔名）。
  const entriesEn = enItems.map((item) => {
    const slug = slugOf(item.link);
    const source = zhBySlug.get(slug);
    if (!source) throw new Error(`英文文章 ${item.link} 對不到中文文章`);
    return { title: item.title, url: `${SITE}/en/${encodeURI(slug)}/`, datePublished: source.datePublished, group: source.group };
  });
  return { zhBySlug, entriesEn, sourceLabel: `${SITE} 的 RSS` };
}

const byDateDesc = (a, b) => b.datePublished.localeCompare(a.datePublished) || a.url.localeCompare(b.url);

function render(exportName, entries, note) {
  return `import type { PrimaryArticle } from "@/lib/growth/primary-articles";

/**
 * ${note}
 *
 * 由 \`scripts/build-primary-article-index.mjs\` 從主站原始檔產生，請勿手動編輯——
 * 更新方式是重跑 npm run build:primary-index，並在 PR 裡檢視 diff。
 *
 * 只保存標題、網址與發布日期，不含任何內文。
 */
export const ${exportName}: PrimaryArticle[] = ${JSON.stringify(entries, null, 2)};
`;
}

function collectFromFiles() {
  const postsDir = path.join(WEB_DIR, "src", "content", "posts");
  const postsEnDir = path.join(WEB_DIR, "src", "content", "posts-en");
  if (!existsSync(postsDir)) {
    throw new Error(`找不到主站文章資料夾 ${postsDir}，請用 SOWEREAD_WEB_DIR 指定主站 repo 的位置`);
  }

  const zhBySlug = new Map();
  for (const slug of readdirSync(postsDir)) {
    const file = path.join(postsDir, slug, "index.md");
    if (!existsSync(file)) continue;
    const text = readFileSync(file, "utf8");
    const title = frontmatterField(text, "title");
    const date = frontmatterField(text, "pubDate");
    if (!title || !date) throw new Error(`${file} 缺少 title 或 pubDate`);
    zhBySlug.set(slug, {
      title,
      url: `${SITE}/${encodeURI(slug)}/`,
      datePublished: date.slice(0, 10),
      group: groupFor(title),
    });
  }
  const entriesEn = [];
  if (existsSync(postsEnDir)) {
    for (const name of readdirSync(postsEnDir).filter((f) => f.endsWith(".md"))) {
      const text = readFileSync(path.join(postsEnDir, name), "utf8");
      const slug = name.replace(/\.md$/, "");
      const source = zhBySlug.get(frontmatterField(text, "source") ?? slug);
      const title = frontmatterField(text, "title");
      if (!source || !title) throw new Error(`${name} 的 source 或 title 對不到中文文章`);
      entriesEn.push({
        title,
        url: `${SITE}/en/${encodeURI(slug)}/`,
        datePublished: source.datePublished,
        group: source.group,
      });
    }
  }
  return { zhBySlug, entriesEn, sourceLabel: WEB_DIR };
}

async function main() {
  const { zhBySlug, entriesEn, sourceLabel } = FROM_FEEDS ? await collectFromFeeds() : collectFromFiles();
  const entries = [...zhBySlug.values()].sort(byDateDesc);
  entriesEn.sort(byDateDesc);

  writeFileSync(OUTPUT, render("primaryArticles", entries, "潤讀主站（https://soweread.com）的中文文章索引。"), "utf8");
  writeFileSync(
    OUTPUT_EN,
    render("primaryArticlesEn", entriesEn, "潤讀主站英文版（https://soweread.com/en/）的文章索引，分組沿用對應的中文文章。"),
    "utf8"
  );

  const byGroup = entries.reduce((acc, entry) => {
    acc[entry.group] = (acc[entry.group] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`主站：${sourceLabel}`);
  console.log(`中文：${entries.length} 篇 → ${OUTPUT}`);
  console.log(`英文：${entriesEn.length} 篇 → ${OUTPUT_EN}`);
  console.log("分組：", JSON.stringify(byGroup));
  const ungrouped = entries.filter((entry) => entry.group === "other");
  if (ungrouped.length > 0) {
    console.log(`\n未分組 ${ungrouped.length} 篇，請檢查關鍵字表：`);
    for (const entry of ungrouped) console.log(`  - ${entry.title}`);
  }
}

// 被測試 import 時不執行；直接用 node 執行才跑。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
