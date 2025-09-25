import LoginForm from "@/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex justify-center md:h-screen">
      <div className="flex flex-col items-center w-full max-w-[400px]">
        <h1 className="my-6 w-full text-center text-2xl">Login</h1>
        <LoginForm />
        <div className="flex flex-col mt-8 text-center">
          <Link
            href="/register"
            className="bg-white text-black border border-black rounded-lg px-8 py-2
              hover:bg-black hover:text-white hover:border-black
              focus-visible:outline-offset-2
              transition-colors"
          >
            Register
          </Link>
          {/* <Link
            href="/"
            className="bg-gray-500 text-white rounded-lg px-8 py-2 mt-2 hover:bg-gray-400 focus-visible:outline-offset-2"
          >
            Home
          </Link> */}
        </div>
      </div>
    </main>
  );
}
