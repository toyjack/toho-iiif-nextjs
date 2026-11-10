// Used inside the client component books.tsx, so it needs no "use client" of its own.
import { UI } from "@/lib/ui-text";
import Icon from "./icon";

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

/** Current conditions as removable tags (§4.11), then 「すべてクリア」. */
export default function ActiveFilters({
  filters,
  onRemove,
  onClearAll,
}: {
  filters: ActiveFilter[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}) {
  if (filters.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="適用中の条件">
      {filters.map((f) => (
        <li key={f.key}>
          <button
            type="button"
            className="btn btn-sm btn-outline border-border-strong font-normal"
            onClick={() => onRemove(f.key)}
            aria-label={`${f.label}「${f.value}」の条件を外す`}
          >
            <span>
              <span className="text-muted">{f.label}：</span>
              {f.value}
            </span>
            <Icon name="close" />
          </button>
        </li>
      ))}
      <li>
        <button type="button" className="btn btn-sm btn-ghost font-normal underline" onClick={onClearAll}>
          {UI.clearAll}
        </button>
      </li>
    </ul>
  );
}
