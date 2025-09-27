import { prisma } from "@/lib/prisma";

/**
 * ユーザーのカルマスコアを計算する
 * カルマスコア = 投稿に対するUP投票数 + コメントに対するUP投票数
 */
export async function calculateUserKarmaScore(userId: string): Promise<number> {
  try {
    // 1. ユーザーの投稿に対するUP投票を取得
    const postUpVotes = await prisma.postVote.count({
      where: {
        voteType: "UP",
        post: {
          userId: userId,
        },
      },
    });

    // 2. ユーザーのコメントに対するUP投票を取得
    const commentUpVotes = await prisma.commentVote.count({
      where: {
        voteType: "UP",
        comment: {
          userId: userId,
        },
      },
    });

    // 3. カルマスコア計算（UP投票の合計）
    const karmaScore = postUpVotes + commentUpVotes;

    return karmaScore;
  } catch (error) {
    console.error("Karma Score Calculation Error:", error);
    return 0; // エラー時は0を返す
  }
}

/**
 * 複数ユーザーのカルマスコアを一括計算
 */
export async function calculateMultipleUsersKarmaScores(
  userIds: string[]
): Promise<Record<string, number>> {
  const karmaScores: Record<string, number> = {};

  for (const userId of userIds) {
    karmaScores[userId] = await calculateUserKarmaScore(userId);
  }

  return karmaScores;
}
