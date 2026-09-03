# Handoff：SOWEREAD 增長站下一個切片

**建立日期：** 2026-09-03
**給誰：** 接手這個專案的新對話（假設沒有任何前次對話的記憶）
**先讀：** 本檔 → `docs/soweread-seo-geo-growth-plan.md`（計畫書）→ `docs/vercel-deployment-roles.md`（部署與角色）

---

## 0. 現況（已完成，不要重做）

### 已上線

**https://soweread.vercel.app** 以 `SITE_ROLE=growth` 運行。單一 Vercel Project（名稱 `soweread`），單一 Neon 資料庫。

`https://soweread.com` 是**獨立的 WordPress 主站**，不在 Vercel 上，**任何情況下都不要修改它**。

線上已驗證：growth 角色、`configIssues: 0`、`index, follow`、self-canonical、robots.txt 帶 sitemap、`/blog` 與 `/categories/*` 與 `/rss.xml` 回 404、Search Console 驗證檔 200、GA4 已在瀏覽器確認初始化、`/status` 顯示 `configHealthy: true`。

### 程式已完成

- `SITE_ROLE` 三角色（primary／growth／backup）＋ `unresolved` 的 fail-closed 隔離。
- 知識模型：`Topic`、`Entity`、`EntityRelation`、`Source`、`GrowthArticle` ＋ 4 個關聯表。
- Growth 頁面路由：`/`、`/topics`、`/topics/[slug]`、`/entities/[slug]`、`/articles/[slug]`。
- 每頁具備 self-canonical、JSON-LD（Article／CollectionPage／DefinedTerm／BreadcrumbList／Organization）、來源欄位、內部連結、導向主站的 CTA。
- GA4（僅 growth 角色載入，ID 經格式驗證）。
- Backup MVP（WordPress 每日鏡像、cron、read-only gate）**程式保留但未部署**。
- `npm run test:backup` → **54 個測試全過**。

### 資料庫

Neon 專案 `Soweread`，endpoint `ep-cold-dawn-ae1q09kn`（us-east-2）。4 個 migration 全部套用，`prisma migrate diff` 無 drift。

**資料庫目前沒有任何 growth 內容**（`Topic`／`Entity`／`GrowthArticle` 都是空的），所以 `/topics` 顯示「目前尚未發布任何主題」，sitemap 只有 `/` 與 `/topics`。這是刻意的，見 §2 的 fixture 說明。

### Vercel 環境變數

Production：`SITE_ROLE_RESOLUTION=env`、`SITE_ROLE=growth`、`NEXT_PUBLIC_SITE_URL=https://soweread.vercel.app`、`PRIMARY_SITE_URL=https://soweread.com`、`GROWTH_ENFORCE_CANONICAL_HOST=true`、`NEXT_PUBLIC_GA_MEASUREMENT_ID=G-FSYTV0011X`、`DATABASE_URL`、`DATABASE_DIRECT_URL`、`SESSION_SECRET`、`ADMIN_EMAIL`、`ADMIN_PASSWORD`。

Production **刻意沒有** `GROWTH_USE_FIXTURE`、`CRON_SECRET`、`WORDPRESS_API_URL`、`GROWTH_SITE_VERIFICATION`。

Preview：growth 五件套 ＋ `GROWTH_USE_FIXTURE=true`，但**目前只綁在 `codex/seo-ai-search-content-fields` 這一個分支**（Vercel CLI 非互動模式無法設 all Preview branches）。

Vercel 已改版：環境變數在 **Settings → Environments → 點該環境 → Environment Variables**。

### Git

- 預設分支 `main`，目前 `bc8b9e1`。工作分支 `codex/seo-ai-search-content-fields`。
- Production 追蹤 `main`，合併進 `main` 會自動部署。
- **worktree 有兩個必須保留、不要動的既有修改**：`.claude/settings.local.json`、`tsconfig.tsbuildinfo`。
- `soweread` 這個路徑的修改**現在是任務 A 的處理對象**（Richmond 已授權），見下。

---

## 1. 任務 A：修掉兩個 build warning（Richmond 已明確同意處理）

### A-1：孤兒 submodule（`Failed to fetch one or more git submodules`）

**診斷：** repo 索引裡有一個 gitlink（mode `160000`，SHA `9b6beb2`）指向路徑 `soweread`，但**沒有 `.gitmodules` 檔案**。實際上 `D:\SOWEREAD\soweread\` 是**這個 repo 自己的一份嵌套 clone**（remote 同為 `richmond1977/soweread.git`，本地 HEAD 在 `dd9560b`，約 2 MB，而且裡面還有再一層 `soweread/`）。Vercel 每次 build 都試圖抓這個 submodule，因為沒有 URL 可解析而發出警告。

對 build 無害（沒有任何程式碼 import `soweread/`），但會掩蓋真正的問題。

**建議修法**（移除 repo 裡的 gitlink，**不刪除本地目錄**）：

```bash
git rm --cached soweread
printf 'soweread/\n' >> .gitignore
```

**動手前必做：**
1. 確認 `soweread/` 裡沒有任何只存在於該處的檔案。它看起來是意外產生的嵌套 clone，但**請先向 Richmond 確認**再建議他刪除本地目錄。刪除本地目錄不在本任務範圍。
2. 確認移除後 `npm run build` 正常。
3. 確認 `git status` 不再出現 `M soweread`。

### A-2：Prisma 設定位置已棄用

**現象：** 每次 `prisma` 指令與 Vercel build 都出現
`warn The configuration property package.json#prisma is deprecated and will be removed in Prisma 7.`

**成因：** `package.json` 裡有 `"prisma": { "seed": "node prisma/seed.mjs" }`。Prisma 7 會移除這個位置，需改成 `prisma.config.ts`。

**風險（重要）：** Vercel 的 `postinstall` 會跑 `prisma generate`。改壞設定格式會**弄壞部署**。目前 Prisma 版本 `6.19.0`。

**要求：**
1. 先查該版本 `prisma.config.ts` 的正確格式（官方文件，不要憑記憶寫）。
2. 本地依序驗證：`npx prisma validate`、`npx prisma generate`、`npm run build`、`npm run test:backup`。
3. 確認 `prisma db seed` 仍能解析到 `prisma/seed.mjs`。
4. 確認警告真的消失。
5. 這個改動**必須先在 preview 部署驗證成功**，再合併進 `main`。不要直接推 `main`。

---

## 2. 任務 B：評估並發布具有獨立編輯價值的內容

Richmond 要求：**評估發布具有獨立編輯價值的主題頁、實體頁與知識整理，並導流至主站。**

這是本切片的重點，但**先評估、再實作**，不要直接開始寫大量內容。

### B-0：三個前置阻礙（必須先解決或明確排除）

1. **Growth 頁面完全沒有 CSS。** `src/app/globals.css` 裡沒有任何 `growth-*` 樣式，所有 growth 頁面目前是瀏覽器預設外觀。**在發布公開內容之前應該先做樣式**，否則就算內容好也不能給讀者看。相關 class 名稱在 `src/components/growth-shell.tsx`、`growth-home.tsx`。
2. **沒有編輯後台。** 知識模型只能透過 seed script 或直接寫資料庫建立內容。需要決定：先寫一個一次性的 seed script，還是先做最小後台（`draft` → `review` → `published` 狀態機）。
3. **Fixture 不能當成內容。** `src/data/growth-fixture.ts` 是技術驗證用的測試資料，**所有來源都是標明「佔位來源」的機構首頁 URL**。Production 刻意沒開 `GROWTH_USE_FIXTURE`。**絕對不要把 fixture 內容發布成正式頁面，也不要把佔位來源改個標題就當成真來源。**

### B-1：評估階段的產出

先給 Richmond 一份評估，內容包含：

1. **哪些主題值得開 Topic Hub**（計畫書 §6.1 建議 5–7 個，第一批不要全開）。判準：Richmond 有實際專業與素材、讀者真的會搜尋、能寫出主站沒有的獨立內容。
2. **哪些實體值得開 Entity Page**。判準見計畫書 §7 與 §9.3：內容與證據不足的實體**必須保持 draft**，不得產生公開薄頁。
3. **每一頁的來源清單**：實際可查證的官方機關、法規、論文 URL，含 publisher、published date、retrieval date。**這一步不能跳過，也不能事後補。**
4. **導流到主站的位置**：哪幾篇主站長文與哪個 growth 頁面真正相關。計畫書 §9.2 明確禁止每段硬塞 CTA。

### B-2：內容的硬性規則（來自計畫書，不可協商）

- **不得把主站文章全文或改寫版發布到 growth 站。** 換句話說規避重複內容也不行（§8.2）。
- WordPress 內容只能當**研究與導引來源**：metadata／摘要 → 內部候選主題 → 編輯建立 Claim／Source／Relation → **人工確認** → 才能發布。
- **不得建立假來源、假作者、假評價，或不可驗證的 Schema。** structured data 必須與頁面可見內容一致。
- 食安／營養內容必須**明確區分事實、推論、爭議與未知**（§9.3、§10）。優先使用官方機關、法規、原始研究。
- 顯示作者、審閱者、發布日與**實質**更新日。**不得因為排程重跑就虛假更新 `dateModified`**。
- 任何對外顯示的關係都必須能回到可閱讀的來源。程式已強制這點：`publicRelationsForEntity()` 會隱藏沒有來源的關係。
- 只有 `publicationStatus`／`editorialStatus` 等於 `published` 的資料才會出現在公開頁面與 sitemap。

### B-3：導流策略（§11）

允許：內文相關長文連結、「前往潤讀主站閱讀完整評論」CTA、品牌介紹頁連結、Newsletter 入口。

**禁止：growth 內容頁自動 307/308 導向主站** —— 那樣 growth 站永遠形成不了自己的可索引內容。程式已強制：growth 角色不做全站 redirect。

---

## 3. 驗證要求（每次交付都要做）

```bash
npm run test:backup      # 目前 54 個測試，不得減少或失敗
npx prisma validate
npx prisma generate
npm run build
```

外加：

- 針對新行為補 deterministic test。
- 起 production server（或用 preview 部署）**實際讀取 HTML**，檢查 canonical、meta robots、JSON-LD、內部連結。
- 確認新內容出現在 sitemap，且 draft 內容**沒有**出現。
- 確認 `/blog`、`/categories/*`、`/rss.xml` 在 growth 角色仍然 404。
- 檢查最終 `git diff`，確認沒有覆蓋無關的 dirty changes。

本地跑 growth 站的環境變數範例：

```bash
SITE_ROLE_RESOLUTION=env
SITE_ROLE=growth
NEXT_PUBLIC_SITE_URL=http://localhost:3100
PRIMARY_SITE_URL=https://soweread.com
GROWTH_USE_FIXTURE=true      # 只在本地／preview
```

---

## 4. 邊界（不可協商）

- **不要修改 `https://soweread.com`**，不要在主站安裝外掛，只使用公開 REST API 的 `GET`。
- **不要部署到 Cloudflare。**
- **不要把 robots.txt 當成私人存取控制。**
- **不要建立假來源、假作者、假評價或不可驗證的 Schema。**
- **不要讓排程同步直接發布 growth 內容。**
- **不要提交或推送 Git，除非 Richmond 在該對話明確授權。**
- **不要把密碼類憑證（資料庫連線字串等）寫進任何服務設定** —— 那是 Richmond 自己做的事，請提供他確切要填的值與位置。
- **不得破壞現有的 Backup MVP 程式。**
- 保留 `.claude/settings.local.json` 與 `tsconfig.tsbuildinfo` 的既有修改。
- 會產生雲端費用的變更（新資料庫、儲存、付費 API）**先停下、輸出費用警告、等 Richmond 批准**。

---

## 5. 關鍵檔案地圖

| 檔案 | 用途 |
|---|---|
| `src/lib/site-config.ts` | 角色解析、fail-closed 判斷、canonical base、robots 決策 |
| `src/lib/request-site-config.ts` | 逐請求解析（env 模式不呼叫 `headers()`，保留靜態） |
| `src/proxy.ts` | 角色 URL 空間互斥、`X-Robots-Tag`、canonical host 308、ownership 檔案放行 |
| `src/lib/growth/knowledge-core.ts` | **純函式**選擇器（published 過濾、關係來源強制、sitemap 路徑）— 測試都打這裡 |
| `src/lib/growth/knowledge.ts` | 資料庫載入 ＋ fixture fallback |
| `src/data/growth-fixture.ts` | 測試資料（佔位來源）。**不是內容** |
| `src/components/growth-shell.tsx` | 版面外殼、來源清單、CTA（CSS class 名稱在這裡） |
| `src/components/growth-json-ld.tsx` | 所有 growth JSON-LD |
| `src/app/{topics,entities,articles}/` | Growth 頁面路由 |
| `src/app/robots.ts`、`sitemap.ts` | 按角色分流 |
| `prisma/schema.prisma` | 知識模型（`GrowthArticle` 刻意與 `Post` 分離） |
| `docs/soweread-seo-geo-growth-plan.md` | 計畫書（權威來源） |
| `docs/vercel-deployment-roles.md` | 部署、角色行為對照表、環境變數 |

---

## 6. 建議執行順序

1. **任務 A**（兩個 warning）—— 獨立、低風險、已授權，先清掉。
2. **Growth 頁面 CSS** —— 讓 Richmond 看得到版面，才好判斷內容模型對不對。
3. **任務 B 的評估報告** —— 主題／實體清單 ＋ 真實來源 ＋ 導流位置，交 Richmond 確認。
4. Richmond 確認後，才實作內容建立機制（seed script 或最小後台）與第一批 cornerstone 頁面。

**不要跳過第 3 步直接產生內容。**

---

## 7. 仍待 Richmond 決定的事

- `soweread/` 嵌套 clone 裡是否有需要保留的東西（任務 A-1）。
- 是否需要 cookie consent gate（目前 GA 在頁面載入後直接啟動；客群以台灣為主，個資法未如 GDPR 要求事前同意，但若預期歐盟訪客則需要）。
- 第一批要開哪些主題（任務 B-1 的評估要先給他看）。
- 是否要把 Preview 環境變數從單一分支放寬到所有預覽分支。
- 何時從 `*.vercel.app` 遷移到自有網域。**建議在累積大量內容之前就遷移** —— `vercel.app` 網域屬於 Vercel、無法轉移，之後搬家只能靠 301 帶走部分排名。
