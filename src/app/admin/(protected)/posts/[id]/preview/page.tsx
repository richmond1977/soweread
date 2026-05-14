import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryFor, getContent, isPostPublic } from "@/lib/content";
import { renderArticleContent } from "@/lib/markdown";

type PreviewPostPageProps = {
  params: Promise<{ id: string }>;
};

const statusLabel: Record<string, string> = {
  draft: "草稿",
  published: "已發布",
  scheduled: "排程",
  archived: "封存",
};

export default async function PreviewPostPage({ params }: PreviewPostPageProps) {
  const { id } = await params;
  const content = await getContent();
  const post = content.posts.find((item) => item.id === id);
  if (!post) notFound();

  const category = categoryFor(post, content.categories);

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>文章預覽</h1>
          <p>這是後台專用預覽，不會改變文章發布狀態。</p>
        </div>
        <div className="admin-form-actions">
          <Link className="admin-button admin-button--secondary" href={`/admin/posts/${post.id}/edit`}>
            返回編輯
          </Link>
          {isPostPublic(post) && (
            <Link className="admin-button" href={`/blog/${post.slug}`} target="_blank">
              開啟公開頁
            </Link>
          )}
        </div>
      </div>

      <div className="admin-preview-status">
        <span>{statusLabel[post.status] ?? post.status}</span>
        <span>{post.publishedAt}</span>
        <span>{category.name}</span>
      </div>

      <article className="article-main admin-article-preview">
        <header className="article-header">
          <Link className="article-category" href={`/categories/${category.slug}`} target="_blank">
            {category.name}
          </Link>
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta">
            <span>{post.publishedAt}</span>
            <span>{post.readingMinutes} 分鐘閱讀</span>
            <span>{post.views.toLocaleString()} 次瀏覽</span>
          </div>
        </header>

        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="article-cover" src={post.coverImage} alt={post.title} />
        )}

        {renderArticleContent(post.content)}

        {post.tags.length > 0 && (
          <div className="article-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </>
  );
}
