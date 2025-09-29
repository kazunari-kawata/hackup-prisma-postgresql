import { NextResponse } from "next/server";
import {
  getPostLikes,
  createPostLike,
  deletePostLikeByPostAndUser,
} from "@/lib/dao/post_like";

// GET: 投稿のいいね一覧を返す
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = Number(searchParams.get("postId"));
  const likes = await getPostLikes(postId);
  return NextResponse.json(likes);
}

// POST: 投稿にいいね追加
export async function POST(req: Request) {
  try {
    const { postId, userId } = await req.json();
    console.log({ postId, userId });
    const like = await createPostLike({ postId, userId });
    return NextResponse.json(like);
  } catch (e) {
    console.error("POST /api/post-likes error:", e);
    return NextResponse.json(
      { error: (e as Error).message || "インターナルサーバーエラー" },
      { status: 500 }
    );
  }
}

// DELETE: 投稿のいいねを削除
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = Number(searchParams.get("postId"));
  const userId = String(searchParams.get("userId"));
  await deletePostLikeByPostAndUser(postId, userId);
  return NextResponse.json({ ok: true });
}
