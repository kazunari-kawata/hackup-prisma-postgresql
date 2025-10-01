import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // 既存のPostLikeテーブルを使用して、ユーザーがライクした投稿を取得
    const savedPosts = await prisma.postLike.findMany({
      where: {
        userId: userId,
      },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                iconUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc", // 保存日時の降順
      },
    });

    // データを整形して返す
    const formattedPosts = savedPosts.map((postLike) => ({
      id: postLike.post.id,
      title: postLike.post.title,
      content: postLike.post.content,
      createdAt: postLike.post.createdAt,
      user: postLike.post.user,
      savedAt: postLike.createdAt, // ライクした日時
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("保存された投稿の取得エラー:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved posts" },
      { status: 500 }
    );
  }
}
