"use client";

import Header from "@/components/Menu/Menu";
import { usePathname } from "next/navigation";

export default function LeftColumn() {
  const pathname = usePathname();
  const hideLeftColumn = ["/login", "/register"].includes(pathname);
  if (hideLeftColumn) return null;
  return (
    <div>
      <Header />
    </div>
  );
}
