import Link from "next/link";
import { SITE_NAME } from "@/lib/ui-text";
import ExternalLink from "./external-link";

function FooterComp() {
  return (
    <footer className="bg-base-200 text-[0.8125rem] leading-normal">
      <div className="mx-auto grid w-full max-w-page gap-6 px-4 py-8 md:grid-cols-[1fr_auto] md:px-6">
        <div className="flex flex-col gap-1.5">
          <p className="font-serif text-base font-bold">{SITE_NAME}</p>
          <p>
            <ExternalLink href="https://www.ciih.zinbun.kyoto-u.ac.jp/">
              京都大学人文科学研究所附属人文情報学創新センター
            </ExternalLink>
          </p>
          <p className="text-muted">
            本サイトの漢籍コンテンツは
            <ExternalLink href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</ExternalLink>
            でライセンスされています
          </p>
          <p className="text-muted">© 2025 INSTITUTE FOR RESEARCH IN HUMANITIES, KYOTO UNIVERSITY.</p>
        </div>
        <nav aria-label="サイト情報">
          <ul className="flex gap-4 md:flex-col md:gap-1.5">
            <li>
              <Link className="hover:underline" href="/about">
                このサイトについて
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/sitepolicy">
                利用規約
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default FooterComp;
