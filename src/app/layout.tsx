import type { Metadata } from "next";
import "./globals.css";
import HeaderComp from "../components/header";
import FooterComp from "../components/footer";

export const metadata: Metadata = {
  title: "東方学IIIF図書館",
  description: "京都大学人文科学研究所が提供する、東アジア古典籍のデジタル図書館です。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen bg-base-100">
          <HeaderComp />
          {children}
          <FooterComp />
        </div>
      </body>
    </html>
  );
}
