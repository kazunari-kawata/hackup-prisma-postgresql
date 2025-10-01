import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE: 投稿削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // リクエストボディからユーザーIDを取得
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "無効な投稿IDです" }, { status: 400 });
    }

    // 投稿の存在確認と投稿者チェック
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      );
    }

    if (existingPost.user.id !== userId) {
      return NextResponse.json(
        { error: "削除権限がありません" },
        { status: 403 }
      );
    }

    // 関連データを削除（外部キー制約のため）
    await prisma.$transaction([
      // コメントのいいねと投票を削除
      prisma.commentLike.deleteMany({
        where: {
          comment: {
            postId: postId,
          },
        },
      }),
      prisma.commentVote.deleteMany({
        where: {
          comment: {
            postId: postId,
          },
        },
      }),
      // コメントを削除
      prisma.comment.deleteMany({
        where: { postId: postId },
      }),
      // 投稿のいいねと投票を削除
      prisma.postLike.deleteMany({
        where: { postId: postId },
      }),
      prisma.postVote.deleteMany({
        where: { postId: postId },
      }),
      // 投稿を削除
      prisma.post.delete({
        where: { id: postId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("削除エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// PUT: 投稿編集
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, title, content } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "無効な投稿IDです" }, { status: 400 });
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: "タイトルと内容は必須です" },
        { status: 400 }
      );
    }

    // 投稿の存在確認と投稿者チェック
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      );
    }

    if (existingPost.user.id !== userId) {
      return NextResponse.json(
        { error: "編集権限がありません" },
        { status: 403 }
      );
    }

    // 投稿を更新
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            iconUrl: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("更新エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
