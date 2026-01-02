# Change: Add Slack Integration

## Why

日次サマリーをSlackに投稿する機能により、ユーザーが作業内容を共有し、研修担当者が進捗を把握できるようになります。Incoming Webhookを使用して、シンプルで安全な連携を実現します。

## What Changes

- Webhook URL設定の保存機能（Secret Storage APIを使用）
- 日次サマリーのSlack形式フォーマット機能
- HTTPリクエスト送信機能（Incoming WebhookへのPOST）
- エラーハンドリング（接続失敗、無効なURLなど）
- 投稿タイミングの制御（手動トリガーまたは自動投稿設定）
- コマンド登録（Slack投稿の実行）

## Impact

- Affected specs: `slack-integration` (新規作成)
- Affected code:
  - `src/slack/` (新規ディレクトリ)
  - `src/slack/webhook.ts` (新規: Webhook送信機能)
  - `src/slack/formatter.ts` (新規: Slack形式フォーマット)
  - `src/slack/config.ts` (新規: Webhook URL設定管理)
  - `src/extension.ts` (修正: コマンド登録)
  - `package.json` (HTTPクライアント依存関係の追加)
