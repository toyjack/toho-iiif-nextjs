import { expect, test } from "bun:test";
import { pageItems, paginate, parsePage } from "./pagination";

test("parsePage accepts positive integers only", () => {
  expect(parsePage(null)).toBe(1);
  expect(parsePage("")).toBe(1);
  expect(parsePage("3")).toBe(3);
  expect(parsePage("0")).toBe(1);
  expect(parsePage("-2")).toBe(1);
  expect(parsePage("2.5")).toBe(1);
  expect(parsePage("abc")).toBe(1);
});

test("paginate slices and clamps", () => {
  expect(paginate(335, 1)).toEqual({ page: 1, totalPages: 7, start: 0, end: 50 });
  expect(paginate(335, 7)).toEqual({ page: 7, totalPages: 7, start: 300, end: 335 });
  expect(paginate(335, 99)).toEqual({ page: 7, totalPages: 7, start: 300, end: 335 });
  expect(paginate(0, 3)).toEqual({ page: 1, totalPages: 1, start: 0, end: 0 });
  expect(paginate(12, 1)).toEqual({ page: 1, totalPages: 1, start: 0, end: 12 });
});

test("pageItems keeps ends and neighbours, filling one-page gaps", () => {
  expect(pageItems(1, 1)).toEqual([1]);
  expect(pageItems(1, 7)).toEqual([1, 2, "gap", 7]);
  expect(pageItems(3, 7)).toEqual([1, 2, 3, 4, "gap", 7]);
  expect(pageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  expect(pageItems(7, 7)).toEqual([1, "gap", 6, 7]);
  expect(pageItems(5, 10)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
});

test("count and range labels", async () => {
  const { countLabel, formatNumber, rangeLabel } = await import("./ui-text");
  expect(formatNumber(111247)).toBe("111,247");
  expect(formatNumber(335)).toBe("335");
  expect(countLabel(12)).toBe("12 件");
  expect(rangeLabel(335, 0, 50)).toBe("335 件中 1–50 件");
  expect(rangeLabel(0, 0, 0)).toBe("0 件");
});
