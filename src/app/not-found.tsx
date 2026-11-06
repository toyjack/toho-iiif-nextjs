import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body text-center">
          <p className="text-5xl font-bold text-primary mb-2">404</p>
          <h2 className="card-title justify-center">ページが見つかりません</h2>
          <p className="text-base-content/70">
            お探しのページ、または漢籍は存在しないか、移動した可能性があります。
          </p>
          <div className="card-actions justify-center mt-4">
            <Link href="/books" className="btn btn-primary">
              漢籍一覧へ
            </Link>
            <Link href="/" className="btn btn-ghost">
              ホームへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
