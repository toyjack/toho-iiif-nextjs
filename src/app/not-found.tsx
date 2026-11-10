import type { Metadata } from "next";
import Link from "next/link";
import Notice from "@/components/notice";

export const metadata: Metadata = {
  title: "ページが見つかりません",
};

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-prose px-4 py-12 md:px-6">
      <Notice
        headingLevel={1}
        title="ページが見つかりません"
        actions={
          <>
            <Link href="/books" className="btn btn-primary">
              漢籍一覧へ
            </Link>
            <Link href="/" className="btn btn-ghost">
              ホームへ
            </Link>
          </>
        }
      >
        <p>お探しのページ、または漢籍は存在しないか、移動した可能性があります。</p>
        <p className="mt-1 font-mono text-xs">404</p>
      </Notice>
    </div>
  );
}
