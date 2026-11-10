import type { ReactNode } from "react";

/** Page title and an optional one-line description (§3.5), beside it when there is room. One per page. */
export default function PageHeader({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-6 pb-4">
      <h1 className="font-serif text-2xl leading-[1.35] font-bold sm:text-[1.75rem]">{title}</h1>
      {description && <p className="text-[0.8125rem] leading-normal text-muted">{description}</p>}
    </div>
  );
}
