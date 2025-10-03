import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 投票データを取得
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        { error: "commentId is required" },
        { status: 400 }
      );
    }

    const commentIdNum = Number(commentId);
    if (isNaN(commentIdNum)) {
      return NextResponse.json(
        { error: "commentId must be a valid number" },
        { status: 400 }
      );
    }

    console.log(
      "[Comment Votes API] Fetching votes for commentId:",
      commentIdNum
    );

    const votes = await prisma.commentVote.findMany({
      where: { commentId: commentIdNum },
    });

    console.log("[Comment Votes API] Found votes:", votes.length);
    return NextResponse.json(votes);
  } catch (error) {
    console.error("[Comment Votes API] Error fetching votes:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch votes",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST: 投票を追加/更新
export async function POST(req: NextRequest) {
  try {
    const { commentId, userId, voteType } = await req.json();
    if (!commentId || !userId || !voteType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    // 既存の投票を削除
    await prisma.commentVote.deleteMany({
      where: { commentId: Number(commentId), userId },
    });
    // 新しい投票を追加
    const newVote = await prisma.commentVote.create({
      data: {
        commentId: Number(commentId),
        userId,
        voteType,
      },
    });
    return NextResponse.json(newVote, { status: 201 });
  } catch (error) {
    console.error("POST Comment Vote Error:", error);
    return NextResponse.json(
      { error: "Failed to create vote" },
      { status: 500 }
    );
  }
}

// DELETE: 投票を削除
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get("commentId");
  const userId = searchParams.get("userId");
  if (!commentId || !userId) {
    return NextResponse.json(
      { error: "commentId and userId are required" },
      { status: 400 }
    );
  }
  try {
    await prisma.commentVote.deleteMany({
      where: { commentId: Number(commentId), userId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE Comment Vote Error:", error);
    return NextResponse.json(
      { error: "Failed to delete vote" },
      { status: 500 }
    );
  }
}
