import Link from "next/link";
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
            潤讀是一個多元知識的平台，<br />
            旨在篩選和整理重要資訊。
          </p>
        </div>
      </section>

      <main className="container">

        {/* 成立初衷 */}
        <section className="story-origin">
          <div className="story-origin-text">
            <p className="story-en-label">Origin</p>
            <h2>成立初衷</h2>
            <p className="story-lead">
              潤讀於2026年一月中創立，因緣際會之下，有幸能另闢蹊徑，以文字結交志同道合的朋友。
            </p>
            <p>
              承蒙各界賢達賞光，抽空於百忙之中、在相同或者不同的時間來到此網域相會，一探耕讀究竟。無論是出於好奇、希望更深入了解，或尋找靈感的火花的八方讀者，潤讀都深表歡迎。
            </p>
            <p>
              自成立以來，潤讀透過清晰的呈現幫助讀者深度理解各類知識與趨勢，為讀者提供深刻的見解，並幫助他們在繁雜的資訊中找到真正有價值的內容，從讀者的反饋與好評之中，建立穩固與長久的讀者社群。
            </p>
            <p>
              您的關注與分享，不僅能讓這份書寫與思索的旅程延續，更是讓潤讀盡棉薄之力的最大推進力。
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

        {/* 讀者與社群 */}
        <section className="story-community">
          <div className="story-community-inner">
            <div className="story-community-text">
              <p className="story-en-label">Engagements</p>
              <h2>讀者與社群</h2>
              <p>
                潤讀相信，知識的傳遞不是單向的。每一位讀者的關注、分享、思考與討論，都是讓潤讀持續前進的動力。從好奇心出發，讀者可以在這裡找到探索世界的起點，也可以在這裡尋找靈感火花、建立知識脈絡，甚至與其他志同道合的人交流、分享觀點。
              </p>
              <p>
                在此，潤讀不僅「以文會友」，更是一個匯聚同好、共同探索知識的社群空間。
              </p>
              <p>
                文章的每一次點擊、每一次分享，不僅是潤讀書寫旅程的標記，更是您知識之田被耕耘的證明。
              </p>
            </div>
            <div className="story-community-cta">
              <p>與我們一同深耕學習，讓每次閱讀都變得更有價值。</p>
              <Link className="btn-primary" href="/blog">開始閱讀</Link>
            </div>
          </div>
        </section>

        {/* 主張 */}
        <section className="story-manifesto">
          <p className="story-en-label">Manifesto</p>
          <h2>主張</h2>
          <p>
            在瞬息萬變的資訊洪流中，我們常常被大量資訊淹沒，卻難以找到真正有價值的知識。
            潤讀誕生於慢下腳步、沉澱知識的需求，將新舊知識、新聞脈絡、產業趨勢與世界觀點整合成清晰、立體的理解。
          </p>
          <p>
            我們以最客觀忠實的筆觸，呈現經過梳理的資訊，幫助讀者在數位時代建立宏觀視角。
            我們整理食品安全、營養知識與飲食文化相關內容，保留可讀性，也重視資料來源與脈絡，讓知識能回到生活現場。
          </p>
          <p>
            如果你也喜歡慢慢理解一件事，這裡會是一個適合停留、翻找與再次閱讀的地方。
          </p>
          <p className="story-copyright">
            本站圖文禁止轉載、重製或商業用途，引用請註明出處並保持原文完整，授權請取得書面同意。<br />
            All Rights Reserved. © 2026 潤讀 So We Read
          </p>
        </section>

      </main>
    </PublicShell>
  );
}
