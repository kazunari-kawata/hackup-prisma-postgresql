import PostForm from "@/components/Hacks/PostHackForm";
import PostList from "@/components/Hacks/GetHackList";
import { getPosts } from "@/lib/dao/post";

export default async function Home() {
  const posts = await getPosts();

  return (
    <>
      <PostForm />
      <PostList posts={posts} />
    </>
  );
}
