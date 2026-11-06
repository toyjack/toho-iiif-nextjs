/**
 * Build-time pinyin generation (pinyin-pro is a dev dependency and never
 * reaches the browser).
 */
import { pinyin } from "pinyin-pro";
import { normalize } from "../src/lib/search/normalize";
import type { PinyinDict, PinyinEntry } from "../src/lib/search/pinyin";
import type { VariantMap } from "../src/lib/search/variants";

const HAN = /\p{Script=Han}/u;

/** Toneless, lower-case, with ü written as u (so lv / lu / lü all match). */
const clean = (s: string) => s.toLowerCase().replace(/ü|v/g, "u");

/**
 * Pinyin for one string: for each Han character its readings (contextual
 * reading first, then other readings of polyphones) and its UTF-16 offset.
 * Characters are folded through the variant table first, so old forms such
 * as 淸 or 説 get the reading of their representative.
 */
export function pinyinEntry(
  text: string,
  variants: VariantMap,
  missing: Set<string>
): PinyinEntry | null {
  const chars: string[] = [];
  const offsets: number[] = [];
  let offset = 0;
  for (const ch of text) {
    if (HAN.test(ch)) {
      chars.push(normalize(ch, variants) || ch);
      offsets.push(offset);
    }
    offset += ch.length;
  }
  if (chars.length === 0) return null;

  const contextual = pinyin(chars.join(""), { type: "all", toneType: "none" }) as Array<{
    origin: string;
    pinyin: string;
    isZh: boolean;
  }>;

  const readings = chars.map((ch, i) => {
    const all = new Set<string>();
    const first = contextual[i];
    if (first && first.origin === ch && first.isZh && first.pinyin) all.add(clean(first.pinyin));
    for (const r of pinyin(ch, { multiple: true, type: "array", toneType: "none" }) as string[]) {
      if (/^[a-zü]+$/i.test(r)) all.add(clean(r));
    }
    if (all.size === 0) missing.add(ch);
    return [...all].join("|");
  });

  return { r: readings, p: offsets };
}

export function buildPinyinDict(
  texts: Iterable<string>,
  variants: VariantMap
): { dict: PinyinDict; missing: string[] } {
  const dict: PinyinDict = {};
  const missing = new Set<string>();
  for (const text of texts) {
    if (text in dict) continue;
    const entry = pinyinEntry(text, variants, missing);
    if (entry) dict[text] = entry;
  }
  return { dict, missing: [...missing].sort() };
}
