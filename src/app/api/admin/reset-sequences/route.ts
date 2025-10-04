import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * データベースのシーケンスをリセットするAPI
 * IDの自動採番エラーが発生した場合に使用
 *
 * 使用方法: POST /api/admin/reset-sequences
 * 本番環境では適切な認証を追加してください
 */
export async function POST() {
  try {
    console.log("[Admin API] Resetting database sequences...");

    // 各テーブルのシーケンスをリセット
    const tables = [
      "PostVote",
      "CommentVote",
      "PostLike",
      "CommentLike",
      "Post",
      "Comment",
    ];

    const results = [];

    for (const table of tables) {
      try {
        // 現在の最大IDを取得してシーケンスをリセット
        await prisma.$executeRawUnsafe(`
          SELECT setval(
            pg_get_serial_sequence('"${table}"', 'id'),
            COALESCE((SELECT MAX(id) FROM "${table}"), 1),
            true
          );
        `);

        results.push({
          table,
          status: "success",
          message: `Sequence for ${table} reset successfully`,
        });

        console.log(`[Admin API] ${table} sequence reset successfully`);
      } catch (error) {
        console.error(`[Admin API] Error resetting ${table}:`, error);
        results.push({
          table,
          status: "error",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }

    const allSuccess = results.every((r) => r.status === "success");

    return NextResponse.json(
      {
        success: allSuccess,
        message: allSuccess
          ? "All sequences reset successfully"
          : "Some sequences failed to reset",
        results,
      },
      { status: allSuccess ? 200 : 207 }
    );
  } catch (error) {
    console.error("[Admin API] Error in reset-sequences:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset sequences",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
