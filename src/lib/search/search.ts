import { matchRanges, normalize } from "./normalize";
import {
  isPinyinQuery,
  normalizePinyinQuery,
  pinyinMatch,
  pinyinRange,
  type PinyinDict,
  type PinyinEntry,
} from "./pinyin";
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

/** Pinyin matches rank just below literal matches in the same field. */
const PINYIN_PENALTY = 5;
const TITLE_PREFIX_BONUS = 20;

interface IndexedValue {
  raw: string;
  /** normalised with variant folding */
  folded: string;
  /** normalised without variant folding (to tell literal from variant matches) */
  plain: string;
  /** pinyin, when the build generated it for this text */
  py?: PinyinEntry;
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

export function buildIndex<T extends SearchableBook>(
  books: T[],
  variants: VariantMap,
  pinyin: PinyinDict = {}
): IndexedBook<T>[] {
  return books.map((book) => ({
    book,
    fields: FIELDS.map(({ key, weight }) => ({
      key,
      weight,
      values: values(book, key).map((raw) => ({
        raw,
        folded: normalize(raw, variants),
        plain: normalize(raw),
        py: pinyin[raw],
      })),
    })),
  }));
}

type Via = "literal" | "variant" | "pinyin";

interface Term {
  folded: string;
  plain: string;
  /** normalised pinyin, when the term is Latin letters only */
  pinyin?: string;
}

function term(text: string, variants: VariantMap): Term {
  return {
    folded: normalize(text, variants),
    plain: normalize(text),
    pinyin: isPinyinQuery(text) ? normalizePinyinQuery(text) : undefined,
  };
}

/**
 * Query terms. A query of Latin letters only is one pinyin term (spaces
 * between syllables ignored); otherwise terms are split on whitespace.
 */
function terms(query: string, variants: VariantMap): Term[] {
  if (isPinyinQuery(query)) return [term(query, variants)];
  return query
    .split(/[\s　]+/)
    .filter(Boolean)
    .map((t) => term(t, variants))
    .filter((t) => t.folded.length > 0);
}

interface ValueMatch {
  /** character position of the match (for ordering) */
  at: number;
  via: Via;
  ranges: Array<[number, number]>;
}

function matchValue(value: IndexedValue, t: Term, variants: VariantMap, withRanges: boolean): ValueMatch | null {
  const at = value.folded.indexOf(t.folded);
  if (at >= 0) {
    return {
      at,
      via: value.plain.includes(t.plain) ? "literal" : "variant",
      ranges: withRanges ? matchRanges(value.raw, t.folded, variants) : [],
    };
  }
  if (t.pinyin && value.py) {
    const m = pinyinMatch(value.py, t.pinyin);
    if (m) {
      return { at: m[0], via: "pinyin", ranges: withRanges ? [pinyinRange(value.raw, value.py, m)] : [] };
    }
  }
  return null;
}

export interface SearchHit<T extends SearchableBook = SearchableBook> {
  book: T;
  score: number;
  /** true when at least one term matched only through variant folding */
  viaVariant: boolean;
  /** true when at least one term matched only through pinyin */
  viaPinyin: boolean;
}

/**
 * Books matching every term of `query` (AND), best first.
 * Score: per term, the best field weight it matched, with a bonus for a
 * title that starts with the term and a small penalty for pinyin matches.
 */
export function search<T extends SearchableBook>(
  index: IndexedBook<T>[],
  query: string,
  variants: VariantMap
): SearchHit<T>[] {
  const qs = terms(query, variants);
  if (qs.length === 0) {
    return index.map(({ book }) => ({ book, score: 0, viaVariant: false, viaPinyin: false }));
  }

  const hits: SearchHit<T>[] = [];
  for (const entry of index) {
    let score = 0;
    let viaVariant = false;
    let viaPinyin = false;
    let all = true;
    for (const t of qs) {
      let best = 0;
      let bestVia: Via = "pinyin";
      for (const field of entry.fields) {
        for (const value of field.values) {
          const m = matchValue(value, t, variants, false);
          if (!m) continue;
          const points =
            field.weight +
            (field.key === "title" && m.at === 0 ? TITLE_PREFIX_BONUS : 0) -
            (m.via === "pinyin" ? PINYIN_PENALTY : 0);
          // literal beats variant beats pinyin when scores tie
          const rank = { literal: 2, variant: 1, pinyin: 0 };
          if (points > best || (points === best && rank[m.via] > rank[bestVia])) {
            best = points;
            bestVia = m.via;
          }
        }
      }
      if (best === 0) {
        all = false;
        break;
      }
      score += best;
      if (bestVia === "variant") viaVariant = true;
      if (bestVia === "pinyin") viaPinyin = true;
    }
    if (all) hits.push({ book: entry.book, score, viaVariant, viaPinyin });
  }
  return hits.sort((a, b) => b.score - a.score);
}

interface SuggestionBase {
  value: string;
  ranges: Array<[number, number]>;
  viaVariant: boolean;
  viaPinyin: boolean;
}

export type Suggestion<T extends SearchableBook = SearchableBook> =
  | (SuggestionBase & { type: "title"; book: T })
  | (SuggestionBase & { type: "author" | "category" | "dynasty"; count: number });

/**
 * Candidates for the search box, grouped: titles, authors, then
 * categories and dynasties. The whole query (spaces ignored) must match
 * within one value, literally, through variants, or as pinyin.
 */
export function suggest<T extends SearchableBook>(
  index: IndexedBook<T>[],
  query: string,
  variants: VariantMap,
  limit = 5
): Suggestion<T>[] {
  const t = term(query, variants);
  if (!t.folded) return [];

  type Found = SuggestionBase & { at: number };
  const titles: Array<Found & { book: T }> = [];
  const facets = {
    author: new Map<string, Found & { count: number }>(),
    category: new Map<string, Found & { count: number }>(),
    dynasty: new Map<string, Found & { count: number }>(),
  };
  const facetField = { authors: "author", category: "category", dynasty: "dynasty" } as const;

  for (const entry of index) {
    for (const field of entry.fields) {
      if (field.key !== "title" && !(field.key in facetField)) continue;
      for (const value of field.values) {
        const m = matchValue(value, t, variants, true);
        if (!m) continue;
        const found: Found = {
          value: value.raw,
          at: m.at,
          ranges: m.ranges,
          viaVariant: m.via === "variant",
          viaPinyin: m.via === "pinyin",
        };
        if (field.key === "title") {
          titles.push({ ...found, book: entry.book });
        } else {
          const map = facets[facetField[field.key as keyof typeof facetField]];
          const prev = map.get(value.raw);
          map.set(value.raw, { ...(prev ?? found), count: (prev?.count ?? 0) + 1 });
        }
      }
    }
  }

  // literal before variant before pinyin, then by position and length
  const rank = (s: SuggestionBase) => (s.viaPinyin ? 2 : s.viaVariant ? 1 : 0);
  const order = (a: Found, b: Found) =>
    rank(a) - rank(b) || a.at - b.at || a.value.length - b.value.length || a.value.localeCompare(b.value);

  const strip = <V extends Found>({ at: _at, ...rest }: V) => rest;
  const facetList = (type: "author" | "category" | "dynasty") =>
    [...facets[type].values()].sort(order).slice(0, limit).map((f) => ({ ...strip(f), type }));

  return [
    ...titles.sort(order).slice(0, limit).map((f) => ({ ...strip(f), type: "title" as const })),
    ...facetList("author"),
    ...facetList("category"),
    ...facetList("dynasty"),
  ];
}
