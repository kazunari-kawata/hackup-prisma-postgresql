// 必要に応じて、ユーザー情報の型定義をここに追加するか、共通の型定義ファイルからインポートします。
// 例: type User = { id: string; name: string; avatarUrl: string; };

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
        {/* ユーザーの情報をフェッチしてくるように後から修正が必要 */}
      {userAvatarUrl ? (
        <img
          src={userAvatarUrl}
          alt={`${userName}'s avatar`}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        // アバター画像がない場合のプレースホルダー
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
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
