// Used inside the client component books.tsx, so it needs no "use client" of its own.
import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import type { SearchableBook, Suggestion } from "@/lib/search/search";

const GROUP_LABELS: Record<Suggestion["type"], string> = {
  title: "書名",
  author: "著者",
  category: "分類",
  dynasty: "朝代",
};

function highlight(text: string, ranges: Array<[number, number]>): ReactNode {
  if (ranges.length === 0) return text;
  const parts: ReactNode[] = [];
  let last = 0;
  ranges.forEach(([start, end], i) => {
    if (start > last) parts.push(text.slice(last, start));
    parts.push(
      <mark key={i} className="bg-primary/25 text-inherit rounded-sm">
        {text.slice(start, end)}
      </mark>
    );
    last = end;
  });
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function SearchBox<T extends SearchableBook & { available?: boolean }>({
  value,
  onChange,
  suggestions,
  onSelect,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  suggestions: Suggestion<T>[];
  onSelect: (suggestion: Suggestion<T>) => void;
  placeholder?: string;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const show = open && value.trim() !== "" && suggestions.length > 0;

  const choose = (s: Suggestion<T>) => {
    setOpen(false);
    setActive(-1);
    onSelect(s);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // IME conversion in progress
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (suggestions.length ? (i + 1) % suggestions.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (suggestions.length ? (i <= 0 ? suggestions.length - 1 : i - 1) : -1));
    } else if (e.key === "Enter") {
      if (show && active >= 0) {
        e.preventDefault();
        choose(suggestions[active]);
      } else {
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  let lastType: Suggestion["type"] | null = null;

  return (
    <div className="relative">
      <input
        type="search"
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={show && active >= 0 ? `${listId}-${active}` : undefined}
        placeholder={placeholder}
        className="input input-bordered input-sm w-full"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {show && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1 max-h-96 overflow-y-auto rounded-box border border-base-200 bg-base-100 p-1 shadow-lg"
        >
          {suggestions.map((s, i) => {
            const header = s.type !== lastType ? GROUP_LABELS[s.type] : null;
            lastType = s.type;
            return (
              <li key={`${s.type}:${s.type === "title" ? s.book.id : s.value}`} role="presentation">
                {header && (
                  <div className="px-2 pt-2 pb-1 text-xs font-semibold text-base-content/50">{header}</div>
                )}
                <div
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm ${
                    i === active ? "bg-base-200" : "hover:bg-base-200"
                  }`}
                  // mousedown (not click) so the input's blur doesn't close the list first
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(s);
                  }}
                  onMouseEnter={() => setActive(i)}
                >
                  <span className="min-w-0 flex-1 truncate">{highlight(s.value, s.ranges)}</span>
                  {/* several books share a title, so show the ID too */}
                  {s.type === "title" && (
                    <span className="shrink-0 font-mono text-xs text-base-content/50">{s.book.id}</span>
                  )}
                  {s.viaVariant && <span className="badge badge-ghost badge-xs shrink-0">異体字で一致</span>}
                  {s.viaPinyin && <span className="badge badge-ghost badge-xs shrink-0">拼音で一致</span>}
                  {s.type === "title" && s.book.available && (
                    <span className="badge badge-success badge-xs shrink-0">閲覧可能</span>
                  )}
                  {s.type !== "title" && (
                    <span className="shrink-0 text-xs text-base-content/50">{s.count}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
