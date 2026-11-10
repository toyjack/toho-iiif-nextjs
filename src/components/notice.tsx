import type { ReactNode } from "react";

/**
 * Empty, error and information states (§4.10): a heading, one muted
 * sentence and at most two actions. No large icon, no coloured fill.
 */
export default function Notice({
  title,
  children,
  actions,
  headingLevel = 2,
}: {
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  headingLevel?: 1 | 2 | 3;
}) {
  const Heading = (["h1", "h2", "h3"] as const)[headingLevel - 1];
  return (
    <div className="flex flex-col items-start gap-3 rounded-box border border-base-300 bg-base-100 p-6">
      <Heading className="font-serif text-xl leading-[1.4] font-bold">{title}</Heading>
      {children && <div className="text-sm leading-normal text-muted">{children}</div>}
      {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
    </div>
  );
}
