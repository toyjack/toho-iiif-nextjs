"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { recallListUrl } from "@/lib/last-list";
import { UI } from "@/lib/ui-text";
import Icon from "./icon";

const noSubscription = () => () => {};

/**
 * 「← 漢籍一覧」: always a real link to /books (replaces the old router.back()
 * button, which left the site when the reader was opened directly). After
 * mount it points at the list the visitor came from, filters included.
 */
export default function BackToList() {
  // Server render and hydration use /books; the browser then switches to the
  // remembered list. Nothing to subscribe to: the value only changes on /books.
  const href = useSyncExternalStore(
    noSubscription,
    () => recallListUrl() ?? "/books",
    () => "/books"
  );

  return (
    <Link href={href} className="btn btn-ghost btn-sm shrink-0 gap-1 px-2 font-normal">
      <Icon name="back" />
      <span className="max-sm:sr-only">{UI.backToList}</span>
    </Link>
  );
}
