// CommentList.tsx
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import DeleteButton from "./DeleteButton";
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
            {/* ヘッダー部分：ユーザー情報と削除ボタンを横並び */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                {comment.user.iconUrl ? (
                  <Image
                    src={comment.user.iconUrl}
                    alt={`${
                      comment.user.username || "ユーザー"
                    }のプロフィール画像`}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                    unoptimized={true}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-xs text-white font-bold">
                    {comment.user.username
                      ? comment.user.username.slice(0, 2).toUpperCase()
                      : comment.user.email?.slice(0, 2).toUpperCase() || "U"}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800 text-sm">
                    {comment.user.username ||
                      comment.user.email?.split("@")[0] ||
                      "ユーザー"}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(comment.createdAt).toLocaleString("ja-JP", {
                      timeZone: "Asia/Tokyo",
                    })}
                  </span>
                </div>
              </div>
              {/* 削除ボタンを右側に配置 */}
              {comment.userId === currentuserId && (
                <div className="flex-shrink-0 ml-2">
                  <DeleteButton
                    commentId={comment.id}
                    onDelete={fetchComments}
                  />
                </div>
              )}
            </div>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line ml-10">
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
