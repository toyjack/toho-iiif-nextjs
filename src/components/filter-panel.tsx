// Used inside the client component books.tsx, so it needs no "use client" of its own.
import { bookTypeLabel } from "@/lib/book-type";
import { UI } from "@/lib/ui-text";
import Field from "./field";

export interface FilterValues {
  category: string;
  dynasty: string;
  bookType: string;
  onlyAvailable: boolean;
}

export interface FilterOptions {
  categories: string[];
  dynasties: string[];
  bookTypes: string[];
}

export type FilterChange = Partial<{
  category: string | null;
  dynasty: string | null;
  bookType: string | null;
  available: string | null;
}>;

/**
 * The filter controls of /books (§4.2). Rendered twice — in the sidebar
 * (≥ lg) and in the dialog (< lg) — so every id is prefixed.
 */
export default function FilterPanel({
  idPrefix,
  values,
  options,
  onChange,
}: {
  idPrefix: string;
  values: FilterValues;
  options: FilterOptions;
  onChange: (changes: FilterChange) => void;
}) {
  const id = (name: string) => `${idPrefix}-${name}`;
  const select = (
    name: "category" | "dynasty" | "bookType",
    label: string,
    items: string[],
    display: (v: string) => string = (v) => v
  ) => (
    <Field label={label} htmlFor={id(name)}>
      <select
        id={id(name)}
        className="select select-sm w-full"
        value={values[name]}
        onChange={(e) => onChange({ [name]: e.target.value || null })}
      >
        <option value="">{UI.all}</option>
        {items.map((v) => (
          <option key={v} value={v}>
            {display(v)}
          </option>
        ))}
      </select>
    </Field>
  );

  return (
    <div className="flex flex-col gap-5">
      <label className="flex min-h-8 cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={values.onlyAvailable}
          onChange={(e) => onChange({ available: e.target.checked ? "1" : null })}
        />
        {UI.onlyAvailable}
      </label>
      {select("category", UI.category, options.categories)}
      {select("dynasty", UI.dynasty, options.dynasties)}
      {select("bookType", UI.bookType, options.bookTypes, (v) =>
        v === "unknown" ? UI.unknownBookType : bookTypeLabel(v)
      )}
    </div>
  );
}
