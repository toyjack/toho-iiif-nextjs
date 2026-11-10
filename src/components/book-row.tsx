// Presentational only: receives catalogue data (RowBook), reads nothing itself, so it
// works under both server and client components (and never imports @/lib/books
// at runtime — the import below is type-only).
import Link from "next/link";
import type { BookSummary } from "@/lib/books";
import { bookTypeLabel } from "@/lib/book-type";
import { kansekiDbUrl, splitTitle, viewerHref } from "@/lib/book-display";
import { UI } from "@/lib/ui-text";
import ExternalLink from "./external-link";

/** The fields a row shows; both BookSummary and BookEntry satisfy it. */
export type RowBook = Pick<
  BookSummary,
  | "id"
  | "title"
  | "category"
  | "dynasty"
  | "bookType"
  | "authors"
  | "volumes"
  | "publicationInfo"
  | "hasSeals"
  | "hasNotes"
  | "isIncomplete"
  | "available"
  | "nuNumber"
>;

export interface BookRowData {
  book: RowBook;
  viaVariant?: boolean;
  viaPinyin?: boolean;
}

const meta = "text-[0.8125rem] leading-normal text-muted";

function BookTitle({ book }: { book: RowBook }) {
  const [main, rest] = splitTitle(book.title);
  const text = (
    <>
      {main}
      {rest && <span className="font-normal">{rest}</span>}
    </>
  );
  return (
    <h3 className="font-serif text-[1.0625rem] leading-normal font-bold">
      {book.available ? (
        <Link href={viewerHref(book.id)} className="decoration-1 underline-offset-[0.2em] hover:underline">
          {text}
        </Link>
      ) : (
        text
      )}
    </h3>
  );
}

function BookFlags({ book }: { book: RowBook }) {
  if (!book.hasSeals && !book.hasNotes && !book.isIncomplete) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {book.hasSeals && <span className="badge badge-sm badge-outline border-base-300 text-muted">{UI.hasSeals}</span>}
      {book.hasNotes && <span className="badge badge-sm badge-outline border-base-300 text-muted">{UI.hasNotes}</span>}
      {book.isIncomplete && <span className="badge badge-sm badge-soft badge-warning">{UI.incomplete}</span>}
    </span>
  );
}

function MatchNote({ viaVariant, viaPinyin }: { viaVariant?: boolean; viaPinyin?: boolean }) {
  const notes = [viaVariant && UI.viaVariant, viaPinyin && UI.viaPinyin].filter(Boolean);
  if (notes.length === 0) return null;
  return <span className="whitespace-nowrap">（{notes.join("・")}）</span>;
}

/** The 「閲覧」 button repeats the title link, so it is skipped by Tab and screen readers (§5.4). */
function ReadAction({ book }: { book: RowBook }) {
  return book.available ? (
    <>
      <Link href={viewerHref(book.id)} className="btn btn-primary btn-sm" tabIndex={-1} aria-hidden="true">
        {UI.read}
      </Link>
      <span className="sr-only">{UI.available}</span>
    </>
  ) : (
    <span className="text-sm text-muted">{UI.preparing}</span>
  );
}

function KansekiLink({ book }: { book: RowBook }) {
  if (!book.nuNumber) return null;
  return (
    <ExternalLink href={kansekiDbUrl(book.nuNumber)} className="link-text text-[0.8125rem] whitespace-nowrap">
      {UI.kansekiDb}
    </ExternalLink>
  );
}

function bookType(book: RowBook): string | null {
  return book.bookType === "unknown" ? null : bookTypeLabel(book.bookType);
}

/** 巻数 is shown only when the title does not already end with it (most titles do). */
function volumesNote(book: RowBook): string | null {
  return book.volumes && !book.title.includes(book.volumes) ? `${UI.volumes} ${book.volumes}` : null;
}

/** Table row for ≥ md. Columns: 書名 | 著者 | 時代 | 版種 | 分類 (≥ xl) | 状態. */
export function BookTableRow({ book, viaVariant, viaPinyin }: BookRowData) {
  const volumes = volumesNote(book);
  return (
    <tr className="align-top transition-colors duration-150 hover:bg-base-200">
      <td className="py-2!">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <BookTitle book={book} />
            <BookFlags book={book} />
          </div>
          <p className={`${meta} line-clamp-2`}>
            <span className="font-mono">{book.id}</span>
            <span className="xl:hidden"> · {book.category}</span>
            {book.nuNumber && (
              <>
                {" · "}
                <KansekiLink book={book} />
              </>
            )}
            {volumes && <> · {volumes}</>}
            {book.publicationInfo && <> · {book.publicationInfo}</>}
            <MatchNote viaVariant={viaVariant} viaPinyin={viaPinyin} />
          </p>
        </div>
      </td>
      <td className="py-2! text-sm">{book.authors.join("、")}</td>
      <td className="py-2! text-sm whitespace-nowrap">{book.dynasty}</td>
      <td className="py-2! text-sm whitespace-nowrap">{bookType(book)}</td>
      <td className="hidden py-2! text-sm whitespace-nowrap xl:table-cell">{book.category}</td>
      <td className="py-2!">
        <div className="flex justify-end">
          <ReadAction book={book} />
        </div>
      </td>
    </tr>
  );
}

/** Title, details and actions stacked vertically: list rows below md, and cards. */
function BookStacked({ book, viaVariant, viaPinyin }: BookRowData) {
  const details = [book.authors.join("、"), book.dynasty, bookType(book), volumesNote(book)]
    .filter(Boolean)
    .join(" · ");
  return (
    <>
      <BookTitle book={book} />
      {details && <p className="text-sm leading-normal">{details}</p>}
      {(book.publicationInfo || viaVariant || viaPinyin) && (
        <p className={`${meta} line-clamp-2`}>
          {book.publicationInfo}
          <MatchNote viaVariant={viaVariant} viaPinyin={viaPinyin} />
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
        <span className={meta}>
          <span className="font-mono">{book.id}</span> · {book.category}
        </span>
        <BookFlags book={book} />
        <KansekiLink book={book} />
        <span className="ml-auto">
          <ReadAction book={book} />
        </span>
      </div>
    </>
  );
}

/** Stacked row for < md. */
export function BookListItem(props: BookRowData) {
  return (
    <li className="flex flex-col gap-1 py-3">
      <BookStacked {...props} />
    </li>
  );
}

/**
 * Card (§4.3): same content as a row, 1px border, no shadow or hover lift.
 * Not a whole-card link, because it holds a second link (全国漢籍DB).
 */
export function BookCard({ book }: { book: RowBook }) {
  return (
    <article className="flex h-full flex-col gap-1 rounded-box border border-base-300 bg-base-100 p-4">
      <BookStacked book={book} />
    </article>
  );
}

/** Book list: a table from `md`, stacked rows below. */
export function BookList({ rows, caption }: { rows: BookRowData[]; caption: string }) {
  return (
    <>
      <ul className="divide-y divide-base-300 border-y border-base-300 md:hidden">
        {rows.map((r) => (
          <BookListItem key={r.book.id} {...r} />
        ))}
      </ul>
      {/* the wrapper toggles display: DaisyUI's .table would override `hidden` on the table itself */}
      <div className="hidden md:block">
        <table className="table-pin-rows table table-fixed">
          <caption className="sr-only">{caption}</caption>
          <colgroup>
            <col />
            <col className="w-[22%] xl:w-[18%]" />
            <col className="w-16" />
            <col className="w-20" />
            <col className="hidden w-24 xl:table-column" />
            <col className="w-24" />
          </colgroup>
          <thead>
            <tr className="border-b border-base-300 bg-base-200 text-xs font-bold text-muted [&>th]:py-2!">
              <th scope="col">{UI.title}</th>
              <th scope="col">{UI.author}</th>
              <th scope="col">{UI.dynasty}</th>
              <th scope="col">{UI.bookType}</th>
              <th scope="col" className="hidden xl:table-cell">
                {UI.category}
              </th>
              <th scope="col" className="text-right">
                {UI.status}
              </th>
            </tr>
          </thead>
          <tbody className="[&>tr]:border-base-300">
            {rows.map((r) => (
              <BookTableRow key={r.book.id} {...r} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
