import { NextRequest, NextResponse } from "next/server";
import { calculateUserKarmaScore } from "@/lib/services/karmaService";

// GET: ユーザーのカルマスコアを取得
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const karmaScore = await calculateUserKarmaScore(userId);
    return NextResponse.json({ userId, karmaScore });
  } catch (error) {
    console.error("GET Karma Score Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch karma score" },
      { status: 500 }
    );
  }
}
