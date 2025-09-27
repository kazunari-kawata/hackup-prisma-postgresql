import { prisma } from "@/lib/prisma";

/**
 * すべての投稿への投票（UP/DOWN）を取得する関数
 * 投稿に対して誰がどんな投票をしたかの全データを配列で返します。
 * 例：管理画面や集計などで利用できます。
 */
export async function getPostVotes(postId: number) {
  return await prisma.postVote.findMany({
    where: { postId },
    select: {
      id: true, // 投票のID
      postId: true, // どの投稿への投票か
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
 * 指定したIDの投稿投票1件を取得する関数
 * @param id 取得したいPostVoteのID
 * 例：詳細画面や個別操作時に利用します。
 */
export async function getPostVoteById(postId: number, userId: string) {
  return await prisma.postVote.findUnique({
    where: { postId_userId: { postId, userId } }, // 複合ユニークキー名はschema.prismaに合わせて
    select: {
      id: true,
      postId: true,
      userId: true,
      voteType: true,
      createdAt: true,
    },
  });
}

/**
 * 投稿に投票（UP/DOWN）を新規作成する関数
 * @param data postId: 投票する投稿のID, userId: 投票したユーザーのID, voteType: "UP"または"DOWN"
 * 例：ユーザーが投稿にUP/DOWNボタンを押したときに呼び出します。
 */
export async function createPostVote(data: {
  postId: number;
  userId: string;
  voteType: "UP" | "DOWN";
}) {
  return await prisma.postVote.create({
    data: {
      // todo: ユーザーIDは実際のログインユーザーのIDを使用する必要があります。
      postId: data.postId,
      userId: data.userId,
      voteType: data.voteType,
    },
    select: {
      id: true,
      postId: true,
      userId: true,
      voteType: true,
      createdAt: true,
    },
  });
}

/**
 * IDを指定して投稿投票を削除する関数
 * @param id 削除したいPostVoteのID
 * 例：管理者が不正な投票を削除したい場合などに使います。
 */
export async function deletePostVote(id: number) {
  return await prisma.postVote.delete({
    where: { id },
    select: {
      id: true,
      postId: true,
      userId: true,
      voteType: true,
      createdAt: true,
    },
  });
}

/**
 * 投稿IDとユーザーIDの組み合わせで投稿投票を削除する関数
 * @param postId どの投稿か
 * @param userId どのユーザーか
 * 例：ユーザーが自分の投票を取り消したいときなどに使います。
 */
export async function deletePostVoteByPostAndUser(
  postId: number,
  userId: string
) {
  return await prisma.postVote.delete({
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
      voteType: true,
      createdAt: true,
    },
  });
}
