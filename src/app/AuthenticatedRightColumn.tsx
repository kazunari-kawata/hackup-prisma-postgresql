"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import RightColumn from "./RightColumn";
import LogoutButton from "@/components/auth/LogoutButton";

type AuthenticatedRightColumnProps = {
  className?: string;
};

export default function AuthenticatedRightColumn({
  className,
}: AuthenticatedRightColumnProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={className}>
        <div className="w-full p-6 bg-white rounded-2xl shadow-lg mt-10 border border-gray-100 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-300"></div>
            <div>
              <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <hr className="my-3 border-gray-200" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">カルマスコア</span>
            <div className="h-5 bg-gray-300 rounded w-8"></div>
          </div>
          {/* ローディング中のログアウトボタンプレースホルダー */}
          <div className="w-full mt-4 h-10 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const userName = user?.displayName || user?.email?.split("@")[0] || "ゲスト";
  const userId = user?.uid || "guest";
  const userPhotoURL = user?.photoURL;

  return (
    <div className={className}>
      <RightColumn
        userName={userName}
        userId={userId}
        userPhotoURL={userPhotoURL}
      >
        <LogoutButton />
      </RightColumn>
    </div>
  );
}
