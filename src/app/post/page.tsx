import type { Metadata } from "next";
　
export const metadata: Metadata = {
  title: "投稿一覧",
  description: "投稿の一覧が表示されます",
};

// ダミーデータ
const posts = [
  { id: 1, title: "Post 1", content: "Content for post 1" },
  { id: 2, title: "Post 2", content: "Content for post 2" },
  { id: 3, title: "Post 3", content: "Content for post 3" },
];

// 3秒待機
async function fetchArticles() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  //   throw new Error('投稿の一覧表示に失敗しました');
  return posts;
}

export default async function BlogPage() {
  const posts = await fetchArticles();
  return (
    <div>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            title: {post.title}
            content: {post.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
