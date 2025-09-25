import { z } from "zod";

export const PostSchema = z.object({
  title: z
    .string()
    .min(3, "タイトルは3文字以上で入力してください")
    .max(50, "タイトルは50文字以下で入力してください"),
  content: z
    .string()
    .min(10, "投稿内容は10文字以上で入力してください")
    .max(500, "投稿内容は500文字以下で入力してください"),
});

// 型の定義
export type PostType = z.infer<typeof PostSchema>;