import { formatNumber } from "@/lib/ui-text";

export interface Stat {
  label: string;
  value: number;
  unit?: string;
}

/**
 * Collection figures as one row of a definition list (§4.11), replacing the
 * coloured stat cards: serif numerals in ink, label in muted text.
 */
export default function StatList({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:flex-wrap">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col-reverse">
          <dt className="text-[0.8125rem] leading-normal text-muted">{s.label}</dt>
          <dd className="font-serif text-2xl leading-tight font-bold tabular-nums">
            {formatNumber(s.value)}
            {s.unit && <span className="ml-0.5 font-sans text-sm font-normal">{s.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
