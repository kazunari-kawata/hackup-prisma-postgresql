"use client";

import Header from "@/components/Menu/Menu";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import LogoutButton from "@/components/auth/LogoutButton";

export default function LeftColumn() {
  const pathname = usePathname();
  const { user } = useAuth();
  const hideLeftColumn = ["/login", "/register"].includes(pathname);

  if (hideLeftColumn) return null;

  const userName = user?.displayName || user?.email?.split("@")[0] || "ゲスト";
  const userPhotoURL = user?.photoURL;

  return (
    <div>
      <Header userName={userName} userPhotoURL={userPhotoURL}>
        <LogoutButton />
      </Header>
    </div>
  );
}
