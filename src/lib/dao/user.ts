type CreateUserParams = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
};

import { prisma } from "@/lib/prisma";

/**
 * すべてのユーザー情報を取得する関数
 * ユーザー管理画面やランキング表示など、全ユーザーの一覧を取得したいときに使います。
 */
export async function getUsers() {
  return await prisma.user.findMany({
    select: {
      id: true, // ユーザーID
      username: true, // ユーザー名
      iconUrl: true, // アイコン画像のURL
      karmaScore: true, // カルマスコア
    },
    orderBy: {
      id: "asc", // ID順に並べる
    },
  });
}

/**
 * 指定したIDのユーザー情報を取得する関数
 * @param id 取得したいユーザーのID
 * 例：プロフィール画面やユーザー詳細ページで使います。
 */
export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      iconUrl: true,
      karmaScore: true,
    },
  });
}

/**
 * 新しいユーザーを作成する関数
 * @param data username: ユーザー名, iconUrl: アイコン画像のURL（省略可）
 * 例：ユーザー登録画面で新規ユーザーを追加したいときに使います。
 */
export async function createUser({
  uid,
  email,
  displayName,
  photoURL,
}: CreateUserParams) {
  return await prisma.user.create({
    data: {
      id: uid,
      email,
      username: displayName,
      iconUrl: photoURL ?? null,
    },
    select: {
      id: true,
      email: true,
      username: true,
      iconUrl: true,
      karmaScore: true,
    },
  });
}

/**
 * ユーザー情報を更新する関数
 * @param id 更新したいユーザーのID
 * @param data username/iconUrl/karmaScore など変更したい項目
 * 例：ユーザーがプロフィールを編集したいときや、管理者がスコアを修正したいときに使います。
 */
export async function updateUser(
  id: string,
  data: { username?: string; iconUrl?: string; karmaScore?: number }
) {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      iconUrl: true,
      karmaScore: true,
    },
  });
}

/**
 * ユーザーを削除する関数
 * @param id 削除したいユーザーのID
 * 例：ユーザーが退会したいときや、管理者が不正ユーザーを削除したいときに使います。
 */
export async function deleteUser(id: string) {
  return await prisma.user.delete({
    where: { id },
    select: {
      id: true,
      username: true,
      iconUrl: true,
      karmaScore: true,
    },
  });
}
