#!/usr/bin/env node
// 補齊既有快照的獨立 property 統計；不覆寫原 query/page rows、coverage 或 fetchedAt。
// 預設 dry-run；例：node scripts/growth/backfill_totals.mjs --end-date 2026-10-23 --apply
import './lib/env.mjs';
import { PrismaClient } from '@prisma/client';
import { loadGrowthSites } from './lib/load-config.mjs';
import { fetchPropertyTotals } from './lib/gsc-totals.mjs';
import { verifiedPropertyTotals } from './lib/report-metrics.mjs';
import { isCalendarDate } from './lib/experiments.mjs';

const args = process.argv.slice(2);
const index = args.indexOf('--end-date');
const endDate = index >= 0 ? args[index + 1] : undefined;
const apply = args.includes('--apply');
const prisma = new PrismaClient();
try {
  if (!isCalendarDate(endDate) || args.some((arg, i) => i !== index + 1 && !['--end-date', '--apply', '--dry-run'].includes(arg)) || (apply && args.includes('--dry-run'))) {
    throw new Error('用法：backfill_totals.mjs --end-date YYYY-MM-DD [--apply | --dry-run]');
  }
  const sites = loadGrowthSites();
  const snapshots = await prisma.growthSnapshot.findMany({ where: { endDate, site: { in: sites.map(s => s.site) } } });
  if (!snapshots.length) throw new Error('指定日期沒有可補齊的快照');
  for (const snapshot of snapshots) {
    if (verifiedPropertyTotals(snapshot)) { console.log(`${snapshot.site}: 已有同期間 property 統計，保留原值`); continue; }
    const site = sites.find(s => s.site === snapshot.site);
    const totals = await fetchPropertyTotals(site.gscSiteUrl, { startDate: snapshot.startDate, endDate });
    if (totals.status !== 'OBSERVED') throw new Error(`${snapshot.site}: ${totals.reason}；未寫入`);
    console.log(JSON.stringify({ mode: apply ? 'APPLY' : 'DRY-RUN', site: snapshot.site, propertyTotals: totals }));
    if (apply) {
      const result = await prisma.growthSnapshot.updateMany({
        where: { id: snapshot.id, startDate: snapshot.startDate, endDate, rawRows: { equals: snapshot.rawRows } },
        data: { rawRows: { ...snapshot.rawRows, propertyTotals: totals } },
      });
      if (result.count !== 1) throw new Error(`${snapshot.site}: 快照已同時更新，未覆寫`);
    }
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await prisma.$disconnect(); }
