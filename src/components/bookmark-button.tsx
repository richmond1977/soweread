"use client";

import { useState, useEffect, useCallback } from "react";

type BookmarkButtonProps = {
  postId: string;
  title: string;
};

const STORAGE_KEY = "swr_bookmarks";

function getBookmarks(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function BookmarkButton({ postId, title }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(getBookmarks().includes(postId));
  }, [postId]);

  const toggle = useCallback(() => {
    const current = getBookmarks();
    const next = current.includes(postId)
      ? current.filter((id) => id !== postId)
      : [...current, postId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setBookmarked(next.includes(postId));
  }, [postId]);

  return (
    <button
      type="button"
      className={`bookmark-btn${bookmarked ? " bookmark-btn--active" : ""}`}
      onClick={toggle}
      aria-label={bookmarked ? `取消收藏《${title}》` : `收藏《${title}》`}
      title={bookmarked ? "取消收藏" : "收藏文章"}
    >
      {bookmarked ? "★ 已收藏" : "☆ 收藏"}
    </button>
  );
}
