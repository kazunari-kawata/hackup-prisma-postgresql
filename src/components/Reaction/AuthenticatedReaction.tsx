"use client";

import { useAuthState } from "@/lib/auth/useAuth";
import VoteButtons from "./VoteButtons";
import LikeButton from "./LikeButton";
import CommentCount from "../Comments/CommentCount";

type AuthenticatedReactionProps = {
  postId: number;
  commentRefreshTrigger?: number;
};

export default function AuthenticatedReaction({
  postId,
  commentRefreshTrigger,
}: AuthenticatedReactionProps) {
  const { user, isAuthenticated } = useAuthState();

  return (
    <div>
      <div className="text-xs text-gray-400 mb-2 hidden">Post ID: {postId}</div>
      <ul className="md:text-xs flex space-x-4 gap-4">
        <VoteButtons
          postId={postId}
          userId={isAuthenticated && user ? user.uid : "guest"}
        />
        <CommentCount postId={postId} refreshTrigger={commentRefreshTrigger} />
        <LikeButton
          postId={postId}
          userId={isAuthenticated && user ? user.uid : "guest"}
        />
      </ul>
    </div>
  );
}
