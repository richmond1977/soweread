import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="site-nav">
        <Link className="logo" href="/">
          潤讀 So We Read
        </Link>
        <ul className="nav-links">
          <li>
            <Link href="/">首頁</Link>
          </li>
          <li>
            <Link href="/story">潤讀故事</Link>
          </li>
          <li>
            <Link href="/blog">部落格</Link>
          </li>
          <li>
            <Link href="/contact">聯絡</Link>
          </li>
          <li>
            <Link href="/privacy">權利聲明</Link>
          </li>
        </ul>
        <Link className="btn-cta" href="/blog">
          開始閱讀
        </Link>
      </nav>
    </header>
  );
}
