import { NextResponse } from "next/server";
import {
  getCommentLikesByCommentId,
  createCommentLike,
  deleteCommentLikeByCommentAndUser,
} from "@/lib/dao/comment_like";

// GET: コメントのいいね一覧を返す
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = Number(searchParams.get("commentId"));

    if (!commentId || isNaN(commentId)) {
      return NextResponse.json(
        { error: "Valid commentId is required" },
        { status: 400 }
      );
    }

    const likes = await getCommentLikesByCommentId(commentId);
    return NextResponse.json(likes);
  } catch (error) {
    console.error("[Comment Likes API] Error fetching likes:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch comment likes",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST: コメントにいいね追加
export async function POST(req: Request) {
  try {
    const { commentId, userId } = await req.json();
    console.log({ commentId, userId });
    const like = await createCommentLike({ commentId, userId });
    return NextResponse.json(like);
  } catch (e) {
    console.error("POST /api/comment-likes error:", e);
    return NextResponse.json(
      { error: (e as Error).message || "インターナルサーバーエラー" },
      { status: 500 }
    );
  }
}

// DELETE: コメントのいいねを削除
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const commentId = Number(searchParams.get("commentId"));
  const userId = String(searchParams.get("userId"));
  await deleteCommentLikeByCommentAndUser(commentId, userId);
  return NextResponse.json({ ok: true });
}
