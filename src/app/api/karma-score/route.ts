import { NextRequest, NextResponse } from "next/server";
import {
  calculateUserKarmaScore,
  getDetailedKarmaScore,
  formatKarmaScore,
} from "@/lib/services/karmaService";

// GET: ユーザーのカルマスコアを取得
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const detailed = searchParams.get("detailed") === "true";

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    if (detailed) {
      const karmaDetails = await getDetailedKarmaScore(userId);
      const formatted = formatKarmaScore(karmaDetails.totalKarma);
      return NextResponse.json({
        userId,
        karmaScore: karmaDetails.totalKarma,
        details: karmaDetails,
        formatted,
      });
    } else {
      const karmaScore = await calculateUserKarmaScore(userId);
      const formatted = formatKarmaScore(karmaScore);
      return NextResponse.json({
        userId,
        karmaScore,
        formatted,
      });
    }
  } catch (error) {
    console.error("GET Karma Score Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch karma score" },
      { status: 500 }
    );
  }
}
