"use client";

import PostForm from "@/components/Hacks/PostHackForm";
import PostListWithReactQuery from "@/components/Hacks/PostListWithReactQuery";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AuthenticatedHome() {
  return (
    <AuthGuard>
      <PostForm />
      <PostListWithReactQuery initialPageSize={5} />
    </AuthGuard>
  );
}
