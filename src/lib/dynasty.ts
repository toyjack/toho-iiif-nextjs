// relative import: scripts/build-data.ts uses this file too
import { compareText } from "./text-compare";

/**
 * Dynasties in chronological order, as written in the `dynasty` field.
 * Variant spellings of one dynasty share a rank (淸 and 清 are both used in
 * the data and are kept as written). Where dynasties overlap, the one that
 * began earlier comes first (遼 916, 宋 960, 金 1115).
 */
const ORDER: readonly (readonly string[])[] = [
  ["周"],
  ["秦"],
  ["漢", "前漢", "西漢"],
  ["後漢", "東漢"],
  ["三國"],
  ["魏", "曹魏"],
  ["蜀", "蜀漢"],
  ["吳"],
  ["晉", "西晉"],
  ["東晉"],
  ["南北朝"],
  ["劉宋"],
  ["北魏"],
  ["齊", "南齊"],
  ["梁"],
  ["陳"],
  ["北齊"],
  ["北周"],
  ["隋"],
  ["唐"],
  ["五代"],
  ["遼"],
  ["宋", "北宋"],
  ["南宋"],
  ["金"],
  ["元"],
  ["明"],
  ["淸", "清"],
  ["民國"],
];

const RANK = new Map(ORDER.flatMap((names, rank) => names.map((name) => [name, rank] as const)));

/** Position in {@link ORDER}; unknown names rank after every known one. */
export function dynastyRank(dynasty: string): number {
  return RANK.get(dynasty) ?? ORDER.length;
}

export function isKnownDynasty(dynasty: string): boolean {
  return RANK.has(dynasty);
}

/**
 * Chronological order; dynasties not in the table follow, by code point.
 * Deterministic on server and browser alike (no localeCompare).
 */
export function compareDynasty(a: string, b: string): number {
  return dynastyRank(a) - dynastyRank(b) || compareText(a, b);
}
