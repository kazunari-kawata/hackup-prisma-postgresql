"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import DeleteIcon from "@mui/icons-material/Delete";

type CommentHeaderProps = {
  userName: string;
  userAvatarUrl?: string;
  timestamp?: string;
  commentId?: number;
  authorUid?: string;
  onDelete?: () => void;
};

export default function CommentHeader({
  userName,
  userAvatarUrl,
  timestamp,
  commentId,
  authorUid,
  onDelete,
}: CommentHeaderProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // コメント投稿者本人かどうかをチェック
  const isAuthor = user && authorUid && user.uid === authorUid;

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!confirm("このコメントを削除しますか？この操作は取り消せません。")) {
      return;
    }

    setIsDeleting(true);
    setIsMenuOpen(false);

    // 親コンポーネントの削除処理を呼ぶ（React Queryのオプティミスティック更新が実行される）
    onDelete();

    setIsDeleting(false);
  };

  return (
    <div className="flex items-center space-x-2 mb-2">
      {userAvatarUrl ? (
        <Image
          src={userAvatarUrl}
          alt={`${userName}'s avatar`}
          width={24}
          height={24}
          className="w-6 h-6 rounded-full"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
          {userName.charAt(0)}
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-800 text-sm">{userName}</span>
        {timestamp && (
          <span className="text-gray-500 text-xs">・ {timestamp}</span>
        )}

        {/* コメント投稿者本人のみ表示される三点リーダーメニュー */}
        {isAuthor && (
          <div className="relative">
            {/* 三点リーダーボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors ml-1"
              disabled={isDeleting}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path d="M10 4a2 2 0 100-4 2 2 0 000 4z" />
                <path d="M10 20a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>

            {/* ドロップダウンメニュー */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} />
                    {isDeleting ? "削除中..." : "削除"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
