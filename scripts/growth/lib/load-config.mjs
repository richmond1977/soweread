/**
 * 讀取 config/growth.json 的業務設定（品牌詞、門檻、CTR 基準曲線），並組合
 * growth／primary 兩站的 GSC 存取資訊供 ingest_gsc.mjs／analyze.mjs 共用。
 *
 * 設計原則：
 *  - config/growth.json 會被 commit 進這個 public repo，所以只放跟部署環境
 *    無關的業務語意；GSC site URL 一律來自環境變數（GSC_SITE_URL_GROWTH／
 *    GSC_SITE_URL_PRIMARY，定義於 .env.production.example），不進 config。
 *  - 必要欄位缺漏就丟錯，不靜默補預設值——分析門檻或曲線用錯值，比腳本
 *    直接中止危險得多（規劃文件第 6 節陷阱 2：語意硬編會產出看似正常、
 *    實則量錯對象的報告；沉默的預設值是同一種風險的另一種樣貌）。
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_PATH = join(process.cwd(), 'config', 'growth.json');

const REQUIRED_FIELDS = [
  'brandTerms',
  'minImpressions',
  'strikingMinPosition',
  'strikingMaxPosition',
  'ctrGapMaxPosition',
  'ctrBenchmarkByPosition',
];

let cachedConfig = null;

export function loadGrowthConfig() {
  if (cachedConfig) return cachedConfig;

  let raw;
  try {
    raw = readFileSync(CONFIG_PATH, 'utf-8');
  } catch (e) {
    throw new Error(`讀不到 ${CONFIG_PATH}：${e.message}`);
  }

  const config = JSON.parse(raw);
  const missing = REQUIRED_FIELDS.filter((key) => config[key] === undefined);
  if (missing.length > 0) {
    throw new Error(`config/growth.json 缺少必要欄位：${missing.join('、')}`);
  }
  if (
    !Array.isArray(config.ctrBenchmarkByPosition?.curve) ||
    config.ctrBenchmarkByPosition.curve.length === 0
  ) {
    throw new Error('config/growth.json 的 ctrBenchmarkByPosition.curve 必須是非空陣列');
  }

  cachedConfig = config;
  return config;
}

// Phase 4 GEO 題庫（citationQueries）不是 REQUIRED_FIELDS 的一員：Phase 1-3 的
// config/growth.json 沒有這個欄位也要能正常跑 GSC 分析，缺欄位不該讓整個
// loadGrowthConfig() 炸掉。只有真的要跑引用追蹤或渲染 GEO 章節時才需要，由呼叫端
// 自己檢查（2026-09-05：原本的 submit_citations_batch.mjs／collect_citations_batch.mjs
// 已刪除，見 docs/growth-weekly-report-migration.md 第 2 節——Batch API 與同步
// grounding 皆因免費層 API key 的計費層級限制而打不通，Phase 4 目前暫停，待
// Richmond 決定是否開通計費）。
export function loadCitationQueries(config = loadGrowthConfig()) {
  const queries = config.citationQueries;
  if (!Array.isArray(queries) || queries.length === 0) {
    throw new Error('config/growth.json 缺少非空的 citationQueries 陣列（GEO 題庫）');
  }
  for (const q of queries) {
    if (!q.id || !q.cluster || !q.query) {
      throw new Error(`config/growth.json 的 citationQueries 有題目缺 id/cluster/query：${JSON.stringify(q)}`);
    }
  }
  return queries;
}

// 依 GSC 排名查預期 CTR：取第一個 maxPosition >= position 的區間；
// 曲線最後一筆的 maxPosition 應涵蓋所有更差的排名（見 config/growth.json）。
export function expectedCtr(position, config = loadGrowthConfig()) {
  const curve = config.ctrBenchmarkByPosition.curve;
  for (const bucket of curve) {
    if (position <= bucket.maxPosition) return bucket.ctr;
  }
  return curve[curve.length - 1].ctr;
}

// growth + primary 兩站的 GSC 存取設定。domain 只用來在報告裡顯示，
// 沿用 src/lib/site-config.ts 既有的環境變數名稱與 fallback 網域，
// 不另外發明一套（regarding growth 站在 SOWEREAD 目前的實際網域是
// https://soweread.vercel.app，primary 是 WordPress 主站 https://soweread.com——
// 見 docs/handoff-next-slice.md、src/lib/site-config.ts 的 FALLBACK_PRIMARY_SITE_URL）。
export function loadGrowthSites(env = process.env) {
  const sites = [
    {
      site: 'growth',
      gscSiteUrl: env.GSC_SITE_URL_GROWTH,
      domain: env.GROWTH_SITE_URL || 'https://soweread.vercel.app',
      label: '潤讀成長站',
    },
    {
      site: 'primary',
      gscSiteUrl: env.GSC_SITE_URL_PRIMARY,
      domain: env.PRIMARY_SITE_URL || 'https://soweread.com',
      label: '潤讀主站',
    },
  ];

  const missing = sites.filter((s) => !s.gscSiteUrl).map((s) => `GSC_SITE_URL_${s.site.toUpperCase()}`);
  if (missing.length > 0) {
    throw new Error(
      `缺少環境變數：${missing.join('、')}。請在 .env.local 補上 GSC 網站 URL` +
        '（primary 通常是 domain 屬性字串，如 sc-domain:soweread.com；' +
        'growth 是 vercel.app 網址前綴屬性，例如 https://soweread.vercel.app/——' +
        '需與 Google Search Console 內登記的屬性字串完全一致，包含結尾斜線）。'
    );
  }

  return sites;
}
