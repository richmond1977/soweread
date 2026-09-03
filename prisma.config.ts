import { defineConfig } from "prisma/config";

// 取代已棄用的 package.json#prisma（Prisma 7 會移除該設定位置）。參考 https://pris.ly/prisma-config
//
// Prisma 一旦偵測到 config 檔就不再自動載入 .env，因此這裡依 Next 的順序自行補回，
// 讓本地的 prisma validate／migrate／db seed 仍拿得到 DATABASE_URL 與 DATABASE_DIRECT_URL。
// Vercel 上沒有 .env 檔，環境變數由平台注入，載入失敗直接略過。
for (const envFile of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(envFile);
  } catch {
    // 檔案不存在或無法讀取：交由平台環境變數接手。
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node prisma/seed.mjs",
  },
});
