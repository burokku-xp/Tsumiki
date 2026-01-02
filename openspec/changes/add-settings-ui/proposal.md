# Change: Add Settings UI

## Why

現在、設定はVSCodeの標準設定UIとコマンドで管理されていますが、以下の問題があります：
1. 配列形式の設定（Slack投稿項目）がVSCode標準UIでは扱いにくい
2. Slack Webhook URLの設定がコマンドでしかできず、分かりにくい
3. 設定が分散しており、一元管理できない

ユーザー体験を向上させるため、WebViewベースのカスタム設定画面を追加し、すべての設定を一箇所で管理できるようにします。

## What Changes

- WebViewベースの設定画面を追加（サイドパネルまたはタブとして表示）
- 表示項目のON/OFF切り替えUI（チェックボックス）
- Slack投稿項目の選択UI（チェックボックス）
- Slack Webhook URLの設定UI（入力フィールド、Secret Storageに保存）
- 設定のリアルタイム反映（変更時に即座に適用）
- 設定画面へのアクセスコマンドを追加

## Impact

- Affected specs: `settings` (MODIFIED), `display` (MODIFIED - 設定画面の追加)
- Affected code:
  - `package.json` (設定画面用のコマンドとビュー追加)
  - `src/views/settingsView.ts` (新規: 設定画面のWebViewプロバイダー)
  - `src/webview/settings/` (新規: 設定画面のReactコンポーネント)
  - `src/settings/config.ts` (修正: 設定画面からの設定更新メソッド追加)
  - `src/slack/config.ts` (修正: 設定画面からのWebhook URL更新対応)
