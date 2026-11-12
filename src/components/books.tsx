"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { bookTypeLabel } from "@/lib/book-type";
import type { BookSummary } from "@/lib/books";
import { paginate, parsePage } from "@/lib/pagination";
import { buildIndex, search, suggest, type Suggestion } from "@/lib/search/search";
import { isPinyinQuery, type PinyinDict } from "@/lib/search/pinyin";
import type { VariantMap } from "@/lib/search/variants";
import { rememberListUrl } from "@/lib/last-list";
import { compareDynasty } from "@/lib/dynasty";
import { compareText } from "@/lib/text-compare";
import { UI, countLabel, formatNumber, rangeLabel } from "@/lib/ui-text";
import ActiveFilters, { type ActiveFilter } from "./active-filters";
import { BookList } from "./book-row";
import Dialog from "./dialog";
import Field from "./field";
import FilterPanel, { type FilterChange } from "./filter-panel";
import Icon from "./icon";
import Notice from "./notice";
import PageHeader from "./page-header";
import Pagination from "./pagination";
import { BookListSkeleton } from "./skeleton";
import SearchBox from "./search-box";

type SortOption = "relevance" | "title" | "category" | "dynasty";

/** Query-string keys for every piece of list state. */
const PARAM = {
  q: "q",
  category: "category",
  dynasty: "dynasty",
  bookType: "type",
  available: "available",
  sort: "sort",
  order: "order",
  page: "p",
} as const;

type ParamChanges = Partial<Record<keyof typeof PARAM, string | null>>;

const SEARCH_ID = "book-search";

/** Placeholder until the variant table arrives; compared by identity. */
const NO_VARIANTS: VariantMap = {};

export default function BooksComp({
  books,
  totalBooks,
}: {
  books: BookSummary[];
  totalBooks: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // The URL is the source of truth for filters, so they survive reload and back.
  const q = searchParams.get(PARAM.q) ?? "";
  const category = searchParams.get(PARAM.category) ?? "";
  const dynasty = searchParams.get(PARAM.dynasty) ?? "";
  const bookType = searchParams.get(PARAM.bookType) ?? "";
  const onlyAvailable = searchParams.get(PARAM.available) === "1";
  const sortParam = searchParams.get(PARAM.sort) as SortOption | null;
  const sortOrder = searchParams.get(PARAM.order) === "desc" ? "desc" : "asc";
  const requestedPage = parsePage(searchParams.get(PARAM.page));

  // Lets the reader's 「漢籍一覧」 link come back to this exact list.
  const currentQuery = searchParams.toString();
  useEffect(() => {
    rememberListUrl(currentQuery ? `${pathname}?${currentQuery}` : pathname);
  }, [pathname, currentQuery]);

  // The input keeps its own state so IME composition is never interrupted;
  // it follows the URL when that changes from outside (back/forward).
  const [input, setInput] = useState(q);
  const [syncedQ, setSyncedQ] = useState(q);
  if (q !== syncedQ) {
    setSyncedQ(q);
    setInput(q);
  }

  const queryString = (changes: ParamChanges) => {
    const params = new URLSearchParams(searchParams.toString());
    // any change to the list itself starts again from the first page
    if (!("page" in changes)) params.delete(PARAM.page);
    for (const [key, value] of Object.entries(changes)) {
      const name = PARAM[key as keyof typeof PARAM];
      if (value) params.set(name, value);
      else params.delete(name);
    }
    const qs = params.toString();
    // also used while rendering (pagination links), so no `window` here
    return qs ? `?${qs}` : pathname;
  };

  const updateParams = (changes: ParamChanges) => {
    // replaceState keeps typing out of the history and is synced with useSearchParams.
    window.history.replaceState(null, "", queryString(changes));
  };

  // Variant table is loaded after first paint; search works without it meanwhile.
  const [variants, setVariants] = useState<VariantMap>(NO_VARIANTS);
  useEffect(() => {
    import("@/generated/variants.json").then((m) => setVariants(m.default as VariantMap));
  }, []);

  // Pinyin data is only needed for Latin-letter queries, so load it on first use.
  const [pinyin, setPinyin] = useState<PinyinDict | null>(null);
  const wantsPinyin = isPinyinQuery(input);
  useEffect(() => {
    if (wantsPinyin && pinyin === null) {
      import("@/generated/pinyin.json").then((m) => setPinyin(m.default as PinyinDict));
    }
  }, [wantsPinyin, pinyin]);

  // Until the data a query may depend on has loaded, "no results" could be wrong.
  const searchDataPending = variants === NO_VARIANTS || (wantsPinyin && pinyin === null);

  const index = useMemo(() => buildIndex(books, variants, pinyin ?? {}), [books, variants, pinyin]);

  const filterOptions = useMemo(() => {
    const unique = (values: Array<string | undefined>) =>
      [...new Set(values.filter((v): v is string => Boolean(v)))];
    return {
      categories: unique(books.map((b) => b.category)), // keep data order (經史子集…)
      dynasties: unique(books.map((b) => b.dynasty)).sort(compareDynasty),
      bookTypes: unique(books.map((b) => b.bookType)).sort(),
    };
  }, [books]);

  const availableCount = useMemo(() => books.filter((b) => b.available).length, [books]);

  const query = input.trim();
  const sortBy: SortOption = sortParam ?? (query ? "relevance" : "title");

  const results = useMemo(() => {
    const hits = search(index, query, variants).filter(({ book }) => {
      if (category && book.category !== category) return false;
      if (dynasty && book.dynasty !== dynasty) return false;
      if (bookType && book.bookType !== bookType) return false;
      if (onlyAvailable && !book.available) return false;
      return true;
    });
    if (sortBy === "relevance" && query) {
      return sortOrder === "asc" ? hits : [...hits].reverse();
    }
    const sign = sortOrder === "asc" ? 1 : -1;
    // compareText, not localeCompare: the server and the browser must agree.
    if (sortBy === "dynasty") {
      // chronological; books without a dynasty go last in either order,
      // and books of one dynasty stay in title order
      return [...hits].sort(({ book: a }, { book: b }) => {
        if (!a.dynasty || !b.dynasty) return Number(!a.dynasty) - Number(!b.dynasty) || compareText(a.title, b.title);
        return sign * compareDynasty(a.dynasty, b.dynasty) || compareText(a.title, b.title);
      });
    }
    const key = (b: BookSummary) => (sortBy === "category" ? b.category : b.title);
    return [...hits].sort((a, b) => sign * compareText(key(a.book), key(b.book)));
  }, [index, query, variants, category, dynasty, bookType, onlyAvailable, sortBy, sortOrder]);

  const slice = paginate(results.length, requestedPage);
  const pageRows = results.slice(slice.start, slice.end);

  const suggestions = useMemo(() => suggest(index, query, variants), [index, query, variants]);

  const onSelect = (s: Suggestion<BookSummary>) => {
    if (s.type === "title") {
      if (s.book.available) {
        router.push(`/viewer?book=${encodeURIComponent(s.book.id)}`);
        return;
      }
      setInput(s.value);
      updateParams({ q: s.value });
    } else if (s.type === "author") {
      setInput(s.value);
      updateParams({ q: s.value });
    } else {
      setInput("");
      updateParams({ q: null, [s.type]: s.value });
    }
  };

  const clearFilters = () => {
    setInput("");
    window.history.replaceState(null, "", window.location.pathname);
  };

  // Paging is a navigation, so it gets a history entry (Back returns to the previous page).
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const goToPage = (page: number) => {
    window.history.pushState(null, "", queryString({ page: page > 1 ? String(page) : null }));
    resultsHeading.current?.scrollIntoView({ block: "start" });
    resultsHeading.current?.focus({ preventScroll: true });
  };

  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilters: ActiveFilter[] = [];
  if (category) activeFilters.push({ key: "category", label: UI.category, value: category });
  if (dynasty) activeFilters.push({ key: "dynasty", label: UI.dynasty, value: dynasty });
  if (bookType) {
    const value = bookType === "unknown" ? UI.unknownBookType : bookTypeLabel(bookType);
    activeFilters.push({ key: "bookType", label: UI.bookType, value });
  }
  if (onlyAvailable) activeFilters.push({ key: "available", label: UI.status, value: UI.onlyAvailable });
  const hasConditions = activeFilters.length > 0 || query !== "";

  const filterValues = { category, dynasty, bookType, onlyAvailable };
  const onFilterChange = (changes: FilterChange) => updateParams(changes);

  const resultLabel = rangeLabel(results.length, slice.start, slice.end);

  return (
    <div className="mx-auto w-full max-w-page px-4 pb-12 md:px-6">
      <PageHeader
        title="漢籍一覧"
        description={`収録 ${formatNumber(totalBooks)} 部（うち${UI.available} ${formatNumber(availableCount)} 部）`}
      />

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-8">
        {/* Filters: sidebar from lg; below lg they live in the dialog. */}
        <aside aria-labelledby="filters-heading" className="hidden lg:block">
          <div className="sticky top-4 flex flex-col gap-4 rounded-box bg-base-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 id="filters-heading" className="text-base font-bold">
                {UI.filter}
              </h2>
              <button
                type="button"
                className="btn btn-sm btn-ghost font-normal underline"
                onClick={clearFilters}
                disabled={!hasConditions}
              >
                {UI.clearFilters}
              </button>
            </div>
            <FilterPanel idPrefix="filters-side" values={filterValues} options={filterOptions} onChange={onFilterChange} />
          </div>
        </aside>

        <section aria-labelledby="results-heading" className="flex min-w-0 flex-col gap-3">
          <Field
            label={UI.search}
            htmlFor={SEARCH_ID}
            hideLabel
            hint="異体字・拼音（例：zhouyi、zy）でも検索できます。複数の語はスペースで区切ります。"
          >
            <SearchBox
              id={SEARCH_ID}
              describedBy={`${SEARCH_ID}-hint`}
              value={input}
              onChange={(value) => {
                setInput(value);
                updateParams({ q: value.trim() || null });
              }}
              suggestions={suggestions}
              onSelect={onSelect}
              placeholder="書名・著者・版本など"
            />
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-base-300 pb-3">
            <h2
              id="results-heading"
              ref={resultsHeading}
              tabIndex={-1}
              className="scroll-mt-4 text-sm font-bold tabular-nums"
            >
              <span className="sr-only">検索結果 </span>
              <span role="status">{resultLabel}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline border-border-strong lg:hidden"
                onClick={() => setFiltersOpen(true)}
                aria-haspopup="dialog"
              >
                <Icon name="filter" />
                {UI.filter}
                {activeFilters.length > 0 && <span className="tabular-nums">（{activeFilters.length}）</span>}
              </button>
              <label htmlFor="book-sort" className="text-xs font-bold text-muted">
                {UI.sort}
              </label>
              <select
                id="book-sort"
                className="select select-sm w-auto"
                value={sortBy}
                onChange={(e) => updateParams({ sort: e.target.value })}
              >
                {query && <option value="relevance">{UI.sortRelevance}</option>}
                <option value="title">{UI.sortTitle}</option>
                <option value="category">{UI.sortCategory}</option>
                <option value="dynasty">{UI.sortDynasty}</option>
              </select>
              <button
                type="button"
                className="btn btn-sm btn-ghost btn-square"
                aria-label={sortOrder === "asc" ? "降順にする" : "昇順にする"}
                title={sortOrder === "asc" ? `${UI.ascending}（クリックで${UI.descending}）` : `${UI.descending}（クリックで${UI.ascending}）`}
                onClick={() => updateParams({ order: sortOrder === "asc" ? "desc" : null })}
              >
                <Icon name={sortOrder === "asc" ? "sortAsc" : "sortDesc"} size={20} />
              </button>
            </div>
          </div>

          <ActiveFilters
            filters={activeFilters}
            onRemove={(key) => updateParams({ [key]: null } as ParamChanges)}
            onClearAll={clearFilters}
          />

          {results.length === 0 && query && searchDataPending ? (
            <BookListSkeleton rows={3} />
          ) : results.length === 0 ? (
            <Notice
              title="条件に一致する漢籍はありません"
              actions={
                <button type="button" className="btn btn-sm btn-outline border-border-strong" onClick={clearFilters}>
                  {UI.clearFilters}
                </button>
              }
            >
              <p>
                {[
                  query && `検索語「${query}」`,
                  ...activeFilters.map((f) => `${f.label}：${f.value}`),
                ]
                  .filter(Boolean)
                  .join("、")}
                {hasConditions && " に一致する漢籍は見つかりませんでした。"}
              </p>
              {query && (
                <p className="mt-1">
                  {wantsPinyin
                    ? "拼音は声調なしのローマ字（例：zhouyi）か、各字の頭文字（例：zy）で入力してください。"
                    : "語を減らすか、別の字体・表記でもお試しください。"}
                </p>
              )}
            </Notice>
          ) : (
            <BookList rows={pageRows} caption={`漢籍一覧（${resultLabel}）`} />
          )}

          <Pagination
            page={slice.page}
            totalPages={slice.totalPages}
            hrefFor={(p) => queryString({ page: p > 1 ? String(p) : null })}
            onNavigate={goToPage}
          />
        </section>
      </div>

      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={UI.filter}
        footer={
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="btn btn-sm btn-ghost font-normal underline"
              onClick={clearFilters}
              disabled={!hasConditions}
            >
              {UI.clearFilters}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setFiltersOpen(false)}>
              {countLabel(results.length)}を表示
            </button>
          </div>
        }
      >
        <FilterPanel idPrefix="filters-dialog" values={filterValues} options={filterOptions} onChange={onFilterChange} />
      </Dialog>
    </div>
  );
}
