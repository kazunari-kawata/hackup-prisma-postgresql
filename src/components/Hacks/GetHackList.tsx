import Post from "./GetHackPosts"; // 新しく作成した Post コンポーネントをインポート
import { Post as PostType } from "@/lib/dao/post";

export default function PostList({ posts }: { posts: PostType[] }) {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
