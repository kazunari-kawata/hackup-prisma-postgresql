import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // ユーザーが保存したコメントを取得
    const savedComments = await prisma.commentLike.findMany({
      where: {
        userId: userId,
      },
      include: {
        comment: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                iconUrl: true,
              },
            },
            post: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc", // 保存日時順（新しい順）
      },
    });

    // レスポンス用にデータを整形
    const formattedComments = savedComments.map((savedComment) => ({
      id: savedComment.comment.id,
      content: savedComment.comment.content,
      createdAt: savedComment.comment.createdAt.toISOString(),
      savedAt: new Date().toISOString(), // CommentLikeにcreatedAtがない場合の代替
      user: {
        id: savedComment.comment.user.id,
        username: savedComment.comment.user.username,
        iconUrl: savedComment.comment.user.iconUrl,
      },
      post: {
        id: savedComment.comment.post.id,
        title: savedComment.comment.post.title,
      },
    }));

    return NextResponse.json(formattedComments);
  } catch (error) {
    console.error("Error fetching saved comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
