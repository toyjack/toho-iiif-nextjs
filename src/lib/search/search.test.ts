import { describe, expect, test } from "bun:test";
import { matchRanges, normalize, normalizeWithOffsets } from "./normalize";
import { buildIndex, search, suggest, type SearchableBook } from "./search";
import { parseVariantTable } from "./variants";

const TABLE = [
  "# comment",
  "standard\tvariants\tsource\tnote",
  "清\t淸\t出典\t",
  "說\t説 䛡\t\t",
  "",
].join("\n");

describe("parseVariantTable", () => {
  test("maps every variant to the standard of its group", () => {
    const { map, errors, groups } = parseVariantTable(TABLE);
    expect(errors).toEqual([]);
    expect(groups).toBe(2);
    expect(map).toEqual({ 淸: "清", 説: "說", 䛡: "說" });
  });

  test("merges groups sharing a character and keeps the earlier representative", () => {
    const { map, warnings } = parseVariantTable("standard\tvariants\n教\t敎\n𢼂\t敎\n");
    expect(map).toEqual({ 敎: "教", "𢼂": "教" });
    expect(warnings.some((w) => w.includes("merged"))).toBe(true);
  });

  test("rejects entries that are not one code point", () => {
    const { errors } = parseVariantTable("standard\tvariants\n清\t淸水\n說\t\n");
    expect(errors).toHaveLength(2);
  });

  test("accepts a headerless two-column pair list", () => {
    expect(parseVariantTable("清\t淸\n說\t説\n").map).toEqual({ 淸: "清", 説: "說" });
  });

  test("handles supplementary-plane characters", () => {
    expect(parseVariantTable("standard\tvariants\n𠮟\t叱\n").map).toEqual({ 叱: "𠮟" });
  });
});

const variants = parseVariantTable(TABLE).map;

describe("normalize", () => {
  test("drops whitespace and variation selectors, folds variants and width", () => {
    expect(normalize("周易筮述　八卷", variants)).toBe("周易筮述八卷");
    expect(normalize("淸王弘", variants)).toBe("清王弘");
    expect(normalize("葛\u{E0100}城", variants)).toBe("葛城");
    expect(normalize("ＡＢｃ Def")).toBe("abcdef");
  });

  test("maps CJK compatibility ideographs to unified ones", () => {
    expect(normalize("豈")).toBe("豈"); // 豈 compat → 豈
  });

  test("offsets point back into the original text", () => {
    const n = normalizeWithOffsets("A　𠮟B");
    expect(n.text).toBe("a𠮟b");
    // "𠮟" is two UTF-16 units at original index 2..4
    expect(n.starts).toEqual([0, 2, 2, 4]);
    expect(n.ends).toEqual([1, 4, 4, 5]);
  });

  test("matchRanges highlights the original characters", () => {
    expect(matchRanges("淸王弘撰撰", normalize("清王", variants), variants)).toEqual([[0, 2]]);
    expect(matchRanges("周易　筮述", "易筮")).toEqual([[1, 4]]);
  });
});

const books: SearchableBook[] = [
  { id: "A029", title: "周易筮述　八卷", authors: ["淸王弘撰"], category: "經部", dynasty: "淸", publicationInfo: "乾隆刊本", collectionInfo: "", volumeTitles: ["第一册"] },
  { id: "A014", title: "周易正義　十四卷", authors: ["唐孔穎達等奉敕"], category: "經部", dynasty: "唐", publicationInfo: "舊鈔本", collectionInfo: "", volumeTitles: [] },
  { id: "B001", title: "說文解字", authors: ["漢許愼"], category: "經部", publicationInfo: "刊本", collectionInfo: "", volumeTitles: [] },
  { id: "C001", title: "史記", authors: ["漢司馬遷"], category: "史部", publicationInfo: "易州刊本", collectionInfo: "", volumeTitles: [] },
];
const index = buildIndex(books, variants);

describe("search", () => {
  test("title matches outrank other fields", () => {
    const ids = search(index, "易", variants).map((h) => h.book.id);
    expect(ids).toEqual(["A029", "A014", "C001"]);
  });

  test("all terms must match (AND)", () => {
    expect(search(index, "周易 唐", variants).map((h) => h.book.id)).toEqual(["A014"]);
  });

  test("finds old forms by modern ones and flags the variant match", () => {
    const hits = search(index, "清王弘", variants);
    expect(hits.map((h) => h.book.id)).toEqual(["A029"]);
    expect(hits[0].viaVariant).toBe(true);
    expect(search(index, "淸王弘", variants)[0].viaVariant).toBe(false);
    expect(search(index, "説文", variants).map((h) => h.book.id)).toEqual(["B001"]);
  });

  test("ignores spacing inside titles", () => {
    expect(search(index, "周易筮述八卷", variants).map((h) => h.book.id)).toEqual(["A029"]);
  });

  test("an empty query returns everything", () => {
    expect(search(index, "  ", variants)).toHaveLength(4);
  });
});

describe("suggest", () => {
  test("groups titles, authors and facets with highlight ranges", () => {
    const s = suggest(index, "周易", variants);
    expect(s.filter((x) => x.type === "title").map((x) => x.value)).toEqual(["周易筮述　八卷", "周易正義　十四卷"]);
    expect(s[0].ranges).toEqual([[0, 2]]);
  });

  test("suggests distinct authors, categories and dynasties", () => {
    const s = suggest(index, "清", variants);
    expect(s.map((x) => `${x.type}:${x.value}:${x.viaVariant}`)).toEqual([
      "author:淸王弘撰:true",
      "dynasty:淸:true",
    ]);
    const cat = suggest(index, "經部", variants).find((x) => x.type === "category");
    expect(cat && cat.type !== "title" ? cat.count : 0).toBe(3);
  });
});
