import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 投票データを取得
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }
  try {
    const votes = await prisma.postVote.findMany({
      where: { postId: Number(postId) },
    });
    return NextResponse.json(votes);
  } catch (error) {
    console.error("GET Post Votes Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}

// POST: 投票を追加/更新
export async function POST(req: NextRequest) {
  try {
    const { postId, userId, voteType } = await req.json();
    if (!postId || !userId || !voteType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    // 既存の投票を削除
    await prisma.postVote.deleteMany({
      where: { postId: Number(postId), userId },
    });
    // 新しい投票を追加
    const newVote = await prisma.postVote.create({
      data: {
        postId: Number(postId),
        userId,
        voteType,
      },
    });
    return NextResponse.json(newVote, { status: 201 });
  } catch (error) {
    console.error("POST Post Vote Error:", error);
    return NextResponse.json(
      { error: "Failed to create vote" },
      { status: 500 }
    );
  }
}

// DELETE: 投票を削除
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const userId = searchParams.get("userId");
  if (!postId || !userId) {
    return NextResponse.json(
      { error: "postId and userId are required" },
      { status: 400 }
    );
  }
  try {
    await prisma.postVote.deleteMany({
      where: { postId: Number(postId), userId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE Post Vote Error:", error);
    return NextResponse.json(
      { error: "Failed to delete vote" },
      { status: 500 }
    );
  }
}
