"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

interface PostActionsProps {
  postId: number;
  authorUid: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PostActions({
  postId,
  authorUid,
  onEdit,
  onDelete,
}: PostActionsProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 投稿者本人でない場合は何も表示しない
  if (!user || user.uid !== authorUid) {
    return null;
  }

  const handleDelete = async () => {
    if (!confirm("この投稿を削除しますか？この操作は取り消せません。")) {
      return;
    }

    setIsDeleting(true);
    setIsMenuOpen(false);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uid,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "削除に失敗しました");
      }

      onDelete?.();
      window.location.reload();
    } catch (error) {
      console.error("削除エラー:", error);
      alert(error instanceof Error ? error.message : "削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsMenuOpen(false);
    onEdit?.();
  };

  return (
    <div className="relative">
      {/* 三点リーダーボタン */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        disabled={isDeleting}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path d="M10 4a2 2 0 100-4 2 2 0 000 4z" />
          <path d="M10 20a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>

      {/* ドロップダウンメニュー */}
      {isMenuOpen && (
        <>
          {/* 背景オーバーレイ */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* メニュー */}
          <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              編集
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {isDeleting ? "削除中..." : "削除"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
