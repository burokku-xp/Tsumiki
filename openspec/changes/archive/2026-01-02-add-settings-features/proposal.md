# Change: Add Settings Features

## Why

ユーザーが表示内容や投稿内容をカスタマイズできるようにするため、設定機能が必要です。VSCodeの設定APIを使用して、表示項目のON/OFF切り替えや投稿内容のカスタマイズを実現します。

## What Changes

- VSCode設定（`contributes.configuration`）の定義
- 設定画面の実装（VSCode設定UIまたはWebView）
- 表示項目のON/OFF切り替え機能
- 投稿内容のカスタマイズ機能（表示項目の選択）
- 設定の永続化と読み込み
- 設定変更時のリアルタイム反映

## Impact

- Affected specs: `settings` (新規作成)
- Affected code:
  - `package.json` (修正: `contributes.configuration`の追加)
  - `src/settings/` (新規ディレクトリ)
  - `src/settings/config.ts` (新規: 設定管理)
  - `src/views/tsumikiView.ts` (修正: 設定に基づく表示制御)
  - `src/slack/formatter.ts` (修正: 設定に基づく投稿内容制御)
