# Multi Claude App

Claude API統合、ストリーミングチャット、プロンプトエンジニアリング、タスク分解機能を備えた本格的な個人開発者ツール。Cloudflare Pages にデプロイ可能。

## 機能

### 💬 チャット
- **リアルタイムストリーミング** — トークン単位での出力
- **モデル切り替え** (Claude Sonnet 4.6, Opus 4.8, Haiku 4.5, Fable 5)
- **会話履歴** — 永続化とサイドバーナビゲーション
- **システムプロンプトのカスタマイズ** と温度設定
- **ストリーム途中での停止**、再生成、メッセージコピー
- **トークンカウント** — 各メッセージごと

### 🔨 プロンプトビルダー
- **プロンプト分析** → 目的、制約条件、出力形式、ギャップ、改善点を識別
- **4段階の出力生成** (シンプル / 標準 / プロフェッショナル / リサーチ)
- **バージョン比較** — 改善理由を表示
- **ビルダーから直接コピー・反復**

### ✓ タスク
- **AI によるゴール分解** → 順序付きサブタスク生成
- **実行ループ**: 各サブタスクごとに計画 → 実行 → レビュー
- **リアルタイム状態追跡** (未開始 / 実行中 / 完了 / 失敗 / 再試行)
- **タスク別ログ** — デバッグ用
- **実行の一時停止・再開**

## テックスタック

| レイヤー | 技術スタック |
|---------|------------|
| **フロントエンド** | Remix v2 · TypeScript strict · Tailwind CSS v4 · Radix UI · Jotai |
| **バックエンド** | Cloudflare Pages Workers · Wrangler |
| **データベース** | Drizzle ORM + Cloudflare D1 |
| **テスト** | Vitest · Playwright (E2E) |
| **AI** | @anthropic-ai/sdk (ストリーミング、サーキットブレーカー、レート制限対応) |

## クイックスタート

### 必須要件
- Node.js 18+
- npm または yarn
- Wrangler CLI: `npm i -g wrangler`
- Anthropic API キー

### セットアップ

```bash
# 依存パッケージをインストール
npm install

# 環境変数テンプレートをコピー
cp .dev.vars.example .dev.vars

# .dev.vars に Anthropic API キーを追加
# ANTHROPIC_API_KEY=sk-...

# データベーススキーマを生成
npm run db:generate
npm run db:migrate

# ローカル開発サーバーを起動
npm run dev
```

`http://localhost:8788` にアクセス

## プロジェクト構成

```
app/
├── features/               # 機能別の垂直スライス
│   ├── chat/              # ストリーミングチャット UI
│   ├── builder/           # プロンプト分析・生成
│   └── tasks/             # ゴール分解・実行
├── routes/                # Remix ルート (シン委譲)
├── shared/
│   ├── lib/claude/        # Claude API クライアント、モデル、サーキットブレーカー
│   ├── lib/db/            # Drizzle スキーマ・クライアント
│   ├── components/        # 共有 UI コンポーネント
│   └── types/             # 共有 TypeScript 型定義
└── styles/                # Tailwind + CSS トークン
```

**アーキテクチャ原則:** 機能優先の垂直スライス。各機能は独自のコンポーネント、フック、サービス、リポジトリ、スキーマを所有。共有コードは `app/shared/` に配置（3 機能以上で使用される場合のみ）。

## 開発

```bash
# 型チェック
npm run typecheck

# リント
npm run lint

# テスト (ユニット + 統合)
npm run test

# E2E テスト
npm run test:e2e

# 本番ビルド
npm run build

# Cloudflare Pages にデプロイ
npm run deploy
```

## デプロイ

このアプリは **Cloudflare Pages**（D1 データベース + KV キャッシュ）で実行します。

### 初回セットアップ
1. Cloudflare アカウントとプロジェクトを作成
2. `wrangler secret put` で環境シークレットを設定
3. `npm run deploy` を実行

### 必須シークレット
- `ANTHROPIC_API_KEY` — Claude API キー
- (オプション) カスタムドメイン SSL 設定

詳細は [デプロイドキュメント](./docs/deployment/cloudflare-setup.md) を参照。

## コーディング規約

### 言語 & 型
- **TypeScript strict モード** 全体に適用
- **`any` 型禁止** — `unknown` で型ガードを使用
- **Zod による I/O 検証** — API 境界で必須
- **名前付きエクスポート のみ** (ルートと `root.tsx` を除く)

### ファイル組織
- **1 ファイル最大 200 行** — 超過時は分割
- **ファイル名**: kebab-case (`chat-service.ts`)
- **React コンポーネント**: PascalCase (`MessageItem.tsx`)
- **フック**: `use` プレフィックス (`useStream.ts`)
- **サービス/リポジトリ**: 機能名プレフィックス (`ChatService.ts`, `ConversationRepository.ts`)

### データベース & API
- **Drizzle リポジトリ** が全 SQL クエリを所有
- **サービス** がビジネスロジックを所有
- **ルート** は入力検証 → サービス呼び出し → レスポンス返却
- **生 SQL は禁止** — `*Repository.ts` ファイル外では使用禁止

### テスト
- **ユニットテスト** — 純関数とサービスメソッド (Vitest)
- **統合テスト** — リポジトリを実際の Miniflare D1 でテスト
- **E2E テスト** — 完全なユーザーフロー (Playwright)
- **カバレッジ目標**: 行/関数 80%, ブランチ 75%

### コミット
- 従来形式: `feat:` `fix:` `chore:` `docs:` `test:` `refactor:`
- 1 コミット = 1 つの論理的変更
- PR マージには CI パス + 1 審査者の承認が必須

## 主要機能の詳細

### Claude API 統合
- **スマートパラメータ構築** — `buildMessageParams()` でモデル固有機能に対応
- **Server-Sent Events でのストリーミング** — リアルタイムトークン出力
- **サーキットブレーカー** — API 障害への優雅な対応
- **レート制限** — API クォータの尊重
- **リクエスト ID ロギング** — Anthropic サポート対応用

### モデルサポート
- **Sonnet 4.6** (デフォルト、バランス型)
- **Opus 4.8** (推論, 温度設定不可)
- **Haiku 4.5** (高速、低コスト)
- **Fable 5** (拡張思考, 温度設定不可)

詳細は [モデル機能一覧](./docs/api/model-capabilities.md) を参照。

### エラーハンドリング
- `stop_reason: "refusal"` の明示的ハンドリング (ストリーミングルート)
- 構造化ロギング (`~/shared/lib/logger` を使用)
- `AppError` でアプリケーションレベルエラーを管理
- サイレント キャッチ禁止 — 常にコンテキストをログするか再スロー

## ロードマップ

### MVP (現在)
- [ ] ストリーミングとモデル切り替え対応のチャット
- [ ] 分析・生成機能付きプロンプトビルダー
- [ ] タスク分解と実行ループ
- [ ] モデルが 400 エラーなく正常動作
- [ ] Cloudflare Pages へのデプロイ
- [ ] コア E2E テストのパス

### Beta (+3 週間)
- サーキットブレーカーとレート制限の負荷テスト
- R2 への構造化ログ出力
- パフォーマンス向上用 KV キャッシング
- 8 言語のシンタックスハイライト
- 完全キーボード操作対応
- モバイルレスポンシブ (320px–1920px)

### v1 (+6 週間)
- バックグラウンドタスク用 Durable Objects
- 会話エクスポート (Markdown)
- 検索・お気に入り機能付きプロンプト履歴
- トークン使用量分析ページ
- ARIA 完全準拠

詳細は [GOAL.md](./GOAL.md) を参照。

## ドキュメント

- [アーキテクチャ概要](./docs/architecture/overview.md)
- [API ストリーミングガイド](./docs/api/streaming.md)
- [データベーススキーマ](./docs/database/schema.md)
- [はじめに](./docs/development/getting-started.md)
- [テスト戦略](./docs/development/testing.md)
- [デプロイガイド](./docs/deployment/cloudflare-setup.md)
- [トラブルシューティング](./docs/troubleshooting.md)

## セキュリティ

- **コードにシークレット非埋め込み** — 全 API キーは Cloudflare ダッシュボードのみ
- **生 SQL なし** — Drizzle がインジェクション攻撃を防止
- **入力検証** — 全 API 境界で Zod による検証
- **HTTPS デフォルト** — Cloudflare Pages で自動対応
- **SQLite 暗号化** — D1 での保存時暗号化

詳細は [セキュリティモデル](./docs/architecture/security-model.md) を参照。

## 貢献

1. [CLAUDE.md](./CLAUDE.md) のコーディング規約に従う
2. 全変更についてテスト作成 (ユニット + 統合 or E2E)
3. 従来形式でコミット
4. PR 前に CI パスを確認

## ライセンス

MIT

## サポート

問題または質問がある場合:
- [トラブルシューティング](./docs/troubleshooting.md) を確認
- 再現ステップを含めて GitHub Issue を開く
- [アーキテクチャドキュメント](./docs/architecture/overview.md) で設計判断を確認