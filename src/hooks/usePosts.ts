"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostWithStats, PostsWithStatsResponse } from "@/types/post";

/**
 * 投稿一覧を取得するカスタムフック
 */
export function usePosts(params?: {
  limit?: number;
  offset?: number;
  userId?: string;
}) {
  const { limit = 50, offset = 0, userId } = params || {};

  return useQuery<PostsWithStatsResponse>({
    queryKey: ["posts", limit, offset, userId],
    queryFn: async () => {
      const userIdParam = userId ? `&userId=${userId}` : "";
      const response = await fetch(
        `/api/posts/with-stats?limit=${limit}&offset=${offset}${userIdParam}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2分間はキャッシュを使用
    gcTime: 5 * 60 * 1000, // 5分間メモリに保持
  });
}

/**
 * 投稿詳細を取得するカスタムフック
 */
export function usePost(postId: number, userId?: string) {
  return useQuery<PostWithStats>({
    queryKey: ["post", postId, userId],
    queryFn: async () => {
      const userIdParam = userId ? `&userId=${userId}` : "";
      const response = await fetch(
        `/api/posts/${postId}?userId=${userIdParam}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }
      return response.json();
    },
    staleTime: 3 * 60 * 1000, // 3分間はキャッシュを使用
  });
}

/**
 * 投票を更新するカスタムフック
 */
export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      postId: number;
      userId: string;
      voteType: "UP" | "DOWN";
    }) => {
      const response = await fetch(`/api/post-votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error("Failed to vote");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      // 投稿一覧のキャッシュを無効化して再取得
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      // 該当投稿のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
    },
  });
}

/**
 * 投票を削除するカスタムフック
 */
export function useDeleteVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { postId: number; userId: string }) => {
      const response = await fetch(
        `/api/post-votes?postId=${params.postId}&userId=${params.userId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete vote");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
    },
  });
}

/**
 * いいねを切り替えるカスタムフック
 */
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      postId: number;
      userId: string;
      isLiked: boolean;
    }) => {
      const method = params.isLiked ? "DELETE" : "POST";
      const url = params.isLiked
        ? `/api/post-likes?postId=${params.postId}&userId=${params.userId}`
        : `/api/post-likes`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify(params) : undefined,
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
    },
  });
}

/**
 * 投稿を作成するカスタムフック
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      content: string;
      userId: string;
    }) => {
      const response = await fetch(`/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error("Failed to create post");
      }
      return response.json();
    },
    onSuccess: () => {
      // 投稿一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

/**
 * 投稿を削除するカスタムフック
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
