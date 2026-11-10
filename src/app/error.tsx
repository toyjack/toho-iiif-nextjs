"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import Notice from "@/components/notice";

/** Runtime errors in any page below the root layout (§4.10). */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // Server errors carry an identifier that matches the server log.
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <div className="mx-auto w-full max-w-prose px-4 py-12 md:px-6">
      <Notice
        headingLevel={1}
        title="表示中に問題が発生しました"
        actions={
          <>
            <button type="button" className="btn btn-primary" onClick={() => retry()}>
              再読み込み
            </button>
            <Link href="/" className="btn btn-ghost">
              ホームへ
            </Link>
          </>
        }
      >
        <p>時間をおいて再度お試しください。問題が続く場合は、京都大学人文科学研究所までお知らせください。</p>
        {digest && <p className="mt-1 font-mono text-xs">エラー ID：{digest}</p>}
      </Notice>
    </div>
  );
}
