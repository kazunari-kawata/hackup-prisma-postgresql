import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";

// 本番環境の接続情報（複数の方式を試行）
const productionConnections = [
  {
    name: "Prisma Accelerate (推奨)",
    url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza18tM2tDOUlUVzR3eU8tclF5bHNQcloiLCJhcGlfa2V5IjoiMDFLNjA0S0JES0FRSlQxWVpaTk1YWE5FUTciLCJ0ZW5hbnRfaWQiOiI3OTNhOTlmNGUzZTkxZDAxNzg1Yzk2NzAxZGM1ZjE0YWQ4OWJkM2JmOWZmN2YzYTFlNWVhNmI3OTVmNWU3NDkzIiwiaW50ZXJuYWxfc2VjcmV0IjoiZmU0ZmUwZTctMTNmNy00ZTZlLTlkZmUtZGY1ZWNlNzAwOGI0In0.ySwT3HMawB1MPitdDY-tA8bILg_0BumQ9Jc4PoLX8ng",
  },
  {
    name: "直接接続",
    url: "postgres://793a99f4e3e91d01785c96701dc5f14ad89bd3bf9ff7f3a1e5ea6b795f5e7493:sk_-3kC9ITW4wyO-rQylsPrZ@db.prisma.io:5432/postgres?sslmode=require",
  },
];

async function createWebBasedViewer() {
  console.log("🌐 Web ベースの本番DBビューアーを作成します...");

  let workingConnection = null;

  // 接続テスト
  for (const connection of productionConnections) {
    console.log(`🔍 ${connection.name}での接続テスト中...`);

    const prisma = new PrismaClient({
      datasources: { db: { url: connection.url } },
    });

    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`✅ ${connection.name}接続成功`);
      workingConnection = connection;
      await prisma.$disconnect();
      break;
    } catch (error) {
      console.log(
        `❌ ${connection.name}接続失敗: ${error.message.split("\n")[0]}`
      );
      await prisma.$disconnect();
    }
  }

  if (!workingConnection) {
    console.log("❌ 全ての接続方法が失敗しました");
    console.log("💡 代替案:");
    console.log("   1. Prisma Cloud Console: https://cloud.prisma.io/");
    console.log("   2. ローカル環境での開発継続");
    console.log("   3. 後でデプロイしたアプリから確認");
    return;
  }

  console.log(`\n🎯 ${workingConnection.name}を使用してデータ取得中...`);

  const prisma = new PrismaClient({
    datasources: { db: { url: workingConnection.url } },
  });

  try {
    // データを取得
    const [users, posts, comments, postLikes, postVotes] = await Promise.all([
      prisma.user.findMany({
        orderBy: { id: "asc" },
        select: {
          id: true,
          username: true,
          email: true,
          karmaScore: true,
        },
      }),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { username: true } },
          _count: {
            select: { comments: true, likes: true, votes: true },
          },
        },
      }),
      prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { username: true } },
          post: { select: { title: true } },
        },
      }),
      prisma.postLike.count(),
      prisma.postVote.count(),
    ]);

    console.log("\n📊 本番環境データサマリー");
    console.log("=".repeat(50));
    console.log(`👥 ユーザー数: ${users.length}人`);
    console.log(`📝 投稿数: ${posts.length}件`);
    console.log(`💬 コメント数: ${comments.length}件`);
    console.log(`👍 いいね数: ${postLikes}件`);
    console.log(`🗳️ 投票数: ${postVotes}件`);

    // HTML ビューアー作成
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>本番環境DB ビューアー</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .section { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .stat-card { background: white; padding: 15px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #e5e7eb; font-weight: 600; }
        .japanese { color: #059669; font-weight: 500; }
        .english { color: #dc2626; }
        .title { font-size: 1.8em; margin-bottom: 20px; color: #1f2937; }
        .refresh { position: fixed; top: 20px; right: 20px; }
        .btn { background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">🌐 本番環境データベース ビューアー</h1>
        <p><strong>接続方式:</strong> ${workingConnection.name}</p>
        <p><strong>更新時刻:</strong> ${new Date().toLocaleString("ja-JP")}</p>
        
        <div class="section">
            <h2>📊 統計情報</h2>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${users.length}</div>
                    <div>ユーザー</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${posts.length}</div>
                    <div>投稿</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${comments.length}</div>
                    <div>コメント</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${postLikes}</div>
                    <div>いいね</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>👥 ユーザー一覧（最新10人）</h2>
            <table>
                <tr><th>ID</th><th>ユーザー名</th><th>メール</th><th>カルマ</th></tr>
                ${users
                  .slice(0, 10)
                  .map(
                    (user) => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.karmaScore}</td>
                </tr>
                `
                  )
                  .join("")}
            </table>
        </div>

        <div class="section">
            <h2>📝 投稿一覧</h2>
            <table>
                <tr><th>ID</th><th>タイトル</th><th>投稿者</th><th>言語</th><th>コメント</th><th>いいね</th><th>投票</th></tr>
                ${posts
                  .map((post) => {
                    const isJapanese =
                      /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(
                        post.title + post.content
                      );
                    return `
                <tr>
                    <td>${post.id}</td>
                    <td class="${
                      isJapanese ? "japanese" : "english"
                    }">${post.title.substring(0, 50)}${
                      post.title.length > 50 ? "..." : ""
                    }</td>
                    <td>${post.user.username}</td>
                    <td><span class="${isJapanese ? "japanese" : "english"}">${
                      isJapanese ? "日本語" : "英語/その他"
                    }</span></td>
                    <td>${post._count.comments}</td>
                    <td>${post._count.likes}</td>
                    <td>${post._count.votes}</td>
                </tr>
                `;
                  })
                  .join("")}
            </table>
        </div>

        <div class="section">
            <h2>💬 最新コメント（10件）</h2>
            <table>
                <tr><th>ID</th><th>コメント</th><th>投稿者</th><th>投稿タイトル</th></tr>
                ${comments
                  .slice(0, 10)
                  .map(
                    (comment) => `
                <tr>
                    <td>${comment.id}</td>
                    <td>${comment.content.substring(0, 100)}${
                      comment.content.length > 100 ? "..." : ""
                    }</td>
                    <td>${comment.user.username}</td>
                    <td>${comment.post.title.substring(0, 30)}...</td>
                </tr>
                `
                  )
                  .join("")}
            </table>
        </div>

        <div class="section">
            <h2>🔍 データ品質チェック</h2>
            <p><strong>日本語投稿率:</strong> ${Math.round(
              (posts.filter((p) =>
                /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(
                  p.title + p.content
                )
              ).length /
                posts.length) *
                100
            )}%</p>
            <p><strong>期待値との比較:</strong></p>
            <ul>
                <li>ユーザー: ${users.length}/20 ${
      users.length === 20 ? "✅" : "⚠️"
    }</li>
                <li>投稿: ${posts.length}/15 ${
      posts.length === 15 ? "✅" : "⚠️"
    }</li>
                <li>日本語投稿: ${
                  posts.filter((p) =>
                    /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(
                      p.title + p.content
                    )
                  ).length
                }件</li>
            </ul>
        </div>
    </div>
    
    <button class="btn refresh" onclick="location.reload()">🔄 更新</button>
</body>
</html>`;

    // HTMLファイルを保存
    const filename = `production-db-viewer-${
      new Date().toISOString().split("T")[0]
    }.html`;
    await fs.writeFile(filename, html);

    console.log(`\n🎉 Webビューアーを作成しました: ${filename}`);
    console.log(`💡 ブラウザで開いてください: open ${filename}`);

    // 日本語データ確認
    const japanesePosts = posts.filter((post) =>
      /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(
        post.title + post.content
      )
    );

    console.log(`\n✅ データ同期確認:`);
    console.log(
      `   - 日本語投稿: ${japanesePosts.length}/${posts.length}件 (${Math.round(
        (japanesePosts.length / posts.length) * 100
      )}%)`
    );

    if (japanesePosts.length === posts.length) {
      console.log(`🎊 完璧！全ての投稿が日本語です！`);
    }
  } catch (error) {
    console.error("❌ データ取得エラー:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createWebBasedViewer();
