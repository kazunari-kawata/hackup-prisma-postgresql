import { Post as PostType } from "@/lib/dao/post";
import Reaction from "../Reaction/Reaction";
import UserHeader from "../UserHeader";
import CommentSection from "../Comments/CommentSection";
import HackTitleContent from "./HackTitleContent";

export default function Post({ post }: { post: PostType }) {
  return (
    <>
      {/* ユーザーデータが反映されるように */}
      {/* <div>
        <UserHeader username={post.userName} avatarUrl={post.userAvatarUrl} />
      </div> */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
        <HackTitleContent post={post} />
        <div className={"w-full mt-4 flex justify-center"}>
          <Reaction postId={post.id} userId={post.userId} />
        </div>
        <span className="border-t border-gray-300 block mt-8"></span>
        <div>
          <CommentSection postId={post.id} userId={post.userId} />
        </div>
      </div>
    </>
  );
}
