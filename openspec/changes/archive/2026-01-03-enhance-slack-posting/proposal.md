# Change: Enhance Slack Posting

## Why

現在のSlack投稿機能は手動コマンドのみで、ユーザーが毎回手動で実行する必要があります。時間での自動投稿機能とUIボタンによる手動投稿、さらにコメント機能を追加することで、より便利で柔軟なSlack連携を実現します。

## What Changes

- 時間ベースの自動投稿機能（設定可能な時間間隔で自動投稿）
- WebView UIに手動投稿ボタンを追加
- 投稿時にコメントを追加できる機能
- 自動投稿の設定（有効/無効、投稿間隔）を設定画面に追加

## Impact

- Affected specs: `slack-integration` (MODIFIED)
- Affected code:
  - `src/slack/webhook.ts` (修正: コメントパラメータの追加)
  - `src/slack/formatter.ts` (修正: コメントを含むフォーマット)
  - `src/slack/config.ts` (修正: 自動投稿設定の管理)
  - `src/extension.ts` (修正: 自動投稿タイマーの実装)
  - `src/webview/App.tsx` (修正: 手動投稿ボタンの追加)
  - `src/webview/components/` (新規: 投稿ボタンコンポーネント)
  - `src/webview/settings/SettingsApp.tsx` (修正: 自動投稿設定UI)
  - `src/settings/config.ts` (修正: 自動投稿設定の保存)
