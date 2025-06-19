"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LibraryData } from "@/types";

type SortOption = "title" | "category" | "dynasty" | "bookType";
type FilterState = {
  search: string;
  category: string;
  dynasty: string;
  bookType: string;
  hasSeals: boolean | null;
  hasNotes: boolean | null;
  isIncomplete: boolean | null;
  onlyAvailable: boolean;
};

const ITEMS_PER_PAGE = 12;

export default function BooksComp({tohoData, AvailableBook}: {tohoData: LibraryData, AvailableBook: string[]}) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: category,
    dynasty: "",
    bookType: "",
    hasSeals: null,
    hasNotes: null,
    isIncomplete: null,
    onlyAvailable: false,
  });

  // 获取所有独特的过滤选项
  const filterOptions = useMemo(() => {
    const categories = [
      ...new Set(tohoData.books.map((book) => book.category)),
    ].sort();
    const dynasties = [
      ...new Set(tohoData.books.map((book) => book.dynasty).filter(Boolean)),
    ].sort();
    const bookTypes = [
      ...new Set(tohoData.books.map((book) => book.bookType)),
    ].sort();
    return { categories, dynasties, bookTypes };
  }, []);

  // 过滤和排序书籍
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = tohoData.books.filter((book) => {
      // 搜索过滤
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch =
          book.title.toLowerCase().includes(searchTerm) ||
          book.authors.some((author) =>
            author.toLowerCase().includes(searchTerm)
          ) ||
          book.publicationInfo.toLowerCase().includes(searchTerm) ||
          book.collectionInfo.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // 分类过滤
      if (filters.category && book.category !== filters.category) return false;

      // 朝代过滤
      if (filters.dynasty && book.dynasty !== filters.dynasty) return false;

      // 版本类型过滤
      if (filters.bookType && book.bookType !== filters.bookType) return false;

      // 印章过滤
      if (filters.hasSeals !== null && book.hasSeals !== filters.hasSeals)
        return false;

      // 注释过滤
      if (filters.hasNotes !== null && book.hasNotes !== filters.hasNotes)
        return false;

      // 完整性过滤
      if (
        filters.isIncomplete !== null &&
        book.isIncomplete !== filters.isIncomplete
      )
        return false;

      // 仅显示可浏览的书籍
      if (filters.onlyAvailable && !AvailableBook.includes(book.id))
        return false;

      return true;
    });

    // 排序
    filtered.sort((a, b) => {
      let aValue: string, bValue: string;

      switch (sortBy) {
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "category":
          aValue = a.category;
          bValue = b.category;
          break;
        case "dynasty":
          aValue = a.dynasty || "";
          bValue = b.dynasty || "";
          break;
        case "bookType":
          aValue = a.bookType;
          bValue = b.bookType;
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      const comparison = aValue.localeCompare(bValue);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [filters, sortBy, sortOrder]);

  // 分页计算
  const totalPages = Math.ceil(filteredAndSortedBooks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBooks = filteredAndSortedBooks.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // 重置页码当筛选条件改变时
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortOrder]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      dynasty: "",
      bookType: "",
      hasSeals: null,
      hasNotes: null,
      isIncomplete: null,
      onlyAvailable: false,
    });
  };

  const getBookTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      manuscript: "手鈔本",
      printed: "刊本",
      rubbing: "拓本",
      unknown: "未知",
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">漢籍一覧</h1>
        <p className="text-base-content/70">
          {tohoData.metadata.totalBooks} 部漢籍が公開されています
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 侧边栏筛选器 */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="card bg-base-100 shadow-sm border border-base-200 sticky top-4">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title text-lg">フィルタリング</h2>
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost btn-sm text-error"
                >
                  クレア
                </button>
              </div>

              {/* 搜索框 */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">検索</span>
                </label>
                <input
                  type="text"
                  placeholder="書名、作者、版本など..."
                  className="input input-bordered input-sm"
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
              </div>

              {/* 仅显示可浏览 */}
              <div className="form-control mb-4">
                <label className="label cursor-pointer">
                  <span className="label-text font-medium">現在閲覧可能</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={filters.onlyAvailable}
                    onChange={(e) =>
                      updateFilter("onlyAvailable", e.target.checked)
                    }
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
                  value={filters.category}
                  onChange={(e) => updateFilter("category", e.target.value)}
                >
                  <option value="">全部分類</option>
                  {filterOptions.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
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
                  value={filters.dynasty}
                  onChange={(e) => updateFilter("dynasty", e.target.value)}
                >
                  <option value="">全部朝代</option>
                  {filterOptions.dynasties.map((dynasty) => (
                    <option key={dynasty} value={dynasty}>
                      {dynasty}
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
                  value={filters.bookType}
                  onChange={(e) => updateFilter("bookType", e.target.value)}
                >
                  <option value="">全部類型</option>
                  {filterOptions.bookTypes.map((type) => (
                    <option key={type} value={type}>
                      {getBookTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 特征筛选 */}
              {/* <div className="space-y-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">特徵篩選</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={filters.hasSeals === true}
                      onChange={(e) =>
                        updateFilter("hasSeals", e.target.checked ? true : null)
                      }
                    />
                    <span className="label-text">有印章</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={filters.hasNotes === true}
                      onChange={(e) =>
                        updateFilter("hasNotes", e.target.checked ? true : null)
                      }
                    />
                    <span className="label-text">有註釋</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={filters.isIncomplete === false}
                      onChange={(e) =>
                        updateFilter(
                          "isIncomplete",
                          e.target.checked ? false : null
                        )
                      }
                    />
                    <span className="label-text">完整版本</span>
                  </label>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1">
          {/* 工具栏 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <span>
                表示中： {startIndex + 1}-
                {Math.min(
                  startIndex + ITEMS_PER_PAGE,
                  filteredAndSortedBooks.length
                )}{" "}
                項目，
              </span>
              <span>合計： {filteredAndSortedBooks.length} 項目</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="form-control">
                <select
                  className="select select-bordered select-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="title">書名順</option>
                  <option value="category">分類順</option>
                  <option value="dynasty">朝代順</option>
                  {/* <option value="bookType">按版本類型排序</option> */}
                </select>
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
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

          {/* 书籍网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {paginatedBooks.map((book) => {
              const isAvailable = AvailableBook.includes(book.id);
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

                      <Link
                        href={`/manifest/${book.id}/manifest.json`}
                        className="btn btn-ghost btn-info btn-sm"
                      >
                        Manifest
                      </Link>

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

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                >
                  «
                </button>

                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`join-item btn btn-sm ${
                        currentPage === pageNum ? "btn-active" : ""
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="join-item btn btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
