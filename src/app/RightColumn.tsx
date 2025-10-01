"use client";

import { usePathname } from "next/navigation";

export default function RightColumn() {
  const pathname = usePathname();
  const hideRightColumn = ["/login", "/register"].includes(pathname);

  if (hideRightColumn) return null;

  return (
    <div className="w-full p-4">
      {/* RightColumnは現在は空です。ユーザー情報はMenuに移動しました。 */}
      {/* 今後、サイドバーウィジェットやトレンド情報などを追加できます。 */}
    </div>
  );
}
