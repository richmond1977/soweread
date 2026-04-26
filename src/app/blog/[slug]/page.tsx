import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogSidebar } from "@/components/blog-sidebar";
import { BookmarkButton } from "@/components/bookmark-button";
import { ArticleJsonLd, FaqPageJsonLd } from "@/components/json-ld";
import { PublicShell } from "@/components/public-shell";
import { ShareButtons } from "@/components/share-buttons";
import { categoryFor, getContent, getPostBySlug, getPublishedPosts } from "@/lib/content";
import { renderArticleContent } from "@/lib/markdown";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://soweread.com";

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const ogImage = post.coverImage
    ? [{ url: post.coverImage.startsWith("http") ? post.coverImage : `${SITE_URL}${post.coverImage}`, width: 1200, height: 630, alt: post.title }]
    : [];

  return {
    title: post.seoTitle,
    description: post.seoDescription,
    keywords: post.tags,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      title: post.seoTitle,
      description: post.seoDescription,
      url: `${SITE_URL}/blog/${slug}`,
      siteName: "潤讀 So We Read",
      images: ogImage.length
        ? ogImage
        : [{ url: "/assets/soweread-logo.png", width: 1200, height: 630, alt: post.title }],
      type: "article",
      publishedTime: post.publishedAt,
      authors: ["潤讀編輯部"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.seoDescription,
      images: ogImage.length ? ogImage.map((img) => img.url) : ["/assets/soweread-logo.png"],
    },
  };
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [content, posts, post] = await Promise.all([getContent(), getPublishedPosts(), getPostBySlug(slug)]);
  if (!post) notFound();

  const category = categoryFor(post, content.categories);
  const related = posts.filter((item) => item.id !== post.id && item.categoryId === post.categoryId).slice(0, 3);

  return (
    <PublicShell>
      <ArticleJsonLd
        title={post.title}
        description={post.seoDescription ?? ""}
        slug={slug}
        publishedAt={post.publishedAt}
        tags={post.tags}
        coverImage={post.coverImage}
        categoryName={category.name}
      />
      <FaqPageJsonLd items={post.faq ?? []} />
      <main className="container">
        <div className="article-layout">
          <article className="article-main">
            <header className="article-header">
              <Link className="article-category" href={`/categories/${category.slug}`}>
                {category.name}
              </Link>
              <h1 className="article-title">{post.title}</h1>
              <div className="article-meta">
                <span>{post.publishedAt}</span>
                <span>{post.readingMinutes} 分鐘閱讀</span>
                <span>{post.views.toLocaleString()} 次閱讀</span>
              </div>
              <div className="article-actions">
                <BookmarkButton postId={post.id} title={post.title} />
              </div>
            </header>

            {post.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="article-cover" src={post.coverImage} alt={post.title} />
            )}

            <div className="article-body">{renderArticleContent(post.content)}</div>

            {post.tags.length > 0 && (
              <div className="article-tags">
                {post.tags.map((tag) => (
                  <Link key={tag} className="tag" href={`/blog?q=${encodeURIComponent(tag)}`}>
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <ShareButtons title={post.title} url={`${SITE_URL}/blog/${slug}`} />

            <div className="article-cta">
              <h3>想要更深入地了解食品安全？</h3>
              <p>訂閱潤讀的週刊，每週收到精選知識文章。</p>
              <Link className="btn-primary" href="/contact">
                訂閱週刊
              </Link>
            </div>

            {related.length > 0 && (
              <section>
                <h2 className="section-title">相關閱讀</h2>
                <div className="related-grid">
                  {related.map((item) => (
                    <Link className="related-card" href={`/blog/${item.slug}`} key={item.id}>
                      <div>{item.title}</div>
                      <small>{item.readingMinutes} 分鐘閱讀</small>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="article-sidebar">
            <div className="author-box">
              <div className="author-name">潤讀編輯</div>
              <div>致力於食品安全與營養知識的傳播，幫助讀者做出更明智的飲食選擇。</div>
            </div>
            <BlogSidebar posts={posts} categories={content.categories} />
          </aside>
        </div>
      </main>
    </PublicShell>
  );
}
