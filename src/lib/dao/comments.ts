import { prisma } from "@/lib/prisma";

/**
 * すべてのコメントを取得する関数
 * 投稿された全コメントを配列で返します。ユーザー情報も含みます。
 * 例：記事詳細ページや管理画面でコメント一覧を表示したいときに使います。
 */
export async function getComments(PostId: number) {
  return await prisma.comment.findMany({
    where: { postId: PostId },
    select: {
      id: true, // コメントのID
      postId: true, // どの投稿へのコメントか
      userId: true, // コメントしたユーザーのID
      content: true, // コメント本文
      createdAt: true, // コメントした日時
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          iconUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc", // 新しい順に並べる
    },
  });
}
export type Comment = {
  id: number;
  postId: number;
  userId: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    username: string | null;
    email: string | null;
    iconUrl: string | null;
  };
};
/**
 * 指定したIDのコメント1件を取得する関数
 * @param id 取得したいコメントのID
 * 例：コメント詳細画面や編集時に使います。
 */
export async function getCommentById(id: number) {
  return await prisma.comment.findUnique({
    where: { id },
    select: {
      id: true,
      postId: true,
      userId: true,
      content: true,
      createdAt: true,
    },
  });
}

/**
 * 新しいコメントを作成する関数
 * @param data postId: コメントする投稿のID, userId: コメントしたユーザーのID, content: コメント本文
 * 例：ユーザーがコメントを投稿したときに呼び出します。
 */
export async function createComment(data: {
  postId: number;
  userId: string;
  content: string;
}) {
  return await prisma.comment.create({
    data: {
      postId: data.postId,
      userId: data.userId,
      content: data.content,
    },
    select: {
      id: true,
      postId: true,
      userId: true,
      content: true,
      createdAt: true,
    },
  });
}

/**
 * コメント内容を更新する関数
 * @param id 更新したいコメントのID
 * @param data content: 新しいコメント本文
 * 例：ユーザーが自分のコメントを編集したいときに使います。
 */
export async function updateComment(id: number, data: { content?: string }) {
  return await prisma.comment.update({
    where: { id },
    data,
    select: {
      id: true,
      postId: true,
      userId: true,
      content: true,
      createdAt: true,
    },
  });
}

/**
 * コメントを削除する関数
 * @param id 削除したいコメントのID
 * 例：ユーザーが自分のコメントを削除したいときや、管理者が不適切なコメントを消したいときに使います。
 */
export async function deleteComment(id: number) {
  return await prisma.comment.delete({
    where: { id },
    select: {
      id: true,
      postId: true,
      userId: true,
      content: true,
      createdAt: true,
    },
  });
}
