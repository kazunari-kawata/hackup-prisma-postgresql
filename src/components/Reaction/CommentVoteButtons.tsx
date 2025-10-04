"use client";

import { useCallback, useEffect, useState } from "react";
import { ThumbsDownIcon, ThumbsUpIcon } from "./Icons/ThumbsUpDown";

type CommentVoteButtonsProps = {
  commentId: number;
  userId: string;
};

export default function CommentVoteButtons({
  commentId,
  userId,
}: CommentVoteButtonsProps) {
  const [vote, setVote] = useState<"UP" | "DOWN" | null>(null);
  const [upCount, setUpCount] = useState(0);
  const [downCount, setDownCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 投票データを取得
  const fetchVotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/comment-votes?commentId=${commentId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "投票データの取得に失敗しました");
      }
      const votes = await res.json();
      setUpCount(
        votes.filter((v: { voteType: string }) => v.voteType === "UP").length
      );
      setDownCount(
        votes.filter((v: { voteType: string }) => v.voteType === "DOWN").length
      );

      // userIdが空の場合は投票状態をnullに設定
      if (!userId) {
        setVote(null);
      } else {
        const myVote = votes.find(
          (v: { userId: string }) => v.userId === userId
        );
        setVote(myVote?.voteType ?? null);
      }

      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "データの取得に失敗しました";
      setError(errorMessage);
      console.error("Fetch Comment Votes Error:", err);
    }
  }, [commentId, userId]);

  // アゲサゲボタン初期ロード
  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  // アゲサゲボタン押下時
  const handleVote = async (type: "UP" | "DOWN") => {
    // 認証されていない場合は何もしない
    if (!userId) {
      console.warn("User not authenticated, cannot vote");
      return;
    }

    const prevVote = vote;
    const prevUpCount = upCount;
    const prevDownCount = downCount;

    try {
      if (vote === type) {
        // 同じ投票の取り消し
        const res = await fetch(
          `/api/comment-votes?commentId=${commentId}&userId=${userId}`,
          {
            method: "DELETE",
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "投票の取り消しに失敗しました");
        }
        setVote(null);
        setUpCount((c) => (type === "UP" ? Math.max(0, c - 1) : c));
        setDownCount((c) => (type === "DOWN" ? Math.max(0, c - 1) : c));
      } else {
        // 新規投票 or 切り替え
        // 楽観的UI更新（先にUIを更新）
        const previousVote = vote;
        setVote(type);

        if (previousVote === "UP") {
          // UPからDOWNへ切り替え
          setUpCount((c) => Math.max(0, c - 1));
          setDownCount((c) => c + 1);
        } else if (previousVote === "DOWN") {
          // DOWNからUPへ切り替え
          setDownCount((c) => Math.max(0, c - 1));
          setUpCount((c) => c + 1);
        } else {
          // 新規投票
          if (type === "UP") {
            setUpCount((c) => c + 1);
          } else {
            setDownCount((c) => c + 1);
          }
        }

        const res = await fetch(`/api/comment-votes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commentId,
            userId,
            voteType: type,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "投票の登録に失敗しました");
        }
      }
      setError(null);
    } catch (err) {
      setVote(prevVote);
      setUpCount(prevUpCount);
      setDownCount(prevDownCount);
      const errorMessage =
        err instanceof Error ? err.message : "投票に失敗しました";
      setError(errorMessage);
      console.error("Comment Vote Error:", err);
    }
  };

  return (
    <>
      {error && <p className="text-red-500">{error}</p>}
      <li>
        <button
          onClick={() => handleVote("UP")}
          className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 ${
            vote === "UP"
              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
              : "text-gray-500 hover:text-blue-500 hover:bg-gray-50"
          }`}
        >
          <ThumbsUpIcon />
          <span
            className={`font-medium ms-2 ${
              vote === "UP" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {upCount}
          </span>
        </button>
      </li>
      <li>
        <button
          onClick={() => handleVote("DOWN")}
          className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 ${
            vote === "DOWN"
              ? "text-red-600 bg-red-50 hover:bg-red-100"
              : "text-gray-500 hover:text-red-500 hover:bg-gray-50"
          }`}
        >
          <ThumbsDownIcon />
          <span
            className={`font-medium ms-2 ${
              vote === "DOWN" ? "text-red-600" : "text-gray-500"
            }`}
          >
            {downCount}
          </span>
        </button>
      </li>
    </>
  );
}
