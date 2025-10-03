"use client";

import { useState } from "react";
import { useCreateComment } from "@/hooks/useComments";

type OptimizedPostCommentFormProps = {
  postId: number;
  userId: string;
  username: string | null;
  iconUrl: string | null;
};

export default function OptimizedPostCommentForm({
  postId,
  userId,
  username,
  iconUrl,
}: OptimizedPostCommentFormProps) {
  const [newComment, setNewComment] = useState("");
  const createCommentMutation = useCreateComment(postId);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const content = newComment;
    setNewComment(""); // フォームを即座にクリア

    // オプティミスティック更新で即座にUIに反映
    createCommentMutation.mutate(
      {
        postId,
        userId,
        content,
        username,
        iconUrl,
      },
      {
        onError: (error) => {
          // エラー時はコメントを復元
          setNewComment(content);
          console.error("Comment submission failed:", error);
        },
      }
    );
  };

  return (
    <div className="mt-8 mb-4">
      <form onSubmit={handleCommentSubmit} className="mt-2">
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="コメントを入力..."
          disabled={createCommentMutation.isPending}
        />
        <div className="mt-2 flex justify-between items-center">
          {createCommentMutation.isError && (
            <div className="text-red-500 text-sm">
              {createCommentMutation.error instanceof Error
                ? createCommentMutation.error.message
                : "コメントの送信に失敗しました"}
            </div>
          )}
          <div className="flex-1" />
          <button
            type="submit"
            className="bg-black text-white rounded-md px-4 py-2 transition-all duration-150 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={createCommentMutation.isPending || !newComment.trim()}
          >
            {createCommentMutation.isPending ? "送信中..." : "コメントする"}
          </button>
        </div>
      </form>
      <span className="border-t border-gray-300 block mt-4"></span>
    </div>
  );
}
