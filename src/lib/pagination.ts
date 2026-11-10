/** Books per page on /books (docs/ui-design-system.md §4.4). */
export const PAGE_SIZE = 50;

export interface PageSlice {
  /** 1-based page actually shown, clamped to the available pages */
  page: number;
  totalPages: number;
  /** 0-based slice bounds into the result list */
  start: number;
  end: number;
}

/** Parse a `p` query value; anything that is not a positive integer is page 1. */
export function parsePage(value: string | null | undefined): number {
  if (!value || !/^\d+$/.test(value)) return 1;
  const n = Number(value);
  return n >= 1 ? n : 1;
}

export function paginate(total: number, page: number, size = PAGE_SIZE): PageSlice {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * size;
  return { page: current, totalPages, start, end: Math.min(start + size, total) };
}

/**
 * Page numbers to show in a pagination bar: always the first and last page
 * and `radius` pages either side of the current one; gaps become "gap".
 */
export function pageItems(current: number, totalPages: number, radius = 1): Array<number | "gap"> {
  const pages = new Set<number>([1, totalPages]);
  for (let p = current - radius; p <= current + radius; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const items: Array<number | "gap"> = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev === 2) items.push(prev + 1);
    else if (prev !== undefined && p - prev > 2) items.push("gap");
    items.push(p);
  });
  return items;
}
