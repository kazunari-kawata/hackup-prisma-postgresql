"use client";

import { submitPostForm } from "@/lib/dao/post";
import { PostSchema } from "@/validations/contact";
import { useActionState, useState } from "react";
import { z } from "zod";

export default function PostForm() {
  const [state, formAction] = useActionState(submitPostForm, {
    success: false,
    errors: {},
  });

  const [clientErrors, setClientErrors] = useState({ title: "", content: "" });

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { title, value } = e.target;

    try {
      if (title === "title") {
        PostSchema.pick({ title: true }).parse({ title: value });
      } else if (title === "content") {
        PostSchema.pick({ content: true }).parse({ content: value });
      }
      setClientErrors((prev) => ({
        ...prev,
        [title]: "",
      }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues[0]?.message || "";
        setClientErrors((prev) => ({
          ...prev,
          [title]: errorMessage,
        }));
      }
    }
  };

  return (
    <div>
      <form action={formAction}>
        <div className="py-4 text-gray-600">
          <div className="md:w-9/10 bg-white rounded-lg p-8 flex flex-col mx-auto shadow-md">
            <h2 className="text-xs mb-2">ライフハックを共有する</h2>
            <div className="mb-4">
              {/* <label htmlFor="name" className="text-sm">
                タイトル
              </label> */}
              <input
                type="text"
                id="title"
                name="title"
                onBlur={handleBlur}
                className="w-full bg-white rounded border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200
                outline-none
                py-1
                px-3
                leading-8"
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
              {/* <label htmlFor="content" className="text-sm">
                ライフハック
              </label> */}
              <textarea
                id="content"
                name="content"
                // onBlur={handleBlur}
                className="w-full bg-white rounded border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200
                outline-none
                py-1
                px-3
                leading-8
                h-36
                "
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
            <div className="flex justify-end">
              <button className="text-white bg-gray-800 py-2 px-8 hover:bg-gray-600 rounded-xl text-lg w-auto min-w-0">
                投稿
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
