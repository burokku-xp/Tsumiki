# Change: Add Data Persistence

## Why

計測データを永続化するため、SQLiteデータベースによるローカルデータ保存機能が必要です。作業セッション、ファイル編集記録、日次統計などのデータを無期限に保持します。

## What Changes

- SQLiteデータベースの初期化機能を実装
- データモデル定義（作業セッション、ファイル編集記録、日次統計）
- データベース操作の抽象化レイヤーを実装
- マイグレーション機能を実装
- データベースファイルの管理（作成、バックアップ）

## Impact

- Affected specs: `data-persistence` (新規作成)
- Affected code:
  - `src/database/` (新規ディレクトリ)
  - `src/database/db.ts` (新規: データベース初期化)
  - `src/database/models.ts` (新規: データモデル定義)
  - `src/database/migrations.ts` (新規: マイグレーション)
  - `package.json` (better-sqlite3依存関係の追加)
