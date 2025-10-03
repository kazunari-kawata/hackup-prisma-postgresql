"use client";

import { useAuthState } from "@/lib/auth/useAuth";
import OptimizedPostCommentForm from "./OptimizedPostCommentForm";
import OptimizedCommentList from "./OptimizedCommentList";

type OptimizedCommentSectionProps = {
  postId: number;
};

export default function OptimizedCommentSection({
  postId,
}: OptimizedCommentSectionProps) {
  const { user, isAuthenticated } = useAuthState();

  if (!isAuthenticated || !user) {
    return (
      <div>
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 mb-4">
          <p className="text-gray-600 mb-3">
            コメントを投稿するにはログインが必要です
          </p>
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ログイン
          </a>
        </div>
        {/* ログインしていなくてもコメントは閲覧可能 */}
        <OptimizedCommentList postId={postId} currentUserId="" />
      </div>
    );
  }

  return (
    <div>
      {/* React Query版のコメントフォーム（オプティミスティック更新） */}
      <OptimizedPostCommentForm
        postId={postId}
        userId={user.uid}
        username={user.displayName}
        iconUrl={user.photoURL}
      />
      {/* React Query版のコメント一覧（自動キャッシュ・リアルタイム更新） */}
      <OptimizedCommentList postId={postId} currentUserId={user.uid} />
    </div>
  );
}
