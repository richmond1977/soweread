"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { Category } from "@/types/content";

type PostFiltersProps = {
  categories: Category[];
};

export function PostFilters({ categories }: PostFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="post-filters">
      <input
        className="post-filter-search"
        type="search"
        placeholder="搜尋文章標題…"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => update("q", e.target.value)}
      />
      <select
        className="post-filter-select"
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
      >
        <option value="">全部狀態</option>
        <option value="published">已發布</option>
        <option value="draft">草稿</option>
        <option value="scheduled">排程</option>
        <option value="archived">封存</option>
      </select>
      <select
        className="post-filter-select"
        defaultValue={searchParams.get("category") ?? ""}
        onChange={(e) => update("category", e.target.value)}
      >
        <option value="">全部分類</option>
        {categories.map((cat) => (
          <option value={cat.id} key={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
