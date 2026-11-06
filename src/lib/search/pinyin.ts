/**
 * Pinyin matching. The dictionary is generated at build time
 * (scripts/pinyin.ts); this module has no dependencies so it can run in the
 * browser.
 */

/** Pinyin of one string: readings per Han character and their offsets. */
export interface PinyinEntry {
  /** per Han character: readings joined by "|", contextual reading first */
  r: string[];
  /** UTF-16 offset of each Han character in the original string */
  p: number[];
}

/** original text → pinyin */
export type PinyinDict = Record<string, PinyinEntry>;

/** A query is treated as pinyin when it consists only of Latin letters (and spaces, ', :). */
export function isPinyinQuery(query: string): boolean {
  return /[a-z]/i.test(query) && /^[a-zü:'\s　]+$/i.test(query);
}

/** Lower-case, no spaces or apostrophes; ü / v / u: all become u. */
export function normalizePinyinQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/u:|ü|v/g, "u")
    .replace(/[\s　']/g, "");
}

/**
 * Where `query` (normalised) matches the entry, as [first, last] Han
 * character indices, or null. Two forms are accepted, each starting at a
 * character boundary:
 * - full syllables, the last one possibly typed only partly ("zhouyi",
 *   "zhouy");
 * - initials, one letter per character ("zy").
 * Any reading of a polyphonic character counts.
 */
export function pinyinMatch(entry: PinyinEntry, query: string): [number, number] | null {
  if (!query) return null;
  const readings = entry.r.map((r) => (r ? r.split("|") : []));
  const n = readings.length;

  const full = (i: number, k: number): number => {
    if (k === query.length) return i - 1;
    if (i === n) return -1;
    for (const reading of readings[i]) {
      if (query.startsWith(reading, k)) {
        const end = full(i + 1, k + reading.length);
        if (end >= 0) return end;
      } else if (reading.startsWith(query.slice(k))) {
        return i; // partially typed last syllable
      }
    }
    return -1;
  };

  for (let i = 0; i < n; i++) {
    const end = full(i, 0);
    if (end >= i) return [i, end];
  }

  if (query.length <= n) {
    for (let i = 0; i + query.length <= n; i++) {
      let ok = true;
      for (let j = 0; j < query.length && ok; j++) {
        ok = readings[i + j].some((r) => r[0] === query[j]);
      }
      if (ok) return [i, i + query.length - 1];
    }
  }
  return null;
}

/** Range [start, end) in the original text covered by a pinyin match. */
export function pinyinRange(text: string, entry: PinyinEntry, match: [number, number]): [number, number] {
  const start = entry.p[match[0]];
  const last = entry.p[match[1]];
  const width = (text.codePointAt(last) ?? 0) > 0xffff ? 2 : 1;
  return [start, last + width];
}
