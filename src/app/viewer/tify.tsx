"use client";

import "tify/dist/tify.css";
import "tify";
import { useEffect } from "react";

export default function TifyViewer({ manifestUrl, iiifPage }: { manifestUrl: string, iiifPage: number }) {
  useEffect(() => {
    // @ts-expect-error Tify is not typed
    const Tify = window.Tify;
    const tify = new Tify({
      container: "#tify",
      language: "ja",
      translationsDirUrl: '/i18n/tify',
      manifestUrl,
      pages:[iiifPage],
    });

    return () => {
      tify.destroy();
    }
  }, [manifestUrl, iiifPage]);

  // Fills the space the reader layout gives it; Tify replaces the contents on mount.
  return <div id="tify" className="h-full" />;
}
