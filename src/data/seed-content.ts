import type { CmsContent } from "@/types/content";

export const seedContent: CmsContent = {
  authors: [
    {
      id: "author-editorial",
      name: "潤讀編輯",
      email: "editor@soweread.com",
      role: "admin",
      bio: "致力於食品安全與營養知識的傳播，幫助讀者做出更明智的飲食選擇。",
    },
  ],
  categories: [
    {
      id: "food-safety",
      name: "食品安全",
      slug: "food-safety",
      description: "食品標示、食安風險與消費選擇。",
    },
    {
      id: "nutrition",
      name: "營養知識",
      slug: "nutrition",
      description: "營養標籤、飲食節奏與身體訊號。",
    },
    {
      id: "healthy-eating",
      name: "健康飲食",
      slug: "healthy-eating",
      description: "日常飲食習慣與外食選擇。",
    },
    {
      id: "food-culture",
      name: "飲食文化",
      slug: "food-culture",
      description: "從文化與生活脈絡重新理解餐桌。",
    },
  ],
  posts: [
    {
      id: "post-gmo-guide",
      title: "「基改食物」哪些被你吃下肚？台灣大宗進口原物料黃豆、玉米、小麥進口實況與選購指南",
      slug: "gmo-food-import-guide",
      excerpt:
        "基改食品早已成為現代飲食不可避免的一部分。本文整理台灣大宗進口原物料現況，並提供日常選購時可操作的判斷方法。",
      categoryId: "food-safety",
      authorId: "author-editorial",
      status: "published",
      publishedAt: "2026-04-20",
      readingMinutes: 8,
      views: 1250,
      comments: 24,
      featured: true,
      tags: ["基改食品", "食品標示", "黃豆", "玉米", "食安"],
      seoTitle: "基改食物選購指南｜潤讀 So We Read",
      seoDescription: "理解台灣進口黃豆、玉米、小麥與基改食品標示，做出更明智的飲食選擇。",
      content: `
### 前言：餐桌上的隱形革命

曾幾何時，「基因改造食品」這個詞還帶有些許神祕色彩，但如今，它已悄悄佔據了我們餐桌的一角。從早餐的玉米片、中午的豆漿，到晚餐的食用油，基改食品早已成為現代飲食不可避免的一部分。

臺灣作為農產品高度仰賴進口的市場，每年進口大量黃豆、玉米與小麥。這些數據背後，隱含著我們與全球糧食供應鏈之間密不可分的關係。

> 我們吃進去的食物，很可能來自千里之外的基改作物。

### 臺灣的糧食進口現況

臺灣的地理位置和耕地條件限制了本地農業的發展，導致我們對進口糧食的依賴度極高。以黃豆為例，臺灣每年進口大量黃豆，其中相當比例來自基因改造作物。

玉米的情況也類似。進口玉米多用於動物飼料和食品加工，這些玉米不僅進入食品供應鏈，也間接影響我們食用的肉類、乳製品和加工食品。

### 基因改造與食品安全

關於基改食品的安全性，科學界已有大量研究。經過嚴格審查和檢測的基改食品，與傳統食品的安全性並無顯著差異。但這並不代表消費者不需要關心風險。

- 農藥殘留：部分基改作物被設計為耐除草劑，可能改變農藥使用方式。
- 營養成分變化：某些作物的營養組成可能與原始種類有所差異。
- 生態影響：基改作物可能對本地生態系統產生長期影響。

對消費者而言，最實際的問題是：我們有權利知道自己吃的是什麼。

### 選購指南：如何做出明智選擇

雖然無法完全避免基改食品，但消費者仍有方法做出更有意識的選擇。

- **檢查標籤：** 閱讀包裝上的「基因改造」或相關標示。
- **選擇有機食品：** 有機認證產品通常禁止使用基改成分。
- **支持在地農業：** 購買本地農產品，減少對進口加工原料的依賴。
- **多樣化飲食：** 不要過度依賴單一食品來源。

### 未來展望

基因改造技術本身並無好壞之分，關鍵在於如何使用。隨著基因編輯技術的發展，未來我們可能看到更多創新的農業解決方案。

作為消費者，我們的責任是保持知情，做出有意識的選擇，並支持更透明、更負責任的食品供應鏈。
`,
    },
    {
      id: "post-food-appearance",
      title: "食安真相：別被「賣相」騙了！",
      slug: "food-appearance-truth",
      excerpt:
        "許多消費者購買食品時，往往被吸引人的外觀所迷惑。但食品安全專家提醒，商品的顏值並不能代表其營養價值和安全性。",
      categoryId: "food-safety",
      authorId: "author-editorial",
      status: "published",
      publishedAt: "2026-04-20",
      readingMinutes: 6,
      views: 1180,
      comments: 21,
      featured: false,
      tags: ["食安", "消費選擇", "食品品質"],
      content: "### 食安真相\n\n外觀漂亮不等於品質安全。購買食品時，應該把成分、保存方式、來源與標示一起納入判斷。",
      seoTitle: "食安真相：別被賣相騙了",
      seoDescription: "從食品外觀、標示與來源理解真正的食品品質。",
    },
    {
      id: "post-hunger-signals",
      title: "學會分辨飢餓信號",
      slug: "hunger-signals",
      excerpt:
        "你是否經常吃但仍感到飢餓？真正的生理飢餓和情緒性進食是不同的，理解差異能幫助你建立更健康的飲食習慣。",
      categoryId: "nutrition",
      authorId: "author-editorial",
      status: "published",
      publishedAt: "2026-04-18",
      readingMinutes: 5,
      views: 892,
      comments: 18,
      featured: false,
      tags: ["飢餓", "營養", "情緒性進食"],
      content: "### 身體訊號\n\n飢餓不只是胃空了，也可能與睡眠、壓力、情緒和飲食組成有關。",
      seoTitle: "學會分辨飢餓信號",
      seoDescription: "理解生理飢餓與情緒性進食的差異。",
    },
    {
      id: "post-metabolism-traps",
      title: "外食族必看！破壞代謝力的陷阱",
      slug: "metabolism-traps",
      excerpt:
        "現代人生活快節奏，外食成為常態。但許多外食選項暗含高熱量、高鈉的陷阱，對代謝造成無形負擔。",
      categoryId: "healthy-eating",
      authorId: "author-editorial",
      status: "published",
      publishedAt: "2026-04-15",
      readingMinutes: 7,
      views: 1680,
      comments: 32,
      featured: true,
      tags: ["外食", "代謝", "健康飲食"],
      content: "### 外食與代謝\n\n外食不必然不健康，關鍵在於辨識高鈉、高糖、高油與份量失衡的組合。",
      seoTitle: "外食族必看：破壞代謝力的陷阱",
      seoDescription: "辨識外食中的高熱量與高鈉陷阱。",
    },
    {
      id: "post-taiwan-food-culture",
      title: "台灣飲食文化現象",
      slug: "taiwan-food-culture",
      excerpt:
        "從早餐文化到夜市美食，台灣飲食反映了這片土地的多元性和創意。重新認識身邊的食物，也是在重新認識生活。",
      categoryId: "food-culture",
      authorId: "author-editorial",
      status: "published",
      publishedAt: "2026-04-12",
      readingMinutes: 5,
      views: 765,
      comments: 15,
      featured: false,
      tags: ["台灣", "飲食文化", "夜市"],
      content: "### 台灣餐桌\n\n飲食文化不只關於味道，也包含移民、城市節奏、家庭記憶與地方產業。",
      seoTitle: "台灣飲食文化現象",
      seoDescription: "從早餐與夜市理解台灣飲食文化。",
    },
    {
      id: "post-organic-food",
      title: "有機食品真的更安全嗎？",
      slug: "organic-food-safety",
      excerpt:
        "有機食品的價格通常更高，但它是否真的比傳統食品更安全？科學研究顯示，答案比你想像的複雜。",
      categoryId: "food-safety",
      authorId: "author-editorial",
      status: "published",
      publishedAt: "2026-04-10",
      readingMinutes: 6,
      views: 1420,
      comments: 28,
      featured: true,
      tags: ["有機", "食安", "農產品"],
      content: "### 有機與安全\n\n有機食品提供一種生產方式的承諾，但安全性仍需回到來源、保存、標示與風險管理。",
      seoTitle: "有機食品真的更安全嗎？",
      seoDescription: "客觀理解有機食品的優點與限制。",
    },
    {
      id: "post-nutrition-label",
      title: "營養標籤怎麼讀？",
      slug: "nutrition-label-guide",
      excerpt:
        "超市食品背面的營養標籤看起來複雜，但掌握幾個要點，你就能把資訊變成簡單易懂的購物判斷。",
      categoryId: "nutrition",
      authorId: "author-editorial",
      status: "published",
      publishedAt: "2026-04-08",
      readingMinutes: 4,
      views: 634,
      comments: 12,
      featured: false,
      tags: ["營養標籤", "購物", "食品成分"],
      content: "### 營養標籤\n\n先看份量，再看熱量、糖、鈉與脂肪，最後比對成分表，能避免被單一宣稱帶著走。",
      seoTitle: "營養標籤怎麼讀？",
      seoDescription: "掌握營養標籤判讀方式，做出聰明購物選擇。",
    },
  ],
};
