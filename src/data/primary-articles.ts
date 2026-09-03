import type { PrimaryArticle } from "@/lib/growth/primary-articles";

/**
 * 潤讀主站（https://soweread.com）的文章索引。
 *
 * 由 `scripts/build-primary-article-index.mjs` 從主站快照產生，請勿手動編輯——
 * 更新方式是重跑 npm run backup:wordpress 之後再跑該腳本，並在 PR 裡檢視 diff。
 *
 * 只保存標題、網址與發布日期，不含任何內文。
 *
 * 快照來源：data\wordpress-backup\2026-09-03
 */
export const primaryArticles: PrimaryArticle[] = [
  {
    "title": "台灣「無抗養殖」大革命：告別抗生素，迎向One Health大健康時代",
    "url": "https://soweread.com/%e5%8f%b0%e7%81%a3%e3%80%8c%e7%84%a1%e6%8a%97%e9%a4%8a%e6%ae%96%e3%80%8d%e5%a4%a7%e9%9d%a9%e5%91%bd%ef%bc%9a%e5%91%8a%e5%88%a5%e6%8a%97%e7%94%9f%e7%b4%a0%ef%bc%8c%e8%bf%8e%e5%90%91one-health%e5%a4%a7/",
    "datePublished": "2026-09-01",
    "group": "pesticides-and-veterinary-drugs"
  },
  {
    "title": "食安隱形殺手！除草劑「嘉磷塞」在台灣的逆勢高飛，雞隻無抗生素就安全了嗎？",
    "url": "https://soweread.com/%e9%a3%9f%e5%ae%89%e9%9a%b1%e5%bd%a2%e6%ae%ba%e6%89%8b%ef%bc%81%e9%99%a4%e8%8d%89%e5%8a%91%e3%80%8c%e5%98%89%e7%a3%b7%e5%a1%9e%e3%80%8d%e5%9c%a8%e5%8f%b0%e7%81%a3%e7%9a%84%e9%80%86%e5%8b%a2%e9%ab%98/",
    "datePublished": "2026-08-28",
    "group": "pesticides-and-veterinary-drugs"
  },
  {
    "title": "台灣雞肉與雞蛋有打抗生素嗎？解密「速生雞」發展史與抗藥性真相",
    "url": "https://soweread.com/%e5%8f%b0%e7%81%a3%e9%9b%9e%e8%82%89%e8%88%87%e9%9b%9e%e8%9b%8b%e6%9c%89%e6%89%93%e6%8a%97%e7%94%9f%e7%b4%a0%e5%97%8e%ef%bc%9f%e8%a7%a3%e5%af%86%e3%80%8c%e9%80%9f%e7%94%9f%e9%9b%9e%e3%80%8d%e7%99%bc/",
    "datePublished": "2026-08-21",
    "group": "pesticides-and-veterinary-drugs"
  },
  {
    "title": "住格子籠還是平房好？解析蛋雞飼養環境對產蛋率、雞蛋品質與動物福利的影響",
    "url": "https://soweread.com/%e4%bd%8f%e6%a0%bc%e5%ad%90%e7%b1%a0%e9%82%84%e6%98%af%e5%b9%b3%e6%88%bf%e5%a5%bd%ef%bc%9f%e8%a7%a3%e6%9e%90%e8%9b%8b%e9%9b%9e%e9%a3%bc%e9%a4%8a%e7%92%b0%e5%a2%83%e5%b0%8d%e7%94%a2%e8%9b%8b%e7%8e%87/",
    "datePublished": "2026-08-13",
    "group": "food-production"
  },
  {
    "title": "告別蛋荒與傳統格子籠！水簾式、平飼、放牧養雞場優缺點全解析：哪種友善飼養能兼顧成本與動保？",
    "url": "https://soweread.com/%e5%91%8a%e5%88%a5%e8%9b%8b%e8%8d%92%e8%88%87%e5%82%b3%e7%b5%b1%e6%a0%bc%e5%ad%90%e7%b1%a0%ef%bc%81%e6%b0%b4%e7%b0%be%e5%bc%8f%e3%80%81%e5%b9%b3%e9%a3%bc%e3%80%81%e6%94%be%e7%89%a7%e9%a4%8a%e9%9b%9e/",
    "datePublished": "2026-08-06",
    "group": "food-production"
  },
  {
    "title": "H5N1跨物種風暴來襲！直擊台灣養雞場「A4格子籠」地獄：為什麼設備升級，禽流感撲殺數仍像股市狂飆？",
    "url": "https://soweread.com/h5n1%e8%b7%a8%e7%89%a9%e7%a8%ae%e9%a2%a8%e6%9a%b4%e4%be%86%e8%a5%b2%ef%bc%81%e7%9b%b4%e6%93%8a%e5%8f%b0%e7%81%a3%e9%a4%8a%e9%9b%9e%e5%a0%b4%e3%80%8ca4%e6%a0%bc%e5%ad%90%e7%b1%a0%e3%80%8d%e5%9c%b0/",
    "datePublished": "2026-07-31",
    "group": "food-production"
  },
  {
    "title": "青蔥面臨氣候暴雨與農藥殘留雙重危機！深入解析智能溫室防護、無毒農法、產銷履歷與 IPM 作物病蟲害管理策略",
    "url": "https://soweread.com/%e6%b0%a3%e5%80%99%e6%9a%b4%e9%9b%a8%e8%88%87%e8%be%b2%e8%97%a5%e6%ae%98%e7%95%99%e9%9b%99%e9%87%8d%e5%8d%b1%e6%a9%9f%ef%bc%81%e9%9d%92%e8%94%a5%e7%94%a2%e9%87%8f%e4%b8%8d%e7%a9%a9%ef%bc%9f%e8%a7%a3/",
    "datePublished": "2026-07-27",
    "group": "pesticides-and-veterinary-drugs"
  },
  {
    "title": "台灣洋蔥PK國外洋蔥風味：挑選與料理解析",
    "url": "https://soweread.com/%e5%8f%b0%e7%81%a3%e6%b4%8b%e8%94%a5pk%e5%9c%8b%e5%a4%96%e6%b4%8b%e8%94%a5%e9%a2%a8%e5%91%b3%ef%bc%9a%e6%8c%91%e9%81%b8%e8%88%87%e6%96%99%e7%90%86%e8%a7%a3%e6%9e%90/",
    "datePublished": "2026-07-27",
    "group": "produce"
  },
  {
    "title": "近5年臺灣洋蔥歷程：從產銷失衡到外銷日本的逆風翻轉",
    "url": "https://soweread.com/%e6%9c%ac%e5%9c%9f%e6%b4%8b%e8%94%a5-vs-%e9%80%b2%e5%8f%a3%e6%b4%8b%e8%94%a5%e5%b7%ae%e5%9c%a8%e5%93%aa%ef%bc%9f%e4%b8%80%e6%96%87%e7%9c%8b%e6%87%82%e8%bf%915%e5%b9%b4%e5%8f%b0%e7%81%a3%e6%b4%8b/",
    "datePublished": "2026-07-21",
    "group": "produce"
  },
  {
    "title": "臺灣洋蔥產地、種類、風味全解析：黃、白、紫洋蔥一次搞懂，挑選秘訣與切丁不流淚全攻略",
    "url": "https://soweread.com/2644-2/",
    "datePublished": "2026-07-14",
    "group": "produce"
  },
  {
    "title": "台灣青蔥品種大解密！三星蔥、北蔥、分蔥與大蔥怎麼分？產地、風味與主廚料理指南",
    "url": "https://soweread.com/%e5%8f%b0%e7%81%a3%e9%9d%92%e8%94%a5%e5%93%81%e7%a8%ae%e5%a4%a7%e8%a7%a3%e5%af%86%ef%bc%81%e4%b8%89%e6%98%9f%e8%94%a5%e3%80%81%e5%8c%97%e8%94%a5%e3%80%81%e5%88%86%e8%94%a5%e8%88%87%e5%a4%a7%e8%94%a5/",
    "datePublished": "2026-07-07",
    "group": "produce"
  },
  {
    "title": "美食文化時代的食品安全：如何享受街頭美食同時兼顧健康",
    "url": "https://soweread.com/%e7%be%8e%e9%a3%9f%e6%96%87%e5%8c%96%e6%99%82%e4%bb%a3%e7%9a%84%e9%a3%9f%e5%93%81%e5%ae%89%e5%85%a8%ef%bc%9a%e5%a6%82%e4%bd%95%e4%ba%ab%e5%8f%97%e8%a1%97%e9%a0%ad%e7%be%8e%e9%a3%9f%e5%90%8c%e6%99%82/",
    "datePublished": "2026-06-30",
    "group": "food-safety-culture"
  },
  {
    "title": "聰明挑選、正確清洗蔬果：破解農藥殘留迷思，安心享用飲食均衡",
    "url": "https://soweread.com/2613-2/",
    "datePublished": "2026-06-23",
    "group": "pesticides-and-veterinary-drugs"
  },
  {
    "title": "溫室共生vs共伴養植：打破科技與藥瓶迷思，回歸大地自然循環",
    "url": "https://soweread.com/%e6%ba%ab%e5%ae%a4%e5%85%b1%e7%94%9fvs%e5%85%b1%e4%bc%b4%e9%a4%8a%e6%a4%8d%ef%bc%9a%e6%89%93%e7%a0%b4%e7%a7%91%e6%8a%80%e8%88%87%e8%97%a5%e7%93%b6%e8%bf%b7%e6%80%9d%ef%bc%8c%e5%9b%9e%e6%ad%b8%e5%a4%a7/",
    "datePublished": "2026-06-16",
    "group": "food-production"
  },
  {
    "title": "全球有機食品趨勢：美國「基改與有機」的矛盾，和台灣有機農業的崛起",
    "url": "https://soweread.com/%e5%85%a8%e7%90%83%e6%9c%89%e6%a9%9f%e9%a3%9f%e5%93%81%e8%b6%a8%e5%8b%a2%ef%bc%9a%e7%be%8e%e5%9c%8b%e3%80%8c%e5%9f%ba%e6%94%b9%e8%88%87%e6%9c%89%e6%a9%9f%e3%80%8d%e7%9a%84%e7%9f%9b%e7%9b%be/",
    "datePublished": "2026-06-09",
    "group": "gmo"
  },
  {
    "title": "極端氣候區需要基改作物嗎？生物科技、城市農場給的創新之路",
    "url": "https://soweread.com/%e6%a5%b5%e7%ab%af%e6%b0%a3%e5%80%99%e5%8d%80%e9%9c%80%e8%a6%81%e5%9f%ba%e6%94%b9%e4%bd%9c%e7%89%a9%e5%97%8e%ef%bc%9f%e7%94%9f%e7%89%a9%e7%a7%91%e6%8a%80%e3%80%81%e5%9f%8e%e5%b8%82%e8%be%b2%e5%a0%b4/",
    "datePublished": "2026-06-02",
    "group": "gmo"
  },
  {
    "title": "寧願爆汗、淋雨，也要守住非基改的防線！智慧農法正掀起「非基改」綠色革命",
    "url": "https://soweread.com/%e5%af%a7%e9%a1%98%e7%88%86%e6%b1%97%e3%80%81%e6%b7%8b%e9%9b%a8%ef%bc%8c%e4%b9%9f%e8%a6%81%e5%ae%88%e4%bd%8f%e9%9d%9e%e5%9f%ba%e6%94%b9%e7%9a%84%e9%98%b2%e7%b7%9a%ef%bc%81%e6%99%ba%e6%85%a7%e8%be%b2/",
    "datePublished": "2026-05-29",
    "group": "gmo"
  },
  {
    "title": "氣候危機與地緣政治夾擊！基因改造技術如何成為全球糧食安全的最後防線？",
    "url": "https://soweread.com/%e6%b0%a3%e5%80%99%e5%8d%b1%e6%a9%9f%e8%88%87%e5%9c%b0%e7%b7%a3%e6%94%bf%e6%b2%bb%e5%a4%be%e6%93%8a%ef%bc%81%e5%9f%ba%e5%9b%a0%e6%94%b9%e9%80%a0%e6%8a%80%e8%a1%93%e5%a6%82%e4%bd%95%e6%88%90%e7%82%ba/",
    "datePublished": "2026-05-22",
    "group": "gmo"
  },
  {
    "title": "基因逃逸防不勝防？從挪威鮭魚越獄到基改小麥混入，我們該如何守護食安與生態？",
    "url": "https://soweread.com/%e5%9f%ba%e5%9b%a0%e9%80%83%e9%80%b8%e9%98%b2%e4%b8%8d%e5%8b%9d%e9%98%b2%ef%bc%9f%e5%be%9e%e6%8c%aa%e5%a8%81%e9%ae%ad%e9%ad%9a%e8%b6%8a%e7%8d%84%e5%88%b0%e5%9f%ba%e6%94%b9%e5%b0%8f%e9%ba%a5%e6%b7%b7/",
    "datePublished": "2026-05-15",
    "group": "gmo"
  },
  {
    "title": "隱形的存在：基改原物料如何滲透你的餐盤？解析全球法規、出國旅遊如何避開基改食物",
    "url": "https://soweread.com/2513-2/",
    "datePublished": "2026-05-08",
    "group": "gmo"
  },
  {
    "title": "CRISPR 基改食物是救星還是危機？從國際爭議看餐桌上的基因革命",
    "url": "https://soweread.com/crispr-%e5%9f%ba%e6%94%b9%e9%a3%9f%e7%89%a9%e6%98%af%e6%95%91%e6%98%9f%e9%82%84%e6%98%af%e5%8d%b1%e6%a9%9f%ef%bc%9f%e5%be%9e%e5%9c%8b%e9%9a%9b%e7%88%ad%e8%ad%b0%e7%9c%8b%e9%a4%90%e6%a1%8c%e4%b8%8a/",
    "datePublished": "2026-05-01",
    "group": "gmo"
  },
  {
    "title": "糧食危機的解藥還是健康殺手？從 「基改」是糧食危機的解藥還是健康殺手？從 2025 進口馬鈴薯爭議看台灣基因編輯進行曲",
    "url": "https://soweread.com/%e7%b3%a7%e9%a3%9f%e5%8d%b1%e6%a9%9f%e7%9a%84%e8%a7%a3%e8%97%a5%e9%82%84%e6%98%af%e5%81%a5%e5%ba%b7%e6%ae%ba%e6%89%8b%ef%bc%9f%e5%be%9e-%e3%80%8c%e5%9f%ba%e6%94%b9%e3%80%8d%e6%98%af%e7%b3%a7%e9%a3%9f/",
    "datePublished": "2026-04-24",
    "group": "gmo"
  },
  {
    "title": "「基改食物」哪些被你吃下肚？台灣大宗進口原物料黃豆、玉米、小麥進口實況與選購指南",
    "url": "https://soweread.com/%e3%80%8c%e5%9f%ba%e6%94%b9%e9%a3%9f%e7%89%a9%e3%80%8d%e5%93%aa%e4%ba%9b%e8%a2%ab%e4%bd%a0%e5%90%83%e4%b8%8b%e8%82%9a%ef%bc%9f%e5%8f%b0%e7%81%a3%e5%a4%a7%e5%ae%97%e9%80%b2%e5%8f%a3%e5%8e%9f%e7%89%a9/",
    "datePublished": "2026-04-17",
    "group": "gmo"
  },
  {
    "title": "食安真相：別被「賣相」騙了！「高顏質」食物其實暗藏食安危機",
    "url": "https://soweread.com/%e9%a3%9f%e5%ae%89%e7%9c%9f%e7%9b%b8%ef%bc%9a%e5%88%a5%e8%a2%ab%e3%80%8c%e8%b3%a3%e7%9b%b8%e3%80%8d%e9%a8%99%e4%ba%86%ef%bc%81%e4%ba%86%e8%a7%a3%e9%a3%9f%e7%89%a9%e6%88%90%e9%95%b7%e6%95%85%e4%ba%8b/",
    "datePublished": "2026-04-10",
    "group": "food-safety-culture"
  },
  {
    "title": "學會分辨飢餓信號：識破「假性飢餓」，才是遠離慢性病的關鍵",
    "url": "https://soweread.com/%e5%ad%b8%e6%9c%83%e5%88%86%e8%be%a8%e9%a3%a2%e9%a4%93%e4%bf%a1%e8%99%9f%ef%bc%9a%e8%ad%98%e7%a0%b4%e3%80%8c%e5%81%87%e6%80%a7%e9%a3%a2%e9%a4%93%e3%80%8d%ef%bc%8c%e6%89%8d%e6%98%af%e9%81%a0%e9%9b%a2/",
    "datePublished": "2026-04-03",
    "group": "eating-out"
  },
  {
    "title": "別讓孩子吃「鹹」了未來：揭秘國高中生外食營養黑洞，預防高血壓與腸道危機",
    "url": "https://soweread.com/%e5%88%a5%e8%ae%93%e5%ad%a9%e5%ad%90%e5%90%83%e3%80%8c%e9%b9%b9%e3%80%8d%e4%ba%86%e6%9c%aa%e4%be%86%ef%bc%9a%e6%8f%ad%e7%a7%98%e5%9c%8b%e9%ab%98%e4%b8%ad%e7%94%9f%e5%a4%96%e9%a3%9f%e7%87%9f%e9%a4%8a/",
    "datePublished": "2026-03-27",
    "group": "eating-out"
  },
  {
    "title": "外食族必看！除了澱粉，這 3 個「飲食陷阱」正在破壞你的代謝力",
    "url": "https://soweread.com/%e5%a4%96%e9%a3%9f%e6%97%8f%e5%bf%85%e7%9c%8b%ef%bc%81%e9%99%a4%e4%ba%86%e6%be%b1%e7%b2%89%ef%bc%8c%e9%80%99-3-%e5%80%8b%e3%80%8c%e9%a3%b2%e9%a3%9f%e9%99%b7%e9%98%b1%e3%80%8d%e6%ad%a3%e5%9c%a8/",
    "datePublished": "2026-03-20",
    "group": "eating-out"
  },
  {
    "title": "外食族的營養陷阱：如何達成「我的營養餐盤」的均衡飲食？",
    "url": "https://soweread.com/%e5%a4%96%e9%a3%9f%e6%97%8f%e7%9a%84%e7%87%9f%e9%a4%8a%e9%99%b7%e9%98%b1%ef%bc%9a%e5%a6%82%e4%bd%95%e9%81%94%e6%88%90%e3%80%8c%e6%88%91%e7%9a%84%e7%87%9f%e9%a4%8a%e9%a4%90%e7%9b%a4%e3%80%8d%e7%9a%84/",
    "datePublished": "2026-03-13",
    "group": "eating-out"
  },
  {
    "title": "臺灣飲食文化現象：外食比例高，營養攝取不均是隱憂？",
    "url": "https://soweread.com/%e8%87%ba%e7%81%a3%e9%a3%b2%e9%a3%9f%e6%96%87%e5%8c%96%e7%8f%be%e8%b1%a1%ef%bc%9a%e5%a4%96%e9%a3%9f%e6%af%94%e4%be%8b%e9%ab%98%ef%bc%8c%e7%87%9f%e9%a4%8a%e6%94%9d%e5%8f%96%e4%b8%8d%e5%9d%87%e6%98%af/",
    "datePublished": "2026-03-09",
    "group": "eating-out"
  },
  {
    "title": "臺灣夜市食安困境：探討集客力背後的衛生挑戰與改善之道",
    "url": "https://soweread.com/%e8%88%8c%e5%b0%96%e4%b8%8a%e7%9a%84%e5%8d%b1%e9%9a%aa%e5%b9%b3%e8%a1%a1%ef%bc%9a%e9%80%a3%e9%8e%96%e9%a4%90%e5%bb%b3%e8%88%87%e6%94%a4%e8%b2%a9%e7%9a%84%e9%a3%9f%e5%ae%89%e6%a8%99%e6%ba%96%e6%9c%89/",
    "datePublished": "2026-03-06",
    "group": "food-safety-culture"
  },
  {
    "title": "從美食饗宴到食安關注：現代餐飲文化下的隱憂與展望",
    "url": "https://soweread.com/%e9%99%a4%e4%ba%86%e3%80%8c%e5%a5%bd%e5%90%83%e3%80%8d%ef%bc%8c%e6%88%91%e5%80%91%e5%9c%a8%e7%be%8e%e9%a3%9f%e8%a3%a1%e9%82%84%e9%81%ba%e6%bc%8f%e4%ba%86%e4%bb%80%e9%ba%bc%ef%bc%9f/",
    "datePublished": "2026-03-02",
    "group": "food-safety-culture"
  }
];
