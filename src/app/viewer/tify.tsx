"use client";

import "tify/dist/tify.css";
import "tify";
import { useEffect } from "react";
import { pageFromTifyPages, withPageParam } from "@/lib/viewer-params";

type TifyOptions = { pages?: number[] };

/** The parts of Tify's reactive store used here (not part of its typed API). */
interface TifyStore {
  updateOptions(options: TifyOptions): unknown;
}

/**
 * Keep `?page=` in the address bar in step with the page Tify shows.
 *
 * Every page change in Tify (buttons, keys, thumbnails, table of contents,
 * the `setPage` API) ends in the store's `updateOptions({ pages })`, so it is
 * wrapped here. `replaceState` updates the URL without adding history entries
 * or re-rendering the page.
 */
function syncPageParam(store: TifyStore) {
  const update = store.updateOptions;
  store.updateOptions = (options) => {
    const result = update(options);
    const page = pageFromTifyPages(options?.pages);
    if (page !== null) {
      const href = withPageParam(window.location.href, page);
      if (href !== window.location.href) window.history.replaceState(window.history.state, "", href);
    }
    return result;
  };
}

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

    const store: TifyStore | undefined = tify.app?.config?.globalProperties?.$store;
    if (store) syncPageParam(store);

    return () => {
      tify.destroy();
    }
  }, [manifestUrl, iiifPage]);

  // Fills the space the reader layout gives it; Tify replaces the contents on mount.
  return <div id="tify" className="h-full" />;
}
