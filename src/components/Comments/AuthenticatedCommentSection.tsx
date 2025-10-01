"use client";

import { useState } from "react";
import { useAuthState } from "@/lib/auth/useAuth";
import PostCommentForm from "./PostCommentForm";
import CommentList from "./GetCommentList";

type AuthenticatedCommentSectionProps = {
  postId: number;
  onCommentChange?: () => void;
};

export default function AuthenticatedCommentSection({
  postId,
  onCommentChange,
}: AuthenticatedCommentSectionProps) {
  const { user, isAuthenticated } = useAuthState();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCommentCreated = () => {
    setRefreshKey((prev) => prev + 1);
    onCommentChange?.(); // 親コンポーネントに通知
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">
          コメントを投稿するにはログインが必要です
        </p>
      </div>
    );
  }

  return (
    <div>
      <PostCommentForm
        postId={postId}
        userId={user.uid} // 実際のログインユーザーのUID
        onCommentCreated={handleCommentCreated}
      />
      <CommentList postId={postId} key={refreshKey} currentuserId={user.uid} />
    </div>
  );
}
