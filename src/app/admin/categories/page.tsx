import { saveCategoryAction } from "@/lib/actions";
import { getContent } from "@/lib/content";

export default async function AdminCategoriesPage() {
  const content = await getContent();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>分類管理</h1>
          <p>維護前台側欄與文章分類頁使用的分類資料。</p>
        </div>
      </div>

      <div className="field-grid">
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>分類</th>
                <th>Slug</th>
                <th>文章數</th>
              </tr>
            </thead>
            <tbody>
              {content.categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{content.posts.filter((post) => post.categoryId === category.id).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form className="admin-card admin-form" action={saveCategoryAction}>
          <h2>新增分類</h2>
          <label>
            分類名稱
            <input name="name" required placeholder="例如：飲食文化" />
          </label>
          <label>
            Slug
            <input name="slug" required placeholder="food-culture" />
          </label>
          <label>
            描述
            <textarea name="description" placeholder="分類頁使用的簡短說明" />
          </label>
          <button className="admin-button" type="submit">
            儲存分類
          </button>
        </form>
      </div>
    </>
  );
}
