import { NextResponse } from "next/server";
import {tohoData} from "@/constants/TohoData"
import { IIIFManifestGenerator } from "@/lib/generate-manifest";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ manifestId: string }> }
) {
  const { manifestId } = await params;

  const manifestGenerator = new IIIFManifestGenerator(tohoData);

  const manifest = manifestGenerator.getManifest(manifestId);
  if (!manifest) {
    return new NextResponse(
      JSON.stringify({ error: "Manifest not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }


  return new NextResponse(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });

}
