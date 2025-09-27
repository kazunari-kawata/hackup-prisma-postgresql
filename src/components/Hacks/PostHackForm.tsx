"use client";

import { useAuthState } from "@/lib/auth/useAuth";
import AuthenticatedPostForm from "@/components/forms/AuthenticatedPostForm";
import { PostSchema } from "@/validations/contact";
import { useState } from "react";
import { z } from "zod";

export default function PostForm() {
  const { isAuthenticated } = useAuthState();
  const [clientErrors, setClientErrors] = useState({ title: "", content: "" });

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
    <div>
      <AuthenticatedPostForm>
        {({ formAction, pending, state }) => (
          <div className="py-4 text-gray-600">
            <div className="md:w-9/10 bg-white rounded-lg p-8 flex flex-col mx-auto shadow-md">
              <h2 className="text-xs mb-2">ライフハックを共有する</h2>
              <form action={formAction}>
                <div className="mb-4">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    onBlur={handleBlur}
                    disabled={pending}
                    className="w-full bg-white rounded border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200
                    outline-none
                    py-1
                    px-3
                    leading-8
                    disabled:opacity-50"
                    placeholder="どんなライフハック？"
                  />
                  {state.errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {state.errors.title.join(", ")}
                    </p>
                  )}
                  {clientErrors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {clientErrors.title}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <textarea
                    id="content"
                    name="content"
                    onBlur={handleBlur}
                    disabled={pending}
                    className="w-full bg-white rounded border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200
                    outline-none
                    py-1
                    px-3
                    leading-8
                    h-36
                    disabled:opacity-50"
                    placeholder="あなただけのライフハックを！"
                  />
                  {state.errors.content && (
                    <p className="text-red-500 text-sm mt-1">
                      {state.errors.content.join(", ")}
                    </p>
                  )}
                  {clientErrors.content && (
                    <p className="text-red-500 text-sm mt-1">
                      {clientErrors.content}
                    </p>
                  )}
                </div>

                {state.serverError && (
                  <div className="mb-4">
                    <p className="text-red-500 text-sm">{state.serverError}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={pending}
                    className="text-white bg-gray-800 py-2 px-8 hover:bg-gray-600 rounded-xl text-lg w-auto min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pending ? "投稿中..." : "投稿"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AuthenticatedPostForm>
    </div>
  );
}
