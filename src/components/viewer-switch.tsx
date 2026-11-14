"use client";

import { useId } from "react";
import { UI } from "@/lib/ui-text";
import { VIEWERS, withViewerParam, type ViewerKind } from "@/lib/viewer-params";

const VIEWER_LABELS: Record<ViewerKind, string> = {
  tify: "Tify",
  uv: "Universal Viewer",
  mirador: "Mirador",
};

/**
 * Viewer choice in the reader toolbar. Switching reloads the page with
 * `?viewer=`: each viewer keeps global state of its own, and `?page=` (kept
 * current by all of them) carries the page over.
 */
export default function ViewerSwitch({ current }: { current: ViewerKind }) {
  const id = useId();
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <label htmlFor={id} className="text-[0.8125rem] text-muted max-md:sr-only">
        {UI.viewer}
      </label>
      <select
        id={id}
        className="select select-sm w-auto border-border-strong font-normal"
        value={current}
        onChange={(event) => window.location.assign(withViewerParam(window.location.href, event.target.value as ViewerKind))}
      >
        {VIEWERS.map((viewer) => (
          <option key={viewer} value={viewer}>
            {VIEWER_LABELS[viewer]}
          </option>
        ))}
      </select>
    </span>
  );
}
