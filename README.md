# HackUp - ライフハック共有プラットフォーム

Next.js、Prisma、PostgreSQL、Firebase を使用したライフハック共有アプリケーション。

## ✨ 機能

- 🔐 Firebase 認証（Google、メール/パスワード）
- 📝 投稿の作成・編集・削除
- 💬 コメント機能
- 👍 いいね・投票機能
- 🔍 検索機能
- 📱 レスポンシブデザイン
- ⚡ React Query による最適化されたデータフェッチ
- 🚀 95%の API 呼び出し削減
- 📊 Prisma Accelerate によるパフォーマンス向上

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15.5.3 (App Router)
- **言語**: TypeScript
- **データベース**: PostgreSQL + Prisma ORM 6.16.2
- **認証**: Firebase Authentication
- **状態管理**: React Query (TanStack Query) 5.x
- **スタイリング**: Tailwind CSS + Material-UI
- **デプロイ**: Vercel

## 📦 セットアップ

### 前提条件

- Node.js 20.x 以上
- PostgreSQL 14.x 以上
- Firebase プロジェクト

### インストール

1. リポジトリをクローン

```bash
git clone https://github.com/kazunari-kawata/hackup-prisma-postgresql.git
cd hackup-prisma-postgresql
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数を設定

```bash
cp .env.local.example .env.local
# .env.local を編集して、データベースとFirebaseの設定を追加
```

4. データベースのセットアップ

```bash
# Prismaクライアント生成
npx prisma generate

# マイグレーション実行
npx prisma db push

# （オプション）ダミーデータを投入
node seed-local-japanese.js
```

5. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 🚀 デプロイ

詳細なデプロイ手順は [VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md) を参照してください。

### クイックデプロイ（Vercel）

```bash
# Vercel CLIインストール
npm i -g vercel

# デプロイ
vercel --prod
```

## 📚 ドキュメント

- [Vercel デプロイガイド](./VERCEL_DEPLOY_GUIDE.md) - 詳細なデプロイ手順
- [Phase 1 レポート](./PHASE1_COMPLETION_REPORT.md) - 集約 API + インデックス最適化
- [Phase 2 レポート](./PHASE2_COMPLETION_REPORT.md) - React Query 導入
- [Phase 3 レポート](./PHASE3_REPORT.md) - 本番デプロイ準備
- [クリーンアップレポート](./CLEANUP_REPORT.md) - プロジェクト整理

## 🎯 パフォーマンス最適化

- **API 呼び出し**: 60 回 → 3 回 (95%削減)
- **初回ロード時間**: 3-5 秒 → 0.3-0.7 秒 (85%短縮)
- **2 回目以降**: キャッシュヒットで即座に表示 (<0.1 秒)
- **データベースクエリ**: 11 個のインデックスで 10-15 倍高速化

## 🔧 利用可能なスクリプト

```bash
npm run dev        # 開発サーバー起動（Turbopack）
npm run build      # 本番ビルド（Prisma生成 + Next.js ビルド）
npm start          # 本番サーバー起動
npm run lint       # ESLint実行
```

## 📂 プロジェクト構造

```
hackup-prisma-postgresql/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # APIルート
│   │   ├── posts/             # 投稿ページ
│   │   └── page.tsx           # ホームページ
│   ├── components/            # Reactコンポーネント
│   │   ├── Hacks/            # 投稿関連コンポーネント
│   │   ├── Comments/         # コメント機能
│   │   └── Reaction/         # いいね・投票機能
│   ├── hooks/                # カスタムフック（React Query）
│   ├── lib/                  # ユーティリティ
│   │   ├── auth/            # 認証関連
│   │   └── dao/             # データアクセス層
│   └── providers/           # Context Providers
├── prisma/
│   └── schema.prisma         # Prismaスキーマ
└── vercel.json              # Vercel設定
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🔗 リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
