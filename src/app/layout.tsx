import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RightColumn from "./RightColumn";
import LeftColumn from "./LeftColumn";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HackUp",
  description: "人類の英知を結集するプラットフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //todo: ユーザー名とカルマスコアを動的に取得するように要変更
  const userName = "ゲスト";
  const karmaScore = 0;
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="md:grid md:grid-cols-[1fr_2fr] xl:grid-cols-[1fr_2fr_1fr] md:gap-5 md:min-h-screen">
          {/* 左カラム */}
          <div>
            <LeftColumn />
          </div>
          {/* md以下: ヘッダー直下に表示 */}
          <div className="block md:hidden w-full px-4 mt-4">
            <RightColumn userName={userName} karmaScore={karmaScore} />
          </div>
          {/* 中央カラム */}
          <main>{children}</main>
          {/* md以上: サイドカラムに表示 */}
          <div className="hidden md:block">
            <RightColumn userName={userName} karmaScore={karmaScore} />
          </div>
        </div>
      </body>
    </html>
  );
}
