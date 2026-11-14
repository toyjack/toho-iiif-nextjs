import { describe, expect, test } from "bun:test";
import { firstParam, pageFromTifyPages, parsePage, withPageParam } from "./viewer-params";

describe("parsePage", () => {
  test("missing or invalid values fall back to page 1", () => {
    for (const value of [undefined, "", "abc", "0", "-3", "NaN"]) {
      expect(parsePage(value, 10)).toBe(1);
    }
  });

  test("valid pages are kept and clamped to the page count", () => {
    expect(parsePage("7", 10)).toBe(7);
    expect(parsePage("7abc", 10)).toBe(7);
    expect(parsePage("999", 10)).toBe(10);
  });
});

test("firstParam takes the first of repeated parameters", () => {
  expect(firstParam(["A029", "B004"])).toBe("A029");
  expect(firstParam("A029")).toBe("A029");
  expect(firstParam(undefined)).toBeUndefined();
});

describe("pageFromTifyPages", () => {
  test("takes the lowest real page and skips the empty slot 0", () => {
    expect(pageFromTifyPages([38])).toBe(38);
    expect(pageFromTifyPages([3, 2])).toBe(2);
    expect(pageFromTifyPages([0, 1])).toBe(1);
  });

  test("no real page gives null", () => {
    expect(pageFromTifyPages(undefined)).toBeNull();
    expect(pageFromTifyPages([])).toBeNull();
    expect(pageFromTifyPages([0])).toBeNull();
  });
});

describe("withPageParam", () => {
  const base = "https://example.test/viewer?book=D005&page=37#x";

  test("sets the page and keeps other parameters and the hash", () => {
    expect(withPageParam(base, 38)).toBe("https://example.test/viewer?book=D005&page=38#x");
  });

  test("page 1 removes the parameter", () => {
    expect(withPageParam(base, 1)).toBe("https://example.test/viewer?book=D005#x");
  });
});
