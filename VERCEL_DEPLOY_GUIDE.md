# Vercel デプロイ手順

## 前提条件

1. **Vercel アカウント**: https://vercel.com でアカウント作成
2. **Prisma Accelerate**: https://cloud.prisma.io でプロジェクト作成
3. **Firebase**: https://console.firebase.google.com でプロジェクト作成
4. **PostgreSQL データベース**: 本番用データベースの準備

---

## 📦 Step 1: 環境変数の準備

以下の環境変数を取得してください：

### Database（必須）

```bash
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY"
POSTGRES_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Firebase（必須）

```bash
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

---

## 🚀 Step 2: Vercel へのデプロイ

### 方法 A: Vercel CLI（推奨）

```bash
# Vercel CLIインストール（初回のみ）
npm i -g vercel

# ログイン
vercel login

# プロジェクトディレクトリで実行
cd /path/to/hackup-prisma-postgresql

# デプロイ（プレビュー）
vercel

# 本番デプロイ
vercel --prod
```

### 方法 B: GitHub 連携（自動デプロイ）

1. **GitHub にプッシュ**

   ```bash
   git add .
   git commit -m "feat: ready for production deployment"
   git push origin develop
   ```

2. **Vercel ダッシュボード**

   - https://vercel.com/new にアクセス
   - "Import Git Repository" を選択
   - GitHub リポジトリを選択: `kazunari-kawata/hackup-prisma-postgresql`
   - ブランチを選択: `develop` または `main`

3. **プロジェクト設定**
   - Framework Preset: `Next.js`
   - Root Directory: `./` （デフォルト）
   - Build Command: `prisma generate && next build` （自動検出）
   - Output Directory: `.next` （自動検出）

---

## ⚙️ Step 3: 環境変数の設定

Vercel ダッシュボードで環境変数を設定：

1. プロジェクトページ → **Settings** → **Environment Variables**

2. 以下の変数を追加（**Production** と **Preview** の両方にチェック）：

| Key                                        | Value                     | Environment         |
| ------------------------------------------ | ------------------------- | ------------------- |
| `DATABASE_URL`                             | `prisma+postgres://...`   | Production, Preview |
| `POSTGRES_URL`                             | `postgresql://...`        | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Firebase API Key          | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | `project.firebaseapp.com` | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase Project ID       | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | `project.appspot.com`     | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID        | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Firebase App ID           | Production, Preview |

3. **Save** をクリック

---

## 🗄️ Step 4: データベースのセットアップ

### Prisma Accelerate の設定

1. https://cloud.prisma.io にアクセス
2. プロジェクトを作成
3. データベース接続情報を入力
4. **Accelerate API Key** を取得
5. `DATABASE_URL` に設定

### マイグレーション実行

**方法 1: Prisma Studio（推奨）**

```bash
# ローカルで本番DBに接続
DATABASE_URL="your-production-db-url" npx prisma db push
```

**方法 2: Vercel CLI**

```bash
# Vercelの環境でマイグレーション実行
vercel env pull .env.production.local
npx prisma db push
```

---

## 🔍 Step 5: デプロイ確認

### 1. ビルド成功の確認

Vercel ダッシュボードで：

- **Deployments** タブを確認
- 最新のデプロイが **Ready** になっているか確認
- ログにエラーがないか確認

### 2. アプリケーションの動作確認

デプロイされた URL にアクセス（例: `https://your-project.vercel.app`）

- [ ] トップページが表示される
- [ ] Firebase 認証でログインできる
- [ ] 投稿一覧が表示される
- [ ] 投稿の作成ができる
- [ ] コメントが投稿できる
- [ ] いいね・投票ができる
- [ ] 画像（アバター）が表示される

### 3. パフォーマンス確認

```bash
# Lighthouse実行
npx lighthouse https://your-project.vercel.app --view
```

**目標値:**

- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

---

## 🐛 トラブルシューティング

### ビルドエラー: "Prisma Client not generated"

**原因**: Prisma クライアントが生成されていない

**解決策**:

```bash
# package.jsonのbuildスクリプトを確認
"build": "prisma generate && next build"
```

### データベース接続エラー

**原因**: 環境変数が正しく設定されていない

**解決策**:

1. Vercel ダッシュボードで環境変数を確認
2. `DATABASE_URL` が Prisma Accelerate の URL になっているか確認
3. API キーが有効か確認

### Firebase 認証エラー

**原因**: Firebase 設定が間違っている

**解決策**:

1. Firebase Console で認証設定を確認
2. **承認済みドメイン** に Vercel の URL を追加
   - `your-project.vercel.app`
   - `your-project-*.vercel.app` （プレビュー用）

### 画像が表示されない

**原因**: 外部画像ドメインが許可されていない

**解決策**:
`next.config.ts` を確認:

```typescript
images: {
  remotePatterns: [
    { hostname: 'lh3.googleusercontent.com' }, // Google
    { hostname: 'api.dicebear.com' }, // DiceBear
  ],
}
```

### API タイムアウト

**原因**: サーバーレス関数の実行時間制限

**解決策**:

- Vercel Pro プランにアップグレード（60 秒まで可能）
- または、クエリを最適化してレスポンスタイムを短縮

---

## 🔒 セキュリティチェックリスト

デプロイ前に確認：

- [ ] `.env` ファイルが `.gitignore` に含まれている
- [ ] 環境変数が Git にコミットされていない
- [ ] Firebase 認証の承認済みドメインが設定されている
- [ ] データベースへのアクセスが制限されている
- [ ] API レートリミットが設定されている（必要に応じて）

---

## 📊 デプロイ後のタスク

### 1. カスタムドメイン設定（オプション）

Vercel ダッシュボード → **Settings** → **Domains**

1. カスタムドメインを追加
2. DNS レコードを設定（A/CNAME レコード）
3. SSL 証明書が自動発行される

### 2. Analytics 設定

Vercel ダッシュボード → **Analytics**

- Vercel Analytics を有効化（無料）
- Web Vitals、ページビューを追跡

### 3. モニタリング設定

- **Uptime 監視**: UptimeRobot などを設定
- **エラートラッキング**: Sentry を統合（オプション）

---

## 🎉 デプロイ完了！

以下を確認してください：

✅ アプリが正常に動作している  
✅ パフォーマンススコアが高い  
✅ エラーが発生していない  
✅ データベース接続が安定している  
✅ Firebase 認証が機能している

---

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Accelerate](https://www.prisma.io/docs/accelerate)
- [Firebase Console](https://console.firebase.google.com/)

---

**最終更新**: 2025 年 10 月 3 日
