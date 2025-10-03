import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function debugVotesAPI() {
  console.log("🔍 投票API デバッグツール");
  console.log("=".repeat(60));

  try {
    // 1. データベース接続確認
    console.log("\n1️⃣ データベース接続確認");
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ データベース接続成功");

    // 2. PostVoteテーブルの存在確認
    console.log("\n2️⃣ PostVoteテーブル確認");
    const voteCount = await prisma.postVote.count();
    console.log(`✅ PostVoteテーブル存在: ${voteCount}件のレコード`);

    // 3. 投稿の存在確認
    console.log("\n3️⃣ 投稿データ確認");
    const posts = await prisma.post.findMany({
      take: 5,
      select: { id: true, title: true },
    });
    console.log(`✅ ${posts.length}件の投稿を取得`);
    posts.forEach((post) => {
      console.log(`   - ID ${post.id}: ${post.title.substring(0, 30)}...`);
    });

    if (posts.length === 0) {
      console.log("⚠️ 投稿が存在しません");
      return;
    }

    // 4. 各投稿の投票データ確認
    console.log("\n4️⃣ 投票データ詳細確認");
    for (const post of posts) {
      try {
        const votes = await prisma.postVote.findMany({
          where: { postId: post.id },
        });
        console.log(`   投稿ID ${post.id}: ${votes.length}件の投票`);

        if (votes.length > 0) {
          const upVotes = votes.filter((v) => v.voteType === "UP").length;
          const downVotes = votes.filter((v) => v.voteType === "DOWN").length;
          console.log(`     - UP: ${upVotes}件, DOWN: ${downVotes}件`);
        }
      } catch (error) {
        console.error(`   ❌ 投稿ID ${post.id}の投票取得エラー:`, error);
      }
    }

    // 5. スキーマ確認
    console.log("\n5️⃣ PostVoteスキーマ確認");
    const sampleVote = await prisma.postVote.findFirst();
    if (sampleVote) {
      console.log("✅ サンプル投票レコード:", {
        id: sampleVote.id,
        postId: sampleVote.postId,
        userId: sampleVote.userId,
        voteType: sampleVote.voteType,
        createdAt: sampleVote.createdAt,
      });
    } else {
      console.log("⚠️ 投票レコードが存在しません");
    }

    // 6. 潜在的な問題の確認
    console.log("\n6️⃣ 潜在的な問題チェック");

    // 存在しない投稿への投票
    const orphanedVotes = await prisma.postVote.findMany({
      where: {
        post: null,
      },
    });
    if (orphanedVotes.length > 0) {
      console.log(`⚠️ 孤立した投票: ${orphanedVotes.length}件`);
    } else {
      console.log("✅ 孤立した投票なし");
    }

    // 7. APIシミュレーション
    console.log("\n7️⃣ API動作シミュレーション");
    const testPostId = posts[0].id;
    console.log(`テスト対象投稿ID: ${testPostId}`);

    try {
      const simulatedVotes = await prisma.postVote.findMany({
        where: { postId: testPostId },
      });
      console.log(`✅ APIシミュレーション成功: ${simulatedVotes.length}件取得`);
    } catch (error) {
      console.error("❌ APIシミュレーションエラー:", error);
    }

    // 8. エラーパターン分析
    console.log("\n8️⃣ 考えられるエラー原因");
    console.log("以下をチェックしてください:");
    console.log("  1. フロントエンドが正しい投稿IDを送信しているか");
    console.log("  2. 認証状態が正しく管理されているか");
    console.log("  3. データベース接続がタイムアウトしていないか");
    console.log("  4. 環境変数が正しく設定されているか");
    console.log("  5. Prismaクライアントが最新か");
  } catch (error) {
    console.error("\n❌ デバッグ中にエラー:", error);

    if (error instanceof Error) {
      console.log("\nエラー詳細:");
      console.log("  メッセージ:", error.message);
      console.log("  スタック:", error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// ログ監視
console.log("\n💡 このスクリプトは以下を確認します:");
console.log("  - データベース接続");
console.log("  - PostVoteテーブルの存在");
console.log("  - 投稿データの存在");
console.log("  - 投票データの整合性");
console.log("  - API動作のシミュレーション");
console.log("");

debugVotesAPI();
