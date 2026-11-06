import { describe, expect, test } from "bun:test";
import { buildPinyinDict } from "../../../scripts/pinyin";
import { isPinyinQuery, normalizePinyinQuery, pinyinMatch, pinyinRange } from "./pinyin";
import { buildIndex, search, suggest, type SearchableBook } from "./search";

const variants = { 淸: "清", 説: "說" };

describe("buildPinyinDict (build time)", () => {
  const { dict, missing } = buildPinyinDict(["周易筮述　八卷", "淸王弘撰", "説文", "樂府詩集", "A1"], variants);

  test("records readings per Han character with offsets, skipping other characters", () => {
    expect(dict["周易筮述　八卷"]).toEqual({ r: ["zhou", "yi", "shi", "shu", "ba", "juan"], p: [0, 1, 2, 3, 5, 6] });
    expect(dict["A1"]).toBeUndefined();
    expect(missing).toEqual([]);
  });

  test("reads old forms through the variant table", () => {
    expect(dict["淸王弘撰"].r[0]).toBe("qing");
    expect(dict["説文"].r[0].split("|")[0]).toBe("shuo"); // 説 alone would be yue
  });

  test("keeps every reading of polyphones", () => {
    expect(dict["樂府詩集"].r[0].split("|")).toContain("yue");
  });
});

describe("pinyinMatch", () => {
  const entry = { r: ["zhou", "yi", "shi", "shu", "ba", "juan"], p: [0, 1, 2, 3, 5, 6] };

  test("full syllables, from any character, last one possibly partial", () => {
    expect(pinyinMatch(entry, "zhouyi")).toEqual([0, 1]);
    expect(pinyinMatch(entry, "zhouy")).toEqual([0, 1]);
    expect(pinyinMatch(entry, "shishu")).toEqual([2, 3]);
    expect(pinyinMatch(entry, "bajuan")).toEqual([4, 5]);
  });

  test("does not match inside a syllable", () => {
    expect(pinyinMatch(entry, "ouyi")).toBeNull();
  });

  test("initials", () => {
    expect(pinyinMatch(entry, "zyss")).toEqual([0, 3]);
    expect(pinyinMatch(entry, "bj")).toEqual([4, 5]);
    expect(pinyinMatch(entry, "zx")).toBeNull();
  });

  test("any reading of a polyphone counts", () => {
    const yuefu = { r: ["le|yue|yao|lao", "fu"], p: [0, 1] };
    expect(pinyinMatch(yuefu, "yuefu")).toEqual([0, 1]);
    expect(pinyinMatch(yuefu, "lefu")).toEqual([0, 1]);
    expect(pinyinMatch(yuefu, "yf")).toEqual([0, 1]);
  });

  test("ranges map back to the original text", () => {
    expect(pinyinRange("周易筮述　八卷", entry, [4, 5])).toEqual([5, 7]);
  });
});

test("query detection and normalisation", () => {
  expect(isPinyinQuery("zhou yi")).toBe(true);
  expect(isPinyinQuery("lü")).toBe(true);
  expect(isPinyinQuery("周易")).toBe(false);
  expect(isPinyinQuery("A029")).toBe(false);
  expect(normalizePinyinQuery("Zhou Yi")).toBe("zhouyi");
  expect(normalizePinyinQuery("lü lv lu:")).toBe("lululu");
});

describe("search with pinyin", () => {
  const books: SearchableBook[] = [
    { id: "A029", title: "周易筮述　八卷", authors: ["淸王弘撰"], category: "經部", dynasty: "淸", publicationInfo: "", collectionInfo: "", volumeTitles: [] },
    { id: "C001", title: "史記", authors: ["漢司馬遷"], category: "史部", publicationInfo: "", collectionInfo: "", volumeTitles: [] },
  ];
  const texts = books.flatMap((b) => [b.title, ...b.authors, b.category, ...(b.dynasty ? [b.dynasty] : [])]);
  const { dict } = buildPinyinDict(texts, variants);
  const index = buildIndex(books, variants, dict);

  test("finds titles by full pinyin and initials, flagged as pinyin", () => {
    for (const q of ["zhouyi", "zhou yi", "zy", "Zhou"]) {
      const hits = search(index, q, variants);
      expect(hits.map((h) => h.book.id)).toEqual(["A029"]);
      expect(hits[0].viaPinyin).toBe(true);
    }
    expect(search(index, "shiji", variants).map((h) => h.book.id)).toEqual(["C001"]);
  });

  test("suggestions highlight the matched characters", () => {
    const s = suggest(index, "wanghong", variants);
    expect(s).toHaveLength(1);
    expect(s[0]).toMatchObject({ type: "author", value: "淸王弘撰", viaPinyin: true, ranges: [[1, 3]] });
  });

  test("without a pinyin dictionary, Latin queries simply find nothing", () => {
    expect(search(buildIndex(books, variants), "zhouyi", variants)).toEqual([]);
  });
});
