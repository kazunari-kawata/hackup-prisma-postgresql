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

  console.log("[VoteButtons] Component mounted/updated:", {
    postId,
    propUserId,
    userUid: user?.uid,
    userId,
    isAuthenticated,
  });

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
      // 認証済みユーザーの場合のみ自分の投票を確認
      if (userId) {
        const myVote = votes.find(
          (v: { userId: string }) => v.userId === userId
        );
        setVote(myVote?.voteType ?? null);
      }
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "投票データの取得に失敗しました";
      setError(errorMessage);
      console.error("Fetch Votes Error:", err);
    }
  }, [postId, userId]);

  // アゲサゲボタン初期ロード
  useEffect(() => {
    // postIdが有効な場合のみ投票データを取得
    if (postId) {
      fetchVotes();
    }
  }, [postId, fetchVotes]);

  // アゲサゲボタン押下時
  const handleVote = async (type: "UP" | "DOWN") => {
    console.log("[VoteButtons] Vote button clicked:", {
      postId,
      userId,
      type,
      canVote,
    });

    if (!canVote) {
      console.warn("[VoteButtons] User not authenticated, cannot vote");
      return;
    }

    const prevVote = vote;
    const prevUpCount = upCount;
    const prevDownCount = downCount;

    try {
      if (vote === type) {
        // 同じ投票の取り消し
        console.log("[VoteButtons] Canceling vote:", type);
        const res = await fetch(
          `/api/post-votes?postId=${postId}&userId=${userId}`,
          {
            method: "DELETE",
          }
        );

        console.log("[VoteButtons] DELETE response status:", res.status);

        if (!res.ok) {
          const errorData = await res.json();
          console.error("[VoteButtons] DELETE failed:", errorData);
          throw new Error(errorData.error || "投票の取り消しに失敗しました");
        }
        setVote(null);
        setUpCount((c) => (type === "UP" ? Math.max(0, c - 1) : c));
        setDownCount((c) => (type === "DOWN" ? Math.max(0, c - 1) : c));
      } else {
        // 新規投票 or 切り替え
        console.log("[VoteButtons] Creating/updating vote:", {
          postId,
          userId,
          voteType: type,
          userIdType: typeof userId,
          userIdLength: userId?.length,
          isUserIdValid: !!userId && userId.length > 0,
        });

        // userIdが空の場合はエラー
        if (!userId || userId.length === 0) {
          console.error("[VoteButtons] userId is empty or invalid");
          throw new Error(
            "ユーザーIDが無効です。ログイン状態を確認してください。"
          );
        }

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

        const requestBody = {
          postId: Number(postId),
          userId: String(userId),
          voteType: type,
        };

        console.log("[VoteButtons] Request body:", requestBody);

        const res = await fetch(`/api/post-votes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        console.log("[VoteButtons] POST response status:", res.status);

        if (!res.ok) {
          const errorData = await res.json();
          console.error("[VoteButtons] POST failed:", errorData);
          console.error("[VoteButtons] Full error details:", {
            status: res.status,
            statusText: res.statusText,
            errorData,
          });

          // より詳細なエラーメッセージ
          const errorMsg = errorData.details
            ? `${errorData.error}: ${JSON.stringify(errorData.details)}`
            : errorData.error || "投票の登録に失敗しました";

          throw new Error(errorMsg);
        }

        console.log(
          "[VoteButtons] Vote successful (optimistic update applied)"
        );
      }
      setError(null);
    } catch (err) {
      console.error("[VoteButtons] Vote error:", err);
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
      {error && (
        <div className="text-red-500 text-sm mb-2 p-2 bg-red-50 rounded border border-red-200">
          <p className="font-semibold">エラー:</p>
          <p>{error}</p>
          {!canVote && (
            <p className="mt-1 text-xs">
              ログインしていないか、認証情報が無効です
            </p>
          )}
        </div>
      )}
      {!canVote && !error && (
        <p className="text-gray-500 text-sm mb-2">
          投票するにはログインが必要です
        </p>
      )}
      <li>
        <button
          onClick={() => canVote && handleVote("UP")}
          disabled={!canVote}
          className={`flex items-center gap-1 px-2 py-1 ${
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
          className={`flex items-center gap-1 px-2 py-1 ${
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
