/**
 * 由主站快照產生「潤讀主站文章索引」的資料檔。
 *
 * 只取標題、網址與發布日期——**不取任何內文**。計畫書 §8.2 禁止把主站
 * 全文或改寫版發布到 growth 站；標題與連結屬於 §11 允許的導流方式。
 *
 * 輸出是版控裡的 TypeScript 檔而不是執行期讀取快照，理由是計畫書 §8.2
 * 要求公開發布必須經過 human review gate——產生的檔案會出現在 PR diff 裡，
 * 那就是那道關卡。排程同步不得直接讓內容上線。
 *
 *   npm run backup:wordpress          # 先更新快照
 *   node scripts/build-primary-article-index.mjs
 *
 * 分組是確定性的關鍵字比對（先命中者勝），不是模型判斷；比對不到的文章
 * 會落到「其他」並在執行時列出，由人決定要不要調整關鍵字表。
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const BACKUP_ROOT = path.join("data", "wordpress-backup");
const OUTPUT = path.join("src", "data", "primary-articles.ts");

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
  { group: "produce", keywords: ["洋蔥", "青蔥", "三星蔥", "蔬果"] },
  {
    group: "eating-out",
    keywords: ["外食", "營養", "餐盤", "飢餓", "代謝", "鹹", "飲食陷阱", "飲食文化"],
  },
  { group: "food-safety-culture", keywords: ["夜市", "街頭美食", "餐廳", "食安", "賣相", "美食"] },
];

function latestSnapshotDir() {
  const entries = readdirSync(BACKUP_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (entries.length === 0) {
    throw new Error(`${BACKUP_ROOT} 底下沒有任何快照，請先執行 npm run backup:wordpress`);
  }
  return path.join(BACKUP_ROOT, entries[entries.length - 1]);
}

/** WordPress 的 rendered 標題帶 HTML entity，這裡只還原實際會用到的幾個。 */
function decodeTitle(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function groupFor(title) {
  for (const rule of GROUP_RULES) {
    if (rule.keywords.some((keyword) => title.includes(keyword))) return rule.group;
  }
  return "other";
}

function main() {
  const dir = latestSnapshotDir();
  const posts = JSON.parse(readFileSync(path.join(dir, "posts.json"), "utf8"));

  const entries = posts
    .map((post) => ({
      title: decodeTitle(post.title.rendered),
      url: post.link,
      datePublished: post.date.slice(0, 10),
      group: groupFor(decodeTitle(post.title.rendered)),
    }))
    .sort((a, b) => b.datePublished.localeCompare(a.datePublished));

  const ungrouped = entries.filter((entry) => entry.group === "other");
  const byGroup = entries.reduce((acc, entry) => {
    acc[entry.group] = (acc[entry.group] ?? 0) + 1;
    return acc;
  }, {});

  const body = `import type { PrimaryArticle } from "@/lib/growth/primary-articles";

/**
 * 潤讀主站（https://soweread.com）的文章索引。
 *
 * 由 \`scripts/build-primary-article-index.mjs\` 從主站快照產生，請勿手動編輯——
 * 更新方式是重跑 npm run backup:wordpress 之後再跑該腳本，並在 PR 裡檢視 diff。
 *
 * 只保存標題、網址與發布日期，不含任何內文。
 *
 * 快照來源：${dir.replace(/\\\\/g, "/")}
 */
export const primaryArticles: PrimaryArticle[] = ${JSON.stringify(entries, null, 2)};
`;

  writeFileSync(OUTPUT, body, "utf8");

  console.log(`快照：${dir}`);
  console.log(`文章：${entries.length} 篇 → ${OUTPUT}`);
  console.log("分組：", JSON.stringify(byGroup));
  if (ungrouped.length > 0) {
    console.log(`\n未分組 ${ungrouped.length} 篇，請檢查關鍵字表：`);
    for (const entry of ungrouped) console.log(`  - ${entry.title}`);
  }
}

main();
