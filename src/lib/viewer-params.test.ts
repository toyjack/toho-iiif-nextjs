import { describe, expect, test } from "bun:test";
import {
  firstParam,
  pageFromCanvasId,
  pageFromCanvasIndex,
  pageFromTifyPages,
  parsePage,
  parseViewer,
  withPageParam,
  withViewerParam,
} from "./viewer-params";

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

describe("parseViewer", () => {
  test("known viewers are kept", () => {
    expect(parseViewer("uv")).toBe("uv");
    expect(parseViewer("mirador")).toBe("mirador");
    expect(parseViewer("tify")).toBe("tify");
  });

  test("missing or unknown values fall back to Tify", () => {
    for (const value of [undefined, "", "foo", "Mirador"]) {
      expect(parseViewer(value)).toBe("tify");
    }
  });
});

describe("withViewerParam", () => {
  const base = "https://example.test/viewer?book=D005&page=37#x";

  test("sets the viewer and keeps the page and the hash", () => {
    expect(withViewerParam(base, "mirador")).toBe("https://example.test/viewer?book=D005&page=37&viewer=mirador#x");
  });

  test("Tify removes the parameter", () => {
    expect(withViewerParam(`${base.replace("#x", "")}&viewer=uv`, "tify")).toBe(
      "https://example.test/viewer?book=D005&page=37"
    );
  });
});

describe("pageFromCanvasIndex", () => {
  test("0-based index becomes a 1-based page", () => {
    expect(pageFromCanvasIndex(0)).toBe(1);
    expect(pageFromCanvasIndex(36)).toBe(37);
  });

  test("invalid indexes give null", () => {
    for (const value of [-1, 1.5, Number.NaN, "3", undefined]) {
      expect(pageFromCanvasIndex(value)).toBeNull();
    }
  });
});

describe("pageFromCanvasId", () => {
  const ids = ["https://x/canvas/D101/D101Ap1", "https://x/canvas/D101/D101Ap2", "https://x/canvas/D101/D101B/p1"];

  test("position in the canvas list is the page", () => {
    expect(pageFromCanvasId(ids, ids[0])).toBe(1);
    expect(pageFromCanvasId(ids, ids[2])).toBe(3);
  });

  test("unknown or missing canvas gives null", () => {
    expect(pageFromCanvasId(ids, "https://x/canvas/other")).toBeNull();
    expect(pageFromCanvasId(ids, undefined)).toBeNull();
  });
});
