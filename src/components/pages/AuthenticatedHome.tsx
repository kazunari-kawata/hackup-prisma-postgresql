"use client";

import PostForm from "@/components/Hacks/PostHackForm";
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
      <PostForm />
      <PostListWithReactQuery initialPageSize={5} initialPosts={initialPosts} />
    </AuthGuard>
  );
}
