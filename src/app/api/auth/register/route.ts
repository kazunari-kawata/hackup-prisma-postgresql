import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, username, iconUrl } = body;

    // 必須フィールドのバリデーション
    if (!id) {
      return NextResponse.json(
        { error: "ユーザーIDが必要です" },
        { status: 400 }
      );
    }

    // ユーザーが既に存在するかチェック
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (existingUser) {
      // 既存ユーザーの情報を更新（必要に応じて）
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          email,
          username,
          iconUrl,
        },
      });

      return NextResponse.json({
        message: "ユーザー情報を更新しました",
        user: updatedUser,
      });
    } else {
      // 新規ユーザーを作成
      const newUser = await prisma.user.create({
        data: {
          id,
          email,
          username,
          iconUrl,
          karmaScore: 0, // デフォルト値
        },
      });

      return NextResponse.json({
        message: "ユーザーを作成しました",
        user: newUser,
      });
    }
  } catch (error) {
    console.error("ユーザー登録エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
