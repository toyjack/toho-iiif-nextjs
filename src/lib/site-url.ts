/**
 * Public origin of this site, used in IIIF resource IDs.
 *
 * Read at request time on the server (not a NEXT_PUBLIC_ variable, so it is
 * not frozen into the build):
 * 1. `SITE_URL` (e.g. "https://example.org" or a bare host), when set.
 *    Set this in production.
 * 2. Otherwise the request's `X-Forwarded-Host`/`Host` and
 *    `X-Forwarded-Proto` headers. These are client-controlled, so do not rely
 *    on this fallback once responses are cached by a shared cache.
 *    (`request.url` is not used: the standalone server fills it from its own
 *    bind address, not from the Host header.)
 */
export function getSiteUrl(request: Request): string {
  const configured = process.env.SITE_URL?.trim();
  if (configured) {
    // Accept a bare host ("example.org") as https.
    const withScheme = /^https?:\/\//i.test(configured)
      ? configured
      : `https://${configured}`;
    return new URL(withScheme).origin;
  }

  const fallback = new URL(request.url);
  const host =
    firstValue(request.headers.get("x-forwarded-host")) ??
    firstValue(request.headers.get("host")) ??
    fallback.host;
  const proto =
    firstValue(request.headers.get("x-forwarded-proto")) ??
    fallback.protocol.replace(/:$/, "");
  const scheme = proto === "https" || proto === "http" ? proto : "https";

  try {
    return new URL(`${scheme}://${host}`).origin;
  } catch {
    return fallback.origin;
  }
}

/** First entry of a comma-separated header value, or null. */
function firstValue(value: string | null): string | null {
  const first = value?.split(",")[0]?.trim();
  return first ? first : null;
}
