import type { Metadata } from "next";

// getPost関数がここに必要
// 本来はデータベースやAPIからデータを取得する
// 以下サンプル
async function getPost(slug: string) {
  return {
    title: "Sample Title",
    content: "Sample content for the post. Replace this with actual fetched content.",
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "投稿が見つかりません",
      description: "指定された投稿は存在しません。",
    };
  }

  const desc = post.content
    ? post.content.replace(/<[^>]+>/g, "").slice(0, 80) + "..."
    : "投稿の詳細ページです。";
  return {
    title: `{post.title}: HackUp`,
    description: desc,
  };
}

export default async function page({ params }: { params: { slug: string } }) {
  console.log(params);
  const { slug } = await params;
  return <div>投稿slug: {slug}</div>;
}
