import type { VariantMap } from "./variants";

/**
 * Search normalisation. Never applied to displayed text.
 *
 * Per code point:
 * 1. drop variation selectors (U+FE00–FE0F, U+E0100–E01EF) and whitespace
 *    (including U+3000);
 * 2. map CJK compatibility ideographs (U+F900–FAFF, U+2F800–2FA1F) to their
 *    unified equivalents;
 * 3. fold full-width ASCII to ASCII and lower-case Latin letters;
 * 4. fold variant characters to their representative.
 *
 * Each input code point yields at most one output code point, so match
 * positions can be mapped back to the original string for highlighting.
 */
export interface NormalizedText {
  text: string;
  /** For each UTF-16 unit of `text`: [start, end) in the original string. */
  starts: number[];
  ends: number[];
}

const isVariationSelector = (cp: number) =>
  (cp >= 0xfe00 && cp <= 0xfe0f) || (cp >= 0xe0100 && cp <= 0xe01ef);
const isCompatIdeograph = (cp: number) =>
  (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0x2f800 && cp <= 0x2fa1f);
const isFullWidthAscii = (cp: number) => cp >= 0xff01 && cp <= 0xff5e;

function normalizeChar(ch: string, variants: VariantMap): string {
  const cp = ch.codePointAt(0)!;
  if (isVariationSelector(cp) || /\s/u.test(ch)) return "";
  let out = ch;
  if (isCompatIdeograph(cp)) out = ch.normalize("NFC");
  else if (isFullWidthAscii(cp)) out = String.fromCodePoint(cp - 0xfee0);
  out = out.toLowerCase();
  return variants[out] ?? out;
}

export function normalizeWithOffsets(input: string, variants: VariantMap = {}): NormalizedText {
  let text = "";
  const starts: number[] = [];
  const ends: number[] = [];
  let index = 0;
  for (const ch of input) {
    const out = normalizeChar(ch, variants);
    for (let i = 0; i < out.length; i++) {
      starts.push(index);
      ends.push(index + ch.length);
    }
    text += out;
    index += ch.length;
  }
  return { text, starts, ends };
}

export function normalize(input: string, variants: VariantMap = {}): string {
  let text = "";
  for (const ch of input) text += normalizeChar(ch, variants);
  return text;
}

/** Ranges [start, end) in `original` where the normalised `query` occurs. */
export function matchRanges(
  original: string,
  normalizedQuery: string,
  variants: VariantMap = {}
): Array<[number, number]> {
  if (!normalizedQuery) return [];
  const { text, starts, ends } = normalizeWithOffsets(original, variants);
  const ranges: Array<[number, number]> = [];
  let from = 0;
  for (;;) {
    const at = text.indexOf(normalizedQuery, from);
    if (at < 0) break;
    ranges.push([starts[at], ends[at + normalizedQuery.length - 1]]);
    from = at + normalizedQuery.length;
  }
  return ranges;
}
