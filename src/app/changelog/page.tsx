import type { Metadata } from "next";
import BetaNotice from "@/components/beta-notice";
import PageHeader from "@/components/page-header";
import { CONTENT_CHANGES, FEATURE_CHANGES, type ChangelogEntry } from "@/lib/changelog";
import { UI } from "@/lib/ui-text";

export const metadata: Metadata = {
  title: UI.changelog,
};

/** 2026-11-12 → 2026年11月12日 */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

function EntryList({ entries }: { entries: ChangelogEntry[] }) {
  return (
    <ol className="flex flex-col gap-6">
      {entries.map((entry) => (
        <li key={entry.date} className="flex flex-col gap-1.5 sm:flex-row sm:gap-6">
          <time dateTime={entry.date} className="shrink-0 text-sm leading-[1.8] font-bold text-muted sm:w-32">
            {formatDate(entry.date)}
          </time>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            {entry.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function ChangelogPage() {
  return (
    <div className="mx-auto w-full max-w-prose px-4 pb-16 md:px-6">
      <PageHeader title={UI.changelog} description="機能の変更と収録内容の変更を、新しい順に掲載しています。" />

      <div className="doc">
        <BetaNotice />

        <h2 id="features">機能の変更</h2>
        <EntryList entries={FEATURE_CHANGES} />

        <h2 id="content">収録内容の変更</h2>
        <EntryList entries={CONTENT_CHANGES} />
      </div>
    </div>
  );
}

export default ChangelogPage;
