import Link from "next/link";
import { FIXTURE_NOTICE } from "@/data/growth-fixture";

type Breadcrumb = { name: string; href: string };

interface GrowthShellProps {
  breadcrumbs: Breadcrumb[];
  isFixture: boolean;
  children: React.ReactNode;
}

// 主站 soweread.com 使用的同一組字體。知識站是主站的附冊，字體必須一致，
// 否則刊頭再像也會一眼看出是兩個站。React 會把這個 stylesheet 提升到 <head>。
const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@600;900&family=Noto+Sans+TC:wght@400;500;700&family=Fraunces:ital,opsz,wght@1,9..144,400&family=Cinzel:wght@600&display=swap";

export function GrowthShell({ breadcrumbs, isFixture, children }: GrowthShellProps) {
  return (
    <div className="growth-shell">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_STYLESHEET} precedence="default" />

      <header className="growth-header">
        <div className="growth-strip">
          <span>潤讀知識站 · 名詞、定義與可追溯的來源</span>
          <a href="https://soweread.com/" rel="noopener">
            回潤讀主站 ↗
          </a>
        </div>
        <div className="growth-masthead">
          {/* 子品牌鎖定：主站刊名 ＋ 本站名稱。刊名用文字排出，與主站刊頭一致；
              「知識站」是可選取的文字，不靠圖片傳達。 */}
          <Link className="growth-brand" href="/" aria-label="潤讀知識站首頁">
            <span className="growth-brand-name" aria-hidden="true">
              <span className="growth-brand-zh">潤讀</span>
              <span className="growth-brand-en">SO WE READ</span>
            </span>
            <span className="growth-brand-suffix" aria-hidden="true">
              知識站
            </span>
          </Link>
          <p className="growth-masthead-motto">
            <span className="growth-eyebrow">The Lexicon</span>
            讀食安新聞之前，先查清楚定義。
          </p>
        </div>
        <div className="growth-double-rule" aria-hidden="true" />
        <nav className="growth-nav" aria-label="主要導覽">
          {/* 名詞索引放進全站導覽，是為了讓每個名詞頁離任何一個已被收錄的頁面
              都只有兩跳。名詞頁原本只能從主題頁與文章頁進入，而那些頁面自己
              也還在等收錄，等於整批名詞頁躲在爬蟲搆不到的深處。 */}
          <Link href="/entities">名詞索引</Link>
          <Link href="/topics">議題</Link>
          <Link href="/reading">主站文章</Link>
          <a href="https://soweread.com/" rel="noopener">
            潤讀主站
          </a>
        </nav>
      </header>

      {isFixture ? (
        <p className="growth-fixture-notice" role="note" data-testid="growth-fixture-notice">
          {FIXTURE_NOTICE}
        </p>
      ) : null}

      <nav className="growth-breadcrumbs" aria-label="麵包屑">
        <ol>
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href}>
              {index === breadcrumbs.length - 1 ? (
                <span aria-current="page">{crumb.name}</span>
              ) : (
                <Link href={crumb.href}>{crumb.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <main className="growth-main">{children}</main>

      <footer className="growth-footer">
        <div className="growth-footer-inner">
          <div className="growth-double-rule" aria-hidden="true" />
          <p className="growth-footer-brand">
            <span className="growth-eyebrow">So We Read · Knowledge</span>
            潤讀知識站
          </p>
          <p>
            潤讀知識站是獨立的知識整理站台，與{" "}
            <a href="https://soweread.com/" rel="noopener">
              潤讀 So We Read 主站
            </a>{" "}
            同屬一個編輯團隊。
          </p>
          <p className="growth-footer-follow">
            追蹤我們：
            <a href="https://www.dcard.tw/@soweread" rel="noopener" target="_blank">
              Dcard
            </a>
            <a href="https://www.facebook.com/people/Winslet-Chang/61560169946019/" rel="noopener" target="_blank">
              Facebook
            </a>
            <a href="https://vocus.cc/user/@soweread" rel="noopener" target="_blank">
              方格子
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

interface SourceListProps {
  sources: Array<{
    id: string;
    title: string;
    publisher: string;
    url: string;
    publishedAt: string | null;
    retrievedAt: string;
    note: string;
  }>;
}

export function SourceList({ sources }: SourceListProps) {
  if (!sources.length) return null;

  return (
    <section className="growth-sources" aria-labelledby="growth-sources-heading">
      <span className="growth-eyebrow" aria-hidden="true">
        Sources
      </span>
      <h2 id="growth-sources-heading">來源</h2>
      <ol>
        {sources.map((source) => (
          <li key={source.id} id={`source-${source.id}`}>
            <a href={source.url} rel="noopener nofollow">
              {source.title}
            </a>
            <span className="growth-source-meta">
              {source.publisher}
              {source.publishedAt ? `｜發布 ${source.publishedAt}` : "｜發布日期未確認"}
              {`｜擷取 ${source.retrievedAt}`}
            </span>
            {source.note ? <p className="growth-source-note">{source.note}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

interface PrimaryCtaProps {
  href: string;
  label: string;
}

export function PrimaryCta({ href, label }: PrimaryCtaProps) {
  return (
    <aside className="growth-cta">
      <span className="growth-eyebrow">Further Reading</span>
      <a className="growth-cta-link" href={href} rel="noopener">
        {label} →
      </a>
    </aside>
  );
}
