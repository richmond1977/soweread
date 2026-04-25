import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>潤讀 So We Read</h4>
          <ul>
            <li>
              <Link href="/">首頁</Link>
            </li>
            <li>
              <Link href="/story">潤讀故事</Link>
            </li>
            <li>
              <Link href="/contact">聯絡</Link>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>內容</h4>
          <ul>
            <li>
              <Link href="/blog">部落格</Link>
            </li>
            <li>
              <Link href="/blog">分類</Link>
            </li>
            <li>
              <Link href="/blog">文章存檔</Link>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>社群</h4>
          <ul>
            <li>
              <Link href="/blog">討論區</Link>
            </li>
            <li>
              <Link href="/contact">聯絡我們</Link>
            </li>
            <li>
              <Link href="/blog">訂閱</Link>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>法律</h4>
          <ul>
            <li>
              <Link href="/privacy">隱私權聲明</Link>
            </li>
            <li>
              <Link href="/privacy">使用條款</Link>
            </li>
            <li>
              <Link href="/privacy">Cookie 設定</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 潤讀 So We Read. 版權所有。</p>
      </div>
    </footer>
  );
}
