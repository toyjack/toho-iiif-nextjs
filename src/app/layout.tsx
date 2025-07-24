import type { Metadata } from "next";
import "./globals.css";
import HeaderComp from "../components/header";
import FooterComp from "../components/footer";

export const metadata: Metadata = {
  title: "東方學デジタル圖書館",
  description: "探索古代智慧的數位寶庫 - 收藏豐富的古籍、手稿和歷史文獻",
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
