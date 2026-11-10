import type { Metadata } from "next";
import Link from "next/link";
import CategoryIndex from "@/components/category-index";
import ExternalLink from "@/components/external-link";
import PageHeader from "@/components/page-header";
import StatList from "@/components/stat-list";
import { categoryGroups, collectionStats } from "@/lib/collection";

export const metadata: Metadata = {
  title: "このサイトについて",
};

const ORIGINAL_SITE = "http://kanji.zinbun.kyoto-u.ac.jp/db-machine/toho/html/top.html";

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-prose px-4 pb-16 md:px-6">
      <PageHeader title="このサイトについて" />

      <div className="doc">
        <p>
          東方学IIIF図書館は、京都大学人文科学研究所の
          <ExternalLink href={ORIGINAL_SITE}>「東方學デジタル圖書館」</ExternalLink>
          を、国際的な画像相互運用の枠組みである IIIF（International Image
          Interoperability Framework）に対応させて再構築したものです。
        </p>
        <p>
          書誌の記述と冊・巻の構成は元のサイトのデータを引き継いでおり、原文の表記や旧字形はそのまま収録しています。
        </p>

        <h2>収録内容</h2>
        <StatList stats={collectionStats()} />
        <div className="mt-2">
          <CategoryIndex groups={categoryGroups()} />
        </div>

        <h2>IIIF による利用</h2>
        <p>
          画像は京都大学人文科学研究所の IIIF Image API サーバーから配信されます。各漢籍には IIIF Presentation API 3.0
          形式のマニフェストを用意しており、本サイトのビューア（Tify）のほか、IIIF に対応した任意のビューアで閲覧できます。
        </p>
        <dl
          tabIndex={0}
          aria-label="マニフェストの URL"
          className="grid gap-x-4 gap-y-1 overflow-x-auto rounded-box bg-base-200 p-4 text-sm leading-normal sm:grid-cols-[auto_1fr]"
        >
          <dt className="text-xs leading-5 font-bold text-muted">マニフェストの URL</dt>
          <dd className="whitespace-nowrap">
            <code>/manifest/&lt;漢籍ID&gt;/manifest.json</code>
          </dd>
          <dt className="mt-2 text-xs leading-5 font-bold text-muted sm:mt-0">例</dt>
          <dd className="whitespace-nowrap">
            <Link href="/manifest/A029/manifest.json" className="link-text font-mono">
              /manifest/A029/manifest.json
            </Link>
          </dd>
        </dl>
        <p>マニフェストでは冊・巻ごとの目次（Range）を提供しています。</p>

        <h2>ライセンス</h2>
        <p>
          本サイトの漢籍コンテンツは CC BY 4.0 の下で提供されています。利用条件と出典の表示方法は
          <Link href="/sitepolicy" className="link-text">
            利用規約
          </Link>
          をご覧ください。
        </p>

        <h2>提供</h2>
        <p>
          <ExternalLink href="https://www.ciih.zinbun.kyoto-u.ac.jp/">
            京都大学人文科学研究所附属人文情報学創新センター
          </ExternalLink>
        </p>
      </div>
    </div>
  );
}

export default AboutPage;
