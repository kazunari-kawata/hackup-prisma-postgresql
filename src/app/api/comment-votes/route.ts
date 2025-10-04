import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// キャッシュ設定: API Routeは動的レンダリングだが、可能な限りキャッシュを活用
export const dynamic = "force-dynamic";
export const revalidate = 0; // 投票データは常に最新を取得

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
  const startTime = Date.now();
  try {
    const { commentId, userId, voteType } = await req.json();

    console.log("[Comment Votes API] POST request received:", {
      commentId,
      userId,
      voteType,
    });

    if (!commentId || !userId || !voteType) {
      console.error("[Comment Votes API] Missing required fields:", {
        commentId,
        userId,
        voteType,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // voteTypeの値を検証
    if (voteType !== "UP" && voteType !== "DOWN") {
      console.error("[Comment Votes API] Invalid voteType:", voteType);
      return NextResponse.json(
        { error: "Invalid voteType. Must be UP or DOWN" },
        { status: 400 }
      );
    }

    console.log("[Comment Votes API] Starting transaction...");

    // トランザクションで既存の投票削除と新規投票追加を1回の往復で実行
    const newVote = await prisma.$transaction(async (tx) => {
      // 既存の投票を削除
      await tx.commentVote.deleteMany({
        where: { commentId: Number(commentId), userId },
      });

      // 新しい投票を追加
      const vote = await tx.commentVote.create({
        data: {
          commentId: Number(commentId),
          userId,
          voteType,
        },
      });

      return vote;
    });

    console.log(
      `[Comment Votes API] Vote created successfully in ${
        Date.now() - startTime
      }ms:`,
      newVote.id
    );
    return NextResponse.json(newVote, { status: 201 });
  } catch (error) {
    console.error(
      `[Comment Votes API] POST Error after ${Date.now() - startTime}ms:`,
      error
    );

    // Prismaエラーの詳細をログ
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string; meta?: unknown };
      console.error("[Comment Votes API] Prisma error code:", prismaError.code);
      console.error("[Comment Votes API] Prisma error meta:", prismaError.meta);
    }

    return NextResponse.json(
      {
        error: "Failed to create vote",
        details: error instanceof Error ? error.message : String(error),
      },
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
