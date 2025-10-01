"use client";

import { usePathname } from "next/navigation";
import SearchComponent from "./search-component";
import { useEffect, useState } from "react";

export default function ConditionalSearchBar() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false); // クライアントサイドでのみレンダリング
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // クライアントサイドでのみ条件判定
  if (!isClient) {
    return null; // サーバーサイドでは何も表示しない
  }

  const shouldShowSearch = pathname === "/" || pathname.startsWith("/search");

  return shouldShowSearch ? <SearchComponent /> : null;
}