/** First value of a possibly repeated query parameter. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** 1-based page number clamped to [1, pageCount]; missing or invalid input → 1. */
export function parsePage(value: string | undefined, pageCount: number): number {
  const page = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.max(1, Math.min(page, pageCount));
}

/**
 * The page to keep in `?page=` for the pages Tify shows: the lowest real
 * page (a two-page view may include 0 for an empty slot). Null when none.
 */
export function pageFromTifyPages(pages: readonly number[] | undefined): number | null {
  const real = (pages ?? []).filter((p) => Number.isInteger(p) && p > 0);
  return real.length > 0 ? Math.min(...real) : null;
}

/** `href` with `page` set, other parameters and the hash kept; page 1 drops it. */
export function withPageParam(href: string, page: number): string {
  const url = new URL(href);
  if (page > 1) url.searchParams.set("page", String(page));
  else url.searchParams.delete("page");
  return url.toString();
}
