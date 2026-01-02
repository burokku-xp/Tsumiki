# Change: タイマーUIの追加

## Why

現在、タイマーの開始/停止はコマンドパレットまたはステータスバーからのみ操作可能です。サイドパネルにタイマーUIを追加することで、ユーザーはより直感的にタイマーを操作でき、現在のタイマー状態も一目で確認できるようになります。

## What Changes

- サイドパネルにタイマーコントロール（開始/停止ボタン）を追加
  - Header（「🧱 本日の記録」）の直下に配置
  - 統計情報セクションの前に表示
- タイマーの現在の状態（動作中/停止中）を表示
- リアルタイムで経過時間を表示
- WebViewと拡張機能本体間でタイマー状態を同期

## Impact

- Affected specs: `display`
- Affected code:
  - `src/webview/App.tsx` - タイマーUIコンポーネントの追加
  - `src/webview/components/` - タイマーコントロールコンポーネント
  - `src/views/tsumikiView.ts` - タイマー状態のメッセージハンドリング
  - `src/extension.ts` - タイマーコマンドとWebViewの連携
