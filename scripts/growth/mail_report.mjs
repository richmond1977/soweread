#!/usr/bin/env node
// 把最新一份成長機會週報（Neon 的 GrowthReport 表，見 scripts/growth/analyze.mjs）
// 寄給 Richmond。純文字信，SMTP 設定沿用既有 lead route 的環境變數慣例。
// 執行：node --env-file=.env.local scripts/growth/mail_report.mjs [--dry-run]
//
// --dry-run：只把主旨與內文印到 console，不呼叫 nodemailer、不真的寄信。
//
// 主旨刻意不解析 markdown 內文組成（移植規劃文件 docs/growth-weekly-report-migration.md
// 第 6 節風險 3）：來源端 mail_report.mjs 用正則反解報告標題取代主旨的日期區間，
// 報告標題文字一改，正則就配不到，主旨會靜默變成空字串——而來源端 CI 對寄信步驟
// 又是 continue-on-error，所以沒人會發現。這裡改成直接用 GrowthReport 資料表裡的
// startDate / endDate 欄位組字串，不依賴 markdown 內文格式。
//
// SMTP 未設定時直接報錯退出（不是像來源端那樣優雅跳過）：SOWEREAD 版本的排程
// workflow 對這一步不設 continue-on-error，寄信失敗就要讓整個 job 失敗，
// Richmond 才會在 GitHub Actions 收到通知（同一份風險 3 的另一半）。
//
// 需要的環境變數：
//   SMTP_HOST / SMTP_USER / SMTP_PASS（必要）
//   SMTP_PORT / SMTP_SECURE / SMTP_FROM（可省，有預設值）
//   GROWTH_REPORT_TO（收件人，必要——見 .env.production.example 說明）
//   DATABASE_URL（Prisma 連線，沿用既有慣例）

import './lib/env.mjs';
import { PrismaClient } from '@prisma/client';

const DRY_RUN = process.argv.includes('--dry-run');

function buildSubject(report) {
  return `【潤讀成長引擎】機會週報 ${report.startDate}~${report.endDate}`;
}

async function main() {
  const prisma = new PrismaClient();
  let report;
  try {
    report = await prisma.growthReport.findFirst({ orderBy: { endDate: 'desc' } });
  } finally {
    await prisma.$disconnect();
  }

  if (!report) {
    console.error('❌ GrowthReport 表是空的，尚未跑過 npm run growth:analyze，不寄空信。');
    process.exit(1);
  }

  const subject = buildSubject(report);
  const content = report.markdown;

  if (DRY_RUN) {
    console.log(`[dry-run] 主旨：${subject}`);
    console.log('[dry-run] 內文：');
    console.log(content);
    return;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.error('❌ 未設定 SMTP（SMTP_HOST/SMTP_USER），無法寄信。');
    process.exit(1);
  }
  if (!process.env.GROWTH_REPORT_TO) {
    console.error('❌ 未設定 GROWTH_REPORT_TO（收件人），無法寄信。');
    process.exit(1);
  }

  const to = process.env.GROWTH_REPORT_TO;
  const nodemailer = (await import('nodemailer')).default;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE != null ? String(process.env.SMTP_SECURE) === 'true' : port === 465;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: content,
  });

  console.log(`✅ 週報已寄給 ${to}（endDate=${report.endDate}）`);
}

main().catch((e) => {
  console.error('❌ 寄信失敗：', e.message);
  process.exit(1);
});
