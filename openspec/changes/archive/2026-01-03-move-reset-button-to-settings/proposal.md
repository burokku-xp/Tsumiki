# Change: リセットボタンを設定画面に移植

## Why
現在、リセットボタンは機能画面（メインのサイドパネル）のヘッダーに配置されていますが、データリセットは設定操作として扱うべきです。設定画面に移動することで、UIの一貫性が向上し、リセット機能がより適切な場所に配置されます。

## What Changes
- 機能画面（Header.tsx）からリセットボタンを削除
- 設定画面（SettingsApp.tsx）にリセットボタンを追加
- リセット機能の実装（tsumikiView.tsの`_handleResetToday`）は設定画面からも利用可能にする
- 設定画面のWebViewプロバイダー（settingsView.ts）にリセットコマンドのハンドラーを追加

## Impact
- Affected specs: `display` (リセットボタンの削除), `settings` (リセットボタンの追加)
- Affected code:
  - `src/webview/components/Header.tsx` - リセットボタンを削除
  - `src/webview/settings/SettingsApp.tsx` - リセットボタンを追加
  - `src/views/settingsView.ts` - リセットコマンドのハンドラーを追加
  - `src/views/tsumikiView.ts` - リセットハンドラーは既存のものを再利用（変更なし）
