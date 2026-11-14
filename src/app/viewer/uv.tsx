"use client";

import { useEffect, useState } from "react";
import { UI } from "@/lib/ui-text";
import { pageFromCanvasIndex, replacePageParam } from "@/lib/viewer-params";
import { loadScript, loadStylesheet } from "./vendor-assets";

/** The parts of Universal Viewer's API used here (UV ships no types for its UMD build). */
interface UVInstance {
  on(event: string, callback: (...args: unknown[]) => void, once?: boolean): void;
  dispose?(): void;
}

interface UVGlobal {
  init(elementId: string, data: object): UVInstance;
}

const UV_BASE = "/vendor/uv";

export default function UniversalViewer({ manifestUrl, iiifPage }: { manifestUrl: string; iiifPage: number }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    loadStylesheet(`${UV_BASE}/uv.css`);
    loadScript(`${UV_BASE}/umd/UV.js`).then(
      () => {
        if (cancelled) return;
        const UV = (window as unknown as { UV: UVGlobal }).UV;
        // No IIIFURLAdapter: it would keep the page in `#?cv=` as well as our `?page=`.
        const uv = UV.init("uv", {
          manifest: new URL(manifestUrl, window.location.href).href,
          canvasIndex: iiifPage - 1,
          embedded: true,
          // UV has no Japanese translation; en-GB is its default.
          locales: [{ name: "en-GB" }],
        });
        // Fired for every page change: buttons, keys, thumbnails, contents, gallery.
        uv.on("canvasIndexChange", (index) => {
          const page = pageFromCanvasIndex(index);
          if (page !== null) replacePageParam(page);
        });
        cleanup = () => {
          uv.dispose?.();
          document.getElementById("uv")?.replaceChildren();
        };
      },
      () => {
        if (!cancelled) setFailed(true);
      }
    );

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [manifestUrl, iiifPage]);

  if (failed) {
    return (
      <p role="alert" className="flex h-full items-center justify-center px-4 text-center text-sm text-muted">
        {UI.viewerLoadError}
      </p>
    );
  }

  return <div id="uv" className="uv h-full" />;
}
