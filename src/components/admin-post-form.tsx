"use client";

import { useActionState, useState, useCallback } from "react";
import { savePostAction } from "@/lib/actions";
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

  const handleTitleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (slug) return;
      const generated = e.target.value
        .trim()
        .toLowerCase()
        .replace(/[\s　一-鿿㐀-䶿]+/g, "-")
        .replace(/[^a-z0-9-]+/g, "")
        .replace(/(^-|-$)/g, "");
      if (generated) setSlug(generated);
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
      </div>

      <label>
        摘要
        <textarea name="excerpt" defaultValue={post?.excerpt} placeholder="列表頁與 SEO 使用的文章摘要" />
      </label>

      <label>
        封面圖片 URL
        <input name="coverImage" defaultValue={post?.coverImage} placeholder="https://... 或使用工具列插入圖片後複製網址" />
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

      <div>
        <p style={{ fontSize: "0.9rem", color: "var(--text-light)", marginBottom: 8 }}>內文</p>
        <TiptapEditor content={content} onChange={setContent} />
      </div>

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

      <div style={{ display: "flex", gap: 12 }}>
        <button className="admin-button" type="submit" name="status" value="published" disabled={isPending}>
          {isPending ? "儲存中…" : "發布文章"}
        </button>
        <button
          className="admin-button"
          type="submit"
          name="status"
          value="draft"
          disabled={isPending}
          style={{ background: "var(--bg-dark)", color: "var(--text-medium)" }}
        >
          儲存草稿
        </button>
      </div>
    </form>
  );
}
