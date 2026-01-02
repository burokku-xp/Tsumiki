## 1. 設定画面のWebViewプロバイダー実装

- [x] 1.1 `src/views/settingsView.ts`を作成
- [x] 1.2 WebViewプロバイダークラスを実装
- [x] 1.3 HTML生成メソッドを実装
- [x] 1.4 メッセージハンドラーを実装（設定更新、Webhook URL設定）

## 2. 設定画面のReactコンポーネント実装

- [x] 2.1 `src/webview/settings/`ディレクトリを作成
- [x] 2.2 `SettingsApp.tsx`を作成（メインコンポーネント）
- [x] 2.3 表示項目のON/OFF切り替えコンポーネントを実装
- [x] 2.4 Slack投稿項目の選択コンポーネントを実装
- [x] 2.5 Slack Webhook URL設定コンポーネントを実装
- [x] 2.6 設定の保存機能を実装
- [x] 2.7 スタイリングを実装（既存のApp.cssを参考）

## 3. 設定管理機能の拡張

- [x] 3.1 `src/settings/config.ts`に設定更新メソッドを追加（VSCode設定APIを使用）
- [x] 3.2 `src/slack/config.ts`を確認（既存の実装を活用）
- [x] 3.3 設定画面からの設定更新を実装

## 4. package.jsonの更新

- [x] 4.1 設定画面用のコマンドを追加（`tsumiki.openSettings`）
- [x] 4.2 設定画面用のビューを追加（`viewsContainers`と`views`）

## 5. 統合とテスト

- [x] 5.1 `src/extension.ts`に設定画面の登録を追加
- [ ] 5.2 設定画面から設定を変更し、リアルタイム反映されることを確認
- [ ] 5.3 VSCode標準設定UIとカスタム設定画面の両方で設定できることを確認
- [ ] 5.4 Slack Webhook URLの設定が正常に動作することを確認
