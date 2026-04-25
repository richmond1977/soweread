import { AdminPostForm } from "@/components/admin-post-form";
import { getContent } from "@/lib/content";

export default async function NewPostPage() {
  const content = await getContent();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>新增文章</h1>
          <p>建立草稿或直接發布到前台部落格。</p>
        </div>
      </div>
      <AdminPostForm categories={content.categories} authors={content.authors} />
    </>
  );
}
