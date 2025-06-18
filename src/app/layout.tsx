import type { Metadata } from "next";
import "./globals.css";

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
      <body
      >
        {children}
      </body>
    </html>
  );
}
