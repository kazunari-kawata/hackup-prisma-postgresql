// CommentList.tsx
import { useCallback, useEffect, useState } from "react";
import DeleteButton from "./DeleteButton";

type Comment = {
  id: number;
  postId: number;
  userId: string;
  content: string;
  createdAt: string;
};
type GetCommentListProps = {
  postId: number;
  //todo: currentUserIdの調整?
  currentuserId: string;
};

export default function GetCommentList({
  postId,
  currentuserId,
}: GetCommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetchCommentsをuseCallbackで定義
  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (!res.ok) throw new Error("コメントの取得に失敗しました");
      const data = await res.json();
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  if (loading) return <div>コメント読み込み中...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li key={comment.id}>
          <div className="relative bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
            {/* 削除ボタンを右上に */}
            {comment.userId === currentuserId && (
              <div className="absolute top-2 right-2">
                <DeleteButton commentId={comment.id} onDelete={fetchComments} />
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 font-bold">
                {comment.userId.slice(0, 2).toUpperCase()}
              </div>
              <span className="font-semibold text-gray-800 text-sm">
                {comment.userId}
              </span>
              <span className="text-gray-400 text-xs ml-2">
                {new Date(comment.createdAt).toLocaleString("ja-JP", {
                  timeZone: "Asia/Tokyo",
                })}
              </span>
            </div>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {comment.content}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
