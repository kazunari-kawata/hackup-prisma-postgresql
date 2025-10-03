"use client";

import { useState } from "react";
import { useAuthState } from "@/lib/auth/useAuth";
import { usePosts } from "@/hooks/usePosts";
import Post from "./GetHackPosts";

type PostListWithReactQueryProps = {
  showComments?: boolean;
  initialPageSize?: number;
  initialPosts?: unknown[];
};

export default function PostListWithReactQuery({
  showComments = false,
  initialPageSize = 5,
  initialPosts = [],
}: PostListWithReactQueryProps) {
  const { user } = useAuthState();
  const [displayCount, setDisplayCount] = useState(initialPageSize);

  // React Queryでデータ取得（自動キャッシュ・再取得）
  // initialPostsがある場合は初期データとして使用
  const initialData =
    initialPosts.length > 0
      ? {
          posts: initialPosts as any,
          pagination: { limit: 50, offset: 0, total: initialPosts.length },
        }
      : undefined;

  const { data, isLoading, error } = usePosts(
    {
      limit: 50,
      offset: 0,
      userId: user?.uid,
    },
    initialData
  );

  const posts = data?.posts || [];

  // PostWithStats型をPostWithUser型に変換
  const convertedPosts = posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    user: post.user || {
      id: post.userId,
      username: null,
      iconUrl: null,
    },
  }));

  const displayedPosts = convertedPosts.slice(0, displayCount);
  const hasMore = displayCount < convertedPosts.length;
  const remainingCount = convertedPosts.length - displayCount;

  const loadMore = () => {
    setDisplayCount((prev) => prev + initialPageSize);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">データの取得に失敗しました</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* 投稿一覧 */}
      {displayedPosts.map((post) => (
        <Post key={post.id} post={post} showComments={showComments} />
      ))}

      {/* もっと見るボタン */}
      {hasMore && (
        <div className="flex flex-col items-center mt-8 mb-4">
          <button
            onClick={loadMore}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            もっと見る ({remainingCount}件)
          </button>
          <p className="text-gray-500 text-sm mt-2">
            {displayCount}件 / {convertedPosts.length}件を表示中
          </p>
        </div>
      )}

      {/* 全て表示済みメッセージ */}
      {!hasMore && convertedPosts.length > 0 && (
        <div className="text-center text-gray-500 py-8">
          <p className="text-sm">全ての投稿を表示しました</p>
          <p className="text-xs mt-1">({convertedPosts.length}件)</p>
        </div>
      )}

      {/* 投稿がない場合 */}
      {convertedPosts.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">投稿がありません</p>
        </div>
      )}
    </div>
  );
}
