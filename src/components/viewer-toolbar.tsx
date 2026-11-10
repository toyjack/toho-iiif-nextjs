import { UI } from "@/lib/ui-text";
import BackToList from "./back-to-list";
import BookInfoDialog, { type BookInfo } from "./book-info-dialog";
import ExternalLink from "./external-link";

/**
 * The reader's single 48px bar (§4.6), replacing the site header:
 * [← 漢籍一覧]  書名 · 著者            [IIIF マニフェスト ↗] [書誌情報]
 * The title is the page's only <h1>; Tify's own title heading is hidden in globals.css.
 */
export default function ViewerToolbar({ info }: { info: BookInfo }) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-1 border-b border-base-300 bg-base-100 px-2 sm:gap-2 sm:px-3">
      <BackToList />
      <div className="flex min-w-0 flex-1 items-baseline gap-2 border-l border-base-300 pl-2 sm:pl-3">
        <h1 className="truncate font-serif text-base leading-tight font-bold" title={info.title}>
          {info.title}
        </h1>
        {info.authors.length > 0 && (
          <p className="hidden truncate text-[0.8125rem] text-muted md:block">{info.authors.join("、")}</p>
        )}
      </div>
      {/* wrapper toggles display: ExternalLink sets inline-flex itself; the dialog has the link on small screens */}
      <span className="hidden shrink-0 md:block">
        <ExternalLink href={info.manifestPath} className="btn btn-ghost btn-sm px-2 font-normal">
          {UI.manifest}
        </ExternalLink>
      </span>
      <BookInfoDialog info={info} />
    </header>
  );
}
