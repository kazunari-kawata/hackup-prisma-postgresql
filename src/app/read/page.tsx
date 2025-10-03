"use client";

import PostListWithReactQuery from "@/components/Hacks/PostListWithReactQuery";

export default function ReadPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">投稿一覧</h1>
        <p className="text-gray-600">全ての投稿を閲覧できます</p>
      </div>
      <PostListWithReactQuery showComments={false} initialPageSize={10} />
    </div>
  );
}
