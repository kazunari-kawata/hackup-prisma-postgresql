import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PostDetailView from "@/components/posts/PostDetailView";

// ISR設定: 5分ごとにページを再生成
export const revalidate = 300;

// 動的メタデータ生成（SEO最適化）
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      select: {
        title: true,
        content: true,
        user: {
          select: { username: true },
        },
      },
    });

    if (!post) {
      return {
        title: "投稿が見つかりません",
      };
    }

    const description = post.content.substring(0, 150) + "...";

    return {
      title: `${post.title} | Hackup`,
      description,
      openGraph: {
        title: post.title,
        description,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
      },
    };
  } catch (error) {
    console.error("[ISR] Error generating metadata:", error);
    return {
      title: "Hackup",
    };
  }
}

// 静的パスの生成（ビルド時に人気の投稿を事前生成）
export async function generateStaticParams() {
  try {
    // 最新の20件の投稿を事前生成
    const posts = await prisma.post.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    return posts.map((post) => ({
      id: post.id.toString(),
    }));
  } catch (error) {
    console.error("[ISR] Error generating static params:", error);
    return [];
  }
}

// 投稿データと統計情報を取得
async function getPost(id: string) {
  try {
    const postId = parseInt(id);

    // 投稿データを取得
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
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

    if (!post) return null;

    // 投票データを取得
    const votes = await prisma.postVote.findMany({
      where: { postId },
      select: {
        voteType: true,
        userId: true,
      },
    });

    // コメントデータを取得（初期表示用）
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      take: 10, // 最新10件
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            iconUrl: true,
          },
        },
      },
    });

    // 統計情報を追加
    const postWithStats = {
      ...post,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      upVoteCount: votes.filter((v) => v.voteType === "UP").length,
      downVoteCount: votes.filter((v) => v.voteType === "DOWN").length,
      isLiked: false, // クライアント側で判定
      userVote: null, // クライアント側で判定
      initialComments: comments.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
    };

    return postWithStats;
  } catch (error) {
    console.error("[ISR] Error fetching post:", error);
    return null;
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return <PostDetailView post={post} />;
}
