import { PostWithUser } from "@/lib/dao/post";
import AuthenticatedReaction from "../Reaction/AuthenticatedReaction";
import UserHeader from "./UserHeader";
import AuthenticatedCommentSection from "../Comments/AuthenticatedCommentSection";
import HackTitleContent from "./HackTitleContent";
import { EditPostModal } from "../editDeleteButtons/EditPostModal";
import { useState } from "react";
import Link from "next/link";

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

type PostProps = {
  post: PostWithUser;
  showComments?: boolean;
};

export default function Post({ post, showComments = true }: PostProps) {
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
    // 削除後の処理（ページリロードまたは親コンポーネントへの通知）
    if (confirm("本当に削除しますか？")) {
      window.location.reload();
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md mb-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
        <UserHeader
          userName={currentPost.user?.username || "名無しユーザー"}
          userAvatarUrl={currentPost.user?.iconUrl || undefined}
          timestamp={formatDate(new Date(currentPost.createdAt))}
          postId={currentPost.id}
          authorUid={currentPost.user?.id}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {showComments ? (
          <HackTitleContent post={currentPost} />
        ) : (
          <Link
            href={`/posts/${currentPost.id}`}
            className="block hover:bg-gray-50 -mx-6 -my-2 px-6 py-2 rounded-lg transition-colors"
          >
            <HackTitleContent post={currentPost} isPreview={true} />
          </Link>
        )}

        <div className={"w-full mt-4 flex justify-center"}>
          <AuthenticatedReaction
            postId={currentPost.id}
            commentRefreshTrigger={commentRefreshTrigger}
          />
        </div>
        {showComments && (
          <>
            <span className="border-t border-gray-300 block mt-8"></span>
            <div>
              <AuthenticatedCommentSection
                postId={currentPost.id}
                onCommentChange={() =>
                  setCommentRefreshTrigger((prev) => prev + 1)
                }
              />
            </div>
          </>
        )}
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
