"use client";

import CommentBookmarkButton from "./CommentBookmarkButton";
import CommentVoteButtons from "./CommentVoteButtons";

type CommentReactionProps = {
  commentId: number;
  userId: string;
};

export default function CommentReaction({
  commentId,
  userId,
}: CommentReactionProps) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-2 hidden">
        Comment ID: {commentId}
      </div>
      <ul className="md:text-xs flex space-x-4 gap-4">
        <CommentVoteButtons commentId={commentId} userId={userId} />
        <CommentBookmarkButton commentId={commentId} userId={userId} />
      </ul>
    </div>
  );
}
