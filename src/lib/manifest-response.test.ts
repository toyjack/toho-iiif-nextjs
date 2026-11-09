import { describe, expect, test } from "bun:test";
import { cacheControl, manifestBody } from "./manifest-response";

describe("manifestBody", () => {
  test("serialises compactly and returns null for unknown IDs", () => {
    const json = manifestBody("A029", "https://example.test")!;
    expect(json).not.toContain("\n");
    expect(JSON.parse(json).id).toBe("https://example.test/manifest/A029/manifest.json");
    expect(manifestBody("XXXX", "https://example.test")).toBeNull();
  });

  test("memoises per base URL", () => {
    const a = manifestBody("A029", "https://a.test")!;
    expect(manifestBody("A029", "https://a.test")).toBe(a);
    expect(JSON.parse(manifestBody("A029", "https://b.test")!).id).toStartWith("https://b.test/");
  });
});

test("only manifests with a configured SITE_URL are publicly cacheable", () => {
  expect(cacheControl(true)).toStartWith("public");
  expect(cacheControl(false)).toStartWith("private");
});
