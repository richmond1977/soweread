import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
};

function buildHref(basePath: string, page: number, searchParams: Record<string, string>) {
  const params = new URLSearchParams({ ...searchParams, page: String(page) });
  if (page === 1) params.delete("page");
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ currentPage, totalPages, basePath, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className="pagination" aria-label="分頁">
      {currentPage > 1 && (
        <Link className="page-btn" href={buildHref(basePath, currentPage - 1, searchParams)}>
          ← 上一頁
        </Link>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
        ) : (
          <Link
            key={p}
            className={`page-btn${p === currentPage ? " page-btn--active" : ""}`}
            href={buildHref(basePath, p, searchParams)}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link className="page-btn" href={buildHref(basePath, currentPage + 1, searchParams)}>
          下一頁 →
        </Link>
      )}
    </nav>
  );
}
