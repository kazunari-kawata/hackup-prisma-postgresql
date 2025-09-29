"use client";

import { useEffect, useState, useCallback } from "react";
import { LikeIcon, LikedIcon } from "./Icons/Likes";

type CommentLikeButtonProps = {
  commentId: number;
  userId: string;
};

export default function CommentLikeButton({
  commentId,
  userId,
}: CommentLikeButtonProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // いいねデータを取得する関数
  const fetchLikes = useCallback(async () => {
    try {
      const res = await fetch(`/api/comment-likes?commentId=${commentId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch comment likes");
      }
      const likes = await res.json();
      setLikeCount(likes.length);

      // userIdが空の場合はliked状態をfalseに設定
      if (!userId) {
        setLiked(false);
      } else {
        setLiked(
          likes.some((like: { userId: string }) => like.userId === userId)
        );
      }
    } catch (error) {
      console.error("Error fetching comment likes:", error);
    }
  }, [commentId, userId]);

  // いいねボタン初期ロード
  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  // いいねボタン押下時
  const handleLike = async () => {
    // 認証されていない場合は何もしない
    if (!userId) {
      console.warn("User not authenticated, cannot like");
      return;
    }

    if (loading) return; // 連続クリック防止

    setLoading(true);

    try {
      if (liked) {
        // いいねを削除
        const res = await fetch(
          `/api/comment-likes?commentId=${commentId}&userId=${userId}`,
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
        const res = await fetch(`/api/comment-likes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commentId: commentId, userId: userId }),
        });

        if (res.ok) {
          setLikeCount((c) => c + 1);
          setLiked(true);
        }
      }
    } catch (error) {
      console.error("Error handling comment like:", error);
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
        {liked ? <LikedIcon /> : <LikeIcon />}{" "}
        <span
          className={`font-medium ${
            liked ? "text-blue-600 ms-1" : "text-gray-500 ms-1"
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
