import Image from "next/image";
import Link from "next/link";
import { FIXTURE_NOTICE } from "@/data/growth-fixture";

type Breadcrumb = { name: string; href: string };

interface GrowthShellProps {
  breadcrumbs: Breadcrumb[];
  isFixture: boolean;
  children: React.ReactNode;
}

export function GrowthShell({ breadcrumbs, isFixture, children }: GrowthShellProps) {
  return (
    <div className="growth-shell">
      <header className="growth-header">
        {/* 子品牌鎖定：主站標誌 ＋ 本站名稱。alt 只描述標誌本身，
            「知識站」是可選取的文字，不靠圖片傳達。 */}
        <Link className="growth-brand" href="/">
          <Image
            src="/soweread-logo.png"
            alt="潤讀 So We Read"
            width={600}
            height={400}
            priority
            className="growth-brand-logo"
          />
          <span className="growth-brand-suffix">知識站</span>
        </Link>
        <nav className="growth-nav" aria-label="主要導覽">
          <Link href="/topics">主題</Link>
          {/* 名詞索引放進全站導覽，是為了讓每個名詞頁離任何一個已被收錄的頁面
              都只有兩跳。名詞頁原本只能從主題頁與文章頁進入，而那些頁面自己
              也還在等收錄，等於整批名詞頁躲在爬蟲搆不到的深處。 */}
          <Link href="/entities">名詞索引</Link>
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
      <h2 id="growth-sources-heading">來源</h2>
      <ol>
        {sources.map((source) => (
          <li key={source.id}>
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
      <a className="growth-cta-link" href={href} rel="noopener">
        {label}
      </a>
    </aside>
  );
}
