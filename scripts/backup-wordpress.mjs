/**
 * 主站 WordPress 內容快照（唯讀）。
 *
 * 只對 https://soweread.com 的公開 REST API 發 GET，不需要任何憑證，
 * 也不對主站做任何寫入 —— 這是計畫書 §2 與交接文件 §4 的硬性邊界。
 *
 * 用途：在備援 deployment 尚未上線之前，讓主站文章至少有一份可還原的
 * 本機副本。輸出目錄以擷取日期命名，不覆蓋既有快照。
 *
 *   node scripts/backup-wordpress.mjs [--out <dir>] [--base <url>]
 *
 * 產出：
 *   <out>/<YYYY-MM-DD>/posts.json      文章全文與 metadata
 *   <out>/<YYYY-MM-DD>/pages.json      靜態頁全文
 *   <out>/<YYYY-MM-DD>/categories.json
 *   <out>/<YYYY-MM-DD>/tags.json
 *   <out>/<YYYY-MM-DD>/users.json      公開作者資料
 *   <out>/<YYYY-MM-DD>/media.json      媒體 metadata（含原始檔 URL）
 *   <out>/<YYYY-MM-DD>/media-urls.txt  媒體原始檔 URL 清單，一行一個
 *   <out>/<YYYY-MM-DD>/manifest.json   擷取時間、筆數與各檔 SHA-256
 */

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_BASE = "https://soweread.com/wp-json/wp/v2";
const PER_PAGE = 100;
/** 兩次請求之間的間隔，避免對主站造成不必要的負載。 */
const REQUEST_DELAY_MS = 250;

function parseArgs(argv) {
  const args = { out: path.join("data", "wordpress-backup"), base: DEFAULT_BASE };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--out") args.out = argv[i + 1] ?? args.out;
    if (argv[i] === "--base") args.base = argv[i + 1] ?? args.base;
  }
  return args;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 抓完一個 endpoint 的所有分頁。
 *
 * WordPress 以 X-WP-TotalPages 回報總頁數；缺這個 header 時退回
 * 「抓到空陣列為止」，並設上限避免無窮迴圈。
 */
async function fetchAll(base, endpoint) {
  const items = [];
  let page = 1;
  let totalPages = null;

  while (page <= (totalPages ?? 50)) {
    const url = `${base}/${endpoint}?per_page=${PER_PAGE}&page=${page}`;
    const response = await fetch(url, { headers: { accept: "application/json" } });

    // 超出最後一頁時 WordPress 回 400，視為正常結束。
    if (response.status === 400 && page > 1) break;
    if (!response.ok) {
      throw new Error(`GET ${endpoint} page ${page} 失敗：HTTP ${response.status}`);
    }

    if (totalPages === null) {
      const header = response.headers.get("x-wp-totalpages");
      totalPages = header ? Number(header) : null;
    }

    const batch = await response.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);

    page += 1;
    if (page <= (totalPages ?? 50)) await sleep(REQUEST_DELAY_MS);
  }

  return items;
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

async function writeJson(dir, name, value) {
  const body = `${JSON.stringify(value, null, 2)}\n`;
  await writeFile(path.join(dir, name), body, "utf8");
  return { file: name, bytes: Buffer.byteLength(body), sha256: sha256(body) };
}

async function main() {
  const { out, base } = parseArgs(process.argv.slice(2));
  const retrievedAt = new Date().toISOString();
  const dir = path.join(out, retrievedAt.slice(0, 10));
  await mkdir(dir, { recursive: true });

  console.log(`來源：${base}`);
  console.log(`輸出：${dir}\n`);

  const endpoints = [
    ["posts", "posts.json"],
    ["pages", "pages.json"],
    ["categories", "categories.json"],
    ["tags", "tags.json"],
    ["users", "users.json"],
    ["media", "media.json"],
  ];

  const files = [];
  const counts = {};

  for (const [endpoint, filename] of endpoints) {
    const items = await fetchAll(base, endpoint);
    counts[endpoint] = items.length;
    files.push(await writeJson(dir, filename, items));
    console.log(`${endpoint.padEnd(12)} ${String(items.length).padStart(4)} 筆`);

    if (endpoint === "media") {
      const urls = items
        .map((item) => item.source_url)
        .filter((url) => typeof url === "string" && url.length > 0);
      const body = `${urls.join("\n")}\n`;
      await writeFile(path.join(dir, "media-urls.txt"), body, "utf8");
      files.push({
        file: "media-urls.txt",
        bytes: Buffer.byteLength(body),
        sha256: sha256(body),
      });
      console.log(`${"media-urls".padEnd(12)} ${String(urls.length).padStart(4)} 個原始檔 URL`);
    }
  }

  const manifest = {
    retrievedAt,
    source: base,
    counts,
    files,
    // 媒體「檔案本身」不在本次快照範圍內，只保存 URL 清單。
    mediaBinariesIncluded: false,
    note: "只對主站公開 REST API 發 GET，未對主站做任何寫入。媒體二進位檔未下載，因此本快照不是 disaster-complete。",
  };
  await writeJson(dir, "manifest.json", manifest);

  const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
  console.log(`\n完成：${files.length + 1} 個檔案，共 ${(totalBytes / 1024).toFixed(1)} KB`);
  console.log("媒體二進位檔未下載，本快照非 disaster-complete。");
}

main().catch((error) => {
  console.error(`備份失敗：${error.message}`);
  process.exitCode = 1;
});
