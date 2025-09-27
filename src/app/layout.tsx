import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import AuthenticatedRightColumn from "./AuthenticatedRightColumn";
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
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          <div className="md:grid md:grid-cols-[1fr_2fr] xl:grid-cols-[1fr_2fr_1fr] md:gap-5 md:min-h-screen">
            {/* 左カラム */}
            <div>
              <LeftColumn />
            </div>
            {/* md以下: ヘッダー直下に表示 */}
            <AuthenticatedRightColumn className="block md:hidden w-full px-4 mt-4" />
            {/* 中央カラム */}
            <main>{children}</main>
            {/* md以上: サイドカラムに表示 */}
            <AuthenticatedRightColumn className="hidden md:block" />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
