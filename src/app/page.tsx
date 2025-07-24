import { AvailableBook } from "@/constants/AvailableBook";
import { tohoData } from "@/constants/TohoData";
import Link from "next/link";

export default function Home() {
  // 古書統計情報を取得
  const totalBooks = tohoData.metadata.totalBooks;
  const totalVolumes = tohoData.metadata.totalVolumes;
  const categories = tohoData.metadata.categories;
  const availableImagesCount = tohoData.books.map((book) => {
    return book.structure?.map((volume) => {
      return Number(volume.maxPage);
    }).reduce((acc, cur) => acc + cur, 0) || 0;
  }).reduce((acc, cur) => acc + (cur || 0), 0);

  // ランダムな6部書籍を取得
  const randomBooks = tohoData.books
    .filter((book) => AvailableBook.includes(book.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  return (
    <>
      {/* ヒーローブロック */}
      <div className="hero min-h-96 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              東方学IIIF図書館
            </h1>
            <p className="text-lg mb-8 text-base-content/80 leading-relaxed">
              <Link href="https://www.zinbun.kyoto-u.ac.jp/" target="_blank" rel="noopener noreferrer" className="link link-primary">
                京都大学人文科学研究所
              </Link>
              が提供する、東アジア古典籍のデジタル図書館です。
              {/* <br className="hidden sm:block" /> */}
              
            </p>

            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-200">
                <div className="stat-figure text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="w-8 h-8 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="stat-title">総蔵書</div>
                <div className="stat-value text-primary">{new Intl.NumberFormat().format(totalBooks)}</div>
                <div className="stat-desc">漢籍</div>
              </div>

              <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-200">
                <div className="stat-figure text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="w-8 h-8 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="stat-title">総巻数</div>
                <div className="stat-value text-secondary">{new Intl.NumberFormat().format(totalVolumes)}</div>
                <div className="stat-desc">巻</div>
              </div>

              <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-200">
                <div className="stat-figure text-accent">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="w-8 h-8 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <div className="stat-title">公開画像数</div>
                <div className="stat-value text-accent">{new Intl.NumberFormat().format(availableImagesCount)}</div>
                <div className="stat-desc">枚</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/books" className="btn btn-primary btn-lg">
                漢籍一覧
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              {/* <button className="btn btn-outline btn-lg">詳しく見る</button> */}
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">漢籍分類</h2>
            <p className="text-base-content/70">
              伝統的な四部分類により、古代典籍を系統的に整理
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.slice(0, 5).map((category, index) => {
              const bookCount = tohoData.books.filter(
                (book) => book.category === category
              ).length;
              const icons = [
                "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
                "M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 110 2h-1v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6H4a1 1 0 010-2h3zM9 3v1h6V3H9z",
                "M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z",
              ];

              return (
                <Link
                  key={category}
                  href={`/books?category=${category}`}
                  className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="card-body items-center text-center p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={icons[index] || icons[0]}
                        />
                      </svg>
                    </div>
                    <h3 className="card-title text-lg">{category}</h3>
                    <p className="text-sm text-base-content/70">
                      {bookCount} 部
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="py-16 px-4 bg-base-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">文庫分類</h2>
            <p className="text-base-content/70">各種文庫</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.slice(5, 10).map((category, index) => {
              const bookCount = tohoData.books.filter(
                (book) => book.category === category
              ).length;
              const icons = [
                "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
                "M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 110 2h-1v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6H4a1 1 0 010-2h3zM9 3v1h6V3H9z",
                "M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z",
              ];

              return (
                <Link
                  key={category}
                  href={`/books?category=${category}`}
                  className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="card-body items-center text-center p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d={icons[index] || icons[0]}
                        />
                      </svg>
                    </div>
                    <h3 className="card-title text-lg">{category}</h3>
                    <p className="text-sm text-base-content/70">
                      {bookCount} 部
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 古書分類 */}

      {/* 厳選古書 */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">おすすめの漢籍</h2>
            <p className="text-base-content/70">
              ランダムな6部の漢籍をご紹介します
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {randomBooks.map((book) => (
              <div
                key={book.id}
                className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="card-body">
                  <h3 className="card-title text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-primary badge-sm">
                        {book.category}
                      </span>
                      {book.dynasty && (
                        <span className="badge badge-secondary badge-sm">
                          {book.dynasty}
                        </span>
                      )}
                    </div>
                    {book.authors && book.authors.length > 0 && (
                      <p className="text-base-content/70">
                        著者：{book.authors.join(", ")}
                      </p>
                    )}
                    <p className="text-base-content/60 text-xs line-clamp-2">
                      {book.publicationInfo}
                    </p>
                  </div>
                  <div className="card-actions justify-between items-center mt-4">
                    <div className="flex gap-1">
                      {book.bookType === "manuscript" && (
                        <div className="badge badge-outline badge-xs">
                          手写本
                        </div>
                      )}
                      {book.bookType === "printed" && (
                        <div className="badge badge-outline badge-xs">刊本</div>
                      )}
                      {book.hasSeals && (
                        <div className="badge badge-outline badge-xs">印有</div>
                      )}
                      {book.hasNotes && (
                        <div className="badge badge-outline badge-xs">注有</div>
                      )}
                    </div>
                    <Link
                      href={`/viewer?book=${book.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      閲覧
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/viewer" className="btn btn-outline btn-lg">
              もっと漢籍を見る
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* プラットフォームの特色 */}
      <div className="py-16 px-4 bg-base-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">プラットフォームの特色</h2>
            <p className="text-base-content/70">
              IIIF技術を活用し、高品質な古書閲覧体験を提供
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">スマート検索</h3>
              <p className="text-base-content/70">
                書名、著者、時代など多次元検索をサポート、目標とする古書を素早く発見
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">高画質閲覧</h3>
              <p className="text-base-content/70">
                IIIF標準を採用し、高解像度画像とスムーズな読書体験を提供
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">学術研究</h3>
              <p className="text-base-content/70">
                詳細な書誌情報と版本記述で、学術研究と文献考証をサポート
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
