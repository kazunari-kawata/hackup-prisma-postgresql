"use server";

import { getUserByEmail } from "@/lib/dao/get_user";
import { signUpSchema } from "@/validations/signin_signup";
import { signOut } from "next-auth/react";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

export type SignUpState = {
  errors?: {
    email?: string[];
    password?: string[];
    username?: string[];
  };
  message?: string | null;
};

export async function signUp(
  prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const validatedFields = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "入力項目が足りません。",
    };
  }

  const { email, password, username } = validatedFields.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await getUserByEmail(email);
    // ユーザー名重複チェック（必要なら）
    const existingUserName = await getUserByUserName(username);

    if (existingUser) {
      return {
        message: "既に登録されているメールアドレスです。",
      };
    }
    if (existingUserName) {
      return {
        message: "既に使用されているユーザー名です。",
      };
    }

    await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        username: username,
      },
    });
  } catch (error) {
    throw error;
  }

  redirect("/login");
}

// サーバーアクションでsignInは使わない。バリデーションやDBチェックのみ行う。
export async function login(prevState: string | undefined, formData: FormData) {
  const formDataObj: Record<string, string> = {};
  formData.forEach((value, key) => {
    formDataObj[key] = String(value);
  });

  // ここでバリデーションやDBチェックを行う例（実際の認証はクライアントでsignInを使う）
  if (!formDataObj.email || !formDataObj.password) {
    return "メールアドレスとパスワードは必須です。";
  }
  const user = await getUserByEmail(formDataObj.email);
  if (!user) {
    return "ユーザーが見つかりません。";
  }
  // パスワードチェック（bcryptで比較）
  const isValid = await bcrypt.compare(formDataObj.password, user.password);
  if (!isValid) {
    return "パスワードが間違っています。";
  }
  // 認証自体はクライアントでsignInを呼ぶ
  return undefined;
}

export async function logout() {
  try {
    await signOut();
  } catch (error) {
    throw error;
  }
}

async function getUserByUserName(username: string) {
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    return user;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return null;
  }
}
