"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Bookmark, Comment } from "@mui/icons-material";

interface SearchResult {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    iconUrl?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      searchPosts(query);
    }
  }, [query]);

  const searchPosts = async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error("検索に失敗しました");
      }
      const data = await response.json();
      console.log("Search API Response:", data);
      if (data.posts && data.posts.length > 0) {
        console.log("First post _count:", data.posts[0]._count);
      }
      setResults(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (!query) {
    return (
      <div className="text-center py-8">検索キーワードを入力してください</div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">検索中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        「{query}」の検索結果 ({results.length}件)
      </h2>

      {results.length === 0 ? (
        <div className="text-center py-8">
          <p>検索結果が見つかりませんでした。</p>
          <p className="text-sm text-gray-500 mt-2">
            別のキーワードで検索してみてください。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-blue-600 hover:text-blue-800">
                  {post.title}
                </h3>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </div>
              </div>

              <p className="text-gray-700 mb-3 line-clamp-3">
                {post.content.substring(0, 200)}
                {post.content.length > 200 ? "..." : ""}
              </p>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>投稿者: {post.user.username}</span>
                <div className="flex gap-4">
                  <span>
                    <Bookmark /> {post._count.likes}
                  </span>
                  <span>
                    <Comment /> {post._count.comments}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
