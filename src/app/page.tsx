import { connection } from "next/server";
import Link from "next/link";
import { BookCard } from "@/components/book-row";
import CategoryIndex from "@/components/category-index";
import BetaNotice from "@/components/beta-notice";
import ExternalLink from "@/components/external-link";
import HomeSearch from "@/components/home-search";
import StatList from "@/components/stat-list";
import { availableBooks } from "@/lib/books";
import { categoryGroups, collectionStats } from "@/lib/collection";
import { sample } from "@/lib/random";
import { SITE_NAME } from "@/lib/ui-text";

export default async function Home() {
  // Render per request so the featured books change on every visit
  // (a static page would fix them at build time).
  await connection();

  const randomBooks = sample(availableBooks(), 6);

  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-12 px-4 pt-10 pb-16 md:gap-16 md:px-6 md:pt-14">
      <section aria-labelledby="site-title" className="flex max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 id="site-title" className="font-serif text-[1.875rem] leading-[1.3] font-bold sm:text-4xl">
            {SITE_NAME}
          </h1>
          <p className="leading-[1.8]">
            <ExternalLink href="https://www.zinbun.kyoto-u.ac.jp/">京都大学人文科学研究所</ExternalLink>
            が提供する、東アジア古典籍のデジタル図書館です。画像は
            <Link href="/about" className="link-text">
              IIIF
            </Link>
            に対応しており、外部のビューアやツールからも利用できます。
          </p>
        </div>
        <HomeSearch />
        <StatList stats={collectionStats()} />
        <BetaNotice />
      </section>

      <section aria-labelledby="browse-heading" className="flex flex-col gap-6">
        <h2 id="browse-heading" className="font-serif text-xl leading-[1.4] font-bold">
          分類から探す
        </h2>
        <CategoryIndex groups={categoryGroups()} />
      </section>

      <section aria-labelledby="featured-heading" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="featured-heading" className="font-serif text-xl leading-[1.4] font-bold">
            所蔵より
          </h2>
          <p className="text-[0.8125rem] text-muted">閲覧可能な漢籍から、訪問のたびに 6 部を選んで表示しています。</p>
        </div>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {randomBooks.map((book) => (
            <li key={book.id}>
              <BookCard book={book} />
            </li>
          ))}
        </ul>
        <div>
          <Link href="/books" className="btn btn-outline border-border-strong">
            漢籍一覧へ
          </Link>
        </div>
      </section>
    </div>
  );
}
