import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  return (
    <div className="admin-shell">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <Link className="logo" href="/admin">
            潤讀後台
          </Link>
          <nav>
            <Link href="/admin">總覽</Link>
            <Link href="/admin/posts">文章管理</Link>
            <Link href="/admin/posts/new">新增文章</Link>
            <Link href="/admin/categories">分類管理</Link>
            <Link href="/">返回前台</Link>
          </nav>
          <form method="POST" action="/api/auth/logout" style={{ marginTop: "auto", paddingTop: 32 }}>
            <button type="submit" className="admin-logout-btn">
              登出
            </button>
          </form>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
