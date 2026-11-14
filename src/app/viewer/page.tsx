import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ViewerComp from "./ViewerComp";
import Notice from "@/components/notice";
import ViewerToolbar from "@/components/viewer-toolbar";
import { bookTypeLabel } from "@/lib/book-type";
import { getBook } from "@/lib/books";
import { getImages } from "@/lib/generate-manifest";
import { firstParam as first, parsePage, parseViewer } from "@/lib/viewer-params";

type SearchParams = Promise<{
  book?: string | string[];
  page?: string | string[];
  viewer?: string | string[];
}>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const bookId = first((await searchParams).book)?.trim();
  const book = bookId ? getBook(bookId) : undefined;
  return { title: book ? book.title : "漢籍ビューア" };
}

/** Missing ID / not yet public: an ordinary site page with header and footer. */
function ViewerNotice({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto w-full max-w-prose px-4 py-12 md:px-6">
      <Notice
        headingLevel={1}
        title={title}
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
        <p>{message}</p>
      </Notice>
    </div>
  );
}

async function ViewerIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const bookId = first(params.book)?.trim();

  if (!bookId) {
    return (
      <ViewerNotice
        title="漢籍のIDが指定されていません"
        message="画像を表示するには、漢籍一覧から読みたい漢籍を選んでください。"
      />
    );
  }

  const book = getBook(bookId);
  if (!book) {
    notFound();
  }

  if (!book.available) {
    return (
      <ViewerNotice
        title="この漢籍の画像は準備中です"
        message={`${book.title}（${book.id}）の画像はまだ公開されていません。`}
      />
    );
  }

  const page = parsePage(first(params.page), getImages(book).length);
  const viewer = parseViewer(first(params.viewer));
  const manifestUrl = `/manifest/${encodeURIComponent(book.id)}/manifest.json`;

  return (
    // #reader hides the site header and footer (globals.css) and fills the viewport.
    <div id="reader" className="flex h-dvh flex-col">
      <ViewerToolbar
        viewer={viewer}
        info={{
          id: book.id,
          title: book.title,
          authors: book.authors,
          dynasty: book.dynasty,
          bookTypeLabel: book.bookType === "unknown" ? undefined : bookTypeLabel(book.bookType),
          volumes: book.volumes,
          publicationInfo: book.publicationInfo,
          collectionInfo: book.collectionInfo,
          category: book.category,
          nuNumber: book.nuNumber,
          legacyUrl: book.url,
          manifestPath: manifestUrl,
        }}
      />
      <div className="min-h-0 flex-1">
        <ViewerComp viewer={viewer} manifestUrl={manifestUrl} iiifPage={page} />
      </div>
    </div>
  );
}

export default ViewerIndexPage;
