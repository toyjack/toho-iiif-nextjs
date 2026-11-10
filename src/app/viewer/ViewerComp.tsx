"use client";

import dynamic from "next/dynamic";
import { UI } from "@/lib/ui-text";

function Loading() {
  return (
    <div role="status" className="flex h-full items-center justify-center text-sm text-muted">
      {UI.loadingImages}
    </div>
  );
}

// Tify touches window on import, so it is only ever loaded in the browser.
const TifyViewer = dynamic(() => import("./tify"), { ssr: false, loading: Loading });

function ViewerComp({ manifestUrl, iiifPage }: { manifestUrl: string; iiifPage: number }) {
  return <TifyViewer iiifPage={iiifPage} manifestUrl={manifestUrl} />;
}

export default ViewerComp;
