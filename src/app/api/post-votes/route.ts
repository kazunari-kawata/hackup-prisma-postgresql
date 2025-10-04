import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// キャッシュ設定: API Routeは動的レンダリングだが、可能な限りキャッシュを活用
export const dynamic = "force-dynamic";
export const revalidate = 0; // 投票データは常に最新を取得

// GET: 投票データを取得
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    console.log("[Post Votes API] GET request for postId:", postId);

    if (!postId) {
      console.error("[Post Votes API] Missing postId");
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const postIdNum = Number(postId);
    if (isNaN(postIdNum)) {
      console.error("[Post Votes API] Invalid postId:", postId);
      return NextResponse.json(
        { error: "postId must be a valid number" },
        { status: 400 }
      );
    }

    const votes = await prisma.postVote.findMany({
      where: { postId: postIdNum },
    });

    console.log("[Post Votes API] Found votes:", votes.length);
    return NextResponse.json(votes);
  } catch (error) {
    console.error("[Post Votes API] GET Error:", error);
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
    const body = await req.json();
    const { postId, userId, voteType } = body;

    console.log("[Post Votes API] POST request received:", {
      postId,
      userId,
      voteType,
    });

    if (!postId || !userId || !voteType) {
      console.error("[Post Votes API] Missing required fields:", {
        postId,
        userId,
        voteType,
      });
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: { postId, userId, voteType },
        },
        { status: 400 }
      );
    }

    // voteTypeの値を検証
    if (voteType !== "UP" && voteType !== "DOWN") {
      console.error("[Post Votes API] Invalid voteType:", voteType);
      return NextResponse.json(
        { error: "Invalid voteType. Must be UP or DOWN" },
        { status: 400 }
      );
    }

    const deleteStart = Date.now();
    console.log("[Post Votes API] Deleting existing votes for user...");

    // トランザクションで既存の投票削除と新規投票追加を1回の往復で実行
    const newVote = await prisma.$transaction(async (tx) => {
      // 既存の投票を削除
      await tx.postVote.deleteMany({
        where: { postId: Number(postId), userId },
      });

      console.log(
        `[Post Votes API] Delete completed in ${Date.now() - deleteStart}ms`
      );

      const createStart = Date.now();
      console.log("[Post Votes API] Creating new vote...");

      // 新しい投票を追加
      const vote = await tx.postVote.create({
        data: {
          postId: Number(postId),
          userId,
          voteType,
        },
      });

      console.log(
        `[Post Votes API] Create completed in ${Date.now() - createStart}ms`
      );

      return vote;
    });

    console.log(
      `[Post Votes API] Vote created successfully in ${
        Date.now() - startTime
      }ms:`,
      newVote.id
    );
    return NextResponse.json(newVote, { status: 201 });
  } catch (error) {
    console.error(
      `[Post Votes API] POST Error after ${Date.now() - startTime}ms:`,
      error
    );

    // Prismaエラーの詳細をログ
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string; meta?: unknown };
      console.error("[Post Votes API] Prisma error code:", prismaError.code);
      console.error("[Post Votes API] Prisma error meta:", prismaError.meta);
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
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const userId = searchParams.get("userId");

    console.log("[Post Votes API] DELETE request:", { postId, userId });

    if (!postId || !userId) {
      console.error("[Post Votes API] Missing required fields:", {
        postId,
        userId,
      });
      return NextResponse.json(
        { error: "postId and userId are required" },
        { status: 400 }
      );
    }

    await prisma.postVote.deleteMany({
      where: { postId: Number(postId), userId },
    });

    console.log("[Post Votes API] Vote deleted successfully");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[Post Votes API] DELETE Error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete vote",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
