"use client";

import dynamic from "next/dynamic";
import { UI } from "@/lib/ui-text";
import type { ViewerKind } from "@/lib/viewer-params";

function Loading() {
  return (
    <div role="status" className="flex h-full items-center justify-center text-sm text-muted">
      {UI.loadingImages}
    </div>
  );
}

// Each viewer touches window on import and is only loaded in the browser,
// and only when chosen.
const VIEWER_COMPONENTS = {
  tify: dynamic(() => import("./tify"), { ssr: false, loading: Loading }),
  uv: dynamic(() => import("./uv"), { ssr: false, loading: Loading }),
  mirador: dynamic(() => import("./mirador"), { ssr: false, loading: Loading }),
};

function ViewerComp({ viewer, manifestUrl, iiifPage }: { viewer: ViewerKind; manifestUrl: string; iiifPage: number }) {
  const Viewer = VIEWER_COMPONENTS[viewer];
  return <Viewer iiifPage={iiifPage} manifestUrl={manifestUrl} />;
}

export default ViewerComp;
