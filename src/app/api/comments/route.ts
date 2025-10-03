import { NextResponse } from "next/server";
import {
  getComments,
  getCommentById,
  createComment,
  deleteComment,
} from "@/lib/dao/comments";

// GET: コメント一覧または単一コメント
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("id");
    const postId = searchParams.get("postId");

    if (commentId) {
      const comment = await getCommentById(Number(commentId));
      return NextResponse.json(comment);
    } else if (postId) {
      const comments = await getComments(Number(postId));
      return NextResponse.json(comments);
    } else {
      // postIdが指定されていない場合は空配列を返す
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch comments",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST: 新規コメント作成
export async function POST(req: Request) {
  try {
    console.log("[Comments API] POST request received");

    const body = await req.json();
    console.log("[Comments API] Request body:", {
      postId: body.postId,
      userId: body.userId,
      hasContent: !!body.content,
    });

    const { postId, userId, content } = body;

    // バリデーション
    if (!postId || !userId || !content) {
      console.error("[Comments API] Validation failed:", {
        postId,
        userId,
        hasContent: !!content,
      });
      return NextResponse.json(
        { error: "postId, userId, content are required" },
        { status: 400 }
      );
    }

    console.log("[Comments API] Creating comment...");
    const comment = await createComment({ postId, userId, content });
    console.log("[Comments API] Comment created successfully:", comment.id);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("[Comments API] Error creating comment:", error);

    // Prisma エラーの詳細をログ
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string; meta?: unknown };
      console.error("[Comments API] Prisma error code:", prismaError.code);
      console.error("[Comments API] Prisma error meta:", prismaError.meta);
    }

    return NextResponse.json(
      {
        error: "Failed to create comment",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE: コメント削除
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = Number(searchParams.get("id"));

    if (!commentId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const deleted = await deleteComment(commentId);
    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      {
        error: "Failed to delete comment",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Vercel設定
export const maxDuration = 10;
