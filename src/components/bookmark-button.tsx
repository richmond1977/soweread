"use client";

import { useCallback, useSyncExternalStore } from "react";

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

/**
 * localStorage 是 React 之外的狀態，用 useSyncExternalStore 訂閱而不是在
 * effect 裡 setState：後者會多觸發一輪 render，而且同一篇文章若有兩個收藏
 * 按鈕，其中一個被點擊時另一個不會跟著更新。
 */
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // storage 事件只在「其他分頁」寫入時觸發，同分頁的變動由 notify() 負責。
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function BookmarkButton({ postId, title }: BookmarkButtonProps) {
  const bookmarked = useSyncExternalStore(
    subscribe,
    () => getBookmarks().includes(postId),
    // 伺服器端沒有 localStorage，一律以未收藏渲染，避免 hydration 不一致。
    () => false
  );

  const toggle = useCallback(() => {
    const current = getBookmarks();
    const next = current.includes(postId)
      ? current.filter((id) => id !== postId)
      : [...current, postId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    notify();
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
