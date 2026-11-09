import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";
import {
  CORS_HEADERS,
  MANIFEST_CONTENT_TYPE,
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

  return new NextResponse(body, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": MANIFEST_CONTENT_TYPE,
      "Cache-Control": cacheControl(Boolean(process.env.SITE_URL?.trim())),
    },
  });
}

/** CORS preflight. */
export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
