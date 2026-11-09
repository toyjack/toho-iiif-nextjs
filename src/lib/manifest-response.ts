import { library } from "@/lib/books";
import { IIIFManifestGenerator } from "@/lib/generate-manifest";

/** IIIF Presentation 3.0 recommends this media type for manifests. */
export const MANIFEST_CONTENT_TYPE =
  'application/ld+json;profile="http://iiif.io/api/presentation/3/context.json"';

/** Manifests are public, read-only resources. */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
  "Access-Control-Max-Age": "86400",
} as const;

/**
 * Cache policy. The data only changes on deploy, so manifests can be cached,
 * but only when SITE_URL fixes the IDs: without it the IDs come from request
 * headers, and a shared cache could serve one client's forged host to others.
 */
export function cacheControl(siteUrlConfigured: boolean): string {
  return siteUrlConfigured
    ? "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    : "private, max-age=3600";
}

const MAX_CACHED = 32;
const bodies = new Map<string, string>();

/**
 * Serialised manifest for a book, or null for an unknown ID. The JSON is
 * memoised per base URL, since large books are several MB; the least
 * recently used entry is evicted.
 *
 * It is served uncompressed: Next 16 drops a route handler's
 * Content-Encoding header and does not compress these responses itself,
 * so compression is left to the reverse proxy in front of the app.
 */
export function manifestBody(bookId: string, baseUrl: string): string | null {
  const key = `${baseUrl}\n${bookId}`;
  const hit = bodies.get(key);
  if (hit !== undefined) {
    bodies.delete(key);
    bodies.set(key, hit);
    return hit;
  }
  const manifest = new IIIFManifestGenerator(library, baseUrl).getManifest(bookId);
  if (!manifest) return null;
  const json = JSON.stringify(manifest);
  bodies.set(key, json);
  if (bodies.size > MAX_CACHED) bodies.delete(bodies.keys().next().value!);
  return json;
}
