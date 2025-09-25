"use server";

import { redirect } from "next/navigation";
import { PostSchema } from "@/validations/contact";
import { prisma } from "@/lib/prisma";
import { PostLike, PostVote } from "@/generated/prisma";
import { User } from "next-auth";

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
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // バリデーション
  const validationResult = PostSchema.safeParse({ title, content });

  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    console.log("サーバー側でエラー", errors);
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
  // todo: ユーザーIDは実際のログインユーザーのIDを使用する必要があります。
  // !重要: ユーザーIDは実際のログインユーザーのIDを使用する必要があります。
  const userId = formData.get("userId") as string;
  await prisma.post.create({
    data: { title, content, userId: "1" },
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
  user?: User;
  likes?: PostLike[];
  votes?: PostVote[];
  comments?: Comment[];
};
