import { prisma } from "@/lib/prisma";

/**
 * すべての投稿への「いいね」を取得する関数
 * 投稿に対して誰が「いいね」したかの全データを配列で返します。
 * 例：管理画面や集計などで利用できます。
 */
export async function getPostLikes(postId: number) {
  return await prisma.postLike.findMany({
    where: { postId: postId },
    select: {
      id: true, // いいねのID
      postId: true, // どの投稿へのいいねか
      userId: true, // どのユーザーがいいねしたか
      createdAt: true, // いいねした日時
    },
    orderBy: {
      createdAt: "desc", // 新しい順に並べる
    },
  });
}

/**
 * 指定したIDの「投稿いいね」1件を取得する関数
 * @param id 取得したいPostLikeのID
 * 例：詳細画面や個別操作時に利用します。
 */
export async function getPostLikeById(id: number) {
  return await prisma.postLike.findUnique({
    where: { id },
    select: {
      id: true,
      postId: true,
      userId: true,
      createdAt: true,
    },
  });
}

/**
 * 投稿に「いいね」を新規作成する関数
 * @param data postId: いいねする投稿のID, userId: いいねしたユーザーのID
 * 例：ユーザーが投稿にいいねボタンを押したときに呼び出します。
 */

export async function createPostLike(data: { postId: number; userId: string }) {
  return await prisma.postLike.create({
    data: {
      postId: data.postId,
      userId: data.userId,
    },
    select: {
      id: true,
      postId: true,
      userId: true,
      createdAt: true,
    },
  });
}

/**
 * IDを指定して「投稿いいね」を削除する関数
 * @param id 削除したいPostLikeのID
 * 例：管理者が不正な「いいね」を削除したい場合などに使います。
 */
export async function deletePostLike(id: number) {
  return await prisma.postLike.delete({
    where: { id },
    select: {
      id: true,
      postId: true,
      userId: true,
      createdAt: true,
    },
  });
}

/**
 * 投稿IDとユーザーIDの組み合わせで「投稿いいね」を削除する関数
 * @param postId どの投稿か
 * @param userId どのユーザーか
 * 例：ユーザーが自分の「いいね」を取り消したいときなどに使います。
 */
export async function deletePostLikeByPostAndUser(
  postId: number,
  userId: string
) {
  return await prisma.postLike.delete({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
    select: {
      id: true,
      postId: true,
      userId: true,
      createdAt: true,
    },
  });
}
