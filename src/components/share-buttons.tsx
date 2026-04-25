"use client";

import { useState, useCallback } from "react";

type ShareButtonsProps = {
  title: string;
  url?: string;
};

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const pageUrl = url ?? "";
  const encoded = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  }, [pageUrl]);

  return (
    <div className="share-bar">
      <span className="share-label">分享</span>
      <a
        className="share-btn share-btn--x"
        href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="分享到 X (Twitter)"
      >
        𝕏
      </a>
      <a
        className="share-btn share-btn--fb"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="分享到 Facebook"
      >
        f
      </a>
      <a
        className="share-btn share-btn--line"
        href={`https://social-plugins.line.me/lineit/share?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="分享到 LINE"
      >
        LINE
      </a>
      <button
        className={`share-btn share-btn--copy${copied ? " share-btn--copied" : ""}`}
        onClick={handleCopy}
        type="button"
        aria-label="複製連結"
      >
        {copied ? "已複製！" : "複製連結"}
      </button>
    </div>
  );
}
