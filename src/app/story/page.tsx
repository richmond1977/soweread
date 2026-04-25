import { PublicShell } from "@/components/public-shell";

export default function StoryPage() {
  return (
    <PublicShell>
      <section className="page-hero">
        <h1>潤讀故事</h1>
        <p>我們相信，好的閱讀不只是取得資訊，而是重新整理自己與世界的關係。</p>
      </section>
      <main className="container">
        <article className="article-main">
          <div className="article-body">
            <h3>起點</h3>
            <p>
              潤讀 So We Read 從日常生活裡的疑問出發：我們吃下什麼、相信什麼，又如何在資訊過量的時代做出清楚選擇。
            </p>
            <h3>我們的方式</h3>
            <p>
              我們整理食品安全、營養知識與飲食文化相關內容，保留可讀性，也重視資料來源與脈絡，讓知識能回到生活現場。
            </p>
            <h3>給讀者</h3>
            <p>如果你也喜歡慢慢理解一件事，這裡會是一個適合停留、翻找與再次閱讀的地方。</p>
          </div>
        </article>
      </main>
    </PublicShell>
  );
}
