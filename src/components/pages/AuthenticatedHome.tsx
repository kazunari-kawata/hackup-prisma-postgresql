"use client";

import OptimizedPostForm from "@/components/Hacks/OptimizedPostForm";
import PostListWithReactQuery from "@/components/Hacks/PostListWithReactQuery";
import AuthGuard from "@/components/auth/AuthGuard";

type AuthenticatedHomeProps = {
  initialPosts?: unknown[];
};

export default function AuthenticatedHome({
  initialPosts = [],
}: AuthenticatedHomeProps) {
  return (
    <AuthGuard>
      <OptimizedPostForm />
      <PostListWithReactQuery initialPageSize={5} initialPosts={initialPosts} />
    </AuthGuard>
  );
}
