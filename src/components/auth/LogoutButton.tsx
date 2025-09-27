"use client";

import { useAuthState } from "@/lib/auth/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const { signOut, isAuthenticated } = useAuthState();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 未認証の場合は表示しない
  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`
        mt-4 px-4 py-2 
        text-sm font-medium text-white 
        bg-gradient-to-r from-red-500 to-red-600 
        hover:from-red-600 hover:to-red-700 
        rounded-lg shadow-md 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isLoading ? "animate-pulse" : ""}
      `}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>ログアウト中...</span>
        </div>
      ) : (
        "ログアウト"
      )}
    </button>
  );
}
