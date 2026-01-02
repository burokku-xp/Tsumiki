# Change: Add Display Features

## Why

計測データをユーザーに可視化するため、VSCodeのプライマリーサイドバー（エクスプローラー、検索、ソース管理などが表示される場所）で日次サマリーを表示する機能が必要です。WebViewを使用して、自由なレイアウトでダッシュボード形式のUIを提供します。

## What Changes

- WebViewのセットアップ（React統合）
- プライマリーサイドバーへのWebView登録（`contributes.viewsContainers`と`contributes.views`）
- WebViewViewProviderの実装
- Reactコンポーネント実装（作業時間、保存回数、ファイル数、変更行数、言語比率、編集ファイル一覧）
- 日次データの取得と表示更新
- リアルタイム更新機能（計測データの変更を反映）
- WebViewと拡張機能本体間の通信（postMessage）

## Impact

- Affected specs: `display` (新規作成)
- Affected code:
  - `src/views/` (新規ディレクトリ)
  - `src/views/tsumikiView.ts` (新規: WebView管理)
  - `src/webview/` (新規ディレクトリ: Reactアプリ)
  - `src/webview/App.tsx` (新規: メインコンポーネント)
  - `src/webview/components/` (新規: UIコンポーネント)
  - `package.json` (React依存関係の追加、ビルド設定、`contributes.viewsContainers`と`contributes.views`の追加)
