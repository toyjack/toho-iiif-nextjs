import type { Metadata } from "next";
import Link from "next/link";
import BetaNotice from "@/components/beta-notice";
import ExternalLink from "@/components/external-link";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = {
  title: "利用規約",
};

function SitePolicyPage() {
  return (
    <div className="mx-auto w-full max-w-prose px-4 pb-16 md:px-6">
      <PageHeader title="利用規約" />

      <div className="doc">
        <p>
          このサイトは、京都大学人文科学研究所附属人文情報学創新センターが提供する東アジア古典籍のデジタル図書館です。
        </p>
        <p>利用者は、本サイトを利用することにより、以下の利用規約に同意したものとみなされます。</p>

        <BetaNotice />

        <h2>ライセンスについて</h2>
        <p>
          本サイトの漢籍コンテンツは、
          <ExternalLink href="https://creativecommons.org/licenses/by/4.0/">
            Creative Commons 表示 4.0 国際ライセンス (CC BY 4.0)
          </ExternalLink>
          の下で提供されています。
        </p>
        <p>
          本サイトは試験公開中のため、ライセンスを含む利用条件は今後変更される可能性があります。変更した場合は
          <Link href="/changelog" className="link-text">
            更新履歴
          </Link>
          でお知らせします。
        </p>

        <h3>ご利用いただけること</h3>
        <ul>
          <li>
            <strong>共有</strong> — どのようなメディアやフォーマットでも資料を複製し、頒布することができます
          </li>
          <li>
            <strong>翻案</strong> — 資料をリミックスし、改変し、別の作品のベースにすることができます
          </li>
          <li>
            <strong>営利目的での利用</strong> — 商用利用も可能です
          </li>
        </ul>

        <h3>守っていただく条件</h3>
        <ul>
          <li>
            <strong>表示</strong> — 適切なクレジットを表示し、ライセンスへのリンクを提供し、変更があったらその旨を示してください
          </li>
          <li>適切な表示例：「出典：東方学IIIF図書館（京都大学人文科学研究所）CC BY 4.0」</li>
        </ul>

        <p>
          詳細は
          <ExternalLink href="https://creativecommons.org/licenses/by/4.0/deed.ja">CC BY 4.0 ライセンス条項</ExternalLink>
          をご確認ください。
        </p>

        <h2>免責事項</h2>
        <p>
          本サイトの情報は、正確性を期していますが、その内容について保証するものではありません。利用者は自己責任で本サイトを利用してください。
        </p>

        <h2>お問い合わせ</h2>
        <p>本サイトに関するお問い合わせは、京都大学人文科学研究所までご連絡ください。</p>
      </div>
    </div>
  );
}

export default SitePolicyPage;
