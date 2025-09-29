import { NextResponse } from "next/server";
import {
  getPostVotes,
  createPostVote,
  deletePostVoteByPostAndUser,
  // getPostVoteByPostAndUserAndType,
} from "@/lib/dao/post_vote";

// GET: 投稿の投票一覧を返す
export async function GET(req: Request) {
  try {
    console.log("[GET /api/post-votes] called");
    const { searchParams } = new URL(req.url);
    const postId = Number(searchParams.get("postId"));
    const votes = await getPostVotes(postId);
    return NextResponse.json(votes);
  } catch (e: unknown) {
    console.error("[GET /api/post-votes] error:", e);
    let message = "インターナルサーバーエラー";
    if (e instanceof Error) message = e.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: 投稿に投票（アゲ/サゲ）追加または更新
export async function POST(req: Request) {
  try {
    console.log("[POST /api/post-votes] called");
    const { postId, userId, voteType } = await req.json();
    console.log({ postId, userId, voteType });
    const vote = await createPostVote({ postId, userId, voteType });
    return NextResponse.json(vote);
  } catch (e: unknown) {
    console.error("[POST /api/post-votes] error:", e);
    let message = "インターナルサーバーエラー";
    if (e instanceof Error) message = e.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: 投稿の投票を削除
export async function DELETE(req: Request) {
  try {
    console.log("[DELETE /api/post-votes] called");
    const { searchParams } = new URL(req.url);
    const postId = Number(searchParams.get("postId"));
    const userId = String(searchParams.get("userId"));
    console.log({ postId, userId });
    await deletePostVoteByPostAndUser(postId, userId);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[DELETE /api/post-votes] error:", e);
    let message = "インターナルサーバーエラー";
    if (e instanceof Error) message = e.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}　