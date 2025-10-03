"use server";

import { redirect } from "next/navigation";
import { PostSchema } from "@/validations/contact";
import { prisma } from "@/lib/prisma";
import { PostLike, PostVote } from "@prisma/client";
import { validateAuthenticatedUser } from "@/lib/auth/serverAuth";

// ActionStateの型定義
type ActionState = {
  success: boolean;
  errors: {
    title?: string[];
    content?: string[];
  };
  serverError?: string;
};

export async function submitPostForm(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  console.log("submitPostForm: Function called");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const userId = formData.get("userId") as string;

  console.log("submitPostForm: Received data", { title, content, userId });

  // バリデーション
  const validationResult = PostSchema.safeParse({ title, content });

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    console.log("submitPostForm: Validation failed", errors);
    return {
      success: false,
      errors: {
        title: errors.title || [],
        content: errors.content || [],
      },
    };
  }
  // DB登録
  //タイトルが存在しているかの確認
  const existingRecord = await prisma.post.findUnique({
    where: { title },
  });

  if (existingRecord) {
    return {
      success: false,
      errors: {
        title: ["この投稿内容は既に登録されています"],
        content: [],
      },
    };
  }

  // ユーザー認証チェック
  console.log("submitPostForm: Starting user authentication check");
  try {
    await validateAuthenticatedUser(userId);
    console.log("submitPostForm: User authentication successful");
  } catch (error) {
    console.log("submitPostForm: User authentication failed", error);
    return {
      success: false,
      errors: {
        title: [],
        content: [],
      },
      serverError:
        error instanceof Error ? error.message : "認証エラーが発生しました",
    };
  }

  console.log("submitPostForm: Creating post in database");
  await prisma.post.create({
    data: { title, content, userId: userId },
  });
  console.log("submitPostForm: Post created successfully", {
    title,
    content,
    userId,
  });

  console.log("送信されたデータ", title, content);
  redirect("/");
}

export async function getPosts() {
  return await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      userId: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          username: true,
          iconUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * すべての投稿データ（Post）を取得する関数
 * 投稿一覧ページやトップページなどで、全ての投稿を新しい順に取得したいときに使います。
 * タイトル・本文・IDのみを返します。
 */

export type Post = {
  id: number;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  user?: {
    id: string;
    username: string | null;
    iconUrl: string | null;
  };
  likes?: PostLike[];
  votes?: PostVote[];
  comments?: Comment[];
};

// getPosts()から返される実際の型
export type PostWithUser = Awaited<ReturnType<typeof getPosts>>[number];

/**
 * 最適化された投稿取得関数（統計情報付き）
 * N+1問題を回避し、必要なデータを効率的に取得
 */
export async function getPostsOptimized(params?: {
  limit?: number;
  offset?: number;
  userId?: string;
}) {
  const { limit = 10, offset = 0, userId } = params || {};

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
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  const postIds = posts.map((p) => p.id);

  // すべての投稿の投票データを一括取得
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

  // 投票統計を集計
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

  const likedPostIds = new Set(userLikes.map((l) => l.postId));

  // 統計情報付きで返す
  return posts.map((post) => ({
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
}

/**
 * 投稿詳細を取得する関数（リレーション含む）
 */
export async function getPostDetail(postId: number, userId?: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
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
      comments: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              iconUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
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
      userId: true,
      voteType: true,
    },
  });

  const upVotes = votes.filter((v) => v.voteType === "UP").length;
  const downVotes = votes.filter((v) => v.voteType === "DOWN").length;
  const userVote = userId
    ? votes.find((v) => v.userId === userId)?.voteType
    : undefined;

  // ユーザーのいいね状態
  let userLiked = false;
  if (userId) {
    const like = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
    userLiked = !!like;
  }

  return {
    ...post,
    stats: {
      likes: post._count.likes,
      comments: post._count.comments,
      upVotes,
      downVotes,
      userVote: userVote || null,
      userLiked,
    },
  };
}
