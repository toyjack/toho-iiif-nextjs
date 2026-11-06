import { describe, expect, test } from "bun:test";
import { firstParam, parsePage } from "./viewer-params";

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
