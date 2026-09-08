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
      { href: "/entities/tap-traceability", label: "認識產銷履歷與追溯資訊" },
      { href: "/topics/food-production", label: "回到食品生產與飼養方式主題" },
    ],
  },
];

export function findEntityReaderGuide(slug: string) {
  return entityReaderGuides.find((guide) => guide.slug === slug);
}
