import { prisma } from "@/lib/prisma";

/**
 * ユーザーのカルマスコアを計算する
 * カルマスコア = (投稿UP投票数 - 投稿DOWN投票数) + (コメントUP投票数 - コメントDOWN投票数)
 * マイナススコアも可能
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

    // 2. ユーザーの投稿に対するDOWN投票を取得
    const postDownVotes = await prisma.postVote.count({
      where: {
        voteType: "DOWN",
        post: {
          userId: userId,
        },
      },
    });

    // 3. ユーザーのコメントに対するUP投票を取得
    const commentUpVotes = await prisma.commentVote.count({
      where: {
        voteType: "UP",
        comment: {
          userId: userId,
        },
      },
    });

    // 4. ユーザーのコメントに対するDOWN投票を取得
    const commentDownVotes = await prisma.commentVote.count({
      where: {
        voteType: "DOWN",
        comment: {
          userId: userId,
        },
      },
    });

    // 5. カルマスコア計算（UP投票 - DOWN投票）
    const postKarma = postUpVotes - postDownVotes;
    const commentKarma = commentUpVotes - commentDownVotes;
    const totalKarma = postKarma + commentKarma;

    // デバッグ用ログ（開発時のみ）
    console.log(`User ${userId} Karma:`, {
      postUpVotes,
      postDownVotes,
      postKarma,
      commentUpVotes,
      commentDownVotes,
      commentKarma,
      totalKarma,
    });

    return totalKarma;
  } catch (error) {
    console.error("Karma Score Calculation Error:", error);
    return 0; // エラー時は0を返す
  }
}

/**
 * より詳細なカルマスコア情報を取得
 */
export async function getDetailedKarmaScore(userId: string): Promise<{
  totalKarma: number;
  postKarma: number;
  commentKarma: number;
  breakdown: {
    postUpVotes: number;
    postDownVotes: number;
    commentUpVotes: number;
    commentDownVotes: number;
  };
}> {
  try {
    const postUpVotes = await prisma.postVote.count({
      where: { voteType: "UP", post: { userId } },
    });

    const postDownVotes = await prisma.postVote.count({
      where: { voteType: "DOWN", post: { userId } },
    });

    const commentUpVotes = await prisma.commentVote.count({
      where: { voteType: "UP", comment: { userId } },
    });

    const commentDownVotes = await prisma.commentVote.count({
      where: { voteType: "DOWN", comment: { userId } },
    });

    const postKarma = postUpVotes - postDownVotes;
    const commentKarma = commentUpVotes - commentDownVotes;
    const totalKarma = postKarma + commentKarma;

    return {
      totalKarma,
      postKarma,
      commentKarma,
      breakdown: {
        postUpVotes,
        postDownVotes,
        commentUpVotes,
        commentDownVotes,
      },
    };
  } catch (error) {
    console.error("Detailed Karma Score Error:", error);
    return {
      totalKarma: 0,
      postKarma: 0,
      commentKarma: 0,
      breakdown: {
        postUpVotes: 0,
        postDownVotes: 0,
        commentUpVotes: 0,
        commentDownVotes: 0,
      },
    };
  }
}

/**
 * カルマスコアの表示用フォーマット
 */
export function formatKarmaScore(score: number): {
  display: string;
  color: string;
  emoji: string;
} {
  if (score > 100) {
    return {
      display: `+${score}`,
      color: "text-green-600",
      emoji: "🏆",
    };
  } else if (score > 50) {
    return {
      display: `+${score}`,
      color: "text-green-500",
      emoji: "⭐",
    };
  } else if (score > 0) {
    return {
      display: `+${score}`,
      color: "text-green-400",
      emoji: "👍",
    };
  } else if (score === 0) {
    return {
      display: "0",
      color: "text-gray-500",
      emoji: "⚪",
    };
  } else if (score > -50) {
    return {
      display: `${score}`,
      color: "text-red-400",
      emoji: "👎",
    };
  } else if (score > -100) {
    return {
      display: `${score}`,
      color: "text-red-500",
      emoji: "🔻",
    };
  } else {
    return {
      display: `${score}`,
      color: "text-red-600",
      emoji: "💀",
    };
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
