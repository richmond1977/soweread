import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { GrowthHome } from "@/components/growth-home";
import { HomeArticleGrid } from "@/components/home-article-grid";
import { PublicShell } from "@/components/public-shell";
import { getContent, getPublishedPosts } from "@/lib/content";
import { getGrowthKnowledge } from "@/lib/growth/knowledge";
import { getRequestSiteConfig } from "@/lib/request-site-config";

export default async function HomePage() {
  const siteConfig = await getRequestSiteConfig();

  // The growth domain must never serve the soweread.com homepage: it needs its
  // own indexable landing page, not a near-duplicate of the primary site.
  if (siteConfig.isGrowth) {
    // A growth role whose config is unhealthy serves nothing at all, matching
    // the other growth routes rather than showing an empty landing page.
    if (!siteConfig.canServeGrowthContent) notFound();

    const { knowledge } = await getGrowthKnowledge(siteConfig);
    return <GrowthHome baseUrl={siteConfig.canonicalBaseUrl} knowledge={knowledge} />;
  }

  const [content, posts] = await Promise.all([getContent(), getPublishedPosts()]);
  const featuredPosts = posts.slice(0, 6);

  return (
    <PublicShell>
      <section className="hero">
        <div className="hero-content">
          <Image
            className="hero-logo"
            src="/assets/soweread-logo.png"
            alt="潤讀 So We Read Logo"
            width={350}
            height={233}
            priority
          />
          <h1>探索閱讀的無限可能</h1>
          <p className="hero-subtitle">
            用文字與知識連結每一位讀者，從食品安全、營養知識到飲食文化，讓每一次閱讀都成為理解生活的起點。
          </p>
          <div className="hero-cta">
            <Link className="btn-primary" href="/blog">
              開始閱讀
            </Link>
            <Link className="btn-secondary" href="/story">
              了解故事
            </Link>
          </div>
        </div>
      </section>

      <main className="container">
        <section className="category-section" id="blog">
          <div className="section-header">
            <h2>食品與健康</h2>
            <Link className="view-all" href="/blog">
              查看全部
            </Link>
          </div>
          <HomeArticleGrid posts={featuredPosts} categories={content.categories} />
        </section>

        <section className="about-section">
          <div className="about-content">
            <h3>關於潤讀</h3>
            <p>潤讀於 2026 年一月中創立，因緣際會之下，有幸能另闢蹊徑，以文字結交志同道合的朋友。</p>
            <blockquote>我們閱讀，不只是吸收資訊，也是重新看見生活。</blockquote>
            <p>我們相信知識的傳遞不是單向的。每一位讀者的關注、分享、思考與討論，都是讓潤讀持續前進的動力。</p>
            <Link className="btn-primary" href="/story">
              了解我們的故事
            </Link>
          </div>

          <div className="newsletter-panel">
            <div className="newsletter-content">
              <h3>訂閱潤讀</h3>
              <p>每週收到精選知識，讓閱讀成為你生活的一部分。</p>
              <form className="newsletter-form">
                <input type="email" placeholder="輸入你的 Email" required />
                <button type="submit">訂閱</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <section className="newsletter-bar">
        <div className="newsletter-content">
          <h3>準備開始閱讀？</h3>
          <p>從最新文章開始，慢慢建立自己的知識路徑。</p>
          <Link className="btn-primary" href="/blog">
            開始閱讀
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
