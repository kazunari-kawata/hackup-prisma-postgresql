import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostDetailView from "@/components/posts/PostDetailView";

async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            iconUrl: true,
          },
        },
      },
    });

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  return <PostDetailView post={post} />;
}
