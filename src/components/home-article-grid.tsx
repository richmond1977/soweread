"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category, Post } from "@/types/content";

type HomeArticleGridProps = {
  posts: Post[];
  categories: Category[];
};

export function HomeArticleGrid({ posts, categories }: HomeArticleGridProps) {
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  return (
    <div className="article-grid">
      {posts.map((post) => {
        const category = categories.find((item) => item.id === post.categoryId) ?? categories[0];

        return (
          <article key={post.id} className="article-card">
            <Link
              className="article-image"
              href={`/blog/${post.slug}`}
              style={
                post.coverImage
                  ? {
                      backgroundImage: `linear-gradient(rgba(250, 248, 245, 0.2), rgba(240, 235, 229, 0.55)), url(${post.coverImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              {!post.coverImage && <span>📰 {category.name}</span>}
            </Link>
            <div className="article-content">
              <span className="article-category">{category.name}</span>
              <h3 className="article-title">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="article-excerpt">{post.excerpt}</p>
              <div className="article-meta">
                <div>
                  <span>{formatHomeDate(post.publishedAt)}</span>
                  <span> • {post.readingMinutes} 分鐘</span>
                </div>
                <div className="article-meta-right">
                  <Link className="btn-read" href={`/blog/${post.slug}`}>
                    閱讀
                  </Link>
                  <button
                    className={`btn-bookmark ${bookmarked[post.id] ? "saved" : ""}`}
                    onClick={() => setBookmarked((current) => ({ ...current, [post.id]: !current[post.id] }))}
                    title={bookmarked[post.id] ? "已收藏" : "收藏文章"}
                    type="button"
                  >
                    {bookmarked[post.id] ? "♥" : "♡"}
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function formatHomeDate(value: string) {
  const [, month, day] = value.split("-");
  return `${Number(month)}月${Number(day)}日`;
}
