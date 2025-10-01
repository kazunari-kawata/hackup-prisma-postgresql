"use client";

import { useEffect, useState } from "react";
import { CommentIcon } from "../Reaction/Icons/Comment";

type CommentCountProps = {
  postId: number;
  refreshTrigger?: number; // 外部からの更新トリガー
};

export default function CommentCount({
  postId,
  refreshTrigger,
}: CommentCountProps) {
  // 実際には、この部分でAPIを叩いてコメント数を取得します
  // 現在は0で固定
  const [commentCount, setCommentCount] = useState(0);

  // コメント数をAPIから取得する場合のロジック
  useEffect(() => {
    const fetchComments = async () => {
      const res = await fetch(`/api/comments?postId=${postId}`);
      const comments = await res.json();
      setCommentCount(comments.length);
    };
    fetchComments();
  }, [postId, refreshTrigger]); // refreshTrigger を依存配列に追加

  return (
    <li className="flex items-center gap-1 px-2 py-1">
      <CommentIcon />
      <span className="text-gray-400">{commentCount}</span>
    </li>
  );
}
