import { prisma } from "@/lib/prisma";

/**
 * コメントへの投票（UP/DOWN）全件を取得する関数
 * すべてのCommentVoteレコード（誰がどのコメントに投票したか）を配列で返します。
 * 例：管理画面や集計などで利用できます。
 */
export async function getCommentVotes() {
  return await prisma.commentVote.findMany({
    select: {
      id: true, // 投票のID
      commentId: true, // どのコメントへの投票か
      userId: true, // どのユーザーが投票したか
      voteType: true, // UPかDOWNか
      createdAt: true, // 投票した日時
    },
    orderBy: {
      createdAt: "desc", // 新しい順に並べる
    },
  });
}

/**
 * 指定したIDのコメント投票1件を取得する関数
 * @param id 取得したいCommentVoteのID
 * 例：詳細画面や個別操作時に利用します。
 */
export async function getCommentVoteById(id: number) {
  return await prisma.commentVote.findUnique({
    where: { id },
    select: {
      id: true,
      commentId: true,
      userId: true,
      voteType: true,
      createdAt: true,
    },
  });
}

/**
 * コメントに投票（UP/DOWN）を新規作成する関数
 * @param data commentId: 投票するコメントのID, userId: 投票したユーザーのID, voteType: "UP"または"DOWN"
 * 例：ユーザーがコメントにUP/DOWNボタンを押したときに呼び出します。
 */
export async function createCommentVote(data: {
  commentId: number;
  userId: string;
  voteType: "UP" | "DOWN";
}) {
  return await prisma.commentVote.create({
    data: {
      commentId: data.commentId,
      userId: data.userId,
      voteType: data.voteType,
    },
    select: {
      id: true,
      commentId: true,
      userId: true,
      voteType: true,
      createdAt: true,
    },
  });
}

/**
 * IDを指定してコメント投票を削除する関数
 * @param id 削除したいCommentVoteのID
 * 例：管理者が不正な投票を削除したい場合などに使います。
 */
export async function deleteCommentVote(id: number) {
  return await prisma.commentVote.delete({
    where: { id },
    select: {
      id: true,
      commentId: true,
      userId: true,
      voteType: true,
      createdAt: true,
    },
  });
}

/**
 * コメントIDとユーザーIDの組み合わせでコメント投票を削除する関数
 * @param commentId どのコメントか
 * @param userId どのユーザーか
 * 例：ユーザーが自分の投票を取り消したいときなどに使います。
 */
export async function deleteCommentVoteByCommentAndUser(
  commentId: number,
  userId: string
) {
  return await prisma.commentVote.delete({
    where: {
      commentId_userId: {
        commentId,
        userId,
      },
    },
    select: {
      id: true,
      commentId: true,
      userId: true,
      voteType: true,
      createdAt: true,
    },
  });
}
