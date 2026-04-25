import { PublicShell } from "@/components/public-shell";

export default function PrivacyPage() {
  return (
    <PublicShell>
      <section className="page-hero">
        <h1>權利聲明</h1>
        <p>我們重視內容使用、隱私保護與讀者資料安全。</p>
      </section>
      <main className="container">
        <article className="article-main">
          <div className="article-body">
            <h3>資料使用</h3>
            <p>潤讀僅在提供服務、回覆聯絡與改善閱讀體驗所需範圍內使用資料。</p>
            <h3>內容權利</h3>
            <p>本站文章與圖文內容除另有標示外，版權歸潤讀 So We Read 所有。</p>
            <h3>聯絡方式</h3>
            <p>若對隱私權、內容授權或資料使用有疑問，請透過聯絡頁與我們聯繫。</p>
          </div>
        </article>
      </main>
    </PublicShell>
  );
}
