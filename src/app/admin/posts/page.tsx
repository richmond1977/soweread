import Link from "next/link";
import { Suspense } from "react";
import { getContent } from "@/lib/content";
import { PostFilters } from "./components/post-filters";

type SearchParams = Promise<{ q?: string; status?: string; category?: string }>;

export default async function AdminPostsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, status, category } = await searchParams;
  const content = await getContent();

  const filtered = content.posts.filter((post) => {
    if (q && !post.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (status && post.status !== status) return false;
    if (category && post.categoryId !== category) return false;
    return true;
  });

  const statusLabel: Record<string, string> = {
    published: "已發布",
    draft: "草稿",
    scheduled: "排程",
    archived: "封存",
  };

  const statusColor: Record<string, string> = {
    published: "#27ae60",
    draft: "#7f8c8d",
    scheduled: "#2980b9",
    archived: "#c0392b",
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>文章管理</h1>
          <p>共 {filtered.length} 篇文章</p>
        </div>
        <Link className="admin-button" href="/admin/posts/new">
          新增文章
        </Link>
      </div>

      <Suspense>
        <PostFilters categories={content.categories} />
      </Suspense>

      <div className="admin-card" style={{ marginTop: 20 }}>
        {filtered.length === 0 ? (
          <p style={{ padding: "24px 0", textAlign: "center", color: "var(--text-light)" }}>沒有符合條件的文章</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>標題</th>
                <th>分類</th>
                <th>狀態</th>
                <th>日期</th>
                <th>瀏覽</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => {
                const cat = content.categories.find((c) => c.id === post.categoryId);
                return (
                  <tr key={post.id}>
                    <td>
                      <span style={{ fontWeight: 500 }}>{post.title}</span>
                      {post.featured && (
                        <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "var(--primary)" }}>精選</span>
                      )}
                    </td>
                    <td>{cat?.name ?? "—"}</td>
                    <td>
                      <span
                        className="status-pill"
                        style={{ color: statusColor[post.status] ?? "inherit" }}
                      >
                        {statusLabel[post.status] ?? post.status}
                      </span>
                    </td>
                    <td>{post.publishedAt}</td>
                    <td>{post.views.toLocaleString()}</td>
                    <td style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <Link href={`/admin/posts/${post.id}/edit`}>編輯</Link>
                      {post.status === "published" && (
                        <Link href={`/blog/${post.slug}`} target="_blank" style={{ color: "var(--text-light)" }}>
                          預覽
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
