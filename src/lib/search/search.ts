import { matchRanges, normalize } from "./normalize";
import type { VariantMap } from "./variants";

/** Fields of a book that search looks at. */
export interface SearchableBook {
  id: string;
  title: string;
  authors: string[];
  category: string;
  dynasty?: string;
  publicationInfo: string;
  collectionInfo: string;
  volumeTitles: string[];
  notes?: string;
}

type FieldKey = "title" | "authors" | "volumeTitles" | "publicationInfo" | "collectionInfo" | "category" | "dynasty" | "notes";

const FIELDS: Array<{ key: FieldKey; weight: number }> = [
  { key: "title", weight: 100 },
  { key: "authors", weight: 60 },
  { key: "volumeTitles", weight: 30 },
  { key: "publicationInfo", weight: 30 },
  { key: "category", weight: 20 },
  { key: "dynasty", weight: 20 },
  { key: "collectionInfo", weight: 15 },
  { key: "notes", weight: 10 },
];

interface IndexedValue {
  raw: string;
  /** normalised with variant folding */
  folded: string;
  /** normalised without variant folding (to tell literal from variant matches) */
  plain: string;
}

export interface IndexedBook<T extends SearchableBook = SearchableBook> {
  book: T;
  fields: Array<{ key: FieldKey; weight: number; values: IndexedValue[] }>;
}

function values(book: SearchableBook, key: FieldKey): string[] {
  const value = book[key];
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

export function buildIndex<T extends SearchableBook>(books: T[], variants: VariantMap): IndexedBook<T>[] {
  return books.map((book) => ({
    book,
    fields: FIELDS.map(({ key, weight }) => ({
      key,
      weight,
      values: values(book, key).map((raw) => ({
        raw,
        folded: normalize(raw, variants),
        plain: normalize(raw),
      })),
    })),
  }));
}

/** Query terms (split on whitespace), each normalised both ways. */
function terms(query: string, variants: VariantMap) {
  return query
    .split(/[\s　]+/)
    .filter(Boolean)
    .map((term) => ({ folded: normalize(term, variants), plain: normalize(term) }))
    .filter((term) => term.folded.length > 0);
}

export interface SearchHit<T extends SearchableBook = SearchableBook> {
  book: T;
  score: number;
  /** true when at least one term matched only through variant folding */
  viaVariant: boolean;
}

/**
 * Books matching every term of `query` (AND), best first.
 * Score: per term, the best field weight it matched, with a bonus for a
 * title that starts with the term.
 */
export function search<T extends SearchableBook>(
  index: IndexedBook<T>[],
  query: string,
  variants: VariantMap
): SearchHit<T>[] {
  const qs = terms(query, variants);
  if (qs.length === 0) return index.map(({ book }) => ({ book, score: 0, viaVariant: false }));

  const hits: SearchHit<T>[] = [];
  for (const entry of index) {
    let score = 0;
    let viaVariant = false;
    let all = true;
    for (const term of qs) {
      let best = 0;
      let literal = false;
      for (const field of entry.fields) {
        for (const value of field.values) {
          const at = value.folded.indexOf(term.folded);
          if (at < 0) continue;
          const bonus = field.key === "title" && at === 0 ? 20 : 0;
          best = Math.max(best, field.weight + bonus);
          if (value.plain.includes(term.plain)) literal = true;
        }
      }
      if (best === 0) {
        all = false;
        break;
      }
      score += best;
      if (!literal) viaVariant = true;
    }
    if (all) hits.push({ book: entry.book, score, viaVariant });
  }
  return hits.sort((a, b) => b.score - a.score);
}

export type Suggestion<T extends SearchableBook = SearchableBook> =
  | { type: "title"; book: T; value: string; ranges: Array<[number, number]>; viaVariant: boolean }
  | { type: "author" | "category" | "dynasty"; value: string; count: number; ranges: Array<[number, number]>; viaVariant: boolean };

/**
 * Candidates for the search box, grouped: titles, authors, then
 * categories and dynasties. The whole query (spaces ignored) must occur
 * within one value.
 */
export function suggest<T extends SearchableBook>(
  index: IndexedBook<T>[],
  query: string,
  variants: VariantMap,
  limit = 5
): Suggestion<T>[] {
  const folded = normalize(query, variants);
  const plain = normalize(query);
  if (!folded) return [];

  const titles: Array<Suggestion<T> & { type: "title"; at: number }> = [];
  const facets = {
    author: new Map<string, { count: number; at: number; viaVariant: boolean }>(),
    category: new Map<string, { count: number; at: number; viaVariant: boolean }>(),
    dynasty: new Map<string, { count: number; at: number; viaVariant: boolean }>(),
  };
  const facetField = { authors: "author", category: "category", dynasty: "dynasty" } as const;

  for (const entry of index) {
    for (const field of entry.fields) {
      for (const value of field.values) {
        const at = value.folded.indexOf(folded);
        if (at < 0) continue;
        const viaVariant = !value.plain.includes(plain);
        if (field.key === "title") {
          titles.push({
            type: "title",
            book: entry.book,
            value: value.raw,
            ranges: matchRanges(value.raw, folded, variants),
            viaVariant,
            at,
          });
        } else if (field.key in facetField) {
          const map = facets[facetField[field.key as keyof typeof facetField]];
          const prev = map.get(value.raw);
          map.set(value.raw, {
            count: (prev?.count ?? 0) + 1,
            at,
            viaVariant: prev ? prev.viaVariant && viaVariant : viaVariant,
          });
        }
      }
    }
  }

  const byPosition = <V extends { at: number }>(a: V & { value: string }, b: V & { value: string }) =>
    a.at - b.at || a.value.length - b.value.length || a.value.localeCompare(b.value);

  const facetList = (type: "author" | "category" | "dynasty") =>
    [...facets[type].entries()]
      .map(([value, info]) => ({ value, ...info }))
      .sort(byPosition)
      .slice(0, limit)
      .map(({ value, count, viaVariant }) => ({
        type,
        value,
        count,
        viaVariant,
        ranges: matchRanges(value, folded, variants),
      }));

  return [
    ...titles.sort(byPosition).slice(0, limit).map(({ at: _at, ...s }) => s),
    ...facetList("author"),
    ...facetList("category"),
    ...facetList("dynasty"),
  ];
}
