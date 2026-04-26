import { PublicShell } from "@/components/public-shell";

export const metadata = {
  title: "著作權保護政策聲明｜潤讀 So We Read",
  description: "潤讀所刊載之所有內容均受著作權法保護，未經書面授權不得轉載、重製或商業使用。",
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <section className="page-hero">
        <h1>著作權保護政策聲明</h1>
        <p>感謝您造訪潤讀。本站所刊載之所有內容均受著作權法律保護。</p>
      </section>
      <main className="container">
        <article className="article-main">
          <div className="article-body">

            <h2>一、權利歸屬</h2>
            <p>
              本站所有原創內容之著作權均歸屬潤讀之作者（以下簡稱「權利人」）所有。非經權利人事前書面同意，任何人不得以任何形式對本站內容進行重製、散布、修改、展示、傳送、出版或進行商業開發。
            </p>

            <h2>二、授權與使用範圍</h2>
            <p><strong>個人非商業使用：</strong>使用者得基於個人非商業目的，在保留完整出處標示（包含作者姓名、原文標題與原始連結）之前提下，進行閱讀、儲存或分享。</p>
            <p><strong>合理引述：</strong>在符合著作權法合理使用範圍內（如評論、新聞報導、學術研究），引述時請務必註明來源出處，且引述比例不應超過全文之10%。</p>

            <h2>三、禁止行為</h2>
            <p>嚴格禁止以下未經書面授權之行為：</p>
            <ul>
              <li><strong>重製與轉載：</strong>禁止將本站內容全文或大部分內容複製、轉貼至其他網站、社群媒體或印刷媒介。</li>
              <li><strong>商業開發：</strong>禁止將本站內容用於廣告、課程素材、付費訂閱服務或其他具營利性質之活動。</li>
              <li><strong>非法自動化抓取：</strong>禁止使用爬蟲軟體、機器人（Bot）或其他自動化工具大規模抓取本站數據。</li>
              <li><strong>AI訓練用途：</strong>禁止將本站內容輸入至任何人工智慧（AI）模型進行訓練或生成新內容。</li>
            </ul>

            <h2>四、侵權處理</h2>
            <p>凡未經授權而有上述禁止行為者，權利人將保留法律追訴權。對於侵權行為，本站將採取包括但不限於以下措施：</p>
            <ul>
              <li>要求限期移除侵權內容；</li>
              <li>向相關搜尋引擎及社群平台提出侵權檢舉（如 DMCA 通知）；</li>
              <li>依法請求損害賠償，並請求負擔因此產生之律師費與訴訟費用。</li>
            </ul>

            <h2>五、授權聯繫</h2>
            <p>
              如需進行內容轉載、商業合作或任何形式之授權使用，請務必事前聯繫。
            </p>

            <hr />
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              本站圖文禁止轉載、重製或商業用途，引用請註明出處並保持原文完整，授權請取得書面同意。<br />
              All Rights Reserved. © 2026 潤讀 So We Read
            </p>

          </div>
        </article>
      </main>
    </PublicShell>
  );
}
