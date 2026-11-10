import Link from "next/link";
import { formatNumber } from "@/lib/ui-text";

export interface CategoryGroup {
  title: string;
  items: Array<{ name: string; count: number }>;
}

/**
 * Category entry points laid out like a table of contents (§4.11):
 * name (serif link) …… count. Groups sit side by side from md.
 */
export default function CategoryIndex({
  groups,
  headingLevel = 3,
}: {
  groups: CategoryGroup[];
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      {groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-2">
          <Heading className="text-base font-bold">{group.title}</Heading>
          <ul className="border-t border-base-300">
            {group.items.map(({ name, count }) => (
              <li key={name} className="border-b border-base-300">
                <Link
                  href={`/books?category=${encodeURIComponent(name)}`}
                  className="group flex min-h-11 items-baseline gap-2 py-2 transition-colors duration-150 hover:bg-base-200"
                >
                  <span className="font-serif text-[1.0625rem] font-bold underline-offset-[0.2em] group-hover:underline">
                    {name}
                  </span>
                  <span aria-hidden="true" className="flex-1 translate-y-[-0.25em] border-b border-dotted border-base-300" />
                  <span className="text-sm text-muted tabular-nums">{formatNumber(count)} 部</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
