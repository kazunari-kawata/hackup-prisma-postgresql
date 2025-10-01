"use client";

import { PostWithUser } from "@/lib/dao/post";
import UserHeader from "@/components/Hacks/UserHeader";
import HackTitleContent from "@/components/Hacks/HackTitleContent";
import AuthenticatedReaction from "@/components/Reaction/AuthenticatedReaction";
import AuthenticatedCommentSection from "@/components/Comments/AuthenticatedCommentSection";
import { EditPostModal } from "@/components/editDeleteButtons/EditPostModal";
import { useState } from "react";

type PostDetailViewProps = {
  post: PostWithUser;
};

// 日時をフォーマットする関数
function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return "たった今";
  } else if (minutes < 60) {
    return `${minutes}分前`;
  } else if (hours < 24) {
    return `${hours}時間前`;
  } else if (days < 7) {
    return `${days}日前`;
  } else {
    return date.toLocaleDateString("ja-JP");
  }
}

export default function PostDetailView({ post }: PostDetailViewProps) {
  const [currentPost, setCurrentPost] = useState(post);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [commentRefreshTrigger, setCommentRefreshTrigger] = useState(0);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSave = (updatedPost: {
    id: number;
    title: string;
    content: string;
    user: { uid: string; username: string };
  }) => {
    // 更新された投稿の情報を現在の投稿に反映
    setCurrentPost({
      ...currentPost,
      title: updatedPost.title,
      content: updatedPost.content,
    });
  };

  const handleDelete = () => {
    // 削除後の処理（ホームページに遷移）
    if (confirm("本当に削除しますか？")) {
      window.location.href = "/";
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-4">
        {/* 戻るボタン */}
        <div className="mb-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            戻る
          </button>
        </div>

        {/* 投稿詳細 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-4 border border-gray-200">
          <UserHeader
            userName={currentPost.user?.username || "名無しユーザー"}
            userAvatarUrl={currentPost.user?.iconUrl || undefined}
            timestamp={formatDate(new Date(currentPost.createdAt))}
            postId={currentPost.id}
            authorUid={currentPost.user?.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <HackTitleContent post={currentPost} />

          <div className={"w-full mt-4 flex justify-center"}>
            <AuthenticatedReaction
              postId={currentPost.id}
              commentRefreshTrigger={commentRefreshTrigger}
            />
          </div>
        </div>

        {/* コメント欄 */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">コメント</h2>
          <AuthenticatedCommentSection
            postId={currentPost.id}
            onCommentChange={() => setCommentRefreshTrigger((prev) => prev + 1)}
          />
        </div>
      </div>

      {/* 編集モーダル */}
      <EditPostModal
        post={{
          id: currentPost.id,
          title: currentPost.title,
          content: currentPost.content,
          user: {
            uid: currentPost.user?.id || "",
            username: currentPost.user?.username || "",
          },
        }}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
      />
    </>
  );
}
