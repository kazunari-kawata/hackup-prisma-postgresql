"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostWithStats, PostsWithStatsResponse } from "@/types/post";

/**
 * 投稿一覧を取得するカスタムフック
 */
export function usePosts(
  params?: {
    limit?: number;
    offset?: number;
    userId?: string;
  },
  initialData?: PostsWithStatsResponse
) {
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
    initialData, // SSRで取得したデータを初期値として使用
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
 * 投稿を作成するカスタムフック（楽観的更新）
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      content: string;
      userId: string;
      username?: string | null;
      iconUrl?: string | null;
    }) => {
      const response = await fetch(`/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: params.title,
          content: params.content,
          userId: params.userId,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }
      return response.json();
    },
    onMutate: async (newPostData) => {
      // 進行中のすべての投稿関連クエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // 楽観的更新: 一時的なIDで新しい投稿を即座に表示
      const tempId = Date.now() + 1000000000000; // 大きな数値で識別
      const optimisticPost = {
        id: tempId,
        title: newPostData.title,
        content: newPostData.content,
        userId: newPostData.userId,
        createdAt: new Date().toISOString(),
        user: {
          id: newPostData.userId,
          username: newPostData.username || "投稿中...",
          iconUrl: newPostData.iconUrl || null,
        },
        _count: {
          likes: 0,
          comments: 0,
        },
        stats: {
          likes: 0,
          comments: 0,
          upVotes: 0,
          downVotes: 0,
          userVote: null,
          userLiked: false,
        },
      };

      // すべての投稿クエリキャッシュに楽観的更新を適用
      const previousCaches: Array<{
        queryKey: readonly unknown[];
        data: PostsWithStatsResponse;
      }> = [];

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["posts"] })
        .forEach((query) => {
          const oldData = query.state.data as
            | PostsWithStatsResponse
            | undefined;
          if (oldData) {
            previousCaches.push({
              queryKey: query.queryKey,
              data: oldData,
            });

            // UIに即座に反映（一番上に追加）
            queryClient.setQueryData<PostsWithStatsResponse>(query.queryKey, {
              ...oldData,
              posts: [optimisticPost, ...oldData.posts],
            });
          }
        });

      return { previousCaches, tempId };
    },
    onSuccess: (serverPost, variables, context) => {
      console.log("[usePosts] Post created successfully:", serverPost.id);

      // サーバーから返された実データで一時データを置き換え
      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["posts"] })
        .forEach((query) => {
          const oldData = query.state.data as
            | PostsWithStatsResponse
            | undefined;
          if (oldData) {
            queryClient.setQueryData<PostsWithStatsResponse>(query.queryKey, {
              ...oldData,
              posts: oldData.posts.map((post) =>
                post.id === context?.tempId ? serverPost : post
              ),
            });
          }
        });
    },
    onError: (error, variables, context) => {
      console.error("[usePosts] Failed to create post:", error);

      // エラー時はすべてのキャッシュをロールバック
      if (context?.previousCaches) {
        context.previousCaches.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
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
