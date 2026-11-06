"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { BookSummary } from "@/lib/books";
import { buildIndex, search, suggest, type Suggestion } from "@/lib/search/search";
import type { VariantMap } from "@/lib/search/variants";
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
} as const;

const BOOK_TYPE_LABELS: Record<string, string> = {
  manuscript: "手鈔本",
  printed: "刊本",
  rubbing: "拓本",
  unknown: "未知",
};
const getBookTypeLabel = (type: string) => BOOK_TYPE_LABELS[type] || type;

export default function BooksComp({
  books,
  totalBooks,
}: {
  books: BookSummary[];
  totalBooks: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // The URL is the source of truth for filters, so they survive reload and back.
  const q = searchParams.get(PARAM.q) ?? "";
  const category = searchParams.get(PARAM.category) ?? "";
  const dynasty = searchParams.get(PARAM.dynasty) ?? "";
  const bookType = searchParams.get(PARAM.bookType) ?? "";
  const onlyAvailable = searchParams.get(PARAM.available) === "1";
  const sortParam = searchParams.get(PARAM.sort) as SortOption | null;
  const sortOrder = searchParams.get(PARAM.order) === "desc" ? "desc" : "asc";

  // The input keeps its own state so IME composition is never interrupted;
  // it follows the URL when that changes from outside (back/forward).
  const [input, setInput] = useState(q);
  useEffect(() => setInput(q), [q]);

  const updateParams = (changes: Partial<Record<keyof typeof PARAM, string | null>>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      const name = PARAM[key as keyof typeof PARAM];
      if (value) params.set(name, value);
      else params.delete(name);
    }
    const qs = params.toString();
    // replaceState keeps typing out of the history and is synced with useSearchParams.
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  // Variant table is loaded after first paint; search works without it meanwhile.
  const [variants, setVariants] = useState<VariantMap>({});
  useEffect(() => {
    import("@/generated/variants.json").then((m) => setVariants(m.default as VariantMap));
  }, []);

  const index = useMemo(() => buildIndex(books, variants), [books, variants]);

  const filterOptions = useMemo(() => {
    const unique = (values: Array<string | undefined>) =>
      [...new Set(values.filter((v): v is string => Boolean(v)))];
    return {
      categories: unique(books.map((b) => b.category)), // keep data order (經史子集…)
      dynasties: unique(books.map((b) => b.dynasty)).sort(),
      bookTypes: unique(books.map((b) => b.bookType)).sort(),
    };
  }, [books]);

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
    const key = (b: BookSummary) =>
      sortBy === "category" ? b.category : sortBy === "dynasty" ? b.dynasty ?? "" : b.title;
    return [...hits].sort((a, b) => {
      const c = key(a.book).localeCompare(key(b.book));
      return sortOrder === "asc" ? c : -c;
    });
  }, [index, query, variants, category, dynasty, bookType, onlyAvailable, sortBy, sortOrder]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">漢籍一覧</h1>
        <p className="text-base-content/70">
          {totalBooks} 部漢籍が公開されています
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 侧边栏筛选器 */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="card bg-base-100 shadow-sm border border-base-200 lg:sticky lg:top-4">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title text-lg">フィルタリング</h2>
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost btn-sm text-error"
                >
                  クリア
                </button>
              </div>

              {/* 搜索框 */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">検索</span>
                </label>
                <SearchBox
                  value={input}
                  onChange={(value) => {
                    setInput(value);
                    updateParams({ q: value.trim() || null });
                  }}
                  suggestions={suggestions}
                  onSelect={onSelect}
                  placeholder="書名、著者、版本など..."
                />
                <p className="mt-1 text-xs text-base-content/50">
                  異体字も検索されます。複数語はスペースで区切ります。
                </p>
              </div>

              {/* 仅显示可浏览 */}
              <div className="form-control mb-4">
                <label className="label cursor-pointer">
                  <span className="label-text font-medium">現在閲覧可能</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={onlyAvailable}
                    onChange={(e) => updateParams({ available: e.target.checked ? "1" : null })}
                  />
                </label>
              </div>

              {/* 分类筛选 */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">分類</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={category}
                  onChange={(e) => updateParams({ category: e.target.value || null })}
                >
                  <option value="">全部分類</option>
                  {filterOptions.categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 朝代筛选 */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">朝代</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={dynasty}
                  onChange={(e) => updateParams({ dynasty: e.target.value || null })}
                >
                  <option value="">全部朝代</option>
                  {filterOptions.dynasties.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* 版本类型筛选 */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">版本類型</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={bookType}
                  onChange={(e) => updateParams({ bookType: e.target.value || null })}
                >
                  <option value="">全部類型</option>
                  {filterOptions.bookTypes.map((type) => (
                    <option key={type} value={type}>
                      {getBookTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1">
          {/* 工具栏 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <span>合計： {results.length} 項目</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="form-control">
                <select
                  className="select select-bordered select-sm"
                  value={sortBy}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                >
                  {query && <option value="relevance">関連度順</option>}
                  <option value="title">書名順</option>
                  <option value="category">分類順</option>
                  <option value="dynasty">朝代順</option>
                </select>
              </div>

              <button
                className="btn btn-ghost btn-sm"
                aria-label={sortOrder === "asc" ? "降順にする" : "昇順にする"}
                onClick={() => updateParams({ order: sortOrder === "asc" ? "desc" : null })}
              >
                {sortOrder === "asc" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {results.length === 0 && (
            <div className="py-16 text-center text-base-content/60">
              条件に一致する漢籍はありません。
            </div>
          )}

          {/* 书籍网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {results.map(({ book, viaVariant }) => {
              const isAvailable = book.available;
              const nuNumber = book.nuNumber;
              return (
                <div
                  key={book.id}
                  className={`card bg-base-100 shadow-sm border transition-all duration-300 group ${
                    isAvailable
                      ? "border-base-200 hover:shadow-lg hover:border-primary/30"
                      : "border-base-300 opacity-75"
                  }`}
                >
                  <div className="card-body p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3
                        className={`card-title text-lg line-clamp-2 ${
                          isAvailable
                            ? "group-hover:text-primary transition-colors"
                            : "text-base-content/70"
                        }`}
                      >
                        {book.title}
                      </h3>
                      {isAvailable && (
                        <div className="badge badge-success badge-sm">
                          閲覧可能
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-primary badge-sm">
                          {book.category}
                        </span>
                        {book.dynasty && (
                          <span className="badge badge-secondary badge-sm">
                            {book.dynasty}
                          </span>
                        )}
                        <span className="badge badge-outline badge-sm">
                          {getBookTypeLabel(book.bookType)}
                        </span>
                        {query && viaVariant && (
                          <span className="badge badge-ghost badge-sm">異体字で一致</span>
                        )}
                      </div>

                      {book.authors && book.authors.length > 0 && (
                        <p className="text-base-content/70">
                          作者：{book.authors.join(", ")}
                        </p>
                      )}

                      {book.volumes && (
                        <p className="text-base-content/60">
                          卷數：{book.volumes}
                        </p>
                      )}

                      <p className="text-base-content/60 text-xs line-clamp-2">
                        {book.publicationInfo}
                      </p>
                    </div>

                    <div className="card-actions justify-between items-center mt-4">
                      <div className="flex gap-1">
                        {book.hasSeals && (
                          <div className="badge badge-outline badge-xs">
                            有印
                          </div>
                        )}
                        {book.hasNotes && (
                          <div className="badge badge-outline badge-xs">
                            有註
                          </div>
                        )}
                        {book.isIncomplete && (
                          <div className="badge badge-warning badge-xs">殘</div>
                        )}
                      </div>

                      {nuNumber && (
                        <Link
                          href={`http://kanji.zinbun.kyoto-u.ac.jp/kanseki?record=data/FA019705/tagged/${nuNumber}.dat&back=1`}
                          className="btn btn-ghost btn-info btn-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          全国漢籍DB
                        </Link>
                      )}

                      {isAvailable ? (
                        <Link
                          href={`/viewer?book=${book.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          閱覽
                        </Link>
                      ) : (
                        <button className="btn btn-disabled btn-sm">
                          準備中
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
