"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "@/lib/auth/useAuth";
import Image from "next/image";
import Link from "next/link";
import UserProfileSection from "@/components/UserProfileSection";

type SavedPost = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  savedAt: string;
  user: {
    id: string;
    username: string;
    iconUrl: string;
  };
};

export default function MyPage() {
  const { user, isAuthenticated } = useAuthState();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const fetchSavedPosts = async () => {
      try {
        const response = await fetch(`/api/my-saved-posts?userId=${user.uid}`);
        if (!response.ok) {
          throw new Error("保存された投稿の取得に失敗しました");
        }
        const posts = await response.json();
        setSavedPosts(posts);
        setError(null);
      } catch (err) {
        console.error("保存された投稿の取得に失敗:", err);
        setError(
          err instanceof Error ? err.message : "不明なエラーが発生しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user, isAuthenticated]);

  const handleUnsave = async (postId: number) => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/post-likes?postId=${postId}&userId=${user.uid}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setSavedPosts((posts) => posts.filter((p) => p.id !== postId));
      } else {
        throw new Error("保存解除に失敗しました");
      }
    } catch (err) {
      console.error("保存解除に失敗:", err);
      alert(err instanceof Error ? err.message : "保存解除に失敗しました");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">ログインが必要です</h2>
          <p className="text-gray-600 mb-4">
            保存された投稿を表示するにはログインしてください。
          </p>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            ログイン
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            エラーが発生しました
          </h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* ユーザープロフィールセクション */}
      {user && (
        <UserProfileSection
          userName={user.displayName || "ユーザー"}
          userId={user.uid}
          userPhotoURL={user.photoURL}
        />
      )}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          保存された投稿
        </h1>
        <p className="text-gray-600">
          あなたが保存した投稿一覧です（{savedPosts.length}件）
        </p>
      </div>

      {savedPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            保存された投稿がありません
          </h3>
          <p className="text-gray-500 mb-6">
            気になる投稿の保存ボタン（ブックマークアイコン）を押して、後で読み返せるように保存しましょう。
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            投稿を見る
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {post.user.iconUrl ? (
                    <Image
                      src={post.user.iconUrl}
                      alt={post.user.username || "User"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                      {post.user.username?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-900">
                      {post.user.username || "ユーザー"}
                    </span>
                    <div className="text-sm text-gray-500">
                      投稿: {formatDate(post.createdAt)} • 保存:{" "}
                      {formatDate(post.savedAt)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleUnsave(post.id)}
                  className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                >
                  保存解除
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-xl text-gray-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-700 line-clamp-3 leading-relaxed">
                  {post.content.length > 200
                    ? `${post.content.substring(0, 200)}...`
                    : post.content}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <Link
                  href={`/posts/${post.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  続きを読む
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
