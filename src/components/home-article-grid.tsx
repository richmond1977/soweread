"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category, Post } from "@/types/content";

type HomeArticleGridProps = {
  posts: Post[];
  categories: Category[];
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "food-safety":    "linear-gradient(135deg, #c0392b 0%, #e74c3c 40%, #f39c12 100%)",
  "nutrition":      "linear-gradient(135deg, #27ae60 0%, #2ecc71 50%, #a8e063 100%)",
  "healthy-eating": "linear-gradient(135deg, #16a085 0%, #1abc9c 50%, #48c9b0 100%)",
  "food-culture":   "linear-gradient(135deg, #8e44ad 0%, #9b59b6 50%, #d7bde2 100%)",
};

const DEFAULT_GRADIENT = "linear-gradient(135deg, #7f8c8d 0%, #95a5a6 50%, #bdc3c7 100%)";

function getCoverStyle(post: Post, categorySlug: string): React.CSSProperties {
  if (post.coverImage) {
    return {
      backgroundImage: `linear-gradient(rgba(250,248,245,0.15), rgba(240,235,229,0.5)), url(${post.coverImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {
    background: CATEGORY_GRADIENTS[categorySlug] ?? DEFAULT_GRADIENT,
  };
}

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
              style={getCoverStyle(post, category.slug)}
            >
              {!post.coverImage && (
                <span className="article-image-label">{category.name}</span>
              )}
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
