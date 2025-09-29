"use client";

import Image from "next/image";

type UserHeaderProps = {
  userName: string;
  userAvatarUrl?: string; // オプション
  timestamp?: string; // オプション (例: "5分前" や "2023年10月27日")
};

export default function UserHeader({
  userName,
  userAvatarUrl,
  timestamp,
}: UserHeaderProps) {
  return (
    <div className="flex items-center space-x-2 mb-2">
      {userAvatarUrl ? (
        <Image
          src={userAvatarUrl}
          alt={`${userName}'s avatar`}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        // アバター画像がない場合のプレースホルダー
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
          {userName.charAt(0)}
        </div>
      )}
      <span className="font-semibold text-gray-900">{userName}</span>
      {timestamp && (
        <span className="text-gray-500 text-sm">・ {timestamp}</span>
      )}
    </div>
  );
}
