import data from "@/generated/books.json";
import type { BookEntry, LibraryData } from "@/types";

/**
 * The single entry point to bibliographic data.
 *
 * Generated from data/site.yaml and data/books/*.md by scripts/build-data.ts,
 * which validates the schema, so the cast here is safe.
 */
export const library = data as LibraryData;

const byId = new Map(library.books.map((book) => [book.id, book]));

export function getBook(id: string): BookEntry | undefined {
  return byId.get(id);
}

export function availableBooks(): BookEntry[] {
  return library.books.filter((book) => book.available);
}
