# 任務 B 評估報告：growth 站第一批內容

**建立日期：** 2026-09-03
**狀態：** 評估，尚未產生任何內容。等 Richmond 確認後才進入實作。
**依據：** `docs/soweread-seo-geo-growth-plan.md`（計畫書）、`docs/handoff-next-slice.md` §2
**查證方式：** 三組獨立來源查證，只採計實際 fetch 成功且內容相符的 URL。fetch 失敗、只有無文字層 PDF、或只在媒體與二手網站出現的數字，一律列為不可用。

---

## 0. 結論摘要

**建議第一批只開 2 個 Topic Hub、9 個 Entity Page、3 篇 Article。**

| 項目 | 建議 |
|---|---|
| 第一批 Topic Hub | `pesticides-and-veterinary-drugs`（農藥與動物用藥）、`food-production`（食品生產與飼養方式） |
| 第三個候選 | `food-labeling`（食品標示）——模板已用 fixture 驗證過，成本最低，但主站素材相對薄 |
| 暫不開 | 食品安全（太廣，會變成什麼都塞的垃圾桶）、法規與政策（與前兩者重疊）、營養科學（來源缺口太大）、科學查證與常見迷思（要先有實體與證據頁才有東西可查證） |
| 前置阻礙 | 三個都真實存在，另外查到 5 個交接文件沒提到的模型／模板缺口，見 §3 |
| 最大風險 | **不是內容不夠，是「網路上流傳但查不到官方來源」的數字太多。** §7 列出 15 條在第一批絕對不能寫的敘述 |

**為什麼是這兩個主題：** 它們對應主站 2026-06～09 最新、最集中的內容群（抗生素／無抗養殖／蛋雞飼養／嘉磷塞，共 9 篇），而且是三組查證裡來源最紮實的兩塊。更重要的是它們天然具備 growth 站該有的**獨立編輯價值**——主站那些是敘事型長文，growth 站要做的是主站不會做、也不適合做的事：把彼此衝突的官方證據並列，並明講哪些是定論、哪些仍有爭議。

---

## 1. 主站內容實況（先修正一個過期認知）

`prisma/wordpress-posts.json` 這份快照**已經過期**：裡面只有 13 篇、最新到 2026-04-24。實際去打主站公開 REST API（`GET /wp-json/wp/v2/posts`，只讀）拿到的是 **31 篇**，最新一篇 2026-09-01，而且維持每週一篇的節奏。

快照裡那 3 篇英文樣板文（`post-1`／`post-2`／`post-3`）已經不在線上清單裡了。

實際內容群（依發布時間，新到舊）：

| 群 | 篇數 | 期間 | 代表 |
|---|---|---|---|
| **抗生素／無抗養殖／One Health／禽流感／蛋雞飼養** | 6 | 2026-07～09 | 台灣「無抗養殖」大革命、H5N1 跨物種風暴、住格子籠還是平房好 |
| **農藥／嘉磷塞／殘留清洗** | 3 | 2026-06～08 | 食安隱形殺手！除草劑「嘉磷塞」在台灣的逆勢高飛 |
| **蔬菜產業：洋蔥 4 篇、青蔥 2 篇** | 6 | 2026-07 | 台灣青蔥品種大解密、近 5 年臺灣洋蔥歷程 |
| **基改／基因編輯／非基改** | 8 | 2026-04～06 | CRISPR、基因逃逸、極端氣候區需要基改作物嗎 |
| **外食營養／飲食心理** | 5 | 2026-03～04 | 我的營養餐盤、假性飢餓、國高中生外食營養黑洞 |
| **夜市／街頭美食食安** | 3 | 2026-03～06 | 臺灣夜市食安困境 |

計畫書 §7 舉的關係例（嘉磷塞→農藥、抗生素使用→抗藥性、One Health、雞蛋→飼養方式）跟這批內容完全對得上，代表知識模型當初就是照這批素材設計的。

**建議一併處理：** 把 `prisma/wordpress-posts.json` 重新抓一次，否則之後任何以它為基礎的研究匯入都會漏掉 18 篇。

---

## 2. 三個前置阻礙的評估結論

### B-0-1：Growth 頁面完全沒有 CSS —— 屬實，且是硬性阻擋

`src/components/growth-shell.tsx` 引用 13 個 `growth-*` class（`growth-shell`、`growth-header`、`growth-brand`、`growth-nav`、`growth-fixture-notice`、`growth-breadcrumbs`、`growth-main`、`growth-footer`、`growth-sources`、`growth-source-meta`、`growth-source-note`、`growth-cta`、`growth-cta-link`），`src/app/globals.css`（1,791 行）裡對 `growth` 的比對結果是 **0**。

現在的 growth 頁面是純瀏覽器預設外觀。**在發布任何公開內容之前必須先做樣式**——不是為了好看，是因為「來源清單」和「爭議並列」這兩個區塊如果沒有視覺層次，讀者根本讀不出哪句是官方結論、哪句是仍有爭議。

repo 根目錄已經有現成的設計資產可以沿用：`Design System - SoWeRead Complete.html`、`Style Guide & Developer Handoff.html`、`Design System - SoWeRead.md`。建議直接抽 design token（色、字級、間距），不要另起一套。

### B-0-2：沒有編輯後台 —— 屬實。建議先寫 seed script，不要先做後台

理由：

- 第一批只有 2 個 topic、9 個 entity、3 篇文章，量小到後台不划算。
- 內容檔進 git 才有 review gate、diff 與歷史。計畫書 §8.2 要求「公開發布必須經過 human review gate」——**PR review 本身就是那個 gate**，而且比自建 draft→review→published UI 更可靠。
- 每一筆來源都有 `retrievedAt`，日後要重新查核時，git blame 能直接告訴你這筆是誰、什麼時候放進去的。

建議做法：`prisma/growth-content/*.ts`（型別直接用 `GrowthKnowledge`，編譯期就擋掉欄位缺漏）＋ 一支 idempotent upsert script。等內容累積到需要非工程人員維護時再做後台。

### B-0-3：Fixture 不能當內容 —— 同意，且不需要動它

`src/data/growth-fixture.ts` 的兩個來源都是「【佔位來源】」加機構首頁 URL，每頁還會顯示測試資料警語。第一批內容進資料庫之後，`loadKnowledge()` 就不會再走 fixture fallback（它只在 topics／entities／articles 全空時才 fallback）。Production 也刻意沒開 `GROWTH_USE_FIXTURE`。

**Fixture 建議原樣保留**，它是 preview 環境的技術驗證工具；把它換成真內容反而會讓 preview 失去「驗證空資料庫行為」的能力。

---

## 3. 交接文件沒提到、但第一批就會撞到的 5 個缺口

這幾個是我讀 schema 與模板時查到的，都會直接影響第一批能做到什麼程度。

### 3-1：`Topic` 沒有來源關聯（阻擋 B-1 第 3 項）

`prisma/schema.prisma:93` 的 `Topic` model 只有 `entities` 和 `articles` 兩個關聯，**沒有 `sources`**。`src/app/topics/[slug]/page.tsx` 也因此完全沒有 render `<SourceList>`。

任務 B-1 要求「每一頁的來源清單」，但 Topic Hub 目前在結構上就放不了來源。

### 3-2：`Topic` 與 `Entity` 沒有作者／審閱者欄位

計畫書 §9.3 要求「顯示作者、審閱者、發布日與實質更新日」。目前只有 `GrowthArticle` 有 `authorName` / `reviewerName`。Topic 與 Entity 只有 `reviewedAt`，而且模板沒有顯示它。

### 3-3：沒有 `Claim` / `ClaimSource` model（影響最大的一個）

計畫書 §7.1 列了 `Claim`，§6.2 列了 `Evidence Page`，§10 要求每個知識頁都要有「已知／未知／仍有爭議」。但 schema 裡 13 個 model 沒有任何一個是 Claim，也沒有 `/evidence` 路由。

**這在第一批就會撞到**，而且撞在最核心的地方：嘉磷塞的 IARC（2015，Group 2A「probably carcinogenic」，屬**危害**鑑定）與 EFSA（2023，「不符合致癌分類標準」，屬**風險**評估）兩個結論方向相反且至今並存。這正是 growth 站相對主站最有價值的獨立內容，但目前沒有結構化的地方放它。

兩個選項：

- **選項 A（建議第一批採用）**：不改 schema，把爭議寫在 Article 的 `content` 與 Entity 的 `description` 裡，用文字明確標示「兩個機構結論不同」與方法學差異。成本低，但那份爭議無法被 JSON-LD 結構化，GEO 效益打折。
- **選項 B**：加 `Claim` + `ClaimSource` 兩個 model 與 `/evidence/[slug]` 路由。成本較高（migration ＋ 模板 ＋ JSON-LD ＋ 測試），但這是計畫書原本的設計，而且擴張到第二批之前遲早要做。

我的建議：**第一批走 A，但把 B 排在第一批上線驗證索引之後、擴張到第二批之前。** 不要為了趕第一批而跳過 B，也不要為了 B 拖住第一批。

### 3-4：CTA 只有文章頁能指向特定長文（影響 B-1 第 4 項）

- `src/components/growth-home.tsx:60`、`src/app/topics/[slug]/page.tsx` 的 `PrimaryCta`、`src/app/entities/[slug]/page.tsx:141` 都**硬編碼** `href="https://soweread.com/"`（主站首頁）。
- 只有 `GrowthArticle` 有可設定的 `primaryCtaUrl` / `primaryCtaLabel`。

所以「導流到主站的位置」目前只能在 Article 頁做到精準。Topic Hub 與 Entity Page 一律導到主站首頁——這既浪費了最相關的導流機會，也違反計畫書 §9.2 的精神（有直接關聯時才連）。

建議：給 `Topic` 與 `Entity` 各加一組 `primaryCtaUrl` / `primaryCtaLabel`（可為空，空就不顯示 CTA），比硬塞首頁連結好。

### 3-5：§6.2 的 7 種內容類型只實作了 3 種

現有路由只有 `/topics`、`/entities`、`/articles`。`Question Page`、`Evidence Page`、`Comparison Page`、`Glossary` 都沒有。

第一批不需要補齊，但要知道：`Comparison Page` 對「格子籠 vs 平飼 vs 放牧」這個題目是最合適的形式，目前只能退而用 Article 承載。

---

## 4. 建議的第一批 Topic Hub

判準依交接文件 B-1：Richmond 有實際專業與素材、讀者真的會搜尋、能寫出主站沒有的獨立內容——我再加一條：**來源查得到**。

### 開：`/topics/pesticides-and-veterinary-drugs`（農藥、動物用藥與食品添加物）

- **素材**：主站 9 篇（嘉磷塞 1、抗生素／無抗養殖 4、蔬果清洗 1、有機與基改 1、溫室共生 1、青蔥農藥殘留 1）
- **獨立價值**：主站寫的是敘事與現象；growth 站做的是「同一個問題，官方與國際機構各自說了什麼，彼此是否一致」。嘉磷塞的 IARC／EFSA 對立就是最好的示範，主站長文形式上做不了這種並列。
- **來源強度：最強。** 動物用藥品管理法 §32／§32-3、動物用藥品使用準則（114-01-08 修正）、動物用藥殘留標準（112-07-13 修正）、農藥殘留容許量標準（115-04-21 修正）、IARC 2015、EFSA 2023、WHO 2017 指引、食藥署蔬果農藥殘留開放資料集（2026-07-02 更新）
- **核心問題（Topic 的 `keyQuestions`）**：
  - 台灣目前允許把抗生素加進飼料嗎？
  - 「殘留容許量」是安全門檻還是管理門檻？
  - 為什麼 IARC 說嘉磷塞「可能致癌」，EFSA 卻說「不符合致癌分類」？
  - 洗菜能洗掉農藥殘留嗎？（**注意：這一題目前沒有查證到的官方來源，要放必須先補查**）

### 開：`/topics/food-production`（食品生產與飼養方式）

- **素材**：主站 6 篇（蛋雞飼養環境 2、友善飼養場優缺點 1、H5N1 與 A4 格子籠 1、無抗養殖 1、溫室共生 1）
- **獨立價值**：**這個主題有一個可驗證、且網路上普遍寫錯的事實**——現行《雞蛋友善生產系統定義及指南》（111-05-23 修正）規定平飼／放牧每隻雞可用面積至少 **1,000 平方公分**，但網路二手報導大量沿用修正前的 **800 平方公分**。growth 站直接引現行法規條文並標明修正日期，就是實打實的獨立價值。
- **來源強度：強。** 雞蛋友善生產系統定義及指南（law.moa.gov.tw GL000691，訂定 104-12-31、修正 111-05-23）、產銷履歷農產品驗證基準（GL001310，112-03-24 修正）、有機農業促進法 §3／§20／§29、禽流感資訊專區（115-08-11 更新）
- **核心問題**：
  - 「平飼」「放牧」「豐富化籠飼」在法規上各自的定義是什麼？
  - 雞蛋盒上的標示哪些是法規強制、哪些是業者自願？
  - 台灣有官方的動物福利標章嗎？（**答案是沒有**，見 §7）

### 第三候選：`/topics/food-labeling`（食品標示與消費選擇）

- **成本最低**：fixture 已經用這個主題把模板、JSON-LD、sitemap 全部驗證過一輪。
- **來源最乾淨**：食安法 §22（十款標示義務）、包裝食品營養標示應遵行事項 111 年修正（113-07-01 生效）、食品過敏原標示規定（11 項，109-07-01 生效）、食安法 §21（基改查驗登記）、§3 第 11 款（基改法定定義）
- **但**：主站直接對應的素材少（基改標示相關 2 篇），而且基改標示三份「應遵行事項」的**全文在官方網域取不到**（只有 PDF 附件），兩份公告對生效日的敘述還互相矛盾（見 §7）。
- **建議**：如果第一批就想要三個 topic，開這個；否則排第二批。

### 暫不開

| 主題 | 不開的理由 |
|---|---|
| 食品安全 | 範圍太廣，會變成什麼都往裡塞的垃圾桶主題，且與上面兩個大量重疊 |
| 法規與政策 | 法規本來就是前兩個主題的骨幹，單獨開會兩邊都變薄 |
| 營養科學 | **來源缺口最大**：官方外食比例查不到、DRIs 鈉的正式數值未能實讀、大腸癌單癌別數字官方頁面沒寫。主站雖有 5 篇素材，但 growth 站寫不出有把握的獨立內容 |
| 科學查證與常見迷思 | 這個主題的價值來自「已經有一批實體與證據頁可以指回去」。第一批沒有那個基礎，現在開只能寫空泛的方法論 |

---

## 5. 建議的第一批 Entity Page

計畫書 §9.3 與交接文件 B-1 都要求：內容與證據不足的實體**必須保持 draft**，不得產生公開薄頁。

### 建議 `published`（9 個）

| slug | 類型 | 主要來源（皆已 fetch 驗證） | 獨立價值 |
|---|---|---|---|
| `glyphosate`（嘉磷塞） | pesticide | IARC 2015-03-20；EFSA 2023-07-06；農藥殘留容許量標準（115-04-21）；防檢署農藥資訊服務網許可證頁 | 並列兩個方向相反且**至今並存**的國際評估，說明 hazard 與 risk 的方法學差異 |
| `medicated-feed-additive`（含藥物飼料添加物） | regulation-concept | 動物用藥品使用準則第 4 條與附件二（114-01-08）；防檢局 2015-12-01 說明 | **直接糾正「台灣已禁抗」這個廣泛流傳的錯誤** |
| `veterinary-drug-residue-standard`（動物用藥殘留標準） | regulation | 動物用藥殘留標準（112-07-13）；動物用藥品管理法 §32-3 | 說明「容許量」指的是指標性殘留物質，且未列品目不得檢出 |
| `antimicrobial-resistance`（抗生素抗藥性） | concept | WHO 2017-11-07 指引；衛福部 114 年國家級防疫一體抗生素抗藥性管理行動計畫 | 必須標明台灣畜禽端監測資料只到 2018 年 |
| `one-health`（防疫一體） | concept | WOAH／OHHLEP 定義；WHO 2017-09-21 Q&A；衛福部 114 年行動計畫 | 註明 WHO 2017 版與 OHHLEP 2021 版措辭不同，不可混用 |
| `egg-friendly-production-system`（雞蛋友善生產系統） | production-method | 雞蛋友善生產系統定義及指南（GL000691，111-05-23 修正） | **引現行條文的 1,000 平方公分，糾正網路流傳的 800** |
| `tap-traceability`（產銷履歷） | certification | 產銷履歷農產品資訊網（115-08-28 更新）；產銷履歷農產品驗證基準（GL001310，112-03-24） | 順帶標明《產銷履歷農產品驗證管理辦法》已於 111-07-19 廢止 |
| `organic-certification-mark`（有機農產品標章） | certification | 有機農業促進法 §3 第 6 款、§20、§29 第 1 款 | 條號、授權關係與罰則（20 萬～200 萬）都可逐條引用 |
| `iarc`（國際癌症研究總署） | institution | IARC 2015-03-20 頁面 | **只有在同時發布 `glyphosate` 時才發布**，否則是薄頁 |

### 必須保持 `draft`（證據不足，7 個）

| 候選 | 為什麼不能公開 |
|---|---|
| 台灣動物用抗生素年度使用量 | **沒有任何公開的官方銷售量數據。** 網路流傳的噸數全部來自新聞與學術二手引用 |
| 動物福利標章 | **不是政府制度。** 現行「動物福利標章」為台灣動物社會研究會（NGO）2021 年推出。若要做，必須明寫發證者，並與官方的雞蛋友善生產系統標示義務清楚區隔 |
| 基因編輯（gene editing） | 台灣**尚無專法**，法規上也未區分基改與基因編輯。唯一可引的公開說明是中央社 2026-07-14 報導，沒有主管機關的正式立場公告 |
| 大宗進口原料（黃豆／玉米／小麥） | 只查到查詢介面與年報清單頁，**沒有任何載有可直接引用數字的官方頁面** |
| 外食比例 | 唯一可驗證的官方數據是 2010 年職場調查（僅限受僱者），不能代表全體國人 |
| H5N1 高病原性禽流感 | 來源本身沒問題（防檢署專區 115-08-11 更新），但**疫情數字滾動更新**，做成公開頁等於長期維護負擔。第一批不划算 |
| 龍葵鹼／進口馬鈴薯 | 來源紮實（防檢署 115-04-20 澄清稿、衛福部 115-04-23），但**主站那篇的年份寫錯**（見 §7 第 1 條），先釐清再做 |

---

## 6. 導流位置對照（growth 頁 → 主站長文）

只列**真正相關**的對應。計畫書 §9.2 明確禁止每段硬塞 CTA。

| growth 頁 | 導向主站 | 理由 |
|---|---|---|
| `/entities/glyphosate` | 食安隱形殺手！除草劑「嘉磷塞」在台灣的逆勢高飛 | 同一物質，主站是現象敘事，growth 是證據並列，互補 |
| `/entities/medicated-feed-additive` | 台灣「無抗養殖」大革命：告別抗生素，迎向 One Health | 主站談產業轉型，growth 說清楚法規現況 |
| `/entities/one-health` | 台灣「無抗養殖」大革命：告別抗生素，迎向 One Health | 同上 |
| `/entities/antimicrobial-resistance` | 台灣雞肉與雞蛋有打抗生素嗎？解密「速生雞」發展史與抗藥性真相 | 主站直接回答讀者的疑問，是很好的下一步閱讀 |
| `/entities/egg-friendly-production-system` | 住格子籠還是平房好？解析蛋雞飼養環境對產蛋率、雞蛋品質與動物福利的影響 | 法規定義 → 實務比較，動線自然 |
| `/entities/tap-traceability` | 青蔥面臨氣候暴雨與農藥殘留雙重危機（該篇實際談到產銷履歷） | 制度定義 → 實際應用 |
| `/topics/pesticides-and-veterinary-drugs` | 聰明挑選、正確清洗蔬果：破解農藥殘留迷思（URL 為 `/2613-2/`） | 主題層級的一般性導流 |
| `/topics/food-production` | 告別蛋荒與傳統格子籠！水簾式、平飼、放牧養雞場優缺點全解析 | 同上 |

**注意兩件事：**

1. 依 §3-4，Topic Hub 與 Entity Page 目前**做不到**指向特定文章——它們的 CTA 是硬編碼的主站首頁。上表要能實現，得先加 `primaryCtaUrl` 欄位。
2. 主站 URL 是中文路徑，寫進程式碼要用 percent-encoded 形式，並且**上線前逐一實測回 200**。其中至少 3 篇的 slug 與標題不一致（例如洋蔥那篇的 URL 是 `/2644-2/`、蔬果清洗那篇是 `/2613-2/`）。

---

## 7. 第一批絕對不能寫的 15 條

這一節是本報告最重要的部分。以下每一條都是「網路上寫得到處都是，但查證後站不住腳」的敘述。計畫書明訂不得建立假來源、不得產生不可驗證的 Schema——這些就是最可能踩到的地方。

### 事實錯誤（寫了就是錯）

1. **「2025 年進口馬鈴薯爭議」** —— 查無任何 2025 年紀錄。所有可驗證事件都在 **2026 年 2～4 月**（農業部 115-02-06 公告輸入檢疫條件、台美 ART 115-02-13、立院質詢 115-04-15、防檢署澄清稿 115-04-20、衛福部新聞稿 115-04-23）。
   **主站 2026-04-24 那篇的標題就是寫「2025」。** 錯誤很可能來自把民國 115 年誤譯成 2025 年——查證過程中 WebFetch 就犯過一模一樣的錯。growth 站不得沿用。（主站是紅線，我沒有也不會去動它，但這件事你會想知道。）

2. **「台灣已禁止抗生素作為飼料添加物／促生長用途」** —— **錯。** 現行《動物用藥品使用準則》第 4 條附件二至今仍列有可用於促進生長的含藥物飼料添加物。可以寫的只有「自民國 89 年起逐年檢討刪減，累計刪除 34 種」（防檢局 2015-12-01 說明）。

3. **雞蛋友善生產「每隻雞 800 平方公分」** —— 那是修正前的數字。現行條文（111-05-23 修正）是 **1,000 平方公分**（平飼不含巢箱）。

4. **引用《產銷履歷農產品驗證管理辦法》** —— 該辦法已於 **111-07-19 廢止**，但搜尋引擎仍大量引用。現行應引《產銷履歷農產品驗證基準》（GL001310）。

5. **把「動物福利標章」寫成官方制度** —— 台灣**沒有**政府的動物福利標章。有法源的官方農產標章只有「有機」與「產銷履歷」。

### 沒有來源可支撐（寫了就是無法驗證）

6. **「台灣每年進口 X 萬噸黃豆／玉米／小麥」** —— 只查到查詢介面與年報清單，沒有任何可直接引用數字的官方頁面。要用必須先開《糧食供需年報》113 年版取數。

7. **「國人外食比例約七成」「天天外食 330 萬人」** —— 官方頁面查不到。唯一可驗證的是 2010 年職場調查（男性每週外食 5 天以上：早餐 51%、午餐 64%），**僅限受僱者**。

8. **各餐次外食比例（早餐 55–65%、午餐 47–62%、晚餐 27–33%）** —— 相關國健署頁面抓取失敗，數值未經驗證。

9. **台灣動物用抗生素年度銷售量（512／868.7／952.8／1,039.9 公噸等數字）** —— 全部來自新聞與學術二手引用，官方未公開。

10. **嘉磷塞在台灣的具體殘留容許量 ppm** —— 《農藥殘留容許量標準》本文頁面**根本沒有出現「嘉磷塞」三個字**，數值在未取得的附表裡。

11. **DRIs 第八版鈉的 AI／CDRR／UL 數值** —— 章節 PDF 未能實讀。目前只能引衛福部頁面確實載明的「每日鈉不超過 2,400 毫克（鹽 6 公克）」。另外**也不得聲稱第八版是最新版**（疑似有第九版增修訂，未查證）。

12. **大腸癌單獨的新發人數與標準化發生率** —— 官方新聞稿只寫「新發生人數第 2 位」，沒寫單癌別數字。媒體報導的「19,074 人」在官方頁面上找不到。

13. **JMPR 對嘉磷塞的「unlikely to pose a carcinogenic risk」結論** —— 兩個來源分別是無文字層 PDF 與 HTTP 403，**未能親自驗證**。要寫必須先補查。

14. **基改標示新制的具體生效日** —— 兩份官方公告互相矛盾：103-12-22 公告寫「105-01-01 生效」，104-05-29 修正公告寫「104-12-31／散裝分三階段」。核對到最終版之前不要寫死日期。

### 不得寫成定論（必須以爭議或限制呈現）

15. 三件事：

    - **嘉磷塞致癌性** —— IARC（2015，Group 2A，**危害**鑑定）與 EFSA（2023，不符合致癌分類標準，**風險**評估）方向相反且至今並存。必須並列、必須說明 hazard 與 risk 的方法學差異，**不得綜合成單一結論，也不得只寫其中一方**。引 EFSA 時必須一併保留它自己載明的「資料缺口」與「23 項擬議用途中 12 項對哺乳類有長期高風險」，否則就是斷章取義。
    - **「台灣畜牧用藥導致人類抗藥性上升」** —— 台灣端缺乏可對接的銷售量與抗藥性同期數據，這個因果句沒有公開資料能支撐。只能寫成國際建議與政策方向。
    - **「假性飢餓」** —— 這不是學術術語，同儕審查文獻裡沒有這個詞。只能引 emotional eating 文獻（Nutrients 2023, DOI 10.3390/nu15051173）並說明兩者關係，不可當學術概念引用。

### 三個操作紀律

- 所有台灣官方頁面的日期都是**民國紀年**。轉西元時務必用頁面原文核對——這正是第 1 條錯誤的成因。
- 疫情、統計、查詢介面類來源必須記 `retrievedAt`，並在頁面上顯示擷取日期。
- **不得因為排程重跑就更新 `dateModified`**（計畫書 §9.3）。第一批只有 3 篇文章，人工控管即可，但寫 seed script 時就要把這件事設計進去：`dateModified` 由內容檔明確指定，不是 `new Date()`。

---

## 8. 建議執行順序

| # | 工作 | 為什麼是這個順序 |
|---|---|---|
| 1 | **Growth CSS**（抽既有 design system 的 token） | 沒有版面就看不出來源清單與爭議並列有沒有做對 |
| 2 | **補 3 組 schema 欄位**：`Topic.sources`、`Topic`／`Entity` 的 `primaryCtaUrl` + `primaryCtaLabel` | 一次 migration 解決 §3-1 與 §3-4，之後內容檔才不用重寫 |
| 3 | **內容檔格式 ＋ idempotent upsert script**（先跑通 1 個 topic、2 個 entity） | 先用最小內容驗證整條管線，不要等 12 個頁面都寫完才第一次跑 |
| 4 | **在 preview 驗證**：HTML canonical、JSON-LD、內部連結、sitemap、draft 不外洩 | 用 preview，不用 production |
| 5 | **補完第一批內容**（2 topic、9 entity、3 article） | 通過第 4 步才做，避免大量返工 |
| 6 | **上線 → Search Console URL Inspection ／ Rich Results 驗證** | 計畫書 Phase 4 要求先驗證再擴張 |
| 7 | 加 `Claim` / `ClaimSource` 與 `/evidence` 路由（§3-3 選項 B） | 擴張到第二批之前 |

第 2 步會動到 production 資料庫的 schema，需要跑 migration——依 `docs/vercel-deployment-roles.md` §4，那是由 Richmond 手動執行的。

---

## 9. 需要 Richmond 決定的事

1. **第一批開 2 個還是 3 個 Topic Hub？**（第三個是食品標示，成本最低但主站素材薄）
2. **§3-3 的爭議呈現走選項 A 還是 B？** 我建議 A（第一批不改 schema），B 排在第二批之前。
3. **§8 第 2 步要不要做？** 不做的話，第一批的 Topic Hub 沒有來源清單，而且所有 CTA 都指向主站首頁。
4. **主站那篇標題的「2025」要不要處理？** 主站是紅線，我不會動。只是 growth 站如果做這個題目，年份必須是 2026。
5. **`prisma/wordpress-posts.json` 要不要重抓？**（目前差 18 篇）
6. **作者與審閱者要掛誰的名字？** 計畫書 §9.3 要求顯示作者與審閱者。fixture 用的是「潤讀知識站（測試資料）」，正式內容需要真名或明確的編輯部署名——**不得建立假作者**。
7. 交接文件 §7 原有的待決事項仍未決：cookie consent gate、preview 環境變數是否放寬到所有分支、何時遷移到自有網域。

---

## 附錄：本報告採用的來源（皆經實際 fetch 驗證）

**法規（全國法規資料庫／農業部主管法規）**

- 食品安全衛生管理法 §3、§21、§22 — https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=L0040001&flno=22
- 動物用藥品管理法（105-11-09 修正）— https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=M0130015
- 動物用藥品使用準則（114-01-08 修正）— https://law.moj.gov.tw/LawClass/LawAll.aspx?PCODE=M0130023
- 動物用藥殘留標準（112-07-13 修正）— https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0040026
- 農藥殘留容許量標準（115-04-21 修正）— https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0040083
- 有機農業促進法（107-05-30 公布，108-05-31 施行）— https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=M0030093
- 食品良好衛生規範準則（114-06-04 修正，54 條）— https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0040122
- 食品安全管制系統準則（107-05-01 修正，13 條）— https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0040116
- 食品業者登錄辦法（115-01-05 修正，10 條）— https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0040112
- 雞蛋友善生產系統定義及指南（111-05-23 修正）— https://law.moa.gov.tw/LawContent.aspx?id=GL000691
- 產銷履歷農產品驗證基準（112-03-24 修正）— https://law.moa.gov.tw/LawContent.aspx?id=GL001310

**主管機關公告與專區**

- 食藥署：我國流通之基因改造食品項目（2025-05-05 更新）— https://www.fda.gov.tw/TC/sitecontent.aspx?sid=3976
- 衛福部：公告修正包裝食品營養標示應遵行事項（2022-06-23 公告，2024-07-01 生效）— https://www.mohw.gov.tw/cp-5269-70142-1.html
- 衛福部：食品過敏原標示 11 項（2020-07-01 生效）— https://www.mohw.gov.tw/fp-16-43376-1.html
- 衛福部：114 年國家級防疫一體抗生素抗藥性管理行動計畫 — https://www.mohw.gov.tw/cp-16-81065-1.html
- 防檢署：進口馬鈴薯全流程嚴格把關（115-04-20）— https://www.aphia.gov.tw/theme_data.php?theme=NewInfoListWS&id=21548
- 衛福部：美國產加工用馬鈴薯輸入食安標準不變（115-04-23）— https://www.mohw.gov.tw/cp-7398-86211-1.html
- 防檢局：自 89 年起逐年檢討刪減 34 種含藥物飼料添加物（2015-12-01）— https://www.aphia.gov.tw/theme_data.php?theme=NewInfoListWS&id=9925
- 產銷履歷農產品資訊網（115-08-28 更新）— https://taft.moa.gov.tw/cp-1073-1990-6162c-1.html
- 禽流感資訊專區（115-08-11 更新）— https://ai.gov.tw/
- 國健署：我的餐盤六口訣（2019-11-13）— https://www.mohw.gov.tw/cp-4251-50222-1.html
- 國健署：國人膳食營養素參考攝取量第八版（2020-04-08 發布，2025-11-21 更新）— https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=4248&pid=12285

**開放資料**

- 基因改造食品原料資料集（2026-08-26 更新）— https://data.gov.tw/dataset/9048
- 市售食品調查蔬果農藥殘留資料集（2026-07-02 更新）— https://data.gov.tw/dataset/8935

**國際機構**

- IARC Monograph on Glyphosate（2015-03-20）— https://www.iarc.who.int/featured-news/media-centre-iarc-news-glyphosate/
- EFSA: Glyphosate — no critical areas of concern（2023-07-06）— https://www.efsa.europa.eu/en/news/glyphosate-no-critical-areas-concern-data-gaps-identified
- WHO guidelines on use of medically important antimicrobials in food-producing animals（2017-11-07）— https://www.who.int/publications/i/item/9789241550130
- WOAH／OHHLEP One Health 定義 — https://www.woah.org/en/what-we-do/global-initiatives/one-health/
- WHO: Food, genetically modified（2014-05-01）— https://www.who.int/news-room/questions-and-answers/item/food-genetically-modified
- WHO: Sodium reduction fact sheet（2026-05-11）— https://www.who.int/news-room/fact-sheets/detail/sodium-reduction

**學術**

- Dakanalis A. et al., *The Association of Emotional Eating with Overweight/Obesity, Depression, Anxiety/Stress, and Dietary Patterns*, Nutrients 15(5):1173, 2023-02-26, DOI 10.3390/nu15051173 — https://pmc.ncbi.nlm.nih.gov/articles/PMC10005347/
