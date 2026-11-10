// Used inside the client component books.tsx, so it needs no "use client" of its own.
import type { MouseEvent } from "react";
import { pageItems } from "@/lib/pagination";
import { UI } from "@/lib/ui-text";
import Icon from "./icon";

/**
 * Link-based pagination (§4.4). Every page is a real link (`hrefFor`), so it
 * can be opened in a new tab; a plain click is handed to `onNavigate`.
 */
export default function Pagination({
  page,
  totalPages,
  hrefFor,
  onNavigate,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  onNavigate: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const go = (target: number) => (e: MouseEvent<HTMLAnchorElement>) => {
    // let the browser handle new-tab / new-window clicks
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigate(target);
  };

  const step = (target: number, label: string, icon: "chevronLeft" | "chevronRight") => {
    const disabled = target < 1 || target > totalPages;
    const content = (
      <>
        {icon === "chevronLeft" && <Icon name={icon} />}
        <span className="max-sm:sr-only">{label}</span>
        {icon === "chevronRight" && <Icon name={icon} />}
      </>
    );
    return disabled ? (
      <span className="btn btn-sm join-item btn-disabled" aria-disabled="true">
        {content}
      </span>
    ) : (
      <a href={hrefFor(target)} onClick={go(target)} className="btn btn-sm join-item btn-outline border-border-strong" rel={label === UI.prev ? "prev" : "next"}>
        {content}
      </a>
    );
  };

  return (
    <nav aria-label={UI.pagination} className="flex justify-center">
      <div className="join">
        {step(page - 1, UI.prev, "chevronLeft")}
        {pageItems(page, totalPages).map((item, i) =>
          item === "gap" ? (
            <span key={`gap-${i}`} className="btn btn-sm join-item btn-disabled tabular-nums" aria-hidden="true">
              …
            </span>
          ) : item === page ? (
            <a
              key={item}
              href={hrefFor(item)}
              aria-current="page"
              onClick={go(item)}
              className="btn btn-sm join-item btn-neutral tabular-nums"
            >
              {item}
            </a>
          ) : (
            <a
              key={item}
              href={hrefFor(item)}
              onClick={go(item)}
              className="btn btn-sm join-item btn-outline border-border-strong tabular-nums"
              aria-label={`${item} ページ`}
            >
              {item}
            </a>
          )
        )}
        {step(page + 1, UI.next, "chevronRight")}
      </div>
    </nav>
  );
}
