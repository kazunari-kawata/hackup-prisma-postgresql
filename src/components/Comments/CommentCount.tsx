"use client";

import { useEffect, useState } from "react";
import { CommentIcon } from "../Reaction/Icons/comment";

type CommentCountProps = {
  postId: number;
};

export default function CommentCount({ postId }: CommentCountProps) {
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
  }, [postId]);

  return (
    <li className="flex items-center gap-1">
      <CommentIcon />
      <span className="text-gray-400">{commentCount}</span>
    </li>
  );
}
