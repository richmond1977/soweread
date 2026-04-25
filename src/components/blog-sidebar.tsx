import Link from "next/link";
import type { Category, Post } from "@/types/content";

type BlogSidebarProps = {
  posts: Post[];
  categories: Category[];
};

export function BlogSidebar({ posts, categories }: BlogSidebarProps) {
  const categoryCounts = categories.map((category) => ({
    ...category,
    count: posts.filter((post) => post.categoryId === category.id).length,
  }));
  const featured = [...posts].sort((a, b) => b.views - a.views).slice(0, 3);
  const tags = [...new Set(posts.flatMap((post) => post.tags))].slice(0, 10);

  return (
    <aside className="blog-sidebar">
      <div className="sidebar-card">
        <h4>精選文章</h4>
        <ul className="featured-list">
          {featured.map((post, index) => (
            <li className="featured-item" key={post.id}>
              <span className="featured-number">{index + 1}</span>
              <Link className="featured-link" href={`/blog/${post.slug}`}>
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-card">
        <h4>分類</h4>
        <ul className="category-list">
          {categoryCounts.map((category) => (
            <li className="category-item" key={category.id}>
              <Link className="category-link" href={`/categories/${category.slug}`}>
                {category.name}
              </Link>
              <span className="category-count">{category.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-card">
        <h4>熱門標籤</h4>
        <div className="tag-cloud">
          {tags.map((tag) => (
            <Link className="tag" href="/blog" key={tag}>
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
