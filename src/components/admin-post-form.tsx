"use client";

import { useActionState, useState, useCallback } from "react";
import Link from "next/link";
import { savePostAction } from "@/lib/actions";
import { CoverImageField } from "@/components/cover-image-field";
import { TiptapEditor } from "@/components/tiptap-editor";
import type { Author, Category, Post } from "@/types/content";

type AdminPostFormProps = {
  post?: Post;
  categories: Category[];
  authors: Author[];
};

export function AdminPostForm({ post, categories, authors }: AdminPostFormProps) {
  const [error, formAction, isPending] = useActionState(savePostAction, null);
  const [content, setContent] = useState(post?.content ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const sourcesText = post?.sources?.map((source) => source.url ? `${source.label} | ${source.url}` : source.label).join("\n") ?? "";
  const faqText = post?.faq?.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n") ?? "";

  const handleTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (slug) return;
      const generated = e.target.value
        .trim()
        .toLowerCase()
        .replace(/[\s　一-鿿㐀-䶿]+/g, "-")
        .replace(/[^a-z0-9-]+/g, "")
        .replace(/(^-|-$)/g, "");
      setSlug(generated || `post-${Date.now()}`);
    },
    [slug]
  );

  return (
    <form className="admin-card admin-form" action={formAction}>
      <input type="hidden" name="id" defaultValue={post?.id} />
      <input type="hidden" name="content" value={content} readOnly />

      {error && (
        <p style={{ color: "#c0392b", background: "#fdecea", padding: "10px 14px", borderRadius: 4, fontSize: "0.9rem" }}>
          {error}
        </p>
      )}

      <label>
        文章標題
        <input name="title" required defaultValue={post?.title} placeholder="輸入文章標題" onBlur={handleTitleBlur} />
      </label>

      <div className="field-grid">
        <label>
          Slug
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="article-slug"
          />
        </label>
        <label>
          發布日期
          <input
            name="publishedAt"
            type="date"
            defaultValue={post?.publishedAt ?? new Date().toISOString().slice(0, 10)}
          />
        </label>
        <label>
          文章更新日
          <input
            name="contentUpdatedAt"
            type="date"
            defaultValue={post?.contentUpdatedAt ?? post?.updatedAt ?? ""}
          />
          <span className="admin-help">留空時，前台會使用系統最後儲存日作為更新日。</span>
        </label>
      </div>

      <label>
        摘要
        <textarea name="excerpt" defaultValue={post?.excerpt} placeholder="列表頁與 SEO 使用的文章摘要" />
      </label>

      <CoverImageField defaultValue={post?.coverImage} />

      <label>
        封面圖片 alt
        <input name="coverImageAlt" defaultValue={post?.coverImageAlt} placeholder="描述封面圖片內容，供搜尋與無障礙閱讀使用" />
      </label>

      <div className="field-grid">
        <label>
          分類
          <select name="categoryId" defaultValue={post?.categoryId ?? categories[0]?.id}>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          作者
          <select name="authorId" defaultValue={post?.authorId ?? authors[0]?.id}>
            {authors.map((author) => (
              <option value={author.id} key={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="field-grid">
        <label>
          狀態
          <select name="status" defaultValue={post?.status ?? "draft"}>
            <option value="draft">草稿</option>
            <option value="published">已發布</option>
            <option value="scheduled">排程</option>
            <option value="archived">封存</option>
          </select>
          <span className="admin-help">排程文章會在發布日期到達後才出現在前台。</span>
        </label>
        <label>
          閱讀分鐘
          <input name="readingMinutes" type="number" min="1" defaultValue={post?.readingMinutes ?? 5} />
        </label>
      </div>

      <label>
        標籤，以逗號分隔
        <input name="tags" defaultValue={post?.tags.join(", ")} placeholder="食安, 營養, 標示" />
      </label>

      <label>
        來源
        <textarea
          name="sources"
          defaultValue={sourcesText}
          placeholder={"每行一筆，例如：\n衛福部食品藥物管理署 | https://www.fda.gov.tw/"}
        />
        <span className="admin-help">建議填入原始資料、法規、新聞或研究來源；格式為「名稱 | URL」。</span>
      </label>

      <div>
        <p style={{ fontSize: "0.9rem", color: "var(--text-light)", marginBottom: 8 }}>內文</p>
        <TiptapEditor content={content} onChange={setContent} />
      </div>

      <label>
        FAQ
        <textarea
          name="faq"
          defaultValue={faqText}
          placeholder={"Q: 問題\nA: 回答\n\nQ: 第二個問題\nA: 第二個回答"}
        />
      </label>

      <label style={{ display: "flex", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: 10 }}>
        <input name="showFaq" type="checkbox" defaultChecked={post?.showFaq} style={{ width: "auto" }} />
        在文章頁顯示 FAQ
      </label>

      <div className="field-grid">
        <label>
          SEO 標題
          <input name="seoTitle" defaultValue={post?.seoTitle} />
        </label>
        <label>
          SEO 描述
          <input name="seoDescription" defaultValue={post?.seoDescription} />
        </label>
      </div>

      <label style={{ display: "flex", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: 10 }}>
        <input name="featured" type="checkbox" defaultChecked={post?.featured} style={{ width: "auto" }} />
        精選文章
      </label>

      <div className="admin-form-actions">
        <button className="admin-button" type="submit" name="submitIntent" value="published" disabled={isPending}>
          {isPending ? "儲存中…" : "發布文章"}
        </button>
        <button
          className="admin-button admin-button--secondary"
          type="submit"
          name="submitIntent"
          value="draft"
          disabled={isPending}
        >
          儲存草稿
        </button>
        <button className="admin-button admin-button--secondary" type="submit" name="submitIntent" value="save" disabled={isPending}>
          儲存變更
        </button>
        {post ? (
          <Link className="admin-button admin-button--ghost" href={`/admin/posts/${post.id}/preview`} target="_blank">
            預覽文章
          </Link>
        ) : (
          <span className="admin-help">新增文章需先儲存草稿後才能預覽。</span>
        )}
      </div>
    </form>
  );
}
