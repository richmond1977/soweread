import { PublicShell } from "@/components/public-shell";

export default function ContactPage() {
  return (
    <PublicShell>
      <section className="page-hero">
        <h1>聯絡</h1>
        <p>有合作、投稿或訂閱需求，歡迎留下訊息。</p>
      </section>
      <main className="container">
        <form className="admin-card admin-form">
          <div className="field-grid">
            <label>
              姓名
              <input name="name" placeholder="請輸入姓名" />
            </label>
            <label>
              Email
              <input name="email" type="email" placeholder="請輸入 Email" />
            </label>
          </div>
          <label>
            主旨
            <input name="subject" placeholder="請輸入聯絡主旨" />
          </label>
          <label>
            訊息
            <textarea name="message" placeholder="請輸入訊息內容" />
          </label>
          <button className="btn-primary" type="button">
            送出訊息
          </button>
        </form>
      </main>
    </PublicShell>
  );
}
