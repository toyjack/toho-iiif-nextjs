import type { BookEntry } from "@/types";

/**
 * Display labels for `bookType`. Kept separate from `@/lib/books` so client
 * components can use it without bundling the catalogue.
 */
export const BOOK_TYPE_LABELS: Record<BookEntry["bookType"], string> = {
  manuscript: "手鈔本",
  printed: "刊本",
  rubbing: "拓本",
  unknown: "未知",
};

export function bookTypeLabel(type: string): string {
  return BOOK_TYPE_LABELS[type as BookEntry["bookType"]] ?? type;
}
