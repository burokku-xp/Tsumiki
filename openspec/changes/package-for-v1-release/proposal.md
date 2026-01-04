# Change: Gitで配布できるようにパッケージ化（v1.0）

## Why

現在のプロジェクトは開発環境でのみ動作する状態であり、GitHubなどで配布可能な形式になっていません。v1.0として正式リリースするため、以下の準備が必要です：

- VS Code拡張機能としてインストール可能な.vsixパッケージの作成
- 配布に必要なドキュメント（README、LICENSE、CHANGELOG）の整備
- バージョン管理の明確化（package.jsonのversionを1.0.0に更新）
- パッケージ化プロセスの自動化

## What Changes

- **package.json**: バージョンを0.0.1から1.0.0に更新
- **ビルドスクリプト**: vsceを使用したパッケージ化コマンド（`package`）を追加
- **README.md**: プロジェクトの説明、インストール方法、使い方を記載
- **LICENSE**: ライセンスファイルを追加（プロジェクトの制約に基づく）
- **CHANGELOG.md**: v1.0のリリースノートを作成
- **.vscodeignore**: パッケージに含めないファイルの確認と最適化
- **devDependencies**: `@vscode/vsce`を追加（パッケージ化ツール）

## Impact

- **Affected specs**: `extension-foundation`（パッケージ化と配布の要件を追加）
- **Affected code**: 
  - `package.json`（バージョンとスクリプト）
  - `.vscodeignore`（パッケージ化設定）
  - 新規ファイル: `README.md`, `LICENSE`, `CHANGELOG.md`
- **Breaking changes**: なし（既存機能への影響なし）
