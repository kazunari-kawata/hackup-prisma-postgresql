"use client";

export default function AboutPage() {
  return (
    <div>
      <div className="p-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          戻る
        </button>
      </div>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <article className="prose prose-indigo md:prose-lg flex flex-col items-center">
          <h1 className="mb-5 text-2xl font-bold">HackUpとは</h1>
          <p className="mb-3 leading-loose">
            HackUpは、日々の暮らしや仕事の中で役立つ
            <mark>“ちょっとした工夫＝ライフハック”</mark>
            を、誰でも気軽に共有できるプラットフォームです。ユーザーは自分の発見や体験を投稿し、
            他のユーザーは <strong>UP/DOWN</strong>{" "}
            ボタンで評価することで、シンプルに「本当に使える知恵」が浮き彫りになります。
          </p>
          <p className="leading-loose">
            私たちが目指すのは、知識や工夫が一人の頭の中に閉じ込められるのではなく、オープンに循環する社会です。
            小さなライフハックが誰かの生活を少し便利にしたり、大きな発想につながったりする。
            <br /> そんな連鎖が生まれる 場所をつくりたいと考えています。
          </p>
        </article>
      </section>
    </div>
  );
}
