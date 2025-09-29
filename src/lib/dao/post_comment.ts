// app/dao/comments.ts
"use server";

import { prisma } from "@/lib/prisma";

// コメント一覧を取得するサーバーアクション
export async function getCommentsAction(postId: number) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: postId },
      orderBy: { createdAt: "desc" },
      // ユーザー情報も取得したい場合はincludeを使用
      include: {
        user: {
          select: { username: true },
        },
      },
    });
    return comments;
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return []; // 失敗した場合は空の配列を返す
  }
}

// 新規コメントを作成するサーバーアクション
export async function createCommentAction(data: {
  postId: number;
  userId: string;
  content: string;
}) {
  try {
    const comment = await prisma.comment.create({
      data: {
        postId: data.postId,
        userId: data.userId,
        content: data.content,
      },
    });
    return comment;
  } catch (error) {
    console.error("Failed to create comment:", error);
    return null; // 失敗した場合はnullを返す
  }
}

// コメントを削除するサーバーアクション
export async function deleteCommentAction(commentId: number) {
  try {
    await prisma.comment.delete({
      where: { id: commentId },
    });
    return true; // 成功
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return false; // 失敗
  }
}
