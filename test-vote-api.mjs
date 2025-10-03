import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error"],
});

async function testVoteAPI() {
  console.log("🧪 投票API テスト\n" + "=".repeat(60));

  try {
    // 1. 投稿を取得
    console.log("\n1️⃣ 投稿データを取得...");
    const posts = await prisma.post.findMany({
      take: 3,
      select: { id: true, title: true },
    });
    console.log(`✅ ${posts.length}件の投稿を取得`);
    posts.forEach((post) => {
      console.log(`   - ID ${post.id}: ${post.title?.substring(0, 30)}...`);
    });

    if (posts.length === 0) {
      console.log("❌ 投稿が存在しません");
      return;
    }

    // 2. 各投稿の投票データを取得（API route と同じロジック）
    console.log("\n2️⃣ 各投稿の投票データを取得（API routeと同じクエリ）...");
    for (const post of posts) {
      try {
        const votes = await prisma.postVote.findMany({
          where: { postId: post.id },
        });

        const upCount = votes.filter((v) => v.voteType === "UP").length;
        const downCount = votes.filter((v) => v.voteType === "DOWN").length;

        console.log(`   投稿ID ${post.id}:`);
        console.log(`     - 総投票数: ${votes.length}件`);
        console.log(`     - UP: ${upCount}件, DOWN: ${downCount}件`);

        if (votes.length > 0) {
          console.log(`     - ユーザーID例: ${votes[0].userId}`);
        }
      } catch (error) {
        console.error(`   ❌ 投稿ID ${post.id} でエラー:`, error.message);
      }
    }

    // 3. 総投票数を確認
    console.log("\n3️⃣ 全体の投票統計...");
    const totalVotes = await prisma.postVote.count();
    const upVotes = await prisma.postVote.count({ where: { voteType: "UP" } });
    const downVotes = await prisma.postVote.count({
      where: { voteType: "DOWN" },
    });

    console.log(`✅ 総投票数: ${totalVotes}件`);
    console.log(
      `   - UP: ${upVotes}件 (${((upVotes / totalVotes) * 100).toFixed(1)}%)`
    );
    console.log(
      `   - DOWN: ${downVotes}件 (${((downVotes / totalVotes) * 100).toFixed(
        1
      )}%)`
    );

    // 4. ユーザーIDの形式チェック
    console.log("\n4️⃣ ユーザーIDの形式チェック...");
    const sampleVotes = await prisma.postVote.findMany({
      take: 5,
      select: { userId: true, postId: true, voteType: true },
    });

    console.log("サンプル投票データ:");
    sampleVotes.forEach((vote, idx) => {
      console.log(
        `   ${idx + 1}. postId: ${vote.postId}, userId: ${
          vote.userId
        }, voteType: ${vote.voteType}`
      );
    });

    // 5. 存在しない投稿への投票チェック
    console.log("\n5️⃣ データ整合性チェック...");
    const votesWithPosts = await prisma.postVote.findMany({
      include: {
        post: {
          select: { id: true },
        },
      },
    });

    const orphanedVotes = votesWithPosts.filter((v) => !v.post);
    if (orphanedVotes.length > 0) {
      console.log(
        `❌ 警告: ${orphanedVotes.length}件の孤立した投票が見つかりました`
      );
      orphanedVotes.slice(0, 5).forEach((v) => {
        console.log(
          `   - 投票ID: ${v.id}, 投稿ID: ${v.postId} (投稿が存在しません)`
        );
      });
    } else {
      console.log("✅ すべての投票データは有効な投稿に紐づいています");
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ テスト完了\n");
  } catch (error) {
    console.error("\n❌ テスト中にエラーが発生:", error);
    console.error("エラー詳細:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
  } finally {
    await prisma.$disconnect();
  }
}

testVoteAPI();
