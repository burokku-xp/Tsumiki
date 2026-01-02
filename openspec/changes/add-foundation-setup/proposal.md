# Change: Add Foundation Setup

## Why

VSCode拡張機能として動作するための基本的な構造とビルド環境が必要です。TypeScript、esbuild、拡張機能マニフェストの設定により、開発基盤を確立します。

## What Changes

- VSCode拡張機能の基本構造を構築
- `package.json`に拡張機能マニフェストを定義
- TypeScript設定（`tsconfig.json`）を追加
- esbuildビルド設定を追加
- 拡張機能のアクティベーション処理を実装
- 基本的なコマンド登録機能を実装

## Impact

- Affected specs: `extension-foundation` (新規作成)
- Affected code: 
  - `package.json` (新規)
  - `tsconfig.json` (新規)
  - `src/extension.ts` (新規)
  - `build.js` または `esbuild.config.js` (新規)
  - `.vscodeignore` (新規)
