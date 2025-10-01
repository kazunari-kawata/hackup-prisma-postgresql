// CommentList.tsx
import { useCallback, useEffect, useState } from "react";
import CommentHeader from "./CommentHeader";
import CommentReaction from "../Reaction/CommentReaction";

type Comment = {
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
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
            {/* CommentHeaderを使用してユーザー情報と削除機能を統合 */}
            <CommentHeader
              userName={
                comment.user.username ||
                comment.user.email?.split("@")[0] ||
                "ユーザー"
              }
              userAvatarUrl={comment.user.iconUrl || undefined}
              timestamp={new Date(comment.createdAt).toLocaleString("ja-JP", {
                timeZone: "Asia/Tokyo",
              })}
              commentId={comment.id}
              authorUid={comment.userId}
              onDelete={fetchComments}
            />
            <div className="text-gray-700 leading-relaxed whitespace-pre-line ml-8">
              {comment.content}
            </div>
            <div className="flex mt-2 justify-center items-center">
              <CommentReaction commentId={comment.id} userId={currentuserId} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
