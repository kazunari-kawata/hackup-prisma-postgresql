"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type UserProfileSectionProps = {
  userName: string;
  userId: string;
  userPhotoURL?: string | null;
};

export default function UserProfileSection({
  userName,
  userId,
  userPhotoURL,
}: UserProfileSectionProps) {
  const [karmaData, setKarmaData] = useState<{
    karmaScore: number;
    details?: {
      totalKarma: number;
      postKarma: number;
      commentKarma: number;
      breakdown: {
        postUpVotes: number;
        postDownVotes: number;
        commentUpVotes: number;
        commentDownVotes: number;
      };
    };
    formatted?: {
      display: string;
      color: string;
      emoji: string;
    };
  }>({ karmaScore: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  // カルマスコアを取得
  useEffect(() => {
    const fetchKarmaScore = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/karma-score?userId=${userId}&detailed=true`
        );
        if (res.ok) {
          const data = await res.json();
          setKarmaData(data);
        } else {
          console.error("Failed to fetch karma score");
        }
      } catch (error) {
        console.error("Karma Score Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchKarmaScore();
    }
  }, [userId]);

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-lg mb-6 border border-gray-100">
      {/* ユーザー情報 */}
      <div className="flex items-center gap-4 mb-6">
        {userPhotoURL ? (
          <Image
            src={userPhotoURL}
            alt={`${userName}のプロフィール画像`}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full shadow-md object-cover"
            unoptimized={true}
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{userName}</h1>
          <p className="text-gray-500">@{userName.toLowerCase()}</p>
        </div>
      </div>

      <hr className="my-4 border-gray-200" />

      {/* カルマスコア表示 */}
      <div className="flex items-center justify-between">
        <span className="text-gray-600 font-medium text-lg">カルマスコア</span>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          ) : (
            <>
              <span className="text-3xl font-bold text-blue-600">
                <span className={karmaData.formatted?.color || "text-gray-600"}>
                  {karmaData.formatted?.display || karmaData.karmaScore}
                </span>
              </span>
              <span className="text-sm text-gray-400">pts</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
