import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import AuthenticatedRightColumn from "./AuthenticatedRightColumn";
import LeftColumn from "./LeftColumn";
import ConditionalSearchBar from "@/components/conditional-search-bar";

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
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ReactQueryProvider>
          <AuthProvider>
            <div className="min-h-screen">
              {/* モバイル: ヘッダーを上部に固定 */}
              <div className="md:hidden">
                <LeftColumn />
              </div>

              {/* デスクトップ以上: フレックスレイアウト */}
              <div className="hidden md:flex min-h-screen">
                {/* 左カラム */}
                <LeftColumn />

                {/* メインコンテンツエリア */}
                <div className="flex-1 ml-64 lg:ml-72">
                  <main className="p-4">
                    <ConditionalSearchBar />
                    {children}
                  </main>
                </div>

                {/* 右カラム */}
                <AuthenticatedRightColumn className="w-64 flex-shrink-0" />
              </div>

              {/* モバイル: メインコンテンツ */}
              <div className="md:hidden">
                {/* md以下: ヘッダー直下に表示 */}
                <AuthenticatedRightColumn className="w-full px-4 mt-4" />

                <main className="p-4">
                  <ConditionalSearchBar />
                  {children}
                </main>
              </div>
            </div>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
