# Vercel 部署：primary／growth／backup 角色隔離

**狀態（2026-09-03）：growth 已完成部署並上線。** https://soweread.vercel.app

線上實測：`SITE_ROLE=growth`、`configIssues: 0`、首頁 `潤讀知識站`、`index, follow`、self-canonical、robots.txt 帶 sitemap、`/blog` 與 `/rss.xml` 回 404、Search Console 驗證檔 200、GA4 已在瀏覽器確認實際初始化、cron 回 `200 {"skipped":true}`、`/status` 顯示 `configHealthy: true`。

資料庫：舊的 Neon（`ep-empty-butterfly`）已由 Richmond 刪除；現用新資料庫（`ep-cold-dawn`），4 個 migration 全部套用、`migrate diff` 無 drift。

**目前站上沒有內容**（`/topics` 顯示「尚未發布任何主題」，sitemap 只有 `/` 與 `/topics`）。Production 刻意**不開** `GROWTH_USE_FIXTURE`：fixture 是標示為測試資料、來源為佔位 URL 的內容，用 `index, follow` 送進索引會違反「不建立假來源、不假裝已查證」的邊界。

> Vercel 已改版：環境變數不再是單一頁面，改為 **Settings → Environments → 點該環境（Production／Preview）→ Environment Variables**。

## 0. 目前決策（2026-09-03，優先讀這節）

- **優先目標是 SEO／GEO 增長**，備援次要。
- **只部署 growth**，一個 Vercel Project，一個 Neon 資料庫。
- Vercel Project 名稱 **`soweread`**，growth 網域 **`https://soweread.vercel.app`**。
- backup 的程式碼**保留但不部署**（`SITE_ROLE=backup` 隨時可啟用）。

因為只跑一個角色，就只需要一個 hostname，所以：

- **`SITE_ROLE_RESOLUTION=env` + `SITE_ROLE=growth`**（不用 host 模式）。
- 單一 Vercel Project 成立。
- 不會有「growth 與 backup 共用鏡像 DB」的問題——那個資料庫裡根本沒有 WordPress 鏡像。
- 整站保留靜態／SSG（host 模式才會強制 dynamic render）。

**唯一必要的設定清單見 §2.1。其他章節（§2.2 backup、§3 host 模式）是日後要啟用備援時才需要。**

一個 Neon 資料庫在這個設定下是安全的，原因是知識模型刻意用了獨立的 `GrowthArticle` model，沒有沿用 `Post`：

```text
同一個 DB
├── Topic / Entity / EntityRelation / Source / GrowthArticle   ← growth 公開內容
└── Post / Category / Author / SyncState                        ← 主站文章（growth 網域上 404）
```

即使日後把 WordPress 鏡像同步進同一個資料庫，鏡像列會落在 `Post`，而 growth 頁面只讀 `GrowthArticle`／`Topic`／`Entity`，**結構上無法把鏡像變成 growth 公開文章**。加上 growth 角色對 `/blog`、`/categories`、`/rss.xml` 一律 404，重複內容的路徑是封死的。

> 唯一仍然禁止的組合：在**同一個 Project** 用 host 模式同時跑 growth 與 backup 卻只給一條連線字串——那種情況程式會 fail closed 拒絕服務，因為兩個公開角色會真的共用鏡像資料。

## 1. 兩種拓樸（背景）

同一個 repo 支援兩種部署方式。程式碼相同，差別只在環境變數。

| | 單一 Vercel Project | 兩個 Vercel Project（用 Vercel 網域時的唯一可行方案） |
|---|---|---|
| `SITE_ROLE_RESOLUTION` | `host` | `env` |
| 角色來源 | 每個 request 的 `Host` header | `SITE_ROLE` 環境變數 |
| 網域 | 兩個網域掛在同一個 Project | 各自一個 Project |
| DB | `GROWTH_DATABASE_URL` 與 `BACKUP_DATABASE_URL` 兩條連線字串同存於一個 runtime | 各 Project 一條 `DATABASE_URL` |
| 隔離保證 | **程式碼層**（role 解析 + DB 分流 + 衝突 fail closed） | **基礎設施層**（兩個 runtime 互不可見） |
| 部署耦合 | 一次 deploy 同時影響 growth 與 backup | 可各自 rollback |
| 靜態快取 | 全站 dynamic render | primary 維持靜態／SSG |

### 單一 Project 的已知代價

1. **鏡像 DB 的隔離降級。** 計畫書 §13 要求「兩個 deployment 不共用可意外公開的完整鏡像 DB」。單一 Project 無法用基礎設施保證這件事，因為兩條連線字串都在同一個 runtime。程式碼補上三道防線：
   - 角色依 Host 解析，未知 host 直接 `503`。
   - Prisma client 依角色選 datasource（`getPrismaForRole`）。
   - `GROWTH_DATABASE_URL === BACKUP_DATABASE_URL` 時兩個角色都 fail closed，growth 不出任何內容。
2. **失去靜態快取。** `SITE_ROLE_RESOLUTION=host` 會讓 root layout 讀 `headers()`，整站變成 dynamic render。primary 若也放在同一個 Project 會一起受影響。
3. **無法獨立 rollback。** growth 出問題時 backup 會一起被回退。

若日後這三點造成困擾，把 `SITE_ROLE_RESOLUTION` 改成 `env` 並拆成兩個 Project 即可，**不需要改任何程式碼**。

## 1.5 使用 Vercel 提供的網域（`*.vercel.app`）

Richmond 決定 growth 先用 Vercel 提供的網域。這個決定有兩個直接後果。

### 後果一：一個 Project 只能有一個角色

Vercel **不允許**在預設的 `.vercel.app` 上自建子網域——每個 Project 的 `.vercel.app` 名稱由 Project 名稱決定，無法額外掛第二個任意名稱。

host 模式的角色解析需要**兩個穩定且不同的 hostname**，而一個 Project 只有一組由 Project 名稱決定的 `.vercel.app`。結論：

- **單一 Project ＋ Vercel 網域 ＋ 只跑 growth → 成立**（目前的做法，用 `SITE_ROLE_RESOLUTION=env`）。
- **單一 Project ＋ Vercel 網域 ＋ 同時跑 growth 與 backup → 無法成立**，湊不出第二個 hostname。
- 日後真的要開備援：再建**第二個 Project**，自動取得自己的 `.vercel.app`，設 `SITE_ROLE=backup` 即可。

```text
Project soweread         → https://soweread.vercel.app          SITE_ROLE=growth   ← 現在只做這個
Project soweread-backup  → https://soweread-backup.vercel.app   SITE_ROLE=backup   ← 延後
```

兩者都用 `SITE_ROLE_RESOLUTION=env`，**不需要改任何程式碼**。

### 後果二：必須處理 alias 重複內容

一個 Vercel Project 的 production 部署會同時回應多個 `.vercel.app` alias。以 Project 名稱 `soweread` 為例，`soweread.vercel.app` 與 `soweread-<scope-slug>.vercel.app` 都會回同一份內容。若不處理，growth 站會自己跟自己重複。

canonical 定為 **`https://soweread.vercel.app`**。

Production 設定 `GROWTH_ENFORCE_CANONICAL_HOST=true`，非 canonical 的 alias 會 **308** 導到 `NEXT_PUBLIC_SITE_URL` 的 host。Preview 保持 `false`，預覽網址才進得去。

### `*.vercel.app` 的 SEO 限制（請先接受再上線）

1. **不是你的資產。** 網域屬於 Vercel，無法轉移。日後換成自有網域時，累積的排名只能靠 301 部分帶走，網域本身帶不走。這與計畫書 §3.1「建立由 Richmond 自主控制的搜尋流量入口」有落差。
2. **Search Console 只能用 URL-prefix property。** 無法做 DNS 驗證的 domain property。用 `GROWTH_SITE_VERIFICATION` 放 meta tag token 驗證。
3. **`vercel.app` 在 Public Suffix List 上**，所以 cookie 與網站邊界是獨立的，不會跟其他人的部署共用 authority——這點是好的。
4. **但 `vercel.app` 上有大量測試與低品質部署**，免費託管子網域的排名表現通常不如自有網域。這是風險判斷，不是保證。
5. 無法搭配品牌 email 或品牌一致的外部連結。

**建議**：用 `.vercel.app` 先把內容模型、索引流程與量測跑通（這階段本來就不該衝量），確認方向對了再買自有網域並 301 遷移。不要在 `.vercel.app` 上累積大量內容之後才搬。

## 2. Vercel 設定

目前只需要 §2.1。§2.2 是日後要開備援時再做。

### 2.1 Growth Project（目前唯一需要建立的）

網域：`https://soweread.vercel.app`（Project 名稱 `soweread`，自動取得，不需任何 DNS 設定）。

Production 環境變數：

```
SITE_ROLE_RESOLUTION=env
SITE_ROLE=growth
NEXT_PUBLIC_SITE_URL=https://soweread.vercel.app
PRIMARY_SITE_URL=https://soweread.com
GROWTH_ENFORCE_CANONICAL_HOST=true
GROWTH_SITE_VERIFICATION=<Search Console meta tag token>
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-FSYTV0011X

GROWTH_DATABASE_URL=<growth Neon pooled URL>
DATABASE_URL=<growth Neon pooled URL>        # Prisma CLI 預設 datasource
DATABASE_DIRECT_URL=<growth Neon direct URL>

SESSION_SECRET=<...>
ADMIN_EMAIL=<...>
ADMIN_PASSWORD=<...>
```

只有這一個 Neon 資料庫，三個變數都填同一組連線字串（`GROWTH_DATABASE_URL` 與 `DATABASE_URL` 填 pooled、`DATABASE_DIRECT_URL` 填 direct）。

**不要**在 growth Project 設 `CRON_SECRET`、`WORDPRESS_API_URL`、`BACKUP_DATABASE_URL`、`GROWTH_SITE_URL`、`BACKUP_SITE_URL`。

**關於 cron**：`vercel.json` 的每日 WordPress 同步排程會被 growth Project 一起繼承。程式已處理：growth 角色呼叫 `/api/sync/wordpress` 會回 **200 `{"skipped": true}`**，不寫入任何資料、也不會在 Vercel 儀表板留下每天一次的失敗 cron。想更乾淨可以在 Settings → Cron Jobs 直接關掉。

Preview 環境變數（已設定）：

```
SITE_ROLE_RESOLUTION=env
SITE_ROLE=growth
PRIMARY_SITE_URL=https://soweread.com
GROWTH_ENFORCE_CANONICAL_HOST=false
GROWTH_USE_FIXTURE=true
```

Preview **不要**設 `NEXT_PUBLIC_GA_MEASUREMENT_ID`，否則預覽流量會灌進同一個 GA property。

> ⚠️ 這五個目前只綁在 `codex/seo-ai-search-content-fields` 這個分支。Vercel CLI 在非互動模式下拒絕設定「all Preview branches」（回 `git_branch_required`），只能指定單一分支。要讓所有預覽分支都適用，請在 dashboard 把這幾個變數的 Git Branch 條件清空。

### 2.2 Backup Project（延後，目前不建立）

網域：自動取得 `https://<backup-project-name>.vercel.app`。

Production 環境變數：

```
SITE_ROLE_RESOLUTION=env
SITE_ROLE=backup
BACKUP_MODE=serve                            # 或 redirect
NEXT_PUBLIC_SITE_URL=https://<backup-project-name>.vercel.app
PRIMARY_SITE_URL=https://soweread.com
WORDPRESS_API_URL=https://soweread.com/wp-json/wp/v2
CRON_SECRET=<長亂數>

BACKUP_DATABASE_URL=<backup Neon pooled URL>
DATABASE_URL=<backup Neon pooled URL>
DATABASE_DIRECT_URL=<backup Neon direct URL>

BLOB_READ_WRITE_TOKEN=<...>
SESSION_SECRET=<...>
ADMIN_EMAIL=<...>
ADMIN_PASSWORD=<...>
```

**不要**設 `GROWTH_DATABASE_URL` 或 `GROWTH_SITE_URL`。backup Project 的 `/topics`、`/entities`、`/articles` 一律 404。

備援站建議一併開啟 Vercel 的 **Deployment Protection**（Password 或 Vercel Authentication），因為 backup 刻意允許 crawler 讀取以便看到 `noindex`；要擋人就用平台的存取控制，不要靠 `robots.txt`。

## 3. 單一 Vercel Project 設定（自有網域時才可行）

### 3.1 網域

在同一個 Project 的 Settings → Domains 掛上兩個網域：

- `<growth-domain>`（全新獨立網域，Richmond 自有）
- `<backup-domain>`（可用子網域）

`soweread.com` **不掛上來**，維持現有 WordPress 主機與 DNS 不動。

### 3.2 Production 環境變數

```
SITE_ROLE_RESOLUTION=host
GROWTH_SITE_URL=https://<growth-domain>
BACKUP_SITE_URL=https://<backup-domain>
PRIMARY_SITE_URL=https://soweread.com
WORDPRESS_API_URL=https://soweread.com/wp-json/wp/v2

BACKUP_MODE=serve            # 或 redirect
CRON_SECRET=<長亂數>

GROWTH_DATABASE_URL=<growth Neon pooled URL>
BACKUP_DATABASE_URL=<backup Neon pooled URL>
DATABASE_URL=<backup Neon pooled URL>       # Prisma CLI 預設 datasource
DATABASE_DIRECT_URL=<backup Neon direct URL>

BLOB_READ_WRITE_TOKEN=<...>
ADMIN_EMAIL=<...>
ADMIN_PASSWORD=<...>
SESSION_SECRET=<...>
```

`SITE_ROLE_FALLBACK` 在 Production **留空**，未知 host 才會 fail closed。

### 3.3 Preview 環境變數

Vercel 的 Preview 是獨立的環境變數集合。預覽網址（`*.vercel.app`）不在 host 對照表裡，預設會 `503`。要讓預覽可用：

```
SITE_ROLE_FALLBACK=growth
GROWTH_USE_FIXTURE=true
```

Preview 一律 `noindex`（Vercel 預設會加 `X-Robots-Tag`），不會影響索引。

## 4. 資料庫與 migration

`prisma/schema.prisma` 是**一份** schema。目前只有一個 Neon 資料庫，套用一次 migration 即可：

```bash
DATABASE_URL="<pooled>" DATABASE_DIRECT_URL="<direct>" npx prisma migrate deploy
```

Vercel build 的 `postinstall` 只跑 `prisma generate`，**不會**自動 migrate。migration 由 Richmond 手動執行。

這個資料庫會同時擁有 growth 與主站兩組表（一份 schema 建出全部），但 growth 網域只讀 growth 那組——理由見 §0。

### 日後真的要開獨立備援資料庫

再開一個 Neon 資料庫，各跑一次 migration，然後在各自的 Project 設定 `GROWTH_DATABASE_URL` / `BACKUP_DATABASE_URL`：

```bash
DATABASE_URL="<growth pooled>" DATABASE_DIRECT_URL="<growth direct>" npx prisma migrate deploy
DATABASE_URL="<backup pooled>" DATABASE_DIRECT_URL="<backup direct>" npx prisma migrate deploy
```

## 5. 每日 WordPress 同步

`vercel.json` 的 cron 每天 UTC 19:00（台北 03:00）呼叫 `/api/sync/wordpress`。

同步流程被明確綁在 backup 角色上（`getBackupSiteConfig()` + `getPrismaForRole("backup")`），**不會**因為 cron 打到哪個網域而寫錯資料庫。growth 或未解析的角色呼叫同步一律回 `503`。

## 6. 角色行為對照

| | primary | growth | backup | unresolved |
|---|---|---|---|---|
| `robots.txt` | Allow + sitemap | Allow + sitemap | Allow，**無** sitemap | `Disallow: /` |
| meta robots | `index, follow` | `index, follow` | `noindex, follow` | `noindex, nofollow` |
| `X-Robots-Tag` | 無 | 無 | `noindex, follow` | `noindex, nofollow` |
| canonical | `soweread.com` | **自身網域** | `soweread.com` | — |
| sitemap 內容 | 主站文章／分類 | 僅 growth 已發布頁 | 空 | 空 |
| 全站 redirect | 無 | **無** | `BACKUP_MODE=redirect` 時 307 | 無 |
| `/blog`、`/categories`、`/rss.xml` | 200 | **404** | 200 | 503 |
| `/topics`、`/entities`、`/articles` | 404 | 200 | **404** | 503 |
| 資料庫 | `DATABASE_URL` | `GROWTH_DATABASE_URL` | `BACKUP_DATABASE_URL` | 不連線 |

backup 刻意保持 crawler 可讀（不用 `Disallow: /`），否則 crawler 看不到 `noindex`，舊 URL 會留在索引裡。要真正擋人看，用 Vercel 的 Deployment Protection，不要靠 `robots.txt`。

## 7. Fixture

`GROWTH_USE_FIXTURE=true` 會在 growth 資料庫為空或連不上時載入 `src/data/growth-fixture.ts`。

那份 fixture 是**技術驗證用的測試資料**：來源全部是標明「佔位來源」的機構首頁 URL，每頁都會顯示測試資料警語。**正式 growth 網域的 Production 必須把這個變數關掉或留空**，並改用真正經過查證的內容。

## 8. 上線前還缺什麼

- ~~Vercel Project~~ → 已建立並上線。
- ~~Neon 資料庫~~ → 已建立並套用 migration。
- ~~Search Console URL-prefix property~~ → 已用 `public/google9ac0854fdca4504b.html` 驗證檔，`GROWTH_SITE_VERIFICATION` 不需設定。
- ~~Google Analytics~~ → 已完成。獨立串流「Soweread」，`G-FSYTV0011X`，線上已確認初始化。
- 取代 fixture 的真實 cornerstone 內容（含實際查證的來源）。
- 媒體檔案獨立鏡像——在那之前備援狀態必須標示為「非 disaster-complete」。

## 9. 量測帳號

Richmond 決定用與 wisecode website 相同的 Google 帳號管理這個站的 Analytics。以**帳號登入**共用沒有問題，但請注意：

- **GA4 要開獨立的 property**（或至少獨立 data stream），不要併進 wisecode website 的 property。計畫書 §11 要求分開記錄 growth 的 impressions／clicks／indexed pages，以及 growth → `soweread.com` 的 referral sessions；混在同一個 property 裡兩邊的報表都會失真。
- **Search Console 同樣要獨立 property**，而且因為是 `*.vercel.app`，只能用 **URL-prefix property**（無法做 DNS 驗證的 domain property）。驗證用 meta tag，token 放進 `GROWTH_SITE_VERIFICATION`。
### GA4 追蹤碼（已實作）

- Measurement ID：`G-FSYTV0011X`，透過 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 提供。
- **只在 growth 角色且設定健康時載入**。backup 鏡像與未解析的 host 不會載入任何追蹤碼。
- 用 `next/script` 的 `afterInteractive`，不阻擋首次繪製。
- ID 會被驗證（`^G-[A-Z0-9]{4,20}$`）。格式錯誤就完全不輸出追蹤碼，而不是產生壞掉的 inline script。
- **這個變數只設在 Production**。若設成 All Environments，每個 preview 部署都會把資料灌進同一個 GA property。

尚未實作、需要你決定的部分：

- **Consent gate**：目前沒有 cookie 同意橫幅，GA 會在頁面載入後直接啟動。站台語言與客群以台灣為主，台灣個資法沒有像 GDPR 那樣要求事前同意；但如果預期有歐盟訪客，就需要加 consent mode。要加請告知。
- **排除內部流量**：建議在 GA4 後台用 IP 過濾設定（Admin → Data Streams → Configure tag settings → Define internal traffic），不需要改程式。
