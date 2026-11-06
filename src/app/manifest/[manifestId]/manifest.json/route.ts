import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";
import {
  CORS_HEADERS,
  MANIFEST_CONTENT_TYPE,
  acceptsGzip,
  cacheControl,
  manifestBody,
} from "@/lib/manifest-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ manifestId: string }> }
) {
  const { manifestId } = await params;
  const body = manifestBody(manifestId, getSiteUrl(request));

  if (body === null) {
    return NextResponse.json(
      { error: "Manifest not found" },
      { status: 404, headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } }
    );
  }

  const headers: Record<string, string> = {
    ...CORS_HEADERS,
    "Content-Type": MANIFEST_CONTENT_TYPE,
    "Cache-Control": cacheControl(Boolean(process.env.SITE_URL?.trim())),
    Vary: "Accept-Encoding",
  };

  // Next does not compress route-handler responses here, and manifests of
  // large books are MBs of repetitive JSON, so serve a memoised gzip.
  if (acceptsGzip(request.headers.get("accept-encoding"))) {
    return new NextResponse(body.gzip() as BodyInit, {
      status: 200,
      headers: { ...headers, "Content-Encoding": "gzip" },
    });
  }
  return new NextResponse(body.json, { status: 200, headers });
}

/** CORS preflight. */
export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
