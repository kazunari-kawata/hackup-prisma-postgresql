"use client";

import VoteButtons from "./_VoteButtons";
import LikeButton from "./LikeButton";
import CommentCount from "../Comments/CommentCount"; // 新しく作成したコンポーネントをインポート

type ReactionProps = {
  postId: number;
  userId: string;
};

export default function Reaction({ postId, userId }: ReactionProps) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-2 hidden">Post ID: {postId}</div>
      <ul className="md:text-xs flex space-x-4 gap-4">
        <LikeButton postId={postId} userId={userId} />
        <CommentCount postId={postId} />
        <VoteButtons postId={postId} userId={userId} />
      </ul>
    </div>
  );
}
