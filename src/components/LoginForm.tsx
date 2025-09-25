// LoginForm.tsx
"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FbAuth } from "@/lib/firebase";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(FbAuth, provider);
      // ログイン成功時の処理（リダイレクトやメッセージなど）
    } catch (err) {
      setError("Googleログインに失敗しました");
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Googleでログイン
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}
