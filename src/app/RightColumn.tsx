"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type RightColumnProps = {
  userName: string;
  userId: string;
  userPhotoURL?: string | null; // Googleアカウントのプロフィール画像URL
  children?: React.ReactNode; // ログアウトボタンなどのコンテンツ用
};

export default function RightColumn({
  userName,
  userId,
  userPhotoURL,
  children,
}: RightColumnProps) {
  const pathname = usePathname();
  const hideRightColumn = ["/login", "/register"].includes(pathname);
  const [karmaScore, setKarmaScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // カルマスコアを取得
  useEffect(() => {
    const fetchKarmaScore = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/karma-score?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setKarmaScore(data.karmaScore);
        } else {
          console.error("Failed to fetch karma score");
        }
      } catch (error) {
        console.error("Karma Score Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && !hideRightColumn) {
      fetchKarmaScore();
    }
  }, [userId, hideRightColumn]);

  if (hideRightColumn) return null;

  // ...existing code...

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-lg mt-10 border border-gray-100">
      {/* ヘッダー部分: ユーザー情報とログアウトボタンを横並び */}
      <div className="flex items-start justify-between mb-4">
        {/* 左側: ユーザー情報 */}
        <div className="flex items-center gap-3">
          {userPhotoURL ? (
            <Image
              src={userPhotoURL}
              alt={`${userName}のプロフィール画像`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full shadow-md object-cover"
              unoptimized={true}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{userName}</h3>
            <p className="text-gray-500 text-sm">@{userName.toLowerCase()}</p>
          </div>
        </div>

        {/* 右側: ログアウトボタン */}
        <div className="flex-shrink-0">{children}</div>
      </div>

      <hr className="my-3 border-gray-200" />

      {/* カルマスコア表示 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500 font-medium">カルマスコア</span>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <>
              <span className="text-2xl font-bold text-blue-600">
                {karmaScore}
              </span>
              <span className="text-xs text-gray-400">pts</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
