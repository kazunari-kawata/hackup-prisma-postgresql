import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/dao/post";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const posts = await getPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log("[Posts API] POST request received");

  try {
    const body = await req.json();
    console.log("[Posts API] Request body:", body);

    const { title, content, userId } = body;

    // バリデーション
    if (!title || !content || !userId) {
      console.error("[Posts API] Missing required fields:", {
        title: !!title,
        content: !!content,
        userId: !!userId,
      });
      return NextResponse.json(
        { error: "Title, content, and userId are required" },
        { status: 400 }
      );
    }

    // 投稿を作成（ユーザー情報と統計も含めて返す）
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        userId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            iconUrl: true,
          },
        },
      },
    });

    // 初期統計データ（新規投稿なのですべて0）
    const postWithStats = {
      ...newPost,
      _count: {
        likes: 0,
        comments: 0,
      },
      stats: {
        likes: 0,
        comments: 0,
        upVotes: 0,
        downVotes: 0,
        userVote: null,
        userLiked: false,
      },
    };

    console.log(
      `[Posts API] Post created successfully after ${
        Date.now() - startTime
      }ms:`,
      newPost.id
    );

    return NextResponse.json(postWithStats, { status: 201 });
  } catch (error) {
    console.error(
      `[Posts API] POST Error after ${Date.now() - startTime}ms:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
