# SOWEREAD SEO／GEO 知識增長站與私人備援計畫書 v2

**決策日期：** 2026-09-03  
**狀態：** 策略已確認，增長站尚未實作  
**取代版本：** 備援站方案 B MVP 計畫書 v1

---

## 0. v3 修訂：第一批範圍對齊實作現況（2026-09-03，Richmond 指示）

本節**優先於下列被點名的章節**。原章節文字保留供對照，但第一批內容以本節為準。

修訂緣由：`docs/growth-content-evaluation.md` 的評估指出，計畫書有數項要求目前的程式並未實作，若照原文執行會把第一批內容卡在實作工作上。Richmond 指示這些不構成前置阻礙，改由本修訂排除。

| # | 原章節 | 原要求 | v3 修訂 |
|---|---|---|---|
| 1 | §7.1 核心節點、§6.2 `Evidence Page` | 知識模型含 `Claim` 節點，並提供證據頁 | **第一批不實作 `Claim` / `ClaimSource` 與 `/evidence` 路由。** 證據與爭議由 `GrowthArticle` 的內文與 `Entity` 的敘述承載，並以文字明確標示「哪些機構的結論不一致」。Claim 模型延後到第一批上線並通過索引驗證之後 |
| 2 | §6.2 公開內容類型 | 列出 7 種內容類型 | **第一批只做 3 種**：`Topic Hub`、`Entity Page`、`Article`。`Question Page`、`Evidence Page`、`Comparison Page`、`Glossary` 延後。原本適合 `Comparison Page` 的題目（例如格子籠 vs 平飼 vs 放牧）先以 `Article` 承載 |
| 3 | §9.3 內容品質 | 顯示作者、審閱者、發布日與實質更新日 | **這項要求的適用範圍限縮為 `Article`**（`GrowthArticle` 有 `authorName` / `reviewerName` 欄位）。`Topic` 與 `Entity` 目前沒有這兩個欄位，第一批不補 migration |
| 4 | §9.2 內部連結、§6.1 主題中心 | 每個公開頁面都要有來源與證據 | **來源清單掛在 `Entity` 與 `Article`**（兩者都有 source 關聯，模板也都已 render `<SourceList>`）。`Topic` 沒有 source 關聯，Topic Hub 的可信度改由它所連結的 Entity 與 Article 承擔 |
| 5 | §6.1 第一層主題中心 | 第一版建立 5–7 個穩定主題 | **第一批開 3 個**：農藥與動物用藥、食品生產與飼養方式、食品標示與消費選擇。其餘主題在第一批通過索引驗證後再逐一開啟 |
| 6 | §9、§10 的整體定位 | —— | **本案目標是 SEO／GEO 增長，不是事實查核。** 內容以讀者的搜尋意圖為主軸，產出完整、好讀、易被引用的知識頁。來源紀律（§9.3 的官方來源優先、不得建立假來源）是**品質底線與撰稿紀律**，不是產品主張；growth 站不以「糾正網路錯誤」作為賣點或版面主軸 |

**沒有改變、仍然不可協商的部分：**

- 不得把主站文章全文或改寫版發布到 growth 站（§8.2）。
- 不得建立假來源、假作者、假評價或不可驗證的 Schema（§9.3、§10）。
- 食安／營養內容必須明確區分事實、推論、爭議與未知（§9.3、§10）。
- 只有 `published` 狀態的資料才會出現在公開頁面與 sitemap；證據不足的實體保持 draft（§9.3）。
- 不得因排程重跑就虛假更新 `dateModified`（§9.3）。
- growth 內容頁不得自動 307/308 導向主站（§11）。

**這項修訂的代價（明講，不掩飾）：** 第 1 項使爭議內容無法被 JSON-LD 結構化，GEO 效益會打折；第 4 項使 Topic Hub 本身沒有來源清單。兩者都是刻意接受的短期取捨，不是遺漏。

---

## 1. 決策摘要

本計畫將原本單純的「公開備援站導回主站」策略，調整為兩個目的、兩個 deployment：

1. **SEO／GEO 知識增長站**
   - 使用全新且由 Richmond 控制的獨立網域。
   - 對搜尋引擎公開，採 `index, follow`。
   - 發布具獨立價值的原創知識頁、主題中心、實體頁與證據頁。
   - 以內容內的自然連結和 CTA 導引讀者前往 `https://soweread.com/`。

2. **私人備援站**
   - 每日從主站 WordPress 公開 REST API 同步已發布內容。
   - 平時不作為 SEO／GEO 內容來源，不與主站競爭索引。
   - 保留 `redirect`／`serve` 能力，供營運備援與未來接管。

`https://soweread.com/` 維持現有 WordPress 運作，本階段不移動網域、不要求修改 WordPress 後台，也不對正式 WordPress 做寫入。

## 2. 核心原則

- **備援與增長不可混為同一公開內容角色。**
- WordPress 完整文章可以同步到私人備援資料庫，但不得自動原文發布到全新網域。
- 增長站每個公開頁面都必須提供獨立、可驗證且對讀者有用的內容。
- 增長站使用自己的 canonical、robots 與 sitemap；不得 canonical 到 `soweread.com` 後又期待自己取得排名。
- `soweread.com`、增長站與私人備援站的內容狀態、資料庫與部署設定必須隔離。
- SEO／GEO 不以大量自動生成頁面為策略；沒有足夠內容與證據的實體不得產生公開薄頁。
- 主站 REST API 同步只使用公開 `GET`；不得要求 WordPress 管理員密碼。

## 3. 目標與非目標

### 3.1 目標

- 建立由 Richmond 自主控制的搜尋流量入口。
- 以食品安全、營養科學與飲食知識形成清楚的主題權威。
- 讓搜尋引擎與生成式搜尋系統容易辨識內容中的實體、主張、關係、來源與更新狀態。
- 將相關讀者自然導往 `soweread.com` 的品牌、長文或其他行動頁面。
- 保留主站文章、分類與基本 metadata 的每日私人備份。
- 為未來取得主站控制權或保留原網域切換新站預留遷移路徑。

### 3.2 非目標

- 不把主站文章全文自動複製到增長站公開索引。
- 不承諾 structured data、知識圖譜或任何 GEO 工具必然帶來排名。
- 不在本階段更換 `soweread.com` 網域或修改 DNS。
- 不在第一版實作自動故障接管。
- 不讓增長站與備援站共用同一份可被意外公開的完整 WordPress 鏡像資料。

## 4. 目標架構

```text
                     ┌────────────────────────────┐
                     │ soweread.com WordPress 主站 │
                     │ 維持現況、唯一既有文章來源   │
                     └─────────────┬──────────────┘
                                   │ 公開 REST API / 每日 GET
                     ┌─────────────▼──────────────┐
                     │ 私人備援 deployment          │
                     │ 完整鏡像、noindex、redirect  │
                     │ 或故障時 serve                │
                     └────────────────────────────┘

  編輯研究／人工審核
          │
          ▼
┌──────────────────────────────────────────────────┐
│ 全新獨立網域：SEO／GEO 知識增長站                 │
│ Topic Hub → Entity → Claim → Evidence → Article │
│ index、self-canonical、sitemap、主站 CTA          │
└────────────────────────┬─────────────────────────┘
                         │ 自然連結與讀者導引
                         ▼
                  https://soweread.com/
```

## 5. Deployment 與資料隔離

同一個 Git repo 可以共用 UI、元件及知識模型，但使用兩個獨立 deployment。

### 5.1 Growth deployment

```text
SITE_ROLE=growth
NEXT_PUBLIC_SITE_URL=https://<new-independent-domain>
```

- 獨立網域由 Richmond 自己的帳號持有。
- 使用獨立 PostgreSQL database/schema。
- 只存放可公開的知識內容與已審核文章。
- `robots: index, follow`。
- sitemap 列出所有可公開頁面。
- canonical 指向增長站自身 URL。
- 不做全站 `307`。

### 5.2 Backup deployment

```text
SITE_ROLE=backup
BACKUP_MODE=redirect | serve
PRIMARY_SITE_URL=https://soweread.com
WORDPRESS_API_URL=https://soweread.com/wp-json/wp/v2
```

- 使用獨立備援資料庫。
- 每日保存主站公開文章鏡像。
- `redirect` 模式對一般 `GET`／`HEAD` 使用 `307` 導回主站。
- `serve` 模式可顯示 last-known-good 內容。
- 備援內容不提交 sitemap。
- 若頁面可被 crawler 存取，使用 `noindex, follow`；不得同時以 `robots.txt Disallow: /` 阻止 crawler 看見 `noindex`。
- 私人預覽若需要保密，以密碼或平台 access control 保護，不把 `robots.txt` 當安全控制。

## 6. 增長站資訊架構

### 6.1 第一層主題中心

第一版以 5–7 個穩定主題建立網站骨架：

- 食品安全
- 營養科學
- 農藥、動物用藥與食品添加物
- 食品生產與飼養方式
- 食品標示與消費選擇
- 法規與政策
- 科學查證與常見迷思

建議 URL：

```text
/topics/food-safety
/topics/nutrition
/topics/pesticides-and-additives
/topics/food-production
/topics/food-labeling
/topics/regulation
/topics/fact-checking
```

主題中心不得只是文章列表，至少包含主題定義、核心問題、重要實體、證據概況、精選內容與下一步閱讀路徑。

### 6.2 公開內容類型

- `Topic Hub`：一個主題的完整導航與概觀。
- `Entity Page`：食品、化學物質、營養素、疾病、機構、法規或生產方式。
- `Question Page`：直接回答讀者的具體問題。
- `Evidence Page`：整理主要研究、官方資料與證據限制。
- `Comparison Page`：比較制度、產品、成分或飼養方式。
- `Article`：具有觀點、分析或敘事的原創專題。
- `Glossary`：具有足夠內容與來源的專業名詞頁。

## 7. 知識圖譜資料模型

第一版使用既有 Prisma／PostgreSQL，不需先導入 Neo4j。

### 7.1 核心節點

```text
Topic
- id
- name
- slug
- summary
- publicationStatus

Entity
- id
- type
- name
- aliases
- description
- canonicalUrl
- publicationStatus

Claim
- id
- statement
- evidenceStatus
- jurisdiction
- validFrom
- reviewedAt

Source
- id
- title
- publisher
- url
- publishedAt
- retrievedAt
- sourceType

Article
- id
- title
- slug
- summary
- content
- datePublished
- dateModified
- editorialStatus
```

### 7.2 關係邊

```text
EntityRelation
- subjectEntityId
- predicate
- objectEntityId
- sourceId
- confidence
- reviewedAt

ArticleEntity
- articleId
- entityId
- role

ClaimSource
- claimId
- sourceId
- supportType
```

關係例：

```text
嘉磷塞 → 屬於 → 農藥
嘉磷塞 → 由…規範 → 食藥署
抗生素使用 → 可能造成 → 抗藥性
One Health → 關聯 → 人類健康
雞蛋 → 使用標示 → 飼養方式
```

任何對外顯示的關係都必須能回到可閱讀的來源；不能只因模型推測相似就建立事實關係。

## 8. WordPress 同步與編輯流程

### 8.1 私人備援流程

```text
每日 03:00 Asia/Taipei
→ GET WordPress 公開 posts/categories/tags/authors
→ full reconciliation
→ idempotent upsert
→ 消失文章標記 archived
→ 保存 last-known-good
```

- 同步失敗不得清空既有資料。
- WordPress mirror 在備援後台保持 read-only。
- 媒體必須在後續階段複製到 Richmond 控制的儲存空間，否則不能宣稱 disaster-complete。

### 8.2 增長站研究匯入流程

WordPress 內容只能作為研究與導引來源：

```text
WordPress 文章 metadata／摘要
→ 內部候選主題與實體
→ 編輯建立 Claim／Source／Relation
→ 人工確認內容與引用
→ 形成具獨立價值的知識頁
→ 才能發布到 growth deployment
```

- 不自動公開 WordPress 全文。
- 不用僅換句話說的方式規避重複內容。
- 自動分類、實體抽取與關係建議都只能產生 draft。
- 公開發布必須經過 human review gate。

## 9. SEO 策略

### 9.1 技術基礎

- `index, follow`。
- 每頁 self-canonical。
- 乾淨且穩定的 URL。
- XML sitemap 只列公開 canonical pages。
- 正確 HTTP status；不存在內容回 `404`，永久遷移才回 `301/308`。
- Breadcrumb UI 與 `BreadcrumbList` JSON-LD 一致。
- 文章提供 `Article`／`BlogPosting` structured data。
- 首頁或關於頁提供 `Organization` structured data。
- structured data 必須與頁面可見內容一致。
- 圖片具有可理解的 filename、alt、尺寸與獨立可存取 URL。

### 9.2 內部連結

每個公開頁面至少連結到：

- 一個上層 Topic Hub。
- 兩個真正相關的 Entity 或 Question pages。
- 必要的 Claim／Source 證據。
- 一個合理的下一步閱讀方向。
- 有直接關聯時才連到 `soweread.com`，不得每段硬塞 CTA。

### 9.3 內容品質

- 以讀者問題為中心，不以關鍵字排列組合大量生頁。
- 顯示作者、審閱者、發布日與實質更新日。
- 食安／營養內容明確區分事實、推論、爭議與未知。
- 優先使用官方機關、法規、論文與原始研究。
- 來源需保存 publisher、URL、published date 與 retrieval timestamp。
- 不因排程重跑就虛假更新 `dateModified`。

## 10. GEO 策略

GEO 使用與 SEO 相同的可索引內容基礎，不建立虛構的特殊排名保證。

每個主要知識頁應包含：

1. 可獨立理解的直接答案。
2. 清楚定義的主題與實體別名。
3. 已知／未知／仍有爭議。
4. 能回到原始來源的主張與證據。
5. 適用地區、期間與限制。
6. 作者、審閱者與更新資訊。
7. 人類可見且一致的結構化資料。
8. 有意義的相關問題與知識關係。

正式 growth deployment 應允許一般搜尋 crawler；是否允許訓練 crawler 另行作政策決定，不與搜尋收錄混為一談。

## 11. 流量導引策略

增長站內容頁不得自動 `307` 到主站，否則無法形成自己的可索引內容。

允許的導引方式：

- 內文中的相關長文連結。
- 「前往潤讀主站閱讀完整評論」CTA。
- 品牌介紹與關於頁連結。
- Newsletter、社群或內容專題的自然轉換入口。

衡量指標分開記錄：

- Growth domain impressions／clicks／indexed pages。
- AI referral／citation observations。
- Growth → `soweread.com` referral sessions。
- CTA click-through rate。
- Topic Hub 到文章的內部導覽率。

增長站的排名屬於新網域，不能宣稱會自動變成 `soweread.com` 的排名。

## 12. 分階段實作

### Phase 0：命名、網域與基線

- 選定全新獨立網域與知識站名稱。
- 確認網域、部署、DB 與 analytics 都在 Richmond 自有帳號。
- 保存目前 repo branch、dirty worktree 與備援 MVP 基線。
- 定義第一版主題分類與 editorial policy。

### Phase 1：Deployment role 隔離

- 新增 `SITE_ROLE=growth`。
- 將 growth／backup 的 robots、canonical、sitemap、redirect 行為完全分離。
- 建立兩個 deployment 與兩套 DB。
- 修正備援 `serve` 模式為 crawler 可見 `noindex, follow`，不再搭配全站 `Disallow: /`。
- 建立 role matrix tests，缺少或矛盾設定必須 fail closed。

### Phase 2：知識模型與後台

- 新增 Topic、Entity、Relation、Claim、Source 與關聯資料表。
- 建立 draft／review／published 狀態。
- 建立來源與 retrieval timestamp 欄位。
- WordPress 匯入只能建立 source/draft，不得直接公開。

### Phase 3：讀者介面與索引

- 建立 Topic Hub、Entity、Question、Evidence 與 Article templates。
- 加入 Breadcrumb、Article、Organization 等 JSON-LD。
- 建立 sitemap、RSS、related-content 與內部連結。
- 以少量完整頁面進行 Search Console／Rich Results／URL Inspection 驗證。

### Phase 4：內容首發

- 先完成少量 cornerstone pages，不追求大量頁數。
- 每頁完成來源查核、作者／審閱資訊與內部連結。
- 對不足以形成獨立價值的 entity 保持 draft。
- 驗證索引、搜尋片段與真實讀者行為後再擴展。

### Phase 5：量測與 SEO／GEO 操作

- 設定新網域 Search Console 與 analytics。
- 提交 sitemap 並觀察 indexing reports。
- 建立主題與 query baseline。
- 追蹤 referral 到 `soweread.com`。
- 定期檢查 structured data、broken links、content freshness 與 citation quality。
- 備援站實際部署完成後，再由 Codex 依真實結果逐步指導 Richmond 操作。

## 13. 驗收條件

### Growth deployment

- growth domain 回 `200` 且可被 crawler 存取。
- robots、meta robots、canonical、sitemap 全部指向 growth domain。
- 不存在全站 redirect 到 `soweread.com`。
- 每個公開頁面都有獨立內容、來源與內部連結。
- WordPress mirror 不會因排程而直接變成公開文章。
- Search Console URL Inspection 能看到完整主要內容與 structured data。

### Backup deployment

- 每日同步只使用 WordPress 公開 `GET`。
- 同步失敗保留 last-known-good。
- 已下架的 WordPress mirror 不再公開服務。
- `redirect` 模式正確導向主站實際 URL。
- `serve` 模式仍不與主站競爭索引。
- 媒體完成獨立鏡像前，狀態明確標示非 disaster-complete。

### 共通邊界

- 兩個 deployment 不共用可意外公開的完整鏡像 DB。
- 所有環境變數缺漏或 role 衝突都 fail closed。
- 不修改或覆蓋 repo 既有無關 dirty changes。
- deterministic tests、Prisma validate／migration、Next production build 與 live route checks 通過。

## 14. 目前完成與未完成

### 已完成

- 備援 MVP 的 `redirect`／`serve` 基礎。
- 每日 WordPress full reconciliation 程式與 Vercel cron 設定。
- 受保護的同步 endpoint、status／health、URL mapping。
- WordPress mirror read-only gate。
- Prisma migration、窄測試與 production build 驗證。

### 尚未完成

- `SITE_ROLE=growth`。
- 全新網域選定與部署。
- growth／backup DB 實際隔離。
- Topic／Entity／Relation／Claim／Source 知識模型。
- Growth templates 與 public editorial workflow。
- 媒體完整鏡像。
- Search Console／analytics 設定。
- SEO／GEO 首批內容與上線後操作。

## 15. 下一個實作切片

下一輪應先完成下列最小垂直切片，不先批量產生內容：

1. 新增並測試 `SITE_ROLE=growth`。
2. 將 growth／backup 的 robots、canonical、sitemap、redirect 完全隔離。
3. 建立獨立 DB 連線與 migration 策略。
4. 實作最小 Topic／Entity／Relation／Source schema。
5. 建立一個 Topic Hub、一個 Entity Page 與一篇 Article fixture。
6. 驗證頁面 HTML、JSON-LD、內部連結與 sitemap。
7. Richmond 確認頁面與內容模型後，再擴充編輯後台與批次內容流程。

## 16. 官方依據

- [Google：生成式 AI 搜尋優化仍以可索引、獨特且有用的內容為基礎](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google：Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Google：Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google：Structured data 一般規範](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [WordPress：公開 Posts REST API](https://developer.wordpress.org/rest-api/reference/posts/)
