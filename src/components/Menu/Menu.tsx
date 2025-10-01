"use client";

import { useEffect, useState } from "react";
import ThumbsUpDown from "./Icons/Logo";
import MobileMenu from "./MobileMenu";
import Link from "next/link";
import Image from "next/image";

type HeaderProps = {
  userName?: string;
  userPhotoURL?: string | null;
  children?: React.ReactNode;
};

export default function Header({
  userName,
  userPhotoURL,
  children,
}: HeaderProps = {}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <header className="bg-gray-800 text-white p-4 md:fixed md:top-0 md:left-0 md:min-h-screen md:w-64 lg:w-72">
      <div className="flex justify-between items-start md:flex-col md:justify-between md:h-full">
        {/* ロゴ */}
        <div className="text-2xl font-bold">
          <Link href="/" className="flex items-center gap-2">
            <ThumbsUpDown />
            <span>HackUp</span>
          </Link>
        </div>
        {/* ナビゲーションメニュー */}
        <nav className="hidden md:flex flex-col flex-1 mt-16 w-full">
          <ul className="flex flex-col space-y-6 flex-grow">
            <li>
              <Link
                href="/"
                className="hover:text-gray-300 text-2xl px-8 py-4 block"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/my-page"
                className="hover:text-gray-300 text-2xl px-8 py-4 block"
              >
                My Page
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-gray-300 text-2xl px-8 py-4 block"
              >
                About
              </Link>
            </li>
          </ul>

          {/* ユーザー情報セクション */}
          {userName && isClient && (
            <div className="mt-auto border-t border-gray-700 pt-4 px-8">
              <div className="flex flex-col space-y-1">
                <Link
                  href="/my-page"
                  className="flex items-center gap-3 hover:bg-gray-700 rounded-lg p-2 transition-colors"
                >
                  {userPhotoURL ? (
                    <Image
                      src={userPhotoURL}
                      alt={`${userName}のプロフィール画像`}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                      unoptimized={true}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {userName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="font-medium text-white text-sm truncate">
                    {userName}
                  </span>
                </Link>
                <div className="flex justify-center">{children}</div>
              </div>
            </div>
          )}
        </nav>
        <MobileMenu userName={userName} userPhotoURL={userPhotoURL}>
          {children}
        </MobileMenu>
      </div>
    </header>
  );
}
