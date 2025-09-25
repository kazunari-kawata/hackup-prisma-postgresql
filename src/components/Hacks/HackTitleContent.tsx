"use client";
import { Post as PostType } from "@/lib/dao/post";

type HackTitleContentProps = {
  post: PostType;
};

export default function HackTitleContent({ post }: HackTitleContentProps) {
  return (
    <div className="py-2 px-1">
      <h2 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight leading-snug break-words">
        {post.title}
      </h2>
      <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-md p-4 border border-gray-100 shadow-sm">
        {post.content}
      </p>
    </div>
  );
}
