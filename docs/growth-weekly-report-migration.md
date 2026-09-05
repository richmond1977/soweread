# SEO / GEO 成長機會週報 —— 移植規劃

> 來源：`D:\WISECODE_Website\scripts\growth\`（`growth.yml` 週一排程版）
> 目標：`D:\SOWEREAD`（public repo，三角色部署：growth / primary / backup）
> 狀態：規劃定案，Phase 0 開工中

## 0. 為什麼不能直接複製

來源端的設計建立在兩個 WISECODE_Website 特有的前提上，這兩個前提在 SOWEREAD 都不成立：

1. **repo 為 private**——週報把 GSC 全量 query 與 Gemini 回答全文（單週約 500 KB）`git commit` 回 repo。SOWEREAD 是 **public repo**（`gh repo view` 確認），照抄會把搜尋成效與 AI 回答全文公開。
2. **資料語意全部硬編**（題庫、品牌詞、自家網域、分組）在 `scripts/growth/lib/ai-sources.mjs` 裡，沒有設定檔。照搬會拿 WISECODE 的專利業題目去問 Gemini，數字照樣跑得出來但完全無意義。

## 1. 已拍板的四個分歧點

| # | 議題 | 決定 |
|---|---|---|
| 1 | GSC property 涵蓋範圍 | **growth + primary 兩個 property**，backup 排除（本來就 `noindex`） |
| 2 | 題庫來源 | 從 `docs/So We Read 潤讀 SEO × GEO Growth Plan v0.1.md` §16 Cluster A–F、§18 Query Strategy、§19 第一批 20 個 Explainers 萃取，寫進 `config/growth.json` |
| 3 | 報告儲存 | **Neon（Prisma model）**，不進 git，為未來 `/admin` 內部頁保留擴充路徑 |
| 4 | GEO 引用追蹤是否進第一版 | **延到 Phase 4**（唯一花錢的部分），Phase 1–3 先做免費的 GSC 三層分析 |

## 2. Gemini 呼叫方式的決定（2026-09-05 更新：已放棄 Batch API，改回同步 + grounding）

**這節的決定被推翻過一次，記錄兩個版本是為了讓之後的 session 知道為什麼，不要照舊版本做。**

**第一版決定（2026-09-04，已作廢）**：來源端 `gemini-grounded.mjs:5-11` 的註解明講「刻意不用 Batch Mode，因為 batch 端點下 `google_search` grounding 會靜默失效」。Richmond 當時知悉此限制，仍選擇 Batch API（非同步批次端點）以壓低成本，代價是訊號從「即時 grounding 引用率」降級為「模型既有知識代理指標」。

**推翻原因（2026-09-05）**：Phase 4 實際開發時發現，`GEMINI_API_KEY` 送出真實 Batch API 請求得到 `400 FAILED_PRECONDITION`——這是 Google 的已知行為：**Batch API 需要專案已啟用付費計費層級，免費層 key 完全不能用**，與請求內容無關（用同一把 key 打同步 `generateContent` 完全正常）。Richmond 得知這個帳戶端限制後，決定**放棄 Batch API**，改回同步呼叫。由於「不帶 grounding」原本唯一的理由就是「batch 下 grounding 會失效」，這個理由隨 batch 一起消失，Richmond 進一步決定**恢復 `google_search` grounding**——沒有理由在同步呼叫上還自我限制拿掉這個訊號。

**現行決定（2026-09-05 起生效）**：

- 同步 `generateContent`，**帶** `google_search` grounding tool。跟來源端 `gemini-grounded.mjs` 的技術路線一致。
- 量測的訊號因此是**真實的即時搜尋 grounding 後引用率**，不是代理指標。GEO 章節的免責聲明文字要跟著改：不再是「模型既有知識代理指標」那種保守措辭，而是要誠實揭露的是**取樣量小**（一週 24 題、每題預設 1 次取樣）帶來的統計雜訊，不是量測對象本身的侷限。
- 呼叫方式改回單一同步腳本（`check_citations.mjs`），不需要來源端曾經有過的「送出→輪詢→取回」兩階段設計——同步呼叫在單次 CI 執行內就能拿到全部結果，`CitationBatchJob` 這張為非同步 batch 設計的表（`pending`/`completed` 狀態機、`batchJobId`）因此也跟著簡化掉，改用一張「一次執行、一次寫入結果」的表（結構比照 `GrowthSnapshot`/`GrowthReport` 的單次寫入模式，不要留著用不到的 batch 專屬欄位）。
- 成本：同步 grounding 呼叫按次計費（比純文字生成貴，但不是 batch 那種批次折扣價）。24 題/週，若要用多次取樣做多數決會等比放大成本，第一版先每題 1 次取樣，取樣策略之後可依實際雜訊狀況調整。

## 3. 目標檔案結構

```
.github/workflows/growth.yml          新增（週一排程 + workflow_dispatch）
config/growth.json                    新增（唯一的專案語意來源：題庫、網域、品牌詞、分組）
scripts/growth/
  authorize.mjs                       移植，只改 redirect port
  ingest_gsc.mjs                      移植，改為多 site 迴圈（growth + primary）
  ingest_ai.mjs                       移植，KV 段改讀 Neon
  check_citations.mjs                 移植，同步呼叫＋grounding（2026-09-05 起：見第 2 節，非 Batch API）
  analyze.mjs                         移植骨架，渲染層依 config 重寫，拿掉 WISECODE 歷史事件註解
  mail_report.mjs                     移植，主旨改為由資料直接組成（見風險 3）
  smoke-test.mjs                      移植
  lib/google-auth.mjs                 原樣移植
  lib/citation-stats.mjs              原樣移植（純函式，含既有測試）
  lib/gemini-grounded.mjs             新增（同步 generateContent + google_search grounding）
  lib/load-config.mjs                 新增（取代硬編的 ai-sources.mjs，讀 config/growth.json）
  lib/env.mjs                         新增（取代 ../radar/load_env.mjs 的相對路徑依賴）
  __tests__/citation-stats.test.mjs   移植，掛進 `npm run test:backup` 同一組
prisma/schema.prisma                  新增 GrowthSnapshot / AiBotHit / CitationCheck 三個 model
src/proxy.ts                          修改：AI bot UA 命中時記一筆到 AiBotHit
src/lib/growth/ai-bots.ts             新增（UA 清單，proxy 與腳本共用）
.env.production.example               補 GOOGLE_OAUTH_*／GA4／GEMINI／GSC 等變數
```

`ai-sources.mjs` 不移植——它就是硬編語意的集中地，由 `config/growth.json` + `load-config.mjs` 取代。

## 4. 分階段實作與驗收

| Phase | 內容 | 驗收條件 |
|---|---|---|
| **0. 憑證與骨架** | `lib/env.mjs`、`lib/google-auth.mjs`、`authorize.mjs`、`smoke-test.mjs`；補 `.env.production.example` | `node scripts/growth/smoke-test.mjs` 成功取得 access token 並列出可存取的 GSC property（需 Richmond 在 Google Cloud Console 建 OAuth client 並跑一次 `growth:auth` 取 refresh token——這步無法由我代為完成） |
| **1. GSC 取數與分析（免費）** | `ingest_gsc.mjs` 多站版 + `analyze.mjs` 三層分類；快照寫 Neon（新增 `GrowthSnapshot` model + migration） | 手動 `npm run growth:refresh` 產出一份 Markdown，三個章節都有列；`prisma studio` 看得到快照列 |
| **2. 設定外部化與品牌重寫** | 建 `config/growth.json`；從 Growth Plan §16/§18/§19 萃取題庫與分組；清掉來源端報告內文所有 WISECODE 歷史事件註解 | `grep -ri "wisecode\|知典\|專利"` 在 `scripts/growth/` 與 `config/` 下零命中 |
| **3. 排程與寄信** | 新增 `.github/workflows/growth.yml`（`0 2 * * 1`）+ GitHub Secrets；`mail_report.mjs` 主旨改「【潤讀成長引擎】」且不再反解 Markdown 標題 | `workflow_dispatch` 手動觸發成功一次，信件收到且主旨非空字串 |
| **4. GEO 層（選配、有成本）** | `check_citations.mjs`（同步）+ `lib/gemini-grounded.mjs`；`CitationCheck` model 取代原本為 Batch 設計的 `CitationBatchJob`；`ai-bots.ts` + `proxy.ts` 計數 + `AiBotHit` model；GA4 AI referrer | 24 題實際跑完一輪、寫入 `CitationCheck`；引用率表有數字；連續兩週後趨勢表有兩列 |

Phase 1 結束即有可用週報。Phase 4 為加值，2026-09-05 起量測的是真實 grounding 引用率（見第 2 節，非代理指標）。

## 5. 成本

```
⚠️  COST IMPACT WARNING
───────────────────────────────────────────────
Change  : Phase 4 每週對約 24 題送出帶 google_search grounding 的同步請求
Resource: Gemini API 同步 generateContent + grounding（非 Batch，2026-09-05 起）
Impact  : unknown — needs pricing check。grounding 呼叫按次計費，比純文字生成貴，
          且無 Batch API 的批次折扣；24 次/週的量級預期仍是個位數美元/月，
          但需在第一次真實跑完整批後用實際帳單核實
Reason  : 追蹤潤讀在 AI 答案中被即時引用的比率（GEO 的核心直接指標）
───────────────────────────────────────────────
```
Phase 0–3 不產生任何新費用（GSC / GA4 API 免費；GitHub Actions 在 public repo 免費；Neon 增加儲存量級可忽略）。

## 6. 五個必須擋掉的移植陷阱

1. **公開 repo 資料外洩**：來源端 `git add data/growth/` 若照抄，會把完整搜尋 query 與 AI 回答推上公開 GitHub。移植第一天就不做這個步驟，改存 Neon。
2. **語意硬編**：不抽成 `config/growth.json` 就會產出一份看似正常、實則測量錯對象的報告。
3. **寄信靜默失敗**：來源端 `mail_report.mjs` 用正則反解報告標題組主旨，CI 對寄信是 `continue-on-error`，改標題會讓主旨變空字串且沒人知道。移植版主旨改由資料（區間、website 名稱）直接組成。
4. **相對路徑依賴**：來源端 8 支腳本全部 import `../radar/load_env.mjs`。移植版一律改用自寫的 `lib/env.mjs`。
5. **GEO 爬蟲節空轉**：`src/proxy.ts` 已有角色守衛與轉址邏輯，插入 AI bot 計數要避免破壞既有行為；且必須換成 Neon 寫入，不是 KV。

## 7. 待 Richmond 手動完成的前置作業（Phase 0 無法代辦）

- Google Cloud Console 建立 SOWEREAD 專用 OAuth client（`webmasters.readonly` + `analytics.readonly` scope）
- 在 GSC 後台確認 growth / primary 兩個 property 的存取權限
- 跑一次 `npm run growth:auth` 取得 refresh token，填入 `.env.local`
- 若要啟用 Phase 4，需確認 `GEMINI_API_KEY`（已存在於 `.env.local`）具備 Batch API 存取權限
