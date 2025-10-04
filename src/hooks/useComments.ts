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

      // 一時的なIDを生成（大きな数値で本物のIDと区別）
      const tempId = Date.now() + 1000000000000;

      // 楽観的に新しいコメントを追加
      const optimisticComment: Comment = {
        id: tempId, // 一時的なID（大きな数値）
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

      return { previousComments, tempId };
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

    // 成功時: サーバーから返された実データで楽観的コメントを置き換え
    onSuccess: (serverComment, variables, context) => {
      console.log(
        "[useComments] Comment created successfully, replacing optimistic comment with server data"
      );

      queryClient.setQueryData<Comment[]>(["comments", postId], (old) => {
        if (!old) return [serverComment];

        // 楽観的コメント（一時ID）を実際のサーバーデータで置き換え
        const newComments = old.map((comment) =>
          comment.id === context?.tempId ? serverComment : comment
        );

        // 作成日時で降順ソート
        return newComments.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
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
      console.log(
        "[useComments] Comment deleted successfully (already optimistically removed)"
      );
      // 楽観的更新で既に削除済みなので、invalidateQueriesは不要
    },
  });
}
