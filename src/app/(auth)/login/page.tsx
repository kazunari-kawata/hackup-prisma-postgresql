import LoginForm from "@/components/auth/LoginForm";
import ThumbsUpDown from "@/components/Menu/Icons/Logo";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* メインカード */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          {/* ヘッダー部分 */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <h1 className="inline-flex gap-2 items-center text-3xl font-bold text-white bg-gray-800 px-6 py-4 rounded-2xl shadow-lg">
                <ThumbsUpDown />
                <span>HackUp</span>
              </h1>
            </div>
            <p className="text-gray-600 text-sm">知識を共有し、遊びましょう</p>
          </div>

          {/* ログインフォーム */}
          <LoginForm />
        </div>

        {/* ホームに戻るリンク */}
        <div className="text-center mt-6"></div>
      </div>
    </main>
  );
}
