#!/usr/bin/env node
// GSC 取數（Phase 1）：對 growth／primary 兩個 Search Console property 各拉一次
// Search Analytics 資料，寫入 Neon 的 GrowthSnapshot——不落地成檔案、不進 git。
// 執行：node --env-file=.env.local scripts/growth/ingest_gsc.mjs
//
// 這是移植規劃文件（docs/growth-weekly-report-migration.md）第 6 節陷阱 1 的
// 直接對應：來源端把整包 GSC query 資料 commit 回 public repo，SOWEREAD 是
// public repo，改成寫進 Neon，用 (site, endDate) 當 upsert 鍵，重跑不會重複。
//
// GSC 資料約有 2–3 天延遲，日期區間算法沿用來源端 ingest.mjs：結束於 3 天前、
// 往前 28 天、dataState: 'final'。

import './lib/env.mjs';
import { PrismaClient } from '@prisma/client';
import { googlePost } from './lib/google-auth.mjs';
import { loadGrowthSites } from './lib/load-config.mjs';

const LOOKBACK_DAYS = Number(process.env.GSC_LOOKBACK_DAYS || 28);
const LAG_DAYS = 3; // GSC 資料延遲緩衝
const ROW_LIMIT = 5000;

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function dateRange() {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - LAG_DAYS);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - LOOKBACK_DAYS + 1);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

async function query(gscSiteUrl, range, dimensions) {
  const encoded = encodeURIComponent(gscSiteUrl);
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encoded}/searchAnalytics/query`;
  const data = await googlePost(url, {
    startDate: range.startDate,
    endDate: range.endDate,
    dimensions,
    rowLimit: ROW_LIMIT,
    dataState: 'final',
  });
  return (data.rows ?? []).map((r) => {
    const row = {
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    };
    dimensions.forEach((dim, i) => {
      row[dim] = r.keys[i];
    });
    return row;
  });
}

async function ingestSite(prisma, site, range) {
  console.log(`GSC 取數：${site.label}（${site.gscSiteUrl}）  ${range.startDate} ~ ${range.endDate}`);

  const [byQuery, byPage, byQueryPage] = await Promise.all([
    query(site.gscSiteUrl, range, ['query']),
    query(site.gscSiteUrl, range, ['page']),
    query(site.gscSiteUrl, range, ['query', 'page']),
  ]);

  console.log(`  query: ${byQuery.length} 列　page: ${byPage.length} 列　query+page: ${byQueryPage.length} 列`);

  const rawRows = { byQuery, byPage, byQueryPage };
  const fetchedAt = new Date();

  await prisma.growthSnapshot.upsert({
    where: { site_endDate: { site: site.site, endDate: range.endDate } },
    create: {
      id: `${site.site}-${range.endDate}`,
      site: site.site,
      startDate: range.startDate,
      endDate: range.endDate,
      rawRows,
      fetchedAt,
    },
    update: {
      startDate: range.startDate,
      rawRows,
      fetchedAt,
    },
  });
}

async function main() {
  const sites = loadGrowthSites();
  const range = dateRange();
  const prisma = new PrismaClient();

  try {
    for (const site of sites) {
      await ingestSite(prisma, site, range);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n✅ growth／primary 兩站的 GSC 快照已寫入 GrowthSnapshot。');
}

main().catch((e) => {
  console.error('\n❌ ingest 失敗：', e.message);
  process.exit(1);
});
