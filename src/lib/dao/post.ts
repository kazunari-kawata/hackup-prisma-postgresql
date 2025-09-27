"use server";

import { redirect } from "next/navigation";
import { PostSchema } from "@/validations/contact";
import { prisma } from "@/lib/prisma";
import { PostLike, PostVote } from "@/generated/prisma";
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
    username: string | null;
    iconUrl: string | null;
  };
  likes?: PostLike[];
  votes?: PostVote[];
  comments?: Comment[];
};

// getPosts()から返される実際の型
export type PostWithUser = Awaited<ReturnType<typeof getPosts>>[number];
