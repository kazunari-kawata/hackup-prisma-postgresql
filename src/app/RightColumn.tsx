"use client";

import { usePathname } from "next/navigation";

type RightColumnProps = {
  userName: string;
  karmaScore: number;
};

export default function RightColumn({
  userName,
  karmaScore,
}: RightColumnProps) {
  const pathname = usePathname();
  const hideRightColumn = ["/login", "/register"].includes(pathname);
  if (hideRightColumn) return null;

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-lg mt-10 border border-gray-100 mr-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold shadow">
          {userName.charAt(0)}
        </div>
        <div>
          <div className="font-extrabold text-lg text-gray-900">{userName}</div>
          <div className="text-xs text-gray-400">ユーザー情報</div>
        </div>
      </div>
      <hr className="my-3 border-gray-200" />
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500">カルマスコア</span>
        <span className="font-bold text-blue-600 text-lg">{karmaScore}</span>
      </div>
    </div>
  );
}
