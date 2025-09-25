// /api/post-votes.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 投票データを取得
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  if (!postId) {
    return new Response(JSON.stringify({ error: "postId is required" }), {
      status: 400,
    });
  }
  try {
    const votes = await prisma.postVote.findMany({
      where: { postId: Number(postId) },
    });
    return new Response(JSON.stringify(votes), { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch votes" }), {
      status: 500,
    });
  }
}

// POST: 投票を追加/更新
export async function POST(req) {
  try {
    const { postId, userId, voteType } = await req.json();
    if (!postId || !userId || !voteType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }
    // 既存の投票を削除
    await prisma.postVote.deleteMany({
      where: { postId: Number(postId), userId },
    });
    // 新しい投票を追加
    const newVote = await prisma.postVote.create({
      data: {
        postId: Number(postId),
        userId,
        voteType,
      },
    });
    return new Response(JSON.stringify(newVote), { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return new Response(JSON.stringify({ error: "Failed to create vote" }), {
      status: 500,
    });
  }
}

// DELETE: 投票を削除
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const userId = searchParams.get("userId");
  if (!postId || !userId) {
    return new Response(
      JSON.stringify({ error: "postId and userId are required" }),
      { status: 400 }
    );
  }
  try {
    await prisma.postVote.deleteMany({
      where: { postId: Number(postId), userId },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete vote" }), {
      status: 500,
    });
  }
}
