import type { Metadata } from "next";
import { Suspense } from "react";
import BooksComp from "@/components/books";
import { BookListSkeleton } from "@/components/skeleton";
import { bookSummaries, library } from "@/lib/books";

export const metadata: Metadata = {
  title: "漢籍一覧",
};

function BooksFallback() {
  return (
    <div className="mx-auto w-full max-w-page px-4 pb-12 md:px-6">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-6 pb-4">
        <h1 className="font-serif text-2xl leading-[1.35] font-bold sm:text-[1.75rem]">漢籍一覧</h1>
      </div>
      <BookListSkeleton />
    </div>
  );
}

function BooksPage() {
  return (
    <Suspense fallback={<BooksFallback />}>
      <BooksComp books={bookSummaries()} totalBooks={library.metadata.totalBooks} />
    </Suspense>
  );
}

export default BooksPage;
