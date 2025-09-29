import { useState } from "react";

type PostCommentFormProps = {
  postId: number;
  userId: string;
  onCommentCreated: () => void; // A callback to refresh the comment list
};

export default function PostCommentForm({
  postId,
  userId,
  onCommentCreated,
}: PostCommentFormProps) {
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId, content: newComment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "コメントの送信に失敗しました");
      }
      setNewComment("");
      onCommentCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 mb-4">
      <form onSubmit={handleCommentSubmit} className="mt-2">
        <textarea
          className="w-full border border-gray-300 rounded-md p-2"
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="コメントを入力..."
          disabled={loading}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            className="bg-black text-white rounded-md px-4 py-2 transition-all duration-150 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
            disabled={loading}
          >
            {loading ? "送信中..." : "コメントする"}
          </button>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
      <span className="border-t border-gray-300 block mt-4"></span>
    </div>
  );
}
