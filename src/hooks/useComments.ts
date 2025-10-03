import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// コメントの型定義
export type Comment = {
  id: number;
  postId: number;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string | null;
    email: string | null;
    iconUrl: string | null;
  };
};

// コメント一覧取得
export function useComments(postId: number, initialData?: unknown[]) {
  return useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    initialData: initialData as Comment[] | undefined, // ISRで取得したデータを初期値として使用
    staleTime: 1 * 60 * 1000, // 1分間キャッシュ
    gcTime: 5 * 60 * 1000, // 5分間保持
  });
}

// コメント作成（オプティミスティック更新付き）
export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      postId: number;
      userId: string;
      content: string;
      username: string | null;
      iconUrl: string | null;
    }) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: data.postId,
          userId: data.userId,
          content: data.content,
        }),
      });

      if (!res.ok) {
        // レスポンスがJSONかどうか確認
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await res.json();
          throw new Error(
            error.error || error.details || "Failed to create comment"
          );
        } else {
          // HTMLエラーページの場合
          const text = await res.text();
          console.error(
            "Server returned non-JSON response:",
            text.substring(0, 200)
          );
          throw new Error(
            "サーバーエラーが発生しました。しばらくしてからもう一度お試しください。"
          );
        }
      }

      return res.json();
    },

    // オプティミスティック更新: サーバー応答前にUIを即座に更新
    onMutate: async (newComment) => {
      // 既存のクエリをキャンセル（競合を防ぐ）
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      // 以前のデータを保存（ロールバック用）
      const previousComments = queryClient.getQueryData<Comment[]>([
        "comments",
        postId,
      ]);

      // 楽観的に新しいコメントを追加
      const optimisticComment: Comment = {
        id: Date.now(), // 一時的なID
        postId: newComment.postId,
        userId: newComment.userId,
        content: newComment.content,
        createdAt: new Date().toISOString(),
        user: {
          id: newComment.userId,
          username: newComment.username,
          email: null,
          iconUrl: newComment.iconUrl,
        },
      };

      queryClient.setQueryData<Comment[]>(["comments", postId], (old) => [
        optimisticComment,
        ...(old || []),
      ]);

      return { previousComments };
    },

    // エラー時: ロールバック
    onError: (err, newComment, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", postId],
          context.previousComments
        );
      }
      console.error("Failed to create comment:", err);
    },

    // 成功時: サーバーデータで更新
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

// コメント削除
export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: number) => {
      const res = await fetch(`/api/comments?id=${commentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete comment");
      }

      return res.json();
    },

    // オプティミスティック更新: 削除もすぐに反映
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      const previousComments = queryClient.getQueryData<Comment[]>([
        "comments",
        postId,
      ]);

      // 削除されたコメントを除外
      queryClient.setQueryData<Comment[]>(["comments", postId], (old) =>
        old ? old.filter((comment) => comment.id !== commentId) : []
      );

      return { previousComments };
    },

    onError: (err, commentId, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", postId],
          context.previousComments
        );
      }
      console.error("Failed to delete comment:", err);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}
