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

/** What the book list needs on the client: display fields plus searchable text. */
export interface BookSummary {
  id: string;
  title: string;
  category: string;
  dynasty?: string;
  bookType: BookEntry["bookType"];
  authors: string[];
  volumes?: string;
  publicationInfo: string;
  collectionInfo: string;
  volumeTitles: string[];
  notes?: string;
  hasSeals: boolean;
  hasNotes: boolean;
  isIncomplete: boolean;
  available: boolean;
  nuNumber?: string;
  /** page on the legacy site, relative to its html/ directory */
  url: string;
}

export function bookSummaries(): BookSummary[] {
  return library.books.map((book) => ({
    id: book.id,
    title: book.title,
    category: book.category,
    dynasty: book.dynasty,
    bookType: book.bookType,
    authors: book.authors,
    volumes: book.volumes,
    publicationInfo: book.publicationInfo,
    collectionInfo: book.collectionInfo,
    // distinct titles only: many volumes are just 第一册, 第二册 …
    volumeTitles: [...new Set((book.structure ?? []).map((v) => v.title))],
    notes: book.notes,
    hasSeals: book.hasSeals,
    hasNotes: book.hasNotes,
    isIncomplete: book.isIncomplete,
    available: book.available,
    nuNumber: book.nuNumber,
    url: book.url,
  }));
}
