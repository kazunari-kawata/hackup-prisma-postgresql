import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ posts: [], count: 0 });
  }

  try {
    // タイトルと内容から検索
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive", // 大文字小文字を区別しない
            },
          },
          {
            content: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            iconUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // 検索結果の総数も取得
    const totalCount = await prisma.post.count({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    return NextResponse.json({
      posts,
      count: totalCount,
      query,
    });
  } catch (error) {
    console.error("検索エラー:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
