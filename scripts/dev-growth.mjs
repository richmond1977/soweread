/**
 * 本機預覽 growth 角色。
 *
 * 用一支 wrapper 而不是改 .env 檔，理由有二：預覽用的變數不該混進開發者
 * 自己的環境設定；而且把「預覽跑的是哪一組角色設定」寫死在版控裡，才不會
 * 每次都要重新回想要設哪幾個變數。
 *
 *   npm run dev:growth
 *
 * 資料來源是 `src/data/growth-content.ts`（已審查、來源皆經查證的正式內容），
 * 不是 fixture。DATABASE_URL 刻意指向一個連不上的位址：growth 的資料載入器
 * 連不到資料庫時會退回內容模組，這正是預覽要走的路徑，也順便驗證了
 * 「資料庫掛掉時不會露出別的部署的資料」這條 fail-closed 行為。
 */

import { spawn } from "node:child_process";

const PORT = process.env.PORT ?? "3100";

const env = {
  ...process.env,
  SITE_ROLE_RESOLUTION: "env",
  SITE_ROLE: "growth",
  NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
  PRIMARY_SITE_URL: "https://soweread.com",
  GROWTH_ENFORCE_CANONICAL_HOST: "false",
  GROWTH_CONTENT_SOURCE: "module",
  // 預覽不載入 GA：NEXT_PUBLIC_GA_MEASUREMENT_ID 刻意留空。
  NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
  // 連不上的位址，用來走到「資料庫不可用 → 退回內容模組」那條路徑。
  DATABASE_URL: "postgresql://preview:preview@127.0.0.1:1/preview",
  DATABASE_DIRECT_URL: "postgresql://preview:preview@127.0.0.1:1/preview",
  GROWTH_DATABASE_URL: "postgresql://preview:preview@127.0.0.1:1/preview",
};

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "dev", "--hostname", "127.0.0.1", "--port", PORT],
  { env, stdio: "inherit", shell: process.platform === "win32" }
);

child.on("exit", (code) => {
  process.exitCode = code ?? 0;
});
