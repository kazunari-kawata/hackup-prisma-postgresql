import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 投稿一覧を統計情報付きで取得する最適化されたAPI
 * N+1問題を解決するため、すべてのデータを1回のクエリで取得
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const userId = searchParams.get("userId") || undefined;

    // 投稿データと基本統計を取得
    const posts = await prisma.post.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            iconUrl: true,
          },
        },
        // 集計データを効率的に取得
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // 投稿IDリストを取得
    const postIds = posts.map((p) => p.id);

    // すべての投稿の投票データを一括取得（N+1問題を回避）
    const allVotes = await prisma.postVote.findMany({
      where: { postId: { in: postIds } },
      select: {
        postId: true,
        userId: true,
        voteType: true,
      },
    });

    // ユーザーのいいねデータを一括取得
    let userLikes: { postId: number }[] = [];
    if (userId) {
      userLikes = await prisma.postLike.findMany({
        where: {
          postId: { in: postIds },
          userId: userId,
        },
        select: {
          postId: true,
        },
      });
    }

    // 投稿IDごとに投票統計を集計
    const voteStats = postIds.reduce((acc, postId) => {
      const postVotes = allVotes.filter((v) => v.postId === postId);
      const upVotes = postVotes.filter((v) => v.voteType === "UP").length;
      const downVotes = postVotes.filter((v) => v.voteType === "DOWN").length;
      const userVote = userId
        ? postVotes.find((v) => v.userId === userId)?.voteType
        : undefined;

      acc[postId] = {
        upVotes,
        downVotes,
        userVote: userVote || null,
      };
      return acc;
    }, {} as Record<number, { upVotes: number; downVotes: number; userVote: string | null }>);

    // いいねデータをマップに変換
    const likedPostIds = new Set(userLikes.map((l) => l.postId));

    // レスポンスデータを構築
    const postsWithStats = posts.map((post) => ({
      ...post,
      stats: {
        likes: post._count.likes,
        comments: post._count.comments,
        upVotes: voteStats[post.id]?.upVotes || 0,
        downVotes: voteStats[post.id]?.downVotes || 0,
        userVote: voteStats[post.id]?.userVote || null,
        userLiked: likedPostIds.has(post.id),
      },
    }));

    return NextResponse.json({
      posts: postsWithStats,
      pagination: {
        limit,
        offset,
        total: posts.length,
      },
    });
  } catch (error) {
    console.error("Error fetching posts with stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// キャッシュ設定（Next.js 15対応）
export const dynamic = "force-dynamic"; // 常に最新データを取得
export const revalidate = 30; // 30秒ごとに再検証
export const maxDuration = 10; // Vercel: 最大10秒
