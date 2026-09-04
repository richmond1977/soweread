#!/usr/bin/env node
// 連線測試：驗證 refresh token 有效，並列出可存取的 GSC 網站。
// 執行：node --env-file=.env.local scripts/growth/smoke-test.mjs
//
// 若有設 GA4_PROPERTY_ID_GROWTH / GA4_PROPERTY_ID_PRIMARY，額外對各自的 GA4
// property 打一筆最小報表確認也通。變數拆成 growth／primary 兩組，不是來源
// 端單一 GA4_PROPERTY_ID，理由是移植規劃第 1 節已拍板：要追蹤 growth 與
// primary 兩個角色各自的成效，不是只有一個網站。

import './lib/env.mjs';
import { googleGet, googlePost } from './lib/google-auth.mjs';

async function checkGa4(label, propertyId) {
  if (!propertyId) {
    console.log(`\n== GA4（${label}）==\n  （未設定，略過。）`);
    return;
  }
  console.log(`\n== GA4（${label}）：property ${propertyId} 最近 7 天 sessions ==`);
  const report = await googlePost(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'sessions' }],
    }
  );
  const value = report.rows?.[0]?.metricValues?.[0]?.value ?? '0';
  console.log(`  過去 7 天 sessions：${value}`);
}

async function main() {
  console.log('== 測試 access token 換取 ==');

  // 1) GSC：列出帳號可存取的網站清單
  console.log('\n== Search Console：可存取的網站 ==');
  const sites = await googleGet('https://www.googleapis.com/webmasters/v3/sites');
  const entries = sites.siteEntry ?? [];
  if (entries.length === 0) {
    console.log('（沒有任何網站。請確認登入的帳號在 GSC 有資源存取權。）');
  } else {
    for (const s of entries) {
      console.log(`  ${s.siteUrl}   [${s.permissionLevel}]`);
    }
  }

  // 2) GA4（選配）：growth 與 primary 各自的 property，兩者都沒設就都略過
  await checkGa4('growth', process.env.GA4_PROPERTY_ID_GROWTH);
  await checkGa4('primary', process.env.GA4_PROPERTY_ID_PRIMARY);

  console.log('\n✅ 連線測試完成。');
}

main().catch((e) => {
  console.error('\n❌ 測試失敗：', e.message);
  process.exit(1);
});
