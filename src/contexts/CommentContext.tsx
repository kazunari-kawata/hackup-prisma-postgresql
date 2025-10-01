"use client";

import { createContext, useContext, useState, useCallback } from "react";

type CommentContextType = {
  commentCounts: Record<number, number>;
  updateCommentCount: (postId: number, count: number) => void;
  incrementCommentCount: (postId: number) => void;
  decrementCommentCount: (postId: number) => void;
};

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export function CommentProvider({ children }: { children: React.ReactNode }) {
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>(
    {}
  );

  const updateCommentCount = useCallback((postId: number, count: number) => {
    setCommentCounts((prev) => ({ ...prev, [postId]: count }));
  }, []);

  const incrementCommentCount = useCallback((postId: number) => {
    setCommentCounts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  }, []);

  const decrementCommentCount = useCallback((postId: number) => {
    setCommentCounts((prev) => ({
      ...prev,
      [postId]: Math.max(0, (prev[postId] || 0) - 1),
    }));
  }, []);

  return (
    <CommentContext.Provider
      value={{
        commentCounts,
        updateCommentCount,
        incrementCommentCount,
        decrementCommentCount,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
}

export function useCommentContext() {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error("useCommentContext must be used within a CommentProvider");
  }
  return context;
}
