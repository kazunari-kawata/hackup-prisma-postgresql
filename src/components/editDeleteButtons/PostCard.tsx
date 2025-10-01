"use client";

import { useState } from "react";
import Image from "next/image";
import { PostActions } from "./PostActions";
import { EditPostModal } from "./EditPostModal";

interface PostWithActions {
  id: number;
  title: string;
  content: string;
  user: {
    uid: string;
    username: string;
    email?: string;
    iconUrl?: string;
  };
  createdAt?: string;
  _count?: {
    comments: number;
    postLikes: number;
  };
}

interface PostCardProps {
  post: PostWithActions;
  onPostUpdate?: (updatedPost: PostWithActions) => void;
  onPostDelete?: (deletedPostId: number) => void;
}

export function PostCard({ post, onPostUpdate, onPostDelete }: PostCardProps) {
  const [currentPost, setCurrentPost] = useState(post);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSave = (updatedPost: PostWithActions) => {
    setCurrentPost(updatedPost);
    onPostUpdate?.(updatedPost);
  };

  const handleDelete = () => {
    onPostDelete?.(currentPost.id);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              {currentPost.user.iconUrl && (
                <Image
                  src={currentPost.user.iconUrl}
                  alt={currentPost.user.username}
                  width={32}
                  height={32}
                  className="rounded-full mr-2"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {currentPost.user.username}
                </p>
                {currentPost.createdAt && (
                  <p className="text-sm text-gray-500">
                    {new Date(currentPost.createdAt).toLocaleDateString(
                      "ja-JP"
                    )}
                  </p>
                )}
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-3">{currentPost.title}</h2>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">
                {currentPost.content}
              </p>
            </div>

            {currentPost._count && (
              <div className="flex gap-4 mt-4 text-sm text-gray-500">
                <span>コメント: {currentPost._count.comments}</span>
                <span>いいね: {currentPost._count.postLikes}</span>
              </div>
            )}
          </div>
        </div>

        {/* 投稿者本人のみ表示される編集・削除ボタン */}
        <PostActions
          postId={currentPost.id}
          authorUid={currentPost.user.uid}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* 編集モーダル */}
      <EditPostModal
        post={currentPost}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
      />
    </>
  );
}
