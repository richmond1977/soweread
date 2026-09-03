import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { BlogSidebar } from "@/components/blog-sidebar";
import { Pagination } from "@/components/pagination";
import { PublicShell } from "@/components/public-shell";
import { categoryFor, getContent, getPublishedPosts } from "@/lib/content";
import { getRequestSiteConfig } from "@/lib/request-site-config";
import { getSiteConfig } from "@/lib/site-config";

const SITE_URL = getSiteConfig().primarySiteUrl;

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const siteConfig = await getRequestSiteConfig();
  const hasIndexChangingParams =
    Boolean(params.q?.trim()) ||
    Boolean(params.sort) ||
    Boolean(params.page);

  return {
    title: "部落格｜潤讀 So We Read",
    description: "探索食品安全、營養知識與飲食文化的精選文章。",
    alternates: { canonical: `${SITE_URL}/blog` },
    // An explicit `undefined` would erase the layout directive, which would drop
    // the backup deployment's noindex. Fall back to the role default instead.
    robots: hasIndexChangingParams ? { index: false, follow: true } : siteConfig.metaRobots,
  };
}

const POSTS_PER_PAGE = 8;

type BlogPageProps = {
  searchParams: Promise<{ sort?: string; page?: string; q?: string }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const [content, posts] = await Promise.all([getContent(), getPublishedPosts()]);

  const query = params.q?.trim().toLowerCase() ?? "";
  const sort = params.sort ?? "popular";
  const currentPage = Math.max(1, Number(params.page) || 1);

  const filtered = query
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.excerpt.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      )
    : posts;

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "comments") return b.comments - a.comments;
    if (sort === "recent") return b.publishedAt.localeCompare(a.publishedAt);
    return b.views - a.views;
  });

  const totalPages = Math.ceil(sorted.length / POSTS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const pagePosts = sorted.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);

  const pageSearchParams: Record<string, string> = {};
  if (sort && sort !== "popular") pageSearchParams.sort = sort;
  if (query) pageSearchParams.q = query;

  return (
    <PublicShell>
      <section className="page-hero">
        <h1>部落格</h1>
        <p>探索食品安全、營養知識與飲食文化的精選文章。</p>
      </section>

      <main className="container">
        <div className="blog-layout">
          <div>
            <div className="blog-controls">
              <form className="blog-search-form" method="GET" action="/blog">
                {sort && sort !== "popular" && <input type="hidden" name="sort" value={sort} />}
                <input
                  className="blog-search-input"
                  type="search"
                  name="q"
                  defaultValue={params.q}
                  placeholder="搜尋文章標題、標籤…"
                  aria-label="搜尋文章"
                />
                <button className="blog-search-btn" type="submit">搜尋</button>
              </form>

              <div className="sorting-controls">
                <a className={`sort-btn${sort === "popular" ? " active" : ""}`} href={`/blog?sort=popular${query ? `&q=${encodeURIComponent(query)}` : ""}`}>
                  最多瀏覽
                </a>
                <a className={`sort-btn${sort === "recent" ? " active" : ""}`} href={`/blog?sort=recent${query ? `&q=${encodeURIComponent(query)}` : ""}`}>
                  最新發布
                </a>
                <a className={`sort-btn${sort === "comments" ? " active" : ""}`} href={`/blog?sort=comments${query ? `&q=${encodeURIComponent(query)}` : ""}`}>
                  最多評論
                </a>
              </div>
            </div>

            {query && (
              <p className="search-result-label">
                搜尋「{params.q}」— 共 {filtered.length} 筆結果
                <Link href="/blog" className="search-clear">清除</Link>
              </p>
            )}

            {pagePosts.length === 0 ? (
              <p className="empty-state">沒有符合條件的文章。</p>
            ) : (
              <div className="article-list">
                {pagePosts.map((post) => (
                  <ArticleCard key={post.id} post={post} category={categoryFor(post, content.categories)} />
                ))}
              </div>
            )}

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              basePath="/blog"
              searchParams={pageSearchParams}
            />
          </div>
          <BlogSidebar posts={posts} categories={content.categories} />
        </div>
      </main>
    </PublicShell>
  );
}
