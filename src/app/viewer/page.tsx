import Link from "next/link";
import ViewerComp from "./ViewerComp";

type SearchParams = Promise<{ book: string,page: string }>;

async function ViewerIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const book = (await searchParams).book;
  const page = Number((await searchParams).page || "1");
  
  if (!book) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-error mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="card-title text-error justify-center">書籍IDが見つかりません</h2>
            <p className="text-base-content/70">文書を表示するには有効な書籍IDが必要です。</p>
            <div className="card-actions justify-center mt-4">
              <Link href="/books" className="btn btn-primary">
                書籍一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const manifestUrl = `/manifest/${book}/manifest.json`;

  const Loading=() => (
    <div className="fixed inset-0 bg-base-100 flex items-center justify-center z-50">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">読み込み中...</p>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      {/* <div className="navbar bg-base-200 shadow">
        <div className="navbar-start">
          <Link href="/books" className="btn btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            コレクションに戻る
          </Link>
        </div>
        
        <div className="navbar-center">
          <h1 className="text-xl font-bold font-serif">古書ビューア</h1>
        </div>
        
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow">
              <li><a>ダウンロード</a></li>
              <li><a>印刷</a></li>
              <li><a>共有</a></li>
              <li><a>ヘルプ</a></li>
            </ul>
          </div>
        </div>
      </div> */}

      {/* Book Info Bar */}
      {/* <div className="bg-base-200/50 border-b border-base-300">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="badge badge-primary">ID: {book}</div>
              <div className="text-sm text-base-content/70">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                文書ビューア
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                検索
              </button>
              <button className="btn btn-ghost btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                ブックマーク
              </button>
            </div>
          </div>
        </div>
      </div> */}

      {/* Viewer Container */}
      <main className="flex-1">
        <div className="h-[calc(100vh-120px)] bg-base-100">
          <ViewerComp
            manifestUrl={manifestUrl}
            iiifPage={page}
          />
        </div>
      </main>
    </div>
  );
}

export default ViewerIndexPage;