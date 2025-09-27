"use client";

import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 認証が必要なページで使用するカスタムフック
 * 未認証の場合はログインページにリダイレクトする
 */
export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  return { user, loading };
};

/**
 * 認証状態を確認するだけのフック（リダイレクトしない）
 */
export const useAuthState = () => {
  const { user, loading, signOut } = useAuth();

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
};
