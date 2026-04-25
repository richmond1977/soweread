import Link from "next/link";
import type { Category, Post } from "@/types/content";

type ArticleCardProps = {
  post: Post;
  category: Category;
};

export function ArticleCard({ post, category }: ArticleCardProps) {
  return (
    <article className="article-item">
      <span className="article-category">{category.name}</span>
      <h3>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <div className="article-meta">
        <span>潤讀編輯</span>
        <span>{post.publishedAt}</span>
        <span>{post.views.toLocaleString("zh-TW")} 次瀏覽</span>
        <span>{post.comments} 條評論</span>
      </div>
      <p className="article-excerpt">{post.excerpt}</p>
      <Link className="read-more" href={`/blog/${post.slug}`}>
        繼續閱讀
      </Link>
    </article>
  );
}
