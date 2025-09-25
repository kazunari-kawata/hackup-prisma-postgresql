"use client";

import { useEffect, useState } from "react";
import { ThumbsDownIcon, ThumbsUpIcon } from "./Icons/ThumbsUpDown";

type VoteButtonsProps = {
  postId: number;
  userId: string;
};

export default function VoteButtons({ postId, userId }: VoteButtonsProps) {
  const [vote, setVote] = useState<"UP" | "DOWN" | null>(null);
  const [upCount, setUpCount] = useState(0);
  const [downCount, setDownCount] = useState(0);

  // アゲサゲボタン初期ロード
  useEffect(() => {
    const fetchVotes = async () => {
      const res = await fetch(`/api/post-votes?postId=${postId}`);
      const votes = await res.json();
      setUpCount(
        votes.filter((v: { voteType: string }) => v.voteType === "UP").length
      );
      setDownCount(
        votes.filter((v: { voteType: string }) => v.voteType === "DOWN").length
      );
      const myVote = votes.find((v: { userId: string }) => v.userId === userId);
      setVote(myVote?.voteType ?? null);
    };
    fetchVotes();
  }, [postId, userId]);

  // アゲサゲボタン押下時
  const handleVote = async (type: "UP" | "DOWN") => {
    if (vote === type) {
      // すでに同じ投票をしている場合は取り消し（削除）
      await fetch(`/api/post-votes?postId=${postId}&userId=${userId}`, {
        method: "DELETE",
      });
      setVote(null);
      if (type === "UP") setUpCount((c) => Math.max(0, c - 1));
      if (type === "DOWN") setDownCount((c) => Math.max(0, c - 1));
    } else {
      // 新規投票 or 切り替え（UP→DOWN, DOWN→UP）
      await fetch(`/api/post-votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: postId,
          userId: userId,
          voteType: type,
        }),
      });
      // 以前の投票を減らし、新しい投票を増やす
      if (vote === "UP") setUpCount((c) => Math.max(0, c - 1));
      if (vote === "DOWN") setDownCount((c) => Math.max(0, c - 1));
      if (type === "UP") setUpCount((c) => c + 1);
      if (type === "DOWN") setDownCount((c) => c + 1);
      setVote(type);
    }
  };

  return (
    <>
      <li>
        <button
          onClick={() => handleVote("UP")}
          className="flex items-center gap-1"
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
          onClick={() => handleVote("DOWN")}
          className="flex items-center gap-1"
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
