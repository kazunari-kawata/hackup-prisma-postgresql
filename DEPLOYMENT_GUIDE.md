# Vercel デプロイガイド

## 🚀 デプロイ前のチェックリスト

### 1. 環境変数の準備

以下の環境変数を Vercel ダッシュボードで設定してください：

#### データベース

```
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_ACCELERATE_API_KEY
POSTGRES_URL=postgresql://user:password@host:port/database?sslmode=require
PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_ACCELERATE_API_KEY
```

#### Firebase

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 2. Prisma Accelerate の設定

1. [Prisma Data Platform](https://cloud.prisma.io/) にログイン
2. プロジェクトを作成
3. データベースを接続
4. Accelerate API キーを取得
5. `DATABASE_URL` と `PRISMA_DATABASE_URL` に設定

### 3. ローカルテスト

本番環境設定でローカルテスト：

```bash
# 環境変数を本番設定に変更
cp .env.production.local .env.local

# ビルドテスト
npm run build

# 本番モードで起動
npm start
```

### 4. データベースマイグレーション

本番データベースにスキーマを適用：

```bash
# 本番環境のDATABASE_URLを使用
npx prisma db push

# または、マイグレーション実行
npx prisma migrate deploy
```

### 5. 初期データの投入（オプション）

本番環境にダミーデータを投入する場合：

```bash
# .env.production.local を使用
node seed-local-japanese.js
```

## 📦 Vercel へのデプロイ手順

### 方法 1: Vercel CLI を使用

```bash
# Vercel CLIインストール
npm i -g vercel

# ログイン
vercel login

# デプロイ
vercel

# 本番環境にデプロイ
vercel --prod
```

### 方法 2: GitHub 連携（推奨）

1. **GitHub リポジトリにプッシュ**

   ```bash
   git add .
   git commit -m "feat: Phase 3 implementation - production ready"
   git push origin develop
   ```

2. **Vercel ダッシュボードで設定**

   - https://vercel.com/dashboard
   - "New Project" をクリック
   - GitHub リポジトリを選択
   - 環境変数を設定
   - "Deploy" をクリック

3. **自動デプロイ設定**
   - `develop` ブランチ → プレビュー環境
   - `main` ブランチ → 本番環境

## 🔧 Vercel 設定

### Build & Development Settings

```
Build Command: prisma generate && next build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

### Environment Variables

| Variable                | Environment | Value                 |
| ----------------------- | ----------- | --------------------- |
| DATABASE_URL            | Production  | Prisma Accelerate URL |
| PRISMA_DATABASE_URL     | Production  | Prisma Accelerate URL |
| POSTGRES_URL            | Production  | Direct PostgreSQL URL |
| NEXT*PUBLIC_FIREBASE*\* | All         | Firebase config       |
| NODE_ENV                | Production  | production            |

### Functions Configuration

```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

### Regions

推奨リージョン: `hnd1` (東京)

## 📊 デプロイ後の確認

### 1. 基本動作確認

- [ ] トップページが表示される
- [ ] ログインできる
- [ ] 投稿一覧が表示される
- [ ] 投稿の作成ができる
- [ ] コメントが表示される
- [ ] いいね・投票ができる

### 2. パフォーマンス確認

```bash
# Lighthouse実行
npx lighthouse https://your-app.vercel.app --view

# または Chrome DevToolsで確認
# Performance > Lighthouse > Generate report
```

**目標値:**

- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

### 3. エラー確認

Vercel ダッシュボードで以下を確認：

- Runtime Logs
- Function Errors
- Build Logs

### 4. データベース接続確認

```bash
# Vercel CLIでログ確認
vercel logs --follow

# エラーがないことを確認
```

## 🐛 トラブルシューティング

### 問題: ビルドエラー

**原因**: Prisma クライアントが生成されていない

**解決策**:

```bash
# ビルドコマンドを修正
prisma generate && next build
```

### 問題: データベース接続エラー

**原因**: 環境変数が正しく設定されていない

**解決策**:

1. Vercel ダッシュボードで環境変数を確認
2. `DATABASE_URL` と `PRISMA_DATABASE_URL` が正しいか確認
3. Prisma Accelerate API キーが有効か確認

### 問題: 本番環境で投票が失敗する

**原因**: 外部キー制約（ユーザー ID が存在しない）

**解決策**:

1. Firebase 認証後にユーザーが DB に登録されているか確認
2. `AuthContext.tsx` でユーザー登録処理が実行されているか確認

### 問題: 画像が表示されない

**原因**: 外部画像ドメインが許可されていない

**解決策**:
`next.config.ts` に追加:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'api.dicebear.com',
    },
  ],
}
```

### 問題: API タイムアウト

**原因**: サーバーレス関数の実行時間制限

**解決策**:

1. Vercel Pro プランにアップグレード（60 秒まで可能）
2. または、クエリを最適化してレスポンスタイムを短縮

## 📈 パフォーマンス最適化

### 1. キャッシュ設定の確認

```typescript
// src/app/api/posts/with-stats/route.ts
export const revalidate = 30; // 30秒キャッシュ
export const dynamic = "force-dynamic";
```

### 2. React Query 設定の調整

本番環境用に最適化：

```typescript
// src/providers/ReactQueryProvider.tsx
staleTime: 3 * 60 * 1000, // 3分
gcTime: 10 * 60 * 1000, // 10分
refetchOnWindowFocus: true, // 本番では有効化
```

### 3. データベースインデックスの確認

```bash
# Prisma Studioで確認
npx prisma studio --browser none

# または、直接PostgreSQLで確認
\d+ "Post"
\d+ "PostVote"
```

## 🔒 セキュリティチェック

- [ ] 環境変数が Git にコミットされていない
- [ ] `.env*` が `.gitignore` に含まれている
- [ ] API 認証が適切に実装されている
- [ ] SQL インジェクション対策（Prisma が自動対応）
- [ ] XSS 対策（React が自動対応）

## 📝 デプロイ後のタスク

1. **カスタムドメイン設定**

   - Vercel ダッシュボード > Settings > Domains
   - カスタムドメインを追加
   - DNS レコードを設定

2. **Analytics 設定**

   - Vercel Analytics を有効化
   - Google Analytics を設定（オプション）

3. **エラートラッキング**

   - Sentry などのサービスを統合（オプション）

4. **モニタリング設定**
   - Uptime 監視（例: UptimeRobot）
   - パフォーマンス監視（Vercel Analytics）

## 🎉 デプロイ完了

おめでとうございます！以下を確認してください：

✅ アプリが正常に動作している
✅ パフォーマンススコアが高い
✅ エラーが発生していない
✅ データベース接続が安定している

---

**参考リンク:**

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Cloud](https://www.prisma.io/docs/accelerate)
