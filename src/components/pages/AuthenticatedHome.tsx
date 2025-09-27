"use client";

import PostForm from "@/components/Hacks/PostHackForm";
import PostList from "@/components/Hacks/GetHackList";
import AuthGuard from "@/components/auth/AuthGuard";
import { useEffect, useState } from "react";
import { PostWithUser } from "@/lib/dao/post";

export default function AuthenticatedHome() {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // サーバーアクションは直接呼び出せないので、APIルートを作成するか、
        // ここではクライアント側でfetchを使用
        const response = await fetch("/api/posts");
        if (response.ok) {
          const postsData = await response.json();
          setPosts(postsData);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">投稿を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <PostForm />
      <PostList posts={posts} />
    </AuthGuard>
  );
}
