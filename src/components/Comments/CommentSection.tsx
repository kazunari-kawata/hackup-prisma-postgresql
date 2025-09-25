// components/CommentSection.tsx
"use client";

import { useState } from "react";
import PostCommentForm from "./PostCommentForm";
import CommentList from "./GetCommentList";

type CommentSectionProps = {
  postId: number;
  userId: string;
};

// CommentSection.tsx
export default function CommentSection({
  postId,
  userId,
}: CommentSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCommentCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <PostCommentForm
        postId={postId}
        userId={userId}
        onCommentCreated={handleCommentCreated}
      />
      <CommentList postId={postId} key={refreshKey} currentuserId={userId} />
    </div>
  );
}
