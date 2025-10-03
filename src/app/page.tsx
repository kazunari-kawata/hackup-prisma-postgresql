import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import AuthenticatedHome from "@/components/pages/AuthenticatedHome";

// SSR化: 動的レンダリング + 60秒ごとのキャッシュ再検証
export const dynamic = "force-dynamic";
export const revalidate = 60;

// サーバー側で投稿データを取得
async function getInitialPosts() {
  try {
    const posts = await prisma.post.findMany({
      take: 10,
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

    // 投票データを一括取得
    const allVotes = await prisma.postVote.findMany({
      where: { postId: { in: postIds } },
      select: {
        postId: true,
        voteType: true,
        userId: true,
      },
    });

    // データを整形
    const postsWithStats = posts.map((post) => {
      const postVotes = allVotes.filter((v) => v.postId === post.id);

      return {
        ...post,
        createdAt: post.createdAt.toISOString(),
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        upVoteCount: postVotes.filter((v) => v.voteType === "UP").length,
        downVoteCount: postVotes.filter((v) => v.voteType === "DOWN").length,
        isLiked: false, // クライアント側で判定
        userVote: null, // クライアント側で判定
      };
    });

    return postsWithStats;
  } catch (error) {
    console.error("[SSR] Failed to fetch posts:", error);
    return [];
  }
}

export default async function Home() {
  // サーバー側でデータ取得
  const initialPosts = await getInitialPosts();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">読み込み中...</p>
        </div>
      }
    >
      <AuthenticatedHome initialPosts={initialPosts} />
    </Suspense>
  );
}
