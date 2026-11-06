import { describe, expect, test } from "bun:test";
import { gunzipSync } from "node:zlib";
import { acceptsGzip, cacheControl, manifestBody } from "./manifest-response";

describe("manifestBody", () => {
  test("serialises compactly and returns null for unknown IDs", () => {
    const { json } = manifestBody("A029", "https://example.test")!;
    expect(json).not.toContain("\n");
    expect(JSON.parse(json).id).toBe("https://example.test/manifest/A029/manifest.json");
    expect(manifestBody("XXXX", "https://example.test")).toBeNull();
  });

  test("memoises per base URL, including the gzip", () => {
    const a = manifestBody("A029", "https://a.test")!;
    expect(manifestBody("A029", "https://a.test")).toBe(a);
    expect(a.gzip()).toBe(a.gzip());
    expect(gunzipSync(a.gzip()).toString("utf8")).toBe(a.json);
    expect(JSON.parse(manifestBody("A029", "https://b.test")!.json).id).toStartWith("https://b.test/");
  });
});

test("acceptsGzip follows Accept-Encoding", () => {
  expect(acceptsGzip("gzip, deflate, br")).toBe(true);
  expect(acceptsGzip("br;q=1.0, gzip;q=0.8")).toBe(true);
  expect(acceptsGzip("*")).toBe(true);
  expect(acceptsGzip("gzip;q=0")).toBe(false);
  expect(acceptsGzip("br")).toBe(false);
  expect(acceptsGzip(null)).toBe(false);
});

test("only manifests with a configured SITE_URL are publicly cacheable", () => {
  expect(cacheControl(true)).toStartWith("public");
  expect(cacheControl(false)).toStartWith("private");
});
