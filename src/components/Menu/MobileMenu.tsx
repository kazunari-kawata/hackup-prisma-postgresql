"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type MobileMenuProps = {
  userName?: string;
  userPhotoURL?: string | null;
  children?: React.ReactNode;
};

export default function MobileMenu({
  userName,
  userPhotoURL,
  children,
}: MobileMenuProps = {}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* ハンバーガーアイコンのボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white focus:outline-none"
      >
        {/* メニューの状態に応じてアイコンを切り替える */}
        {isOpen ? (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* メニュー本体（isOpenがtrueの時だけ表示） */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-gray-800 shadow-md transition-all duration-300 ease-in-out opacity-85 z-50">
          <ul className="flex flex-col space-y-2 p-4">
            <li>
              <Link
                href="/"
                className="block px-2 py-2 hover:bg-gray-700 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/my-page"
                className="block px-2 py-2 hover:bg-gray-700 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                My Page
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="block px-2 py-2 hover:bg-gray-700 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
            </li>

            {/* ユーザー情報セクション */}
            {userName && (
              <>
                <hr className="border-gray-600 my-3" />
                <li>
                  <Link
                    href="/my-page"
                    className="flex items-center gap-3 px-2 py-2 hover:bg-gray-700 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {userPhotoURL ? (
                      <Image
                        src={userPhotoURL}
                        alt={`${userName}のプロフィール画像`}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full object-cover"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                        {userName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="text-sm">{userName}</span>
                  </Link>
                </li>
                <li className="px-2">{children}</li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
