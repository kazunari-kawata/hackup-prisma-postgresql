import Post from "./GetHackPosts"; // 新しく作成した Post コンポーネントをインポート
import { PostWithUser } from "@/lib/dao/post";

type PostListProps = {
  posts: PostWithUser[];
  showComments?: boolean;
};

export default function PostList({
  posts,
  showComments = false,
}: PostListProps) {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {posts.map((post) => (
        <Post key={post.id} post={post} showComments={showComments} />
      ))}
    </div>
  );
}
