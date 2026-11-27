import Link from "next/link";
import { FIXTURE_NOTICE } from "@/data/growth-fixture";
import { type GrowthLocale, localePath, UI } from "@/lib/growth/locale";

type Breadcrumb = { name: string; href: string };

interface GrowthShellProps {
  breadcrumbs: Breadcrumb[];
  isFixture: boolean;
  children: React.ReactNode;
  locale?: GrowthLocale;
  /**
   * 這一頁在另一個語系的網址（語言切換鈕的目的地）。沒有對應翻譯時傳 null，
   * 切換鈕改連到另一個語系的首頁，而不是連到一個會 404 的頁面。
   */
  alternateHref?: string | null;
}

// 主站 soweread.com 使用的同一組字體。知識站是主站的附冊，字體必須一致，
// 否則刊頭再像也會一眼看出是兩個站。React 會把這個 stylesheet 提升到 <head>。
const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@600;900&family=Noto+Sans+TC:wght@400;500;700&family=Fraunces:ital,opsz,wght@1,9..144,400&family=Cinzel:wght@600&display=swap";

export function GrowthShell({
  breadcrumbs,
  isFixture,
  children,
  locale = "zh",
  alternateHref,
}: GrowthShellProps) {
  const ui = UI[locale];
  const otherLocale: GrowthLocale = locale === "zh" ? "en" : "zh";
  const switchHref = alternateHref ?? localePath(otherLocale, "/");

  return (
    // 根 layout 的 <html lang> 是全站共用的 zh-Hant；英文頁在最外層容器上
    // 宣告 lang="en"，讓螢幕閱讀器與瀏覽器用英文處理整頁內容。
    <div className="growth-shell" lang={locale === "en" ? "en" : undefined}>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_STYLESHEET} precedence="default" />

      <header className="growth-header">
        <div className="growth-strip">
          <span>{ui.strip}</span>
          <span className="growth-strip-links">
            <Link
              className="growth-lang-switch"
              href={switchHref}
              hrefLang={otherLocale === "en" ? "en" : "zh-Hant-TW"}
              lang={otherLocale === "en" ? "en" : "zh-Hant"}
              aria-label={ui.switchAria}
            >
              {ui.switchLabel}
            </Link>
            <a href={ui.primaryUrl} rel="noopener">
              {ui.backToPrimary}
            </a>
          </span>
        </div>
        <div className="growth-masthead">
          {/* 子品牌鎖定：主站刊名 ＋ 本站名稱。刊名用文字排出，與主站刊頭一致；
              「知識站」是可選取的文字，不靠圖片傳達。 */}
          <Link className="growth-brand" href={localePath(locale, "/")} aria-label={ui.brandAria}>
            <span className="growth-brand-name" aria-hidden="true">
              <span className="growth-brand-zh" lang="zh-Hant">
                潤讀
              </span>
              <span className="growth-brand-en">SO WE READ</span>
            </span>
            <span className="growth-brand-suffix" aria-hidden="true">
              {ui.brandSuffix}
            </span>
          </Link>
          <p className="growth-masthead-motto">
            <span className="growth-eyebrow">The Lexicon</span>
            {ui.motto}
          </p>
        </div>
        <div className="growth-double-rule" aria-hidden="true" />
        <nav className="growth-nav" aria-label={ui.navAria}>
          {/* 名詞索引放進全站導覽，是為了讓每個名詞頁離任何一個已被收錄的頁面
              都只有兩跳。名詞頁原本只能從主題頁與文章頁進入，而那些頁面自己
              也還在等收錄，等於整批名詞頁躲在爬蟲搆不到的深處。 */}
          <Link href={localePath(locale, "/entities")}>{ui.navGlossary}</Link>
          <Link href={localePath(locale, "/topics")}>{ui.navTopics}</Link>
          {/* 「主站文章」：中文列主站中文文章，英文列主站英文版文章。 */}
          {ui.navReading ? <Link href={localePath(locale, "/reading")}>{ui.navReading}</Link> : null}
          <a href={ui.primaryUrl} rel="noopener">
            {ui.navPrimary}
          </a>
        </nav>
      </header>

      {isFixture ? (
        <p className="growth-fixture-notice" role="note" data-testid="growth-fixture-notice">
          {FIXTURE_NOTICE}
        </p>
      ) : null}

      <nav className="growth-breadcrumbs" aria-label={ui.breadcrumbAria}>
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

      {ui.translationNote ? (
        <p className="growth-translation-note" role="note">
          {ui.translationNote}
        </p>
      ) : null}

      <main className="growth-main">{children}</main>

      <footer className="growth-footer">
        <div className="growth-footer-inner">
          <div className="growth-double-rule" aria-hidden="true" />
          <p className="growth-footer-brand">
            <span className="growth-eyebrow">{ui.footerEyebrow}</span>
            {ui.siteName}
          </p>
          <p>
            {ui.footerAbout[0]}{" "}
            <a href={ui.primaryUrl} rel="noopener">
              {ui.footerAbout[1]}
            </a>
            {locale === "zh" ? " " : ""}
            {ui.footerAbout[2]}
          </p>
          <p className="growth-footer-follow">
            {ui.footerFollow}
            <a href="https://www.facebook.com/people/Winslet-Chang/61560169946019/" rel="noopener" target="_blank">
              Facebook
            </a>
            <a href="https://soweread.substack.com/" rel="noopener" target="_blank">
              Substack
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
    originalTitle?: string;
  }>;
  locale?: GrowthLocale;
}

export function SourceList({ sources, locale = "zh" }: SourceListProps) {
  if (!sources.length) return null;
  const ui = UI[locale];
  const sep = locale === "en" ? " · " : "｜";

  return (
    <section className="growth-sources" aria-labelledby="growth-sources-heading">
      <span className="growth-eyebrow" aria-hidden="true">
        {ui.sourcesEyebrow}
      </span>
      <h2 id="growth-sources-heading">{ui.sourcesHeading}</h2>
      <ol>
        {sources.map((source) => (
          <li key={source.id} id={`source-${source.id}`}>
            <a href={source.url} rel="noopener nofollow">
              {source.title}
            </a>
            {source.originalTitle ? (
              <span className="growth-source-meta">
                {ui.originalTitle}: <span lang="zh-Hant">{source.originalTitle}</span>
              </span>
            ) : null}
            <span className="growth-source-meta">
              {source.publisher}
              {source.publishedAt
                ? `${sep}${ui.published} ${source.publishedAt}`
                : `${sep}${ui.publishedUnknown}`}
              {`${sep}${ui.retrieved} ${source.retrievedAt}`}
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
  locale?: GrowthLocale;
}

export function PrimaryCta({ href, label, locale = "zh" }: PrimaryCtaProps) {
  return (
    <aside className="growth-cta">
      <span className="growth-eyebrow">{UI[locale].furtherReading}</span>
      <a className="growth-cta-link" href={href} rel="noopener">
        {label} →
      </a>
    </aside>
  );
}
