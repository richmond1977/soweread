/**
 * 零依賴載入 .env.local / .env 到 process.env（本機執行用；CI 走 GitHub Secrets，
 * 執行環境已經有變數，不受影響）。
 *
 * 自己重寫一份而不是共用專案裡其他的 env 載入器，理由是移植規劃文件（見
 * docs/growth-weekly-report-migration.md 第 6 節風險 4）點名的陷阱：來源端
 * scripts/growth/ 下每一支腳本都用一條往上跨資料夾的相對路徑去 import 另一個
 * 兄弟資料夾（非 growth/ 本身）裡的 env 載入器，而 SOWEREAD 沒有那個資料夾，
 * 那條路徑在這裡連不到任何檔案。growth/ 這個資料夾
 * 之後會整包搬到排程環境跑，讓它裡面的每一支腳本只依賴同目錄的 lib/，不要
 * 往外跨資料夾借，才不會下次搬家又斷一次。
 *
 * 已存在的環境變數不覆蓋（尊重呼叫端 `node --env-file=` 或 shell 已設的值）。
 * import 此檔即生效（side-effect），用法與來源端相同：
 *   import './lib/env.mjs'
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

for (const file of ['.env.local', '.env']) {
  const path = join(process.cwd(), file);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2].trim().replace(/^["']|["']$/g, '');
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
