"use client";

import { useAuthState } from "@/lib/auth/useAuth";
import { useCreatePost } from "@/hooks/usePosts";
import { PostSchema } from "@/validations/contact";
import { useState } from "react";
import { z } from "zod";

export default function OptimizedPostForm() {
  const { isAuthenticated, user } = useAuthState();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [clientErrors, setClientErrors] = useState({ title: "", content: "" });

  const createPostMutation = useCreatePost();

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    try {
      if (name === "title") {
        PostSchema.pick({ title: true }).parse({ title: value });
      } else if (name === "content") {
        PostSchema.pick({ content: true }).parse({ content: value });
      }
      setClientErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues[0]?.message || "";
        setClientErrors((prev) => ({
          ...prev,
          [name]: errorMessage,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("ログインが必要です");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setClientErrors({
        title: !title.trim() ? "タイトルを入力してください" : "",
        content: !content.trim() ? "内容を入力してください" : "",
      });
      return;
    }

    // バリデーション
    try {
      PostSchema.parse({ title, content });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.flatten().fieldErrors as {
          title?: string[];
          content?: string[];
        };
        setClientErrors({
          title: errors.title?.[0] || "",
          content: errors.content?.[0] || "",
        });
        return;
      }
    }

    // 楽観的更新で即座にUIに反映
    const postData = {
      title: title.trim(),
      content: content.trim(),
      userId: user.uid,
      username: user.displayName,
      iconUrl: user.photoURL,
    };

    createPostMutation.mutate(postData, {
      onSuccess: () => {
        // 成功時はフォームをクリア
        setTitle("");
        setContent("");
        setClientErrors({ title: "", content: "" });
      },
      onError: (error) => {
        console.error("Post creation failed:", error);
        alert(error instanceof Error ? error.message : "投稿に失敗しました");
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="py-4 text-gray-600">
        <div className="md:w-9/10 bg-white rounded-lg p-8 flex flex-col mx-auto shadow-md">
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              ライフハックを投稿するにはログインが必要です
            </p>
            <a
              href="/login"
              className="text-white bg-blue-600 py-2 px-6 hover:bg-blue-700 rounded-xl text-lg"
            >
              ログインする
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 text-gray-600">
      <div className="md:w-9/10 bg-white rounded-lg p-8 flex flex-col mx-auto shadow-md">
        <h2 className="text-xs mb-2">ライフハックを共有する</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              disabled={createPostMutation.isPending}
              className="w-full bg-white rounded border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200
                    outline-none
                    py-1
                    px-3
                    leading-8
                    disabled:opacity-50"
              placeholder="どんなライフハック？"
            />
            {clientErrors.title && (
              <p className="text-red-500 text-sm mt-1">{clientErrors.title}</p>
            )}
          </div>

          <div className="mb-4">
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleBlur}
              disabled={createPostMutation.isPending}
              className="w-full bg-white rounded border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200
                    outline-none
                    py-1
                    px-3
                    leading-8
                    h-36
                    disabled:opacity-50"
              placeholder="あなただけのライフハックを！"
            />
            {clientErrors.content && (
              <p className="text-red-500 text-sm mt-1">
                {clientErrors.content}
              </p>
            )}
          </div>

          {createPostMutation.isError && (
            <div className="mb-4">
              <p className="text-red-500 text-sm">
                {createPostMutation.error instanceof Error
                  ? createPostMutation.error.message
                  : "投稿に失敗しました"}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createPostMutation.isPending}
              className="text-white bg-gray-800 py-2 px-8 hover:bg-gray-600 rounded-xl text-lg w-auto min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createPostMutation.isPending ? "投稿中..." : "投稿"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
