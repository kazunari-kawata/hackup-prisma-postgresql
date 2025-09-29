"use client";

import { useCallback, useEffect, useState } from "react";
import { ThumbsDownIcon, ThumbsUpIcon } from "./Icons/ThumbsUpDown";
import { useAuthState } from "@/lib/auth/useAuth";

type VoteButtonsProps = {
  postId: number;
  userId?: string; // オプショナルに変更（認証情報から自動取得）
};

export default function VoteButtons({
  postId,
  userId: propUserId,
}: VoteButtonsProps) {
  const { user, isAuthenticated } = useAuthState();
  const userId = propUserId || user?.uid || "";

  const [vote, setVote] = useState<"UP" | "DOWN" | null>(null);
  const [upCount, setUpCount] = useState(0);
  const [downCount, setDownCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 未認証ユーザーの場合は投票機能を無効化
  const canVote = isAuthenticated && userId;

  // 投票データを取得
  const fetchVotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/post-votes?postId=${postId}`);
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
      const myVote = votes.find((v: { userId: string }) => v.userId === userId);
      setVote(myVote?.voteType ?? null);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "データの取得に失敗しました";
      setError(errorMessage);
      console.error("Fetch Votes Error:", err);
    }
  }, [postId, userId]);

  // アゲサゲボタン初期ロード
  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  // アゲサゲボタン押下時
  const handleVote = async (type: "UP" | "DOWN") => {
    const prevVote = vote;
    const prevUpCount = upCount;
    const prevDownCount = downCount;

    try {
      if (vote === type) {
        // 同じ投票の取り消し
        const res = await fetch(
          `/api/post-votes?postId=${postId}&userId=${userId}`,
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
        const res = await fetch(`/api/post-votes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId,
            userId,
            voteType: type,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "投票の登録に失敗しました");
        }
        // サーバーから最新データを取得
        await fetchVotes();
      }
      setError(null);
    } catch (err) {
      setVote(prevVote);
      setUpCount(prevUpCount);
      setDownCount(prevDownCount);
      const errorMessage =
        err instanceof Error ? err.message : "投票に失敗しました";
      setError(errorMessage);
      console.error("Vote Error:", err);
    }
  };

  return (
    <>
      {error && <p className="text-red-500">{error}</p>}
      {!canVote && (
        <p className="text-gray-500 text-sm mb-2">
          投票するにはログインが必要です
        </p>
      )}
      <li>
        <button
          onClick={() => canVote && handleVote("UP")}
          disabled={!canVote}
          className={`flex items-center gap-1 ${
            !canVote ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span
            className={
              vote === "UP"
                ? "text-blue-500 flex items-center gap-1"
                : "flex items-center gap-1"
            }
          >
            <ThumbsUpIcon />
          </span>
          <span
            className={
              vote === "UP" ? "text-blue-500 ms-2" : "text-gray-400 ms-2"
            }
          >
            {upCount}
          </span>
        </button>
      </li>
      <li>
        <button
          onClick={() => canVote && handleVote("DOWN")}
          disabled={!canVote}
          className={`flex items-center gap-1 ${
            !canVote ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span
            className={
              vote === "DOWN"
                ? "text-red-500 flex items-center gap-1"
                : "flex items-center gap-1"
            }
          >
            <ThumbsDownIcon />
          </span>
          <span
            className={
              vote === "DOWN" ? "text-red-500 ms-2" : "text-gray-400 ms-2"
            }
          >
            {downCount}
          </span>
        </button>
      </li>
    </>
  );
}
