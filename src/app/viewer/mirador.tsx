"use client";

import { useEffect, useState } from "react";
import { UI } from "@/lib/ui-text";
import { pageFromCanvasId, replacePageParam } from "@/lib/viewer-params";
import { loadScript } from "./vendor-assets";

/** The parts of Mirador's state read here (its Redux store; not a typed API). */
interface MiradorState {
  windows: Record<string, { manifestId?: string; canvasId?: string }>;
  manifests: Record<string, { json?: { items?: Array<{ id: string }> } }>;
}

interface MiradorStore {
  getState(): MiradorState;
  dispatch(action: unknown): unknown;
  subscribe(listener: () => void): () => void;
}

interface MiradorGlobal {
  viewer(config: object): { store: MiradorStore; unmount(): void };
  setCanvas(windowId: string, canvasId: string): unknown;
}

const MIRADOR_SRC = "/vendor/mirador/mirador.min.js";

/**
 * Open the manifest at `startPage`, then keep `?page=` in step with the
 * window's canvas.
 *
 * Mirador has no start-index option, only a canvas ID, and canvas IDs are
 * built from the site origin on the server. So the window opens at the first
 * canvas and moves to `startPage` once Mirador has the manifest and has
 * placed the window on its first canvas.
 */
function followPages(mirador: MiradorGlobal, store: MiradorStore, startPage: number) {
  let started = startPage <= 1;
  let lastCanvas: string | undefined;

  return store.subscribe(() => {
    const state = store.getState();
    const [windowId, win] = Object.entries(state.windows)[0] ?? [];
    if (!windowId || !win?.manifestId) return;
    const ids = (state.manifests[win.manifestId]?.json?.items ?? []).map((canvas) => canvas.id);
    // Wait until Mirador has put the window on its first canvas; jumping
    // earlier would be overridden by that.
    if (ids.length === 0 || !win.canvasId) return;

    if (!started) {
      started = true;
      const target = ids[Math.min(startPage, ids.length) - 1];
      if (target && target !== win.canvasId) {
        store.dispatch(mirador.setCanvas(windowId, target));
        return;
      }
    }

    if (win.canvasId === lastCanvas) return;
    lastCanvas = win.canvasId;
    const page = pageFromCanvasId(ids, win.canvasId);
    if (page !== null) replacePageParam(page);
  });
}

export default function MiradorViewer({ manifestUrl, iiifPage }: { manifestUrl: string; iiifPage: number }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    loadScript(MIRADOR_SRC).then(
      () => {
        if (cancelled) return;
        const mirador = (window as unknown as { Mirador: MiradorGlobal }).Mirador;
        const instance = mirador.viewer({
          id: "mirador",
          language: "ja",
          windows: [{ manifestId: new URL(manifestUrl, window.location.href).href }],
          window: {
            allowClose: false,
            allowMaximize: false,
            hideWindowTitle: true,
            sideBarOpen: false,
          },
          workspace: { type: "mosaic", allowNewWindows: false },
          workspaceControlPanel: { enabled: false },
        });
        const unsubscribe = followPages(mirador, instance.store, iiifPage);
        cleanup = () => {
          unsubscribe();
          instance.unmount();
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

  // Mirador's root is absolutely positioned; the relative wrapper bounds it.
  return (
    <div className="relative h-full">
      <div id="mirador" />
    </div>
  );
}
