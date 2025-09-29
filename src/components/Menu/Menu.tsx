"use client";

import ThumbsUpDown from "./Icons/Logo";
import MobileMenu from "./MobileMenu";
import Link from "next/link";

export default function Header() {
  return (
    <header className="md:fixed md:top-0 md:left-0 bg-gray-800 text-white p-4 md:min-h-screen">
      <div className="container mx-auto flex justify-between items-start">
        {/* ロゴ */}
        <div className="text-2xl font-bold">
          <Link href="/" className="flex items-center gap-2">
            <ThumbsUpDown />
            <span>HackUp</span>
          </Link>
        </div>
        {/* ナビゲーションメニュー */}
        <nav className="hidden md:flex mt-32">
          <ul className="flex flex-col space-y-8">
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
                href="/about"
                className="hover:text-gray-300 text-2xl px-8 py-4 block"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="hover:text-gray-300 text-2xl px-8 py-4 block"
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}
