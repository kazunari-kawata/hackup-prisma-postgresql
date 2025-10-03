"use client";

import { useComments, useDeleteComment } from "@/hooks/useComments";
import CommentHeader from "./CommentHeader";
import CommentReaction from "../Reaction/CommentReaction";

type OptimizedCommentListProps = {
  postId: number;
  currentUserId: string;
};

export default function OptimizedCommentList({
  postId,
  currentUserId,
}: OptimizedCommentListProps) {
  const { data: comments, isLoading, error } = useComments(postId);
  const deleteCommentMutation = useDeleteComment(postId);

  const handleDelete = async (commentId: number) => {
    console.log(
      "[OptimizedCommentList] Delete called for commentId:",
      commentId
    );

    deleteCommentMutation.mutate(commentId, {
      onError: (error) => {
        console.error("[OptimizedCommentList] Delete error:", error);
        alert(
          error instanceof Error
            ? error.message
            : "コメントの削除に失敗しました"
        );
      },
      onSuccess: () => {
        console.log("[OptimizedCommentList] Delete successful");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="ml-3 text-gray-600">コメント読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">コメントの取得に失敗しました</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        まだコメントがありません
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className={`transition-all duration-300 ${
            comment.id > 1000000000000 // 一時的なID（オプティミスティック）
              ? "opacity-70 animate-pulse"
              : "opacity-100"
          }`}
        >
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
            <CommentHeader
              userName={
                comment.user.username ||
                comment.user.email?.split("@")[0] ||
                "ユーザー"
              }
              userAvatarUrl={comment.user.iconUrl || undefined}
              timestamp={new Date(comment.createdAt).toLocaleString("ja-JP", {
                timeZone: "Asia/Tokyo",
              })}
              commentId={comment.id}
              authorUid={comment.userId}
              onDelete={() => handleDelete(comment.id)}
            />
            <div className="text-gray-700 leading-relaxed whitespace-pre-line ml-8">
              {comment.content}
            </div>
            {/* オプティミスティック更新中のコメント（仮ID）ではリアクションを表示しない */}
            {comment.id <= 1000000000000 && (
              <div className="flex mt-2 justify-center items-center">
                <CommentReaction
                  commentId={comment.id}
                  userId={currentUserId}
                />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
