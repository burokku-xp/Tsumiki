# Design: Foundation Setup

## Context

VSCode拡張機能として動作するための基盤を構築します。TypeScriptで開発し、esbuildでビルドします。

## Goals / Non-Goals

### Goals
- VSCode拡張機能として正常にロード・実行できる
- TypeScriptで開発できる環境
- esbuildによる高速ビルド
- 開発時のwatchモード対応

### Non-Goals
- この段階では計測機能は実装しない
- UIコンポーネントは実装しない
- データベースは実装しない

## Decisions

### Decision: esbuildを使用
- **理由**: 高速なビルド、シンプルな設定、TypeScript対応
- **代替案**: webpack（設定が複雑）、rollup（プラグインが必要）

### Decision: TypeScript strict modeを有効化
- **理由**: 型安全性の向上、バグの早期発見
- **代替案**: なし（推奨設定）

### Decision: 拡張機能のエントリーポイントは`src/extension.ts`
- **理由**: 一般的なVSCode拡張機能の構造に準拠
- **代替案**: なし

## Risks / Trade-offs

- **リスク**: esbuildの設定ミスによるビルドエラー
- **対策**: 公式ドキュメントを参照し、最小限の設定から開始

- **リスク**: VSCode APIのバージョン互換性
- **対策**: `engines.vscode`で最小バージョンを指定

## Migration Plan

新規プロジェクトのため、マイグレーションは不要です。

## Open Questions

なし（基本的なセットアップのため）
