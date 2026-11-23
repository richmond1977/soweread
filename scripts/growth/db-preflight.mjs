#!/usr/bin/env node
// 寫入 growth 內容前的資料庫預檢（給 .github/workflows/growth-content.yml 用）。
//
// 為什麼需要：repo secret 只有一個 DATABASE_URL，而 growth 站與 WordPress 鏡像
// 站絕不能共用資料庫（見 .env.production.example「Per-role databases」）。如果
// secret 指到的不是 growth 資料庫，seed 會把知識內容寫進錯的庫。這支腳本只讀不寫：
// 確認目標庫裡已經有公開的 growth 實體與主題，才放行後面的 seed。
//
// 可選：--expect-entity <slug> 一併印出該實體目前的 seoTitle／seoDescription，
// 方便在 Actions log 對照寫入前後。

import { PrismaClient } from '@prisma/client';

const args = process.argv.slice(2);
const expectIndex = args.indexOf('--expect-entity');
const expectSlug = expectIndex >= 0 ? args[expectIndex + 1] : null;

const prisma = new PrismaClient();
try {
  const [entities, topics] = await Promise.all([
    prisma.entity.count({ where: { publicationStatus: 'published' } }),
    prisma.topic.count(),
  ]);
  const host = (() => {
    try {
      return new URL(process.env.DATABASE_URL).host;
    } catch {
      return '（無法解析）';
    }
  })();
  console.log(`目標資料庫主機：${host}`);
  console.log(`公開實體 ${entities} 筆、主題 ${topics} 筆`);

  if (entities === 0 || topics === 0) {
    console.error('❌ 目標資料庫沒有任何公開的 growth 實體或主題，看起來不是 growth 資料庫；停止，不寫入。');
    process.exit(1);
  }

  if (expectSlug) {
    const entity = await prisma.entity.findUnique({
      where: { slug: expectSlug },
      select: { seoTitle: true, seoDescription: true },
    });
    if (!entity) {
      console.error(`❌ 目標資料庫找不到實體 ${expectSlug}；停止，不寫入。`);
      process.exit(1);
    }
    console.log(`${expectSlug} 目前 seoTitle：${entity.seoTitle}`);
    console.log(`${expectSlug} 目前 seoDescription：${entity.seoDescription}`);
  }

  console.log('✅ 預檢通過');
} finally {
  await prisma.$disconnect();
}
