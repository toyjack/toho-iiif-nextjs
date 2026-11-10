import type { Metadata } from "next";
import "./globals.css";
import HeaderComp from "../components/header";
import FooterComp from "../components/footer";
import { SITE_NAME } from "@/lib/ui-text";

export const metadata: Metadata = {
  // pages set only their own name: 「漢籍一覧 | 東方学IIIF図書館」
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "京都大学人文科学研究所が提供する、東アジア古典籍のデジタル図書館です。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col bg-base-100 text-base-content">
        <a href="#main" className="skip-link">
          本文へスキップ
        </a>
        <HeaderComp />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <FooterComp />
      </body>
    </html>
  );
}
