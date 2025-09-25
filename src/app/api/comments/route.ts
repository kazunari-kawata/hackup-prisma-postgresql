import { NextResponse } from "next/server";
import {
  getComments,
  getCommentById,
  createComment,
  deleteComment,
} from "@/lib/dao/comments";

// GET: コメント一覧または単一コメント
export async function GET(req: Request) {
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
}

// POST: 新規コメント作成
export async function POST(req: Request) {
  const { postId, userId, content } = await req.json();
  const comment = await createComment({ postId, userId, content });
  return NextResponse.json(comment);
}

// DELETE: コメント削除
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const commentId = Number(searchParams.get("id"));
  if (!commentId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const deleted = await deleteComment(commentId);
  return NextResponse.json(deleted);
}
