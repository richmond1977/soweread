import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { BlogSidebar } from "@/components/blog-sidebar";
import { Pagination } from "@/components/pagination";
import { PublicShell } from "@/components/public-shell";
import { getContent, getPublishedPosts } from "@/lib/content";
import { getRequestSiteConfig } from "@/lib/request-site-config";
import { getSiteConfig } from "@/lib/site-config";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

const POSTS_PER_PAGE = 8;
const SITE_URL = getSiteConfig().primarySiteUrl;

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { page } = await searchParams;
  const content = await getContent();
  const category = content.categories.find((c) => c.slug === slug);
  if (!category) return {};
  const isPaginated = Boolean(page);

  return {
    title: `${category.name}｜潤讀 So We Read`,
    description: category.description,
    alternates: { canonical: `${SITE_URL}/categories/${slug}` },
    robots: isPaginated ? { index: false, follow: true } : (await getRequestSiteConfig()).metaRobots,
    openGraph: {
      title: `${category.name}｜潤讀 So We Read`,
      description: category.description,
      url: `${SITE_URL}/categories/${slug}`,
      siteName: "潤讀 So We Read",
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const [content, posts] = await Promise.all([getContent(), getPublishedPosts()]);
  const category = content.categories.find((item) => item.slug === slug);
  if (!category) notFound();

  const filteredPosts = posts.filter((post) => post.categoryId === category.id);
  const currentPage = Math.max(1, Number(page) || 1);
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const pagePosts = filteredPosts.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);

  return (
    <PublicShell>
      <section className="page-hero">
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </section>
      <main className="container">
        <div className="blog-layout">
          <div>
            <p className="search-result-label" style={{ marginBottom: 24 }}>
              共 {filteredPosts.length} 篇文章
            </p>
            <div className="article-list">
              {pagePosts.map((post) => (
                <ArticleCard key={post.id} post={post} category={category} />
              ))}
            </div>
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              basePath={`/categories/${slug}`}
            />
          </div>
          <BlogSidebar posts={posts} categories={content.categories} />
        </div>
      </main>
    </PublicShell>
  );
}
