import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

// ミドルウェア本体
export default withAuth(
  function middleware(req: NextRequest) {
    // デバッグ用ログ（不要なら削除可）
    if (!req.nextUrl.pathname.includes(".")) {
      console.log("ミドルウェアのテスト:", req.nextUrl.pathname);
    }
  },
  {
    pages: {
      signIn: "/api/auth/signin", // 未ログイン時に飛ばす場所
    },
  }
);

// ミドルウェアを特定のパスにのみ適用
// 今は /post 配下だけに適用（後で変更可）
export const config = {
  matcher: ["/post/:path*"],
};