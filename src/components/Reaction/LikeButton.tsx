"use client";

import { useEffect, useState, useCallback } from "react";
import { BookmarkOutlinedIcon, BookmarkFilledIcon } from "./Icons/Bookmark";

type LikeButtonProps = {
  postId: number;
  userId: string;
};

export default function LikeButton({ postId, userId }: LikeButtonProps) {
  const [saveCount, setSaveCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // 保存データを取得する関数
  const fetchSaves = useCallback(async () => {
    try {
      const res = await fetch(`/api/post-likes?postId=${postId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch likes");
      }
      const saves = await res.json();

      // 全体の保存数を設定（すべてのユーザーの保存の合計）
      setSaveCount(saves.length);

      // 現在のユーザーが保存しているかをチェック
      const currentUserSaved = saves.some(
        (save: { userId: string }) => save.userId === userId
      );
      setSaved(currentUserSaved);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, [postId, userId]);

  // 初期ロード時と userId が変更された時にデータを取得
  useEffect(() => {
    fetchSaves();
  }, [fetchSaves]);

  // 保存ボタン押下時
  const handleSave = async () => {
    if (loading) return; // 連続クリック防止

    setLoading(true);

    try {
      if (saved) {
        // 保存を削除
        const res = await fetch(
          `/api/post-likes?postId=${postId}&userId=${userId}`,
          {
            method: "DELETE",
          }
        );

        if (res.ok) {
          setSaveCount((c) => c - 1);
          setSaved(false);
        }
      } else {
        // 保存を追加
        const res = await fetch(`/api/post-likes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: postId, userId: userId }),
        });

        if (res.ok) {
          setSaveCount((c) => c + 1);
          setSaved(true);
        }
      }
    } catch (error) {
      console.error("Error handling save:", error);
      // エラー時は最新データを再取得
      fetchSaves();
    } finally {
      setLoading(false);
    }
  };

  return (
    <li>
      <button
        onClick={handleSave}
        disabled={loading}
        className={`flex items-center justify-center gap-1 px-2 py-1 rounded-md transition-all duration-200 disabled:opacity-50 ${
          saved
            ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
            : "text-gray-500 hover:text-blue-500 hover:bg-gray-50"
        }`}
      >
        {saved ? <BookmarkFilledIcon /> : <BookmarkOutlinedIcon />}
        <span
          className={`ms-1 font-medium ${
            saved ? "text-blue-600" : "text-gray-500"
          }`}
        >
          {saveCount > 0 ? saveCount : ""}
        </span>
        {loading && (
          <div className="ml-1 animate-spin rounded-full h-3 w-3 border-b border-current"></div>
        )}
      </button>
    </li>
  );
}
