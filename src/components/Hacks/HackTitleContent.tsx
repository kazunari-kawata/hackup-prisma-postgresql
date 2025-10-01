"use client";
import { PostWithUser } from "@/lib/dao/post";

type HackTitleContentProps = {
  post: PostWithUser;
  isPreview?: boolean;
};

export default function HackTitleContent({
  post,
  isPreview = false,
}: HackTitleContentProps) {
  const contentToShow =
    isPreview && post.content.length > 200
      ? post.content.substring(0, 200) + "..."
      : post.content;

  return (
    <div className="py-2 px-1">
      <h2 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight leading-snug break-words">
        {post.title}
      </h2>
      <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-md p-4 border border-gray-100 shadow-sm">
        {contentToShow}
      </p>
    </div>
  );
}
