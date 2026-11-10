/** Placeholder rows for the /books Suspense fallback (§4.10). */
export function BookListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-label="読み込み中" className="flex flex-col divide-y divide-base-300 border-y border-base-300">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex flex-col gap-2 py-3" aria-hidden="true">
          <div className="h-5 w-2/5 rounded-sm bg-base-200 motion-safe:animate-pulse" />
          <div className="h-4 w-3/5 rounded-sm bg-base-200 motion-safe:animate-pulse" />
          <div className="h-4 w-4/5 rounded-sm bg-base-200 motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  );
}
