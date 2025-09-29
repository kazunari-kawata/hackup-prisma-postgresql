"use client";

import { useEffect, useState, useCallback } from "react";
import { LikeIcon, LikedIcon } from "./Icons/Likes";

type LikeButtonProps = {
  postId: number;
  userId: string;
};

export default function LikeButton({ postId, userId }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // いいねデータを取得する関数
  const fetchLikes = useCallback(async () => {
    try {
      const res = await fetch(`/api/post-likes?postId=${postId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch likes");
      }
      const likes = await res.json();

      // 全体のいいね数を設定（すべてのユーザーのいいねの合計）
      setLikeCount(likes.length);

      // 現在のユーザーがいいねしているかをチェック
      const currentUserLiked = likes.some(
        (like: { userId: string }) => like.userId === userId
      );
      setLiked(currentUserLiked);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, [postId, userId]);

  // 初期ロード時と userId が変更された時にデータを取得
  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  // いいねボタン押下時
  const handleLike = async () => {
    if (loading) return; // 連続クリック防止

    setLoading(true);

    try {
      if (liked) {
        // いいねを削除
        const res = await fetch(
          `/api/post-likes?postId=${postId}&userId=${userId}`,
          {
            method: "DELETE",
          }
        );

        if (res.ok) {
          setLikeCount((c) => c - 1);
          setLiked(false);
        }
      } else {
        // いいねを追加
        const res = await fetch(`/api/post-likes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: postId, userId: userId }),
        });

        if (res.ok) {
          setLikeCount((c) => c + 1);
          setLiked(true);
        }
      }
    } catch (error) {
      console.error("Error handling like:", error);
      // エラー時は最新データを再取得
      fetchLikes();
    } finally {
      setLoading(false);
    }
  };

  return (
    <li>
      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 disabled:opacity-50 ${
          liked
            ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
            : "text-gray-500 hover:text-blue-500 hover:bg-gray-50"
        }`}
      >
        {liked ? <LikedIcon /> : <LikeIcon />}
        <span
          className={`ms-1 font-medium ${
            liked ? "text-blue-600" : "text-gray-500"
          }`}
        >
          {likeCount}
        </span>
        {loading && (
          <div className="ml-1 animate-spin rounded-full h-3 w-3 border-b border-current"></div>
        )}
      </button>
    </li>
  );
}
