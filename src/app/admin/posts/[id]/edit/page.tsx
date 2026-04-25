import { notFound } from "next/navigation";
import { AdminPostForm } from "@/components/admin-post-form";
import { getContent } from "@/lib/content";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const content = await getContent();
  const post = content.posts.find((item) => item.id === id);
  if (!post) notFound();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>編輯文章</h1>
          <p>調整文章內容、SEO、分類與發布狀態。</p>
        </div>
      </div>
      <AdminPostForm post={post} categories={content.categories} authors={content.authors} />
    </>
  );
}
