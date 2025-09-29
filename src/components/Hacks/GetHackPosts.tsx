import { PostWithUser } from "@/lib/dao/post";
import AuthenticatedReaction from "../Reaction/AuthenticatedReaction";
import UserHeader from "./UserHeader";
import AuthenticatedCommentSection from "../Comments/AuthenticatedCommentSection";
import HackTitleContent from "./HackTitleContent";

// 日時をフォーマットする関数
function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return "たった今";
  } else if (minutes < 60) {
    return `${minutes}分前`;
  } else if (hours < 24) {
    return `${hours}時間前`;
  } else if (days < 7) {
    return `${days}日前`;
  } else {
    return date.toLocaleDateString("ja-JP");
  }
}

export default function Post({ post }: { post: PostWithUser }) {
  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md mb-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
        <div>
          <UserHeader
            userName={post.user?.username || "名無しユーザー"}
            userAvatarUrl={post.user?.iconUrl || undefined}
            timestamp={formatDate(new Date(post.createdAt))}
          />
        </div>
        <HackTitleContent post={post} />
        <div className={"w-full mt-4 flex justify-center"}>
          <AuthenticatedReaction postId={post.id} />
        </div>
        <span className="border-t border-gray-300 block mt-8"></span>
        <div>
          <AuthenticatedCommentSection postId={post.id} />
        </div>
      </div>
    </>
  );
}
