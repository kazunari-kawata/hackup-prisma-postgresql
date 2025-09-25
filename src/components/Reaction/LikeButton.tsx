"use client";

import { useEffect, useState } from "react";
import { LikeIcon, LikedIcon } from "./Icons/Likes";

type LikeButtonProps = {
  postId: number;
  userId: string;
};

export default function LikeButton({ postId, userId }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  // いいねボタン初期ロード
  useEffect(() => {
    const fetchLikes = async () => {
      const res = await fetch(`/api/post-likes?postId=${postId}`);
      const likes = await res.json();
      setLikeCount(likes.length);
      setLiked(
        likes.some((like: { userId: string }) => like.userId === userId)
      );
    };
    fetchLikes();
  }, [postId, userId]);

  // いいねボタン押下時
  const handleLike = async () => {
    if (liked) {
      await fetch(`/api/post-likes?postId=${postId}&userId=${userId}`, {
        method: "DELETE",
      });
      setLikeCount((c) => c - 1);
      setLiked(false);
    } else {
      await fetch(`/api/post-likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: postId, userId: userId }),
      });
      setLikeCount((c) => c + 1);
      setLiked(true);
    }
  };

  return (
    <li>
      <button
        onClick={handleLike}
        className={(liked ? "text-blue-500 " : "") + "flex items-center gap-1"}
      >
        {liked ? <LikedIcon /> : <LikeIcon />} {" "}
        <span className={liked ? "text-blue-500 ms-1" : "text-gray-400 ms-1"}>
          {likeCount}
        </span>
      </button>
    </li>
  );
}
