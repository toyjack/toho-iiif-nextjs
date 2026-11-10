/**
 * Order two strings by Unicode code point, after NFC normalisation.
 *
 * `localeCompare` is not used for list sorting because its result depends on
 * the JavaScript engine: Bun (server render) and browsers order
 * supplementary-plane kanji such as 𧻰 differently, which made the server
 * HTML and the first client render disagree (hydration error on /books).
 *
 * For the characters book titles are made of this matches the default
 * collation closely: kana and symbols before kanji, BMP kanji by code point,
 * and extension-plane kanji after them. NFC maps CJK compatibility
 * ideographs onto their unified forms, as collation does.
 */
export function compareText(a: string, b: string): number {
  const x = a.normalize("NFC");
  const y = b.normalize("NFC");
  const xs = x[Symbol.iterator]();
  const ys = y[Symbol.iterator]();
  for (;;) {
    const p = xs.next();
    const q = ys.next();
    if (p.done || q.done) return p.done && q.done ? 0 : p.done ? -1 : 1;
    const d = p.value.codePointAt(0)! - q.value.codePointAt(0)!;
    if (d !== 0) return d < 0 ? -1 : 1;
  }
}
