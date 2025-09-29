'use client';
import { useState } from 'react';
import Link from 'next/link';

// アイコン用のSVGや、メニュー項目を props で受け取ることもできます
export default function MobileMenu() {
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
        <div className="absolute top-16 left-0 w-full bg-gray-800 shadow-md transition-all duration-300 ease-in-out opacity-85">
          <ul className="flex flex-col space-y-2 p-4">
            <li>
              <Link
                href="/"
                className="block px-2 py-2 hover:bg-gray-700 rounded-md"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="block px-2 py-2 hover:bg-gray-700 rounded-md"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="block px-2 py-2 hover:bg-gray-700 rounded-md"
              >
                Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
