import type { ReactNode } from "react";
import { UI } from "@/lib/ui-text";
import Icon from "./icon";

/** Link that opens in a new tab, with an icon and a screen-reader note (§4.11). */
export default function ExternalLink({
  href,
  children,
  className = "link-text",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 ${className}`}>
      {children}
      <Icon name="external" className="size-3" />
      <span className="sr-only">{UI.newTab}</span>
    </a>
  );
}
