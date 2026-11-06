import type { Metadata } from "next";
import Link from "next/link";
import { availableBooks, library } from "@/lib/books";

export const metadata: Metadata = {
  title: "このサイトについて | 東方学IIIF図書館",
};

const ORIGINAL_SITE = "http://kanji.zinbun.kyoto-u.ac.jp/db-machine/toho/html/top.html";

function AboutPage() {
  const { totalBooks, totalVolumes, categories } = library.metadata;
  const viewable = availableBooks().length;
  const number = new Intl.NumberFormat("ja-JP");

  return (
    <div className="container mx-auto px-4 pb-12 max-w-3xl">
      <h1 className="text-3xl font-bold my-8">このサイトについて</h1>

      <section className="mb-8">
        <p className="text-base-content/80 mb-4 leading-relaxed">
          東方学IIIF図書館は、京都大学人文科学研究所の
          <a href={ORIGINAL_SITE} target="_blank" rel="noopener noreferrer" className="link link-primary">
            「東方學デジタル圖書館」
          </a>
          を、国際的な画像相互運用の枠組みである IIIF（International Image
          Interoperability Framework）に対応させて再構築したものです。
        </p>
        <p className="text-base-content/80 leading-relaxed">
          書誌の記述と冊・巻の構成は元のサイトのデータを引き継いでおり、原文の表記や旧字形はそのまま収録しています。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">収録内容</h2>
        <div className="stats stats-vertical sm:stats-horizontal shadow-sm border border-base-200 w-full mb-4">
          <div className="stat">
            <div className="stat-title">収録漢籍</div>
            <div className="stat-value text-primary">{number.format(totalBooks)}</div>
            <div className="stat-desc">部</div>
          </div>
          <div className="stat">
            <div className="stat-title">うち画像閲覧可能</div>
            <div className="stat-value text-secondary">{number.format(viewable)}</div>
            <div className="stat-desc">部</div>
          </div>
          <div className="stat">
            <div className="stat-title">冊・巻</div>
            <div className="stat-value">{number.format(totalVolumes)}</div>
          </div>
        </div>
        <p className="text-base-content/80 mb-2">分類：</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/books?category=${encodeURIComponent(category)}`}
              className="badge badge-outline badge-lg"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">IIIF による利用</h2>
        <p className="text-base-content/80 mb-4 leading-relaxed">
          画像は京都大学人文科学研究所の IIIF Image API サーバーから配信されます。各漢籍には IIIF Presentation API 3.0
          形式のマニフェストを用意しており、本サイトのビューア（Tify）のほか、IIIF に対応した任意のビューアで閲覧できます。
        </p>
        <div className="bg-base-200 p-4 rounded-lg overflow-x-auto">
          <p className="text-sm text-base-content/70 mb-1">マニフェストの URL</p>
          <code className="text-sm whitespace-nowrap">/manifest/&lt;漢籍ID&gt;/manifest.json</code>
          <p className="text-sm text-base-content/70 mt-3 mb-1">例</p>
          <Link href="/manifest/A029/manifest.json" className="link text-sm whitespace-nowrap">
            /manifest/A029/manifest.json
          </Link>
        </div>
        <p className="text-base-content/80 mt-4 leading-relaxed">
          マニフェストでは冊・巻ごとの目次（Range）を提供しています。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">ライセンス</h2>
        <p className="text-base-content/80 leading-relaxed">
          本サイトの漢籍コンテンツは CC BY 4.0 の下で提供されています。利用条件と出典の表示方法は
          <Link href="/sitepolicy" className="link link-primary">
            利用規約
          </Link>
          をご覧ください。
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">提供</h2>
        <p className="text-base-content/80 leading-relaxed">
          <a
            href="https://www.ciih.zinbun.kyoto-u.ac.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary"
          >
            京都大学人文科学研究所附属人文情報学創新センター
          </a>
        </p>
      </section>
    </div>
  );
}

export default AboutPage;
