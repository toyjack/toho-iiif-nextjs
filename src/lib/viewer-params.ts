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

/** The IIIF viewers the reader offers; the first is the default. */
export const VIEWERS = ["tify", "uv", "mirador"] as const;
export type ViewerKind = (typeof VIEWERS)[number];

/** `?viewer=` value; missing or unknown → Tify. */
export function parseViewer(value: string | undefined): ViewerKind {
  return VIEWERS.find((viewer) => viewer === value) ?? "tify";
}

/** `href` with `viewer` set, other parameters and the hash kept; Tify (the default) drops it. */
export function withViewerParam(href: string, viewer: ViewerKind): string {
  const url = new URL(href);
  if (viewer === VIEWERS[0]) url.searchParams.delete("viewer");
  else url.searchParams.set("viewer", viewer);
  return url.toString();
}

/** 1-based page for a 0-based canvas index (Universal Viewer); null when invalid. */
export function pageFromCanvasIndex(index: unknown): number | null {
  return typeof index === "number" && Number.isInteger(index) && index >= 0 ? index + 1 : null;
}

/** 1-based page of `canvasId` among the manifest's canvases (Mirador); null when absent. */
export function pageFromCanvasId(canvasIds: readonly string[], canvasId: string | undefined): number | null {
  if (!canvasId) return null;
  const index = canvasIds.indexOf(canvasId);
  return index < 0 ? null : index + 1;
}

/**
 * Write `page` into the address bar's `?page=` without a history entry or a
 * re-render. Shared by every viewer; browser only.
 */
export function replacePageParam(page: number): void {
  const href = withPageParam(window.location.href, page);
  if (href !== window.location.href) window.history.replaceState(window.history.state, "", href);
}
