import { PublicShell } from "@/components/public-shell";

export const metadata = {
  title: "潤讀故事｜潤讀 So We Read",
  description: "潤讀誕生於慢下腳步、沉澱知識的需求，整合新舊知識、新聞脈絡與世界觀點，幫助讀者建立宏觀視角。",
};

const PILLARS = [
  {
    en: "Selection",
    zh: "精選內容",
    icon: "◈",
    desc: "我們專注於精選內容，去除雜訊、留下價值。每一篇文章都經過仔細梳理，以引領讀者展開更有方向感的知識探索。",
  },
  {
    en: "Wide & Depth",
    zh: "由淺入深",
    icon: "◎",
    desc: "從淺入深、從點到面，幫助讀者理解脈絡。我們既滿足進階讀者對深度的需求，也讓初次接觸的人能建立清晰的知識基礎。",
  },
  {
    en: "Optics",
    zh: "宏觀視角",
    icon: "◉",
    desc: "結合新聞背景、產業動態與世界趨勢，提供完整、立體的理解。我們相信，看見全局，才能做出更好的判斷。",
  },
];

export default function StoryPage() {
  return (
    <PublicShell>
      <section className="page-hero story-hero">
        <div className="story-hero-inner">
          <p className="story-label">Our Story</p>
          <h1>潤讀故事</h1>
          <p className="story-hero-desc">
            我們相信，好的閱讀不只是取得資訊，<br />
            而是重新整理自己與世界的關係。
          </p>
        </div>
      </section>

      <main className="container">

        {/* 起點 */}
        <section className="story-origin">
          <div className="story-origin-text">
            <h2>起點</h2>
            <p className="story-lead">
              在瞬息萬變的資訊洪流中，我們常常被大量資訊淹沒，卻難以找到真正有價值的知識。
            </p>
            <p>
              潤讀 So We Read 從日常生活裡的疑問出發：我們吃下什麼、相信什麼，又如何在資訊過量的時代做出清楚的選擇。
              潤讀誕生於慢下腳步、沉澱知識的需求，將新舊知識、新聞脈絡、產業趨勢與世界觀點整合成清晰、立體的理解。
            </p>
            <p>
              知識的傳遞不是單向的。從好奇心出發，讀者可以在這裡找到探索世界的起點。
            </p>
          </div>
          <div className="story-origin-quote">
            <blockquote>
              慢下腳步，<br />沉澱知識，<br />看見全局。
            </blockquote>
          </div>
        </section>

        {/* 三大特色 */}
        <section className="story-pillars">
          <div className="story-section-header">
            <h2>我們的方式</h2>
            <p>三個核心原則，貫穿每一篇內容的製作。</p>
          </div>
          <div className="story-pillars-grid">
            {PILLARS.map((p) => (
              <div key={p.en} className="story-pillar-card">
                <div className="pillar-icon">{p.icon}</div>
                <div className="pillar-en">{p.en}</div>
                <h3 className="pillar-zh">{p.zh}</h3>
                <p className="pillar-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 宣言 */}
        <section className="story-manifesto">
          <h2>主張</h2>
          <p>
            我們以最客觀忠實的筆觸，呈現經過梳理的資訊，幫助讀者在數位時代建立宏觀視角。
            我們整理食品安全、營養知識與飲食文化相關內容，保留可讀性，也重視資料來源與脈絡，讓知識能回到生活現場。
          </p>
          <p>
            如果你也喜歡慢慢理解一件事，這裡會是一個適合停留、翻找與再次閱讀的地方。
            與我們一同深耕學習，讓每次閱讀都變得更有價值。
          </p>
          <p className="story-copyright">
            本站圖文禁止轉載、重製或商業用途，引用請註明出處並保持原文完整。
          </p>
        </section>

      </main>
    </PublicShell>
  );
}
