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
