"use client";

import { useEffect, useState, useCallback } from "react";
import { BookmarkOutlinedIcon, BookmarkFilledIcon } from "./Icons/Bookmark";

type CommentBookmarkButtonProps = {
  commentId: number;
  userId: string;
};

export default function CommentBookmarkButton({
  commentId,
  userId,
}: CommentBookmarkButtonProps) {
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // 保存データを取得する関数
  const fetchBookmarks = useCallback(async () => {
    try {
      const res = await fetch(`/api/comment-likes?commentId=${commentId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch comment bookmarks");
      }
      const bookmarks = await res.json();
      setBookmarkCount(bookmarks.length);

      // userIdが空の場合はbookmarked状態をfalseに設定
      if (!userId) {
        setBookmarked(false);
      } else {
        setBookmarked(
          bookmarks.some(
            (bookmark: { userId: string }) => bookmark.userId === userId
          )
        );
      }
    } catch (error) {
      console.error("Error fetching comment bookmarks:", error);
    }
  }, [commentId, userId]);

  // 保存ボタン初期ロード
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // 保存ボタン押下時
  const handleBookmark = async () => {
    // 認証されていない場合は何もしない
    if (!userId) {
      console.warn("User not authenticated, cannot bookmark");
      return;
    }

    if (loading) return; // 連続クリック防止

    setLoading(true);

    try {
      if (bookmarked) {
        // 保存を削除
        const res = await fetch(
          `/api/comment-likes?commentId=${commentId}&userId=${userId}`,
          {
            method: "DELETE",
          }
        );

        if (res.ok) {
          setBookmarkCount((c) => c - 1);
          setBookmarked(false);
        }
      } else {
        // 保存を追加
        const res = await fetch(`/api/comment-likes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commentId: commentId, userId: userId }),
        });

        if (res.ok) {
          setBookmarkCount((c) => c + 1);
          setBookmarked(true);
        }
      }
    } catch (error) {
      console.error("Error handling comment bookmark:", error);
      // エラー時は最新データを再取得
      fetchBookmarks();
    } finally {
      setLoading(false);
    }
  };

  return (
    <li>
      <button
        onClick={handleBookmark}
        disabled={loading}
        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 disabled:opacity-50 ${
          bookmarked
            ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
            : "text-gray-500 hover:text-amber-500 hover:bg-gray-50"
        }`}
      >
        {bookmarked ? <BookmarkFilledIcon /> : <BookmarkOutlinedIcon />}{" "}
        <span
          className={`font-medium ${
            bookmarked ? "text-amber-600 ms-1" : "text-gray-500 ms-1"
          }`}
        >
          {bookmarkCount}
        </span>
        {loading && (
          <div className="ml-1 animate-spin rounded-full h-3 w-3 border-b border-current"></div>
        )}
      </button>
    </li>
  );
}
