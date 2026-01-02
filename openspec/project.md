# Project Context

## Purpose

Tsumiki（積み木）は、開発者の作業量を可視化し、達成感を得られる自己管理ツールです。
VSCode/Cursor拡張機能として実装され、日々の開発活動を記録・表示することで、「これだけやった」という実感を提供します。

主な目的:
- 作業量の可視化による達成感の提供
- 日々の成長・頑張りを振り返れる開発日記
- 研修進捗の把握（週報では見えない実態を可視化）

## Tech Stack

- **拡張本体**: TypeScript
- **UI**: WebView + React
- **データ保存**: SQLite（better-sqlite3）
- **Slack連携**: Incoming Webhook（HTTP POST）
- **ビルド**: esbuild
- **パッケージ管理**: pnpm

## Project Conventions

### Code Style

- TypeScript strict modeを有効化
- ESLint + Prettierを使用（設定は後で追加）
- 命名規則: camelCase（変数・関数）、PascalCase（クラス）、kebab-case（ファイル名）
- コメント: 複雑なロジックには日本語コメントを追加

### Architecture Patterns

- **イベント駆動**: VSCode APIのイベント（`onDidSaveTextDocument`など）を活用
- **データ層の抽象化**: SQLite操作を抽象化したレイヤーを提供
- **WebView通信**: `postMessage`による拡張機能本体とUI間の通信
- **機能分割**: 計測、表示、連携を独立したモジュールとして実装

### Testing Strategy

- 単体テスト: 計測ロジック、データベース操作
- 統合テスト: VSCode APIとの連携
- 手動テスト: UI表示、Slack連携

### Git Workflow

- GitHub Flowを採用
- 機能ブランチ: `feature/[change-id]`
- コミットメッセージ: 簡潔で明確な説明

## Domain Context

### 計測ルール

- **行数**: 保存時のみカウント（連打防止）
- **空行・コメント**: カウント対象外
- **信頼性**: 行数は参考値、作業時間・保存回数・ファイル数で総合判断
- **言語判定**: 拡張子ベースで集計

### データモデル

- **作業セッション**: タイマーの開始/終了時刻
- **ファイル編集記録**: ファイル名、編集行数、言語、保存時刻
- **日次統計**: 作業時間、保存回数、ファイル数、変更行数、言語比率

## Important Constraints

- **プライバシー**: コード内容の送信は行わない（統計のみ）
- **収益化禁止**: 広告・課金・販売は行わない
- **用途限定**: 学習・検証・実績づくり目的に限定
- **外部転用禁止**: 外部クライアント案件への転用禁止
- **個人情報**: 実在する業務データ・個人情報の利用禁止

## External Dependencies

- **VSCode API**: 拡張機能の基本機能
- **better-sqlite3**: SQLiteデータベース操作
- **Slack Incoming Webhook**: 日次サマリーの投稿
- **React**: UIコンポーネント構築
