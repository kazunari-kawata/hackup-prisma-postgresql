/**
 * Server Actions で認証が必要な処理を行う際のヘルパー関数
 * クライアントサイドから明示的にuserIdを渡すことで認証状態を確認
 */
export async function validateAuthenticatedUser(userId: string | null) {
  if (!userId || userId === "guest") {
    throw new Error("認証が必要です。ログインしてください。");
  }
  return userId;
}
