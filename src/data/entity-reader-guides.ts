/** Code-owned reader guides; entity publication gates remain in knowledge-core. */
export type ReaderGuide = {
  slug: string;
  typeLabel: string;
  title: string;
  introduction: string;
  sections: {
    id: string;
    title: string;
    paragraphs: string[];
    steps?: string[];
    table?: { caption: string; columns: string[]; rows: string[][] };
    sourceIds: string[];
  }[];
  questions: { question: string; answer: string }[];
  links: { href: string; label: string }[];
};

export const readerGuideSources = [
  {
    id: "nutrition-format",
    title: "包裝食品營養標示應遵行事項問答集：Q5.2，PDF 第 8–9 頁",
    publisher: "衛生福利部",
    url: "https://www.mohw.gov.tw/dl-78104-abdef231-e94f-49ed-9f80-a2f659f21c28.html#page=8",
    version: "2022-06-23 修訂",
    retrievedAt: "2026-09-08",
  },
  {
    id: "allergen-reading",
    title: "食品過敏原標示規定問答集：Q4、Q7，PDF 第 1–2 頁",
    publisher: "衛生福利部",
    url: "https://www.mohw.gov.tw/dl-64172-4f64e2a4-d8df-44d3-acac-ac1e060b1fa2.html#page=1",
    version: "2018-09-21 修訂",
    retrievedAt: "2026-09-08",
  },
  {
    id: "egg-systems",
    title: "雞蛋友善生產系統定義及指南：第 1–4 點，PDF 第 1–3 頁",
    publisher: "農業部主管法規查詢系統",
    url: "https://law.moa.gov.tw/Download.ashx?FileID=42180&id=GL000691&type=LAW#page=1",
    version: "2022-05-23 修正",
    retrievedAt: "2026-09-08",
  },
  {
    id: "pesticide-mrl-std",
    title: "農藥殘留容許量標準（全國法規資料庫）",
    publisher: "法務部",
    url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0040083",
    version: "2026-04-21 修正",
    retrievedAt: "2026-09-03",
  },
  {
    id: "pesticide-survey-data",
    title: "市售食品調查蔬果農藥殘留資料集",
    publisher: "衛生福利部食品藥物管理署（政府資料開放平臺）",
    url: "https://data.gov.tw/dataset/8935",
    version: "頁面載明最後更新 2026-07-02",
    retrievedAt: "2026-09-03",
  },
  {
    id: "who-amr-2017",
    title: "WHO guidelines on use of medically important antimicrobials in food-producing animals",
    publisher: "World Health Organization",
    url: "https://www.who.int/publications/i/item/9789241550130",
    version: "2017-11-07",
    retrievedAt: "2026-09-03",
  },
  {
    id: "amr-plan-2025",
    title: "114 年啟動「國家級防疫一體抗生素抗藥性管理行動計畫」",
    publisher: "衛生福利部",
    url: "https://www.mohw.gov.tw/cp-16-81065-1.html",
    version: "2025-01-01",
    retrievedAt: "2026-09-03",
  },
  {
    id: "woah-one-health",
    title: "One Health（OHHLEP 定義）",
    publisher: "World Organisation for Animal Health (WOAH)",
    url: "https://www.woah.org/en/what-we-do/global-initiatives/one-health/",
    version: "未載明更新日期",
    retrievedAt: "2026-09-03",
  },
  {
    id: "organic-act",
    title: "有機農業促進法：第 3 條第 6 款、第 20 條第 1 項、第 29 條第 1 款",
    publisher: "全國法規資料庫（法務部）",
    url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=M0030093",
    version: "公布日 2018-05-30，施行日 2019-05-31",
    retrievedAt: "2026-09-03",
  },
  {
    id: "tfda-gmo-items",
    title: "我國流通之基因改造食品項目（基因改造食品管理專區）",
    publisher: "衛生福利部食品藥物管理署",
    url: "https://www.fda.gov.tw/TC/sitecontent.aspx?sid=3976",
    version: "頁面載明最後更新日 2025-05-05",
    retrievedAt: "2026-09-03",
  },
  {
    id: "tfda-gmo-registry",
    title: "基因改造食品原料查驗登記許可證資料查詢",
    publisher: "衛生福利部食品藥物管理署（食品藥物消費者專區）",
    url: "https://consumer.fda.gov.tw/Food/GmoInfo.aspx?nodeID=167",
    version: "動態查詢介面，未載明更新日期",
    retrievedAt: "2026-09-03",
  },
] as const;

export const nutritionTeachingExamples = [
  { label: "假設食品 A", servingGrams: 30, sodiumMgPerServing: 120 },
  { label: "假設食品 B", servingGrams: 50, sodiumMgPerServing: 150 },
] as const;

export function sodiumForGrams(sodiumMgPerServing: number, servingGrams: number, grams: number) {
  if (![sodiumMgPerServing, servingGrams, grams].every(Number.isFinite)
    || servingGrams <= 0 || sodiumMgPerServing < 0 || grams < 0) {
    throw new RangeError("換算需要有效的非負含量與食用重量，且每份重量必須大於零。");
  }
  return sodiumMgPerServing / servingGrams * grams;
}

export const entityReaderGuides: ReaderGuide[] = [
  {
    slug: "nutrition-facts-label",
    typeLabel: "食品標示",
    title: "營養標示怎麼比？先看單位，再算實際吃下的份量",
    introduction: "兩包食品的「每份」不一定一樣大。先確認欄位與每份重量，再換成同一基準，就能避免把份量差異誤認為營養含量差異。這份指南以鈉為例，練習讀數字與換算。",
    sections: [
      {
        id: "read-format",
        title: "第一步：辨識第二欄是含量，還是百分比",
        paragraphs: [
          "衛福部問答集 Q5.2 提供一般包裝食品兩種範例格式：一種是「每份＋每 100 公克（或毫升）」；另一種是「每份＋每日參考值百分比」。並非所有食品都必須同時列出每份與每 100 公克。問答集也對特定食品另有格式要求，本頁不作個別產品合規判定。",
          "「每日參考值百分比」是參考值占比，不能當成每 100 公克含量，也不是為你個人訂出的飲食目標。比較前先讀欄名；若要自行換算，還需要包裝上每份的重量或容量。",
        ],
        steps: ["找出「每一份量」及「本包裝含幾份」。", "確認第二欄是每 100 公克／毫升，或每日參考值百分比。", "兩項產品使用相同重量或相同容量比較；不要直接把公克和毫升混算。"],
        sourceIds: ["nutrition-format"],
      },
      {
        id: "compare-same-weight",
        title: "第二步：把兩款食品換成相同重量",
        paragraphs: [
          "以下是潤讀原創的假設教學數字，不是商品測試，也不是完整法定營養標籤。A 每份 30 公克、鈉 120 毫克；B 每份 50 公克、鈉 150 毫克。只看每份會以為 A 較少，但兩份重量不同。",
          "換算公式：每 100 公克的鈉＝每份鈉含量 ÷ 每份公克數 × 100。A 為 120 ÷ 30 × 100＝400 毫克；B 為 150 ÷ 50 × 100＝300 毫克。相同重量下，這組假設數字是 B 的鈉較少。",
        ],
        table: {
          caption: "假設教學比較：統一重量後再讀鈉含量（非完整營養標籤）",
          columns: ["假設食品", "每份重量", "每份鈉", "換算每 100 公克鈉", "實吃 60 公克的鈉"],
          rows: nutritionTeachingExamples.map((example) => [example.label, `${example.servingGrams} 公克`, `${example.sodiumMgPerServing} 毫克`, `${sodiumForGrams(example.sodiumMgPerServing, example.servingGrams, 100)} 毫克`, `${sodiumForGrams(example.sodiumMgPerServing, example.servingGrams, 60)} 毫克`]),
        },
        sourceIds: [],
      },
      {
        id: "actual-portion",
        title: "第三步：再算自己實際吃了多少",
        paragraphs: [
          "實際鈉攝取量＝每份鈉含量 ×（實吃重量 ÷ 每份重量）。若各吃 60 公克：A 吃了 2 份，鈉為 240 毫克；B 吃了 1.2 份，鈉為 180 毫克。不是只有完整一份才能換算。",
          "同重量比較用來理解食品差異，實吃份量則用來估算這次攝取量。一整包可能含多份，別把每份數字直接當成整包數字。鈉較少也不等於整體更健康；單一營養素比較沒有涵蓋整體飲食、其他成分與個人需求。",
        ],
        sourceIds: [],
      },
    ],
    questions: [
      { question: "第二欄只有百分比，就不能比較嗎？", answer: "仍可用每份含量與每份重量換算相同重量。若份量只提供顆數且沒有可用重量，別猜每顆有幾公克；先取得足夠資訊，再做重量比較。" },
      { question: "這個表能判定哪一款食品更健康嗎？", answer: "不能。它只示範同重量與實際份量下的鈉含量換算，不提供產品健康排名。" },
    ],
    links: [
      { href: "/articles/mandatory-food-labels", label: "除了營養標示，包裝還有哪些資訊要看？" },
      { href: "/entities/allergen-labeling", label: "接著讀：過敏原資訊應該在哪裡找？" },
      { href: "/topics/food-labeling", label: "回到食品標示與消費選擇主題" },
    ],
  },
  {
    slug: "allergen-labeling",
    typeLabel: "食品標示",
    title: "過敏原資訊在哪裡？一起看品名、成分與醒語",
    introduction: "不要只在包裝上尋找一個獨立的「過敏原」方框。品名、成分表與醒語各有資訊，交叉閱讀才能看見需要進一步確認的地方。本頁教你找資訊，不判定個別食品是否適合你食用。",
    sections: [
      {
        id: "three-places",
        title: "第一步：依序讀三個位置",
        paragraphs: ["依衛福部問答集 Q4、Q7，過敏原資訊可以用顯著醒語表達，也有在品名全部載明所含致過敏性內容物的方式。只在成分表列出，不等於已完成上述標示方式；反過來，沒有獨立醒語也不能直接解讀為不含過敏原。"],
        steps: ["先讀品名：寫出了哪些食材？是否只是風味或行銷名稱？", "再讀完整成分表：找出自己需要避開或確認的原料，不只看正面大字。", "最後找「本產品含有……」或等同意義的醒語，與前兩處交叉核對；遇到不清楚的資訊，保留問題向廠商確認。"],
        sourceIds: ["allergen-reading"],
      },
      {
        id: "practice-reading",
        title: "閱讀練習：品名多兩個字，資訊可能就不同",
        paragraphs: ["下表是原創的假設閱讀練習，為了練習只呈現部分文字；不是實際商品，也不是完整標籤或合規範本。假設兩項食品都以花生與牛奶作為原料，先練習找出文字提供的資訊，不從這個片段決定能不能吃。"],
        table: {
          caption: "假設包裝片段：請把資訊缺口當成待確認問題",
          columns: ["閱讀位置", "假設 A", "假設 B", "讀者應注意什麼"],
          rows: [
            ["品名", "花生牛奶冰", "花生冰", "A 的品名出現花生、牛奶；B 只出現花生。"],
            ["成分片段", "……花生、牛奶……", "……花生、牛奶……", "兩者片段都提供牛奶資訊，不能只看品名。"],
            ["醒語檢查", "仍要閱讀完整包裝", "找是否另有含花生、牛奶的醒語", "沒有看到獨立醒語，不代表沒有過敏原；片段不足以判定安全或合規。"],
          ],
        },
        sourceIds: ["allergen-reading"],
      },
      {
        id: "information-gap",
        title: "資訊不清楚時，先記下具體問題",
        paragraphs: [
          "可以記下商品完整名稱、需要確認的成分，以及品名和成分表不一致或看不懂的文字，再向廠商詢問。這樣比只問「這個安全嗎？」更容易取得具體資訊。",
          "這份指南沒有列完法定項目、例外與所有可能致敏食材，也沒有評估製程交叉接觸。不能用「沒看到標示」當成個人食用安全保證；有個人過敏需求時，應依自己的醫療照護建議及可確認的產品資訊作決定。",
        ],
        sourceIds: [],
      },
    ],
    questions: [
      { question: "只有成分表列出過敏原就夠了嗎？", answer: "依引用問答集 Q4，單在成分表展開成分並不足以取代規定的醒語或品名全列方式。本頁不代替個別標籤的合規審查。" },
      { question: "品名寫了花生，可以推定沒有牛奶嗎？", answer: "不能。品名可能沒有提供完整成分資訊；仍須讀成分表與醒語，遇到疑問再查證。" },
    ],
    links: [
      { href: "/articles/mandatory-food-labels", label: "延伸閱讀：包裝食品的強制標示" },
      { href: "/entities/nutrition-facts-label", label: "接著讀：營養標示的份量怎麼換算？" },
      { href: "/topics/food-labeling", label: "回到食品標示與消費選擇主題" },
    ],
  },
  {
    slug: "egg-friendly-production-system",
    typeLabel: "飼養方式",
    title: "平飼、放牧、豐富化籠飼怎麼分？買蛋前問三個問題",
    introduction: "看到包裝寫「友善」，先找具體飼養方式，再看資訊能否追到來源雞場。飼養方式描述雞隻的生活環境，不能直接當成雞蛋營養或用藥結果的證明。",
    sections: [
      {
        id: "three-systems",
        title: "先分清楚指南中的三種方式",
        paragraphs: ["引用的《雞蛋友善生產系統定義及指南》將系統分為放牧、平飼與豐富化籠飼三種。傳統籠飼不屬於這份指南列出的三類；豐富化籠飼仍是籠飼，不能與非籠飼畫上等號。"],
        table: {
          caption: "潤讀閱讀比較：摘要飼養環境差異，非完整設施查核表",
          columns: ["方式", "戶外活動", "活動空間與設施重點", "購買時可追問"],
          rows: [
            ["放牧", "提供室內及戶外地面自由活動空間", "有雞舍、棲息與戶外遮蔽等設施要求", "可否查到來源雞場與戶外活動區資訊？"],
            ["平飼", "此類定義沒有戶外活動區要求", "雞舍內活動，設有棲架、巢箱與墊料", "資料是否清楚說明雞舍環境與來源？"],
            ["豐富化籠飼", "此類定義沒有戶外活動區要求", "籠內設有棲架、巢箱及支持自然行為的設施", "是否清楚標示豐富化籠飼，而不是只寫友善？"],
          ],
        },
        sourceIds: ["egg-systems"],
      },
      {
        id: "check-the-claim",
        title: "把包裝上的形容詞，變成可查證問題",
        paragraphs: ["指南第 1 點要求雞場備有呈現飼養管理狀況及追溯功能的紀錄，以證明符合所標示的系統。對讀者而言，可以先確認是否有具體系統名稱、來源與查詢資訊；一張雞場照片或一句「友善」，不能單獨證明完整符合指南。"],
        steps: ["問方式：是放牧、平飼，還是豐富化籠飼？", "問來源：是否能找到雞場、批次或業者提供的追溯資訊？", "問依據：標示宣稱有什麼管理紀錄或查核資訊可供確認？資訊不足就保留未知。"],
        sourceIds: ["egg-systems"],
      },
      {
        id: "buying-example",
        title: "假設選購情境：兩盒都寫友善，怎麼往下看？",
        paragraphs: [
          "假設 A 盒正面只寫「友善好蛋」，B 盒寫「平飼」並提供來源查詢入口。你目前只能說 B 提供了較具體、可繼續核對的資訊；還不能因此宣布 B 已通過查核、A 不符合規定，或哪盒比較安全。這是原創教學情境，不是商品評比。",
          "先試著確認 B 的查詢結果是否對得上這盒蛋，再向 A 的業者詢問實際系統名稱。若你在意戶外活動，就要進一步找放牧系統及其佐證；平飼不等於放牧。",
          "這三種方式本身都不能直接推出「沒有用藥」「零殘留」或「營養更高」。指南對防疫、飼料及治療另有一般遵法要求；飼養系統名稱不足以回答特定批次的檢驗結果或營養比較。",
        ],
        sourceIds: ["egg-systems"],
      },
    ],
    questions: [
      { question: "平飼雞一定會到戶外活動嗎？", answer: "不能從平飼名稱這樣推定。引用指南對放牧明列室內及戶外活動；平飼的設施要求以雞舍內為主。" },
      { question: "豐富化籠飼就是傳統籠飼嗎？", answer: "兩者不能混用。豐富化籠飼是指南的三類之一，另有棲架、巢箱等設施要求；但它仍屬籠飼。" },
    ],
    links: [
      { href: "/articles/egg-production-systems", label: "延伸閱讀：蛋雞飼養方式與設施要求" },
      { href: "/entities/enriched-cage", label: "深入看：豐富化籠飼的面積規定與動物福利爭議" },
      { href: "/entities/tap-traceability", label: "認識產銷履歷與追溯資訊" },
      { href: "/topics/food-production", label: "回到食品生產與飼養方式主題" },
    ],
  },
  {
    slug: "pesticide-residue-limit",
    typeLabel: "法規標準",
    title: "查不到這款農藥的容許量，代表什麼？先看懂附表架構",
    introduction: "《農藥殘留容許量標準》不是一張表，是好幾張表的組合。查一款農藥前，先弄清楚要對到哪張附表、哪個農產品分類，再去看實際檢驗結果——法規數值跟抽驗數值回答的是不同問題，本頁教你分開讀。",
    sections: [
      {
        id: "five-tables",
        title: "第一步：這款農藥屬於哪一張附表",
        paragraphs: [
          "依引用法規，容許量標準除了主要的殘留容許量表，另外訂有外源性農藥容許量表、免訂容許量之農藥、公告禁用農藥，以及農產品分類共五個部分。同一款農藥可能出現在不只一張表裡，也可能因為屬於禁用農藥而完全不會出現在容許量表中。",
          "查詢前先確認農產品分類怎麼歸類你手上的品項——例如某些葉菜類與根莖類的分類方式不一定符合直覺，分類錯了，對到的容許量數值也會錯。",
        ],
        steps: ["先查這款農藥是否在公告禁用農藥名單中。", "不在禁用名單，再查殘留容許量表或外源性農藥容許量表是否列有這款農藥與你手上的農產品分類組合。", "查不到對應組合時，先記下農藥名稱與農產品分類，再向公告本身或主管機關確認，不要自行假設結果。"],
        sourceIds: ["pesticide-mrl-std"],
      },
      {
        id: "law-vs-survey",
        title: "第二步：法規容許量跟抽驗結果，是兩份不同的資料",
        paragraphs: [
          "容許量標準訂的是「上限」，抽驗資料集記錄的是「某一批次實際測到多少」。兩者都需要查，但問題不一樣：容許量回答「上限是多少」，抽驗結果回答「這次抽驗到的批次有沒有超標」。",
          "抽驗資料集是官方定期公布的市售蔬果農藥殘留調查，依頁面資訊每 3 個月更新一次；它反映的是被抽到的批次，不是市售全部商品都逐一檢驗過。",
        ],
        sourceIds: ["pesticide-mrl-std", "pesticide-survey-data"],
      },
    ],
    questions: [
      { question: "容許量標準裡查不到某款農藥，代表完全不會被檢出嗎？", answer: "不能這樣推定。查不到可能是因為屬於免訂容許量之農藥、公告禁用農藥，也可能是分類或名稱沒有對上；本頁不作個別檢驗結果的合規判定，需要對照完整附表與農產品分類確認。" },
      { question: "抽驗資料集顯示某批次『合格』，能保證我買到的那批也合格嗎？", answer: "不能。資料集記錄的是被抽驗的特定批次結果，不是每一批市售農產品都經過檢驗；未受檢的批次不在資料集涵蓋範圍內。" },
    ],
    links: [
      { href: "/entities/glyphosate", label: "個案延伸：嘉磷塞（年年春）的容許量與國際評估分歧" },
      { href: "/entities/veterinary-drug-residue-standard", label: "對照：動物用藥殘留標準怎麼定義未列品目？" },
      { href: "/topics/pesticides-and-veterinary-drugs", label: "回到農藥與動物用藥主題" },
    ],
  },
  {
    slug: "antimicrobial-resistance",
    typeLabel: "風險概念",
    title: "『抗藥性』是誰產生的？先分清楚主體再往下讀",
    introduction: "日常說法常把抗藥性講得像是人或動物本身的體質變化。實際上，抗藥性是微生物演化出來的耐受性，跟著微生物移動，不是使用者身體的反應。分清楚這個主體，才不會把後面的政策建議看反了。",
    sections: [
      {
        id: "who-is-resistant",
        title: "第一步：抗藥性發生在微生物身上，不是人或動物身上",
        paragraphs: [
          "抗生素抗藥性指的是微生物對原本有效的抗微生物製劑產生耐受性，使得既有治療失去效果。重點主體是微生物，不是接受治療的人或動物——這跟「我對這款藥有抗藥性」的日常講法，主體其實不同。",
        ],
        sourceIds: [],
      },
      {
        id: "who-recommendation",
        title: "第二步：WHO 2017 年的建議，針對的是哪種用法",
        paragraphs: [
          "WHO 於 2017 年發布的指引，建議的方向是停止對健康動物例行使用抗生素以促進生長或預防疾病。這句話裡有兩個限定：對象是健康動物，用途是例行性的促進生長或預防疾病；治療已生病動物的用藥情境，不是這句建議直接描述的對象。完整的適用條件與例外，仍需查閱指引原文，本頁只整理已公開的政策方向。",
        ],
        sourceIds: ["who-amr-2017"],
      },
      {
        id: "taiwan-plan",
        title: "第三步：台灣怎麼把這個議題放進行動計畫",
        paragraphs: [
          "台灣於民國 114 年啟動「國家級防疫一體抗生素抗藥性管理行動計畫」，由疾管署、食藥署與農業部共同執行。農業面向的工作包含研擬降低動物用抗生素使用的策略，以及評估替代物質——這代表這個議題橫跨公衛與農業，不是單一部會能獨立處理的事。",
        ],
        sourceIds: ["amr-plan-2025"],
      },
    ],
    questions: [
      { question: "是我或我家的動物『對抗生素產生了抗藥性』嗎？", answer: "嚴格來說，產生耐受性的是微生物，不是人或動物的身體本身。治療失效是因為感染的微生物對藥物不再敏感，不是身體對藥物的反應改變了。" },
      { question: "WHO 的建議等於全面禁止動物用抗生素嗎？", answer: "不是。2017 年指引建議停止的是對健康動物例行使用抗生素以促進生長或預防疾病，不是禁止治療已生病動物；完整範圍與例外仍以指引原文為準。" },
    ],
    links: [
      { href: "/entities/one-health", label: "接著讀：『防疫一體』是什麼樣的合作框架？" },
      { href: "/entities/veterinary-drug-residue-standard", label: "對照：動物用藥殘留標準怎麼定義？" },
      { href: "/topics/pesticides-and-veterinary-drugs", label: "回到農藥與動物用藥主題" },
    ],
  },
  {
    slug: "one-health",
    typeLabel: "跨領域框架",
    title: "『防疫一體』不是口號，是一個決策框架",
    introduction: "看到「防疫一體」或「One Health」，先問這是在描述一個口號，還是一個實際被拿來用的合作框架。這頁先看官方定義，再看台灣怎麼把它放進實際的政策工具裡。",
    sections: [
      {
        id: "official-definition",
        title: "第一步：官方定義在說什麼",
        paragraphs: [
          "WOAH 引用的 OHHLEP 定義將防疫一體描述為「一種整合而統合的方法，目標是永續地平衡並優化人、動物與生態系的健康」。這個定義的重點是「三者一起優化」，不是只把動物防疫當成人類健康的附屬議題，也不是只談生態。",
        ],
        sourceIds: ["woah-one-health"],
      },
      {
        id: "taiwan-application",
        title: "第二步：台灣怎麼實際用這個框架",
        paragraphs: [
          "台灣在民國 114 年的抗生素抗藥性管理行動計畫中，以防疫一體作為跨部會合作的架構，由疾管署、食藥署與農業部共同執行。這代表「防疫一體」在這個案例裡不只是概念，而是被用來說明為什麼三個不同主管機關要放進同一份行動計畫。",
        ],
        sourceIds: ["amr-plan-2025"],
      },
    ],
    questions: [
      { question: "防疫一體只是動物防疫的概念嗎？", answer: "不是。依引用的 OHHLEP 定義，涵蓋人類健康、動物健康與生態系健康三者；動物防疫只是這個框架下的其中一個應用領域。" },
      { question: "台灣官方文件裡，防疫一體具體做了什麼？", answer: "依已公開資料，它被用作 114 年跨部會抗生素抗藥性管理行動計畫的合作框架；本頁未涵蓋該計畫的完整內容，需要查看原始公告與計畫文件。" },
    ],
    links: [
      { href: "/entities/antimicrobial-resistance", label: "延伸閱讀：抗生素抗藥性的定義與台灣的行動計畫" },
      { href: "/topics/pesticides-and-veterinary-drugs", label: "回到農藥與動物用藥主題" },
    ],
  },
  {
    slug: "organic-certification-mark",
    typeLabel: "驗證標章",
    title: "看到『有機』兩個字，先確認有沒有這個標章",
    introduction: "『有機』在法規上是一個需要驗證才能使用的標章名稱，不是行銷形容詞。這頁教你先找標章本身，再往下追驗證機構資訊，遇到查不到的部分就先記下問題，不自己判定合規與否。",
    sections: [
      {
        id: "legal-basis",
        title: "第一步：標章的法律定義與使用門檻",
        paragraphs: [
          "依《有機農業促進法》第 3 條第 6 款，有機農產品標章是用以證明農產品為有機的法定標章。依第 20 條第 1 項，只有經本法驗證合格的農產品才得使用這個標章——換句話說，標章本身是受規範的使用資格，不是任何人都能自行印上包裝。",
        ],
        sourceIds: ["organic-act"],
      },
      {
        id: "penalty",
        title: "第二步：未經驗證使用標章的罰則",
        paragraphs: [
          "第 29 條第 1 款規定，未經驗證合格而使用標章者，處新臺幣 20 萬元以上 200 萬元以下罰鍰，並得按次處罰。這一條罰則的對象是「使用標章」的行為；包裝上只用文字宣稱、沒有標章圖案的情況是否落入同一罰則，需要查對完整條文與個案事實，本頁不作違法性認定。",
        ],
        sourceIds: ["organic-act"],
      },
      {
        id: "buying-checklist",
        title: "第三步：買有機農產品時可以問什麼",
        paragraphs: [
          "看到標章之後，可以進一步追問驗證機構名稱與驗證範圍，而不是只確認有沒有貼標章。標章證明的是「經驗證合格」，不是特定批次的檢驗結果或營養成分——這兩件事法規定義的範圍不同，不要互相替代解讀。",
        ],
        steps: ["找標章圖案本身，不是只看『有機』文字。", "找驗證機構名稱，確認是可查證的第三方機構。", "資訊不足時，記下具體問題向業者或主管機關詢問，不自行推定合規或違規。"],
        sourceIds: ["organic-act"],
      },
    ],
    questions: [
      { question: "包裝只寫『有機』兩個字，沒有標章圖案，算違法嗎？", answer: "引用的裁罰依據明文針對『使用標章』的行為；純文字宣稱是否適用同一罰則，需要查對完整條文與個案事實，本頁不作違法性認定。" },
      { question: "未經驗證使用標章的罰鍰金額是多少？", answer: "依第 29 條第 1 款，處新臺幣 20 萬元以上 200 萬元以下罰鍰，並得按次處罰；具體個案的裁罰金額仍以主管機關認定為準。" },
    ],
    links: [
      { href: "/entities/tap-traceability", label: "對照：產銷履歷（TAP）的驗證方式有什麼不同？" },
      { href: "/topics/food-production", label: "回到食品生產與飼養方式主題" },
    ],
  },
  {
    slug: "tfda",
    typeLabel: "主管機關",
    title: "食安法第22條說『另行公告』，公告要去哪裡找？",
    introduction: "食安法第 22 條把營養標示、基因改造標示的具體格式授權給主管機關另行公告——查條文本身查不到細節，還要再找到食藥署發布的公告頁面。這頁教你怎麼找、找到之後要注意什麼。",
    sections: [
      {
        id: "law-vs-announcement",
        title: "第一步：分清楚『法條』跟『公告』",
        paragraphs: [
          "食安法第 22 條列出十款強制標示事項，但其中營養標示與基因改造原料標示的具體呈現方式，是由中央主管機關以公告訂定——實務上由衛生福利部與食藥署發布。只查條文本身，看不到這兩項的實際規定內容。",
        ],
        sourceIds: [],
      },
      {
        id: "where-to-look",
        title: "第二步：去食藥署網站找哪個頁面",
        paragraphs: [
          "基因改造食品標示相關的公告與品項清單，收在食藥署「基因改造食品管理專區」；已核准的基因改造食品原料查驗登記紀錄，則在食品藥物消費者專區的查驗登記查詢頁面，但那是動態查詢介面，頁面本身沒有標明總筆數或更新日期。",
        ],
        steps: ["先到基因改造食品管理專區找相關公告與品項清單頁面，記下頁面標示的最後更新日期。", "需要查詢具體原料是否已核准登記，改到消費者專區的查驗登記查詢頁面查詢，不要用清單頁面的資訊代替查詢結果。", "頁面沒有標明更新日期或總筆數時，不要假設它已涵蓋最新全部資料。"],
        sourceIds: ["tfda-gmo-items", "tfda-gmo-registry"],
      },
      {
        id: "version-caution",
        title: "第三步：留意二手轉載跟現行版本可能不一樣",
        paragraphs: [
          "公告與附表的數值會隨修正而變動；網路上流傳的二手整理，內容可能停留在修正前的版本。查到具體規定後，養成核對官方頁面標示的日期或版本說明的習慣，再決定要不要引用。",
        ],
        sourceIds: [],
      },
    ],
    questions: [
      { question: "食藥署跟衛生福利部是什麼關係？", answer: "食藥署是衛生福利部下轄的機關，主管食品、藥物與化粧品安全；食安法多處授權「中央主管機關」公告細節，實務上由衛生福利部或食藥署發布。" },
      { question: "在食藥署網站查到的資料，一定是最新版嗎？", answer: "不一定要自行確認。頁面有標明最後更新日期時以該日期為準；遇到像查驗登記查詢這類沒有標明更新日或總筆數的動態介面，不要假設它已涵蓋最新全部資料。" },
    ],
    links: [
      { href: "/articles/mandatory-food-labels", label: "延伸閱讀：包裝食品的強制標示" },
      { href: "/entities/gmo-food-labeling", label: "接著讀：基因改造食品標示的適用範圍" },
      { href: "/topics/food-labeling", label: "回到食品標示與消費選擇主題" },
    ],
  },
];

export function findEntityReaderGuide(slug: string) {
  return entityReaderGuides.find((guide) => guide.slug === slug);
}
