import Link from "next/link";
import { getContent } from "@/lib/content";

export default async function AdminDashboardPage() {
  const content = await getContent();
  const publishedCount = content.posts.filter((post) => post.status === "published").length;
  const draftCount = content.posts.filter((post) => post.status === "draft").length;

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>內容總覽</h1>
          <p>管理文章、分類與發布狀態。</p>
        </div>
        <Link className="admin-button" href="/admin/posts/new">
          新增文章
        </Link>
      </div>

      <div className="field-grid">
        <div className="admin-card">
          <h2>{content.posts.length}</h2>
          <p>全部文章</p>
        </div>
        <div className="admin-card">
          <h2>{publishedCount}</h2>
          <p>已發布</p>
        </div>
        <div className="admin-card">
          <h2>{draftCount}</h2>
          <p>草稿</p>
        </div>
        <div className="admin-card">
          <h2>{content.categories.length}</h2>
          <p>分類</p>
        </div>
      </div>
    </>
  );
}
