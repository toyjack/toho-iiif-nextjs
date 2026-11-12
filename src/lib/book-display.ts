/**
 * Display helpers for catalogue entries. They change how text is styled,
 * never the text itself. Safe for client components (no catalogue import).
 */

/**
 * Split a title at its first ideographic space (U+3000) into the work's name
 * and the rest (卷数 and similar notes), e.g. 「周易正義　十四卷」 →
 * ["周易正義", "　十四卷"]. The space stays with the rest, so joining the two
 * parts gives back the original title exactly.
 */
export function splitTitle(title: string): [main: string, rest: string] {
  const i = title.indexOf("　");
  if (i <= 0) return [title, ""];
  return [title.slice(0, i), title.slice(i)];
}

/** Record page of a book in 全国漢籍データベース. */
export function kansekiDbUrl(nuNumber: string): string {
  return `http://kanji.zinbun.kyoto-u.ac.jp/kanseki?record=data/FA019705/tagged/${nuNumber}.dat&back=1`;
}

/** Directory of the legacy site (東方學デジタル圖書館); book `url` fields are relative to it. */
export const LEGACY_SITE_BASE = "http://kanji.zinbun.kyoto-u.ac.jp/db-machine/toho/html/";

/** A book's page on the legacy site, from its `url` field (e.g. `A015menu.html`). */
export function legacySiteUrl(url: string): string {
  return new URL(url, LEGACY_SITE_BASE).href;
}

export function viewerHref(id: string): string {
  return `/viewer?book=${encodeURIComponent(id)}`;
}
