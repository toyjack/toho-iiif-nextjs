import { afterEach, describe, expect, test } from "bun:test";
import { library } from "@/lib/books";
import { IIIFManifestGenerator } from "./generate-manifest";
import { getSiteUrl } from "./site-url";

const original = process.env.SITE_URL;
afterEach(() => {
  if (original === undefined) delete process.env.SITE_URL;
  else process.env.SITE_URL = original;
});

const request = new Request("http://internal:3000/manifest/A029/manifest.json");

describe("getSiteUrl", () => {
  test("falls back to the request origin", () => {
    delete process.env.SITE_URL;
    expect(getSiteUrl(request)).toBe("http://internal:3000");
  });

  test("uses Host and forwarded headers when SITE_URL is unset", () => {
    delete process.env.SITE_URL;
    const proxied = new Request(request.url, {
      headers: {
        host: "internal:3000",
        "x-forwarded-host": "toho.example.org, proxy.local",
        "x-forwarded-proto": "https",
      },
    });
    expect(getSiteUrl(proxied)).toBe("https://toho.example.org");
    const direct = new Request(request.url, { headers: { host: "localhost:3000" } });
    expect(getSiteUrl(direct)).toBe("http://localhost:3000");
  });

  test("prefers SITE_URL and normalises it to an origin", () => {
    process.env.SITE_URL = "https://toho.example.org/";
    expect(getSiteUrl(request)).toBe("https://toho.example.org");
  });

  test("accepts a bare host as https", () => {
    process.env.SITE_URL = "toho.example.org";
    expect(getSiteUrl(request)).toBe("https://toho.example.org");
  });
});

test("manifest IDs use the given base URL", () => {
  const manifest = new IIIFManifestGenerator(library, "https://toho.example.org/").getManifest("A029")!;
  expect(manifest.id).toBe("https://toho.example.org/manifest/A029/manifest.json");
  expect(manifest.items[0].id).toBe("https://toho.example.org/canvas/A029/p1");
  expect(manifest.provider[0].id).toBe("https://toho.example.org");
});
