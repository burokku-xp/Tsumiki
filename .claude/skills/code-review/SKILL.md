---
name: code-review
description: This skill should be used when performing code reviews, reviewing pull requests, or analyzing code quality. Use this skill when the user asks to "review code", "check code quality", "review this PR", "analyze this code", or needs guidance on code review best practices. Provides comprehensive checklists, TypeScript/React-specific guidelines, and systematic review workflows for VS Code extension development.
---

# Code Review Skill

## Overview

コードレビューを体系的に実施するためのスキルです。TypeScript/ReactベースのVS Code拡張機能開発におけるコードレビューのベストプラクティス、チェックリスト、ガイドラインを提供します。

## コードレビューの目的

コードレビューは以下の目的で実施します：

1. **品質保証**: バグ、セキュリティ問題、パフォーマンス問題の早期発見
2. **知識共有**: チーム内での知識共有とベストプラクティスの普及
3. **保守性向上**: 可読性、保守性、拡張性の確保
4. **一貫性維持**: コーディング規約とアーキテクチャパターンの遵守

## レビューワークフロー

### 1. 全体像の把握

コードレビューを開始する前に、以下を確認します：

- 変更の目的と背景を理解する
- 関連するOpenSpecのchange proposalやspecを確認する
- 影響範囲を把握する（どのファイルが変更されたか）

### 2. 体系的レビューの実施

以下の順序でレビューを実施します：

1. **機能性**: 要件を満たしているか、期待通りに動作するか
2. **セキュリティ**: セキュリティリスクがないか
3. **パフォーマンス**: パフォーマンス問題がないか
4. **可読性**: コードが理解しやすいか
5. **保守性**: 将来の変更が容易か
6. **テスト**: 適切にテストされているか

### 3. フィードバックの提供

レビュー結果は以下の形式で提供します：

- **必須修正**: バグやセキュリティ問題など、必ず修正すべき項目
- **推奨改善**: コード品質向上のための推奨事項
- **質問・確認**: 意図が不明確な箇所への質問

## レビュー観点

### 機能性

- 要件を満たしているか
- エッジケースが適切に処理されているか
- エラーハンドリングが適切か
- ユーザー体験が考慮されているか

### セキュリティ

- 入力値の検証が適切か
- SQLインジェクションなどの脆弱性がないか
- 機密情報の取り扱いが適切か
- 権限チェックが適切か

### パフォーマンス

- 不要な再レンダリングがないか（React）
- データベースクエリが最適化されているか
- メモリリークの可能性がないか
- 非同期処理が適切に実装されているか

### 可読性

- 変数名・関数名が適切か
- コメントが適切に記載されているか
- 複雑なロジックが簡潔に書かれているか
- コードの意図が明確か

### 保守性

- コードの重複がないか
- 適切にモジュール化されているか
- 依存関係が明確か
- 将来の拡張が容易か

### テスト

- 単体テストが適切に書かれているか
- テストカバレッジが十分か
- テストが保守しやすいか

## プロジェクト固有のガイドライン

このプロジェクト（Tsumiki）では、以下の規約に従います：

- **TypeScript strict mode**: 有効化されていることを確認
- **命名規則**: camelCase（変数・関数）、PascalCase（クラス）、kebab-case（ファイル名）
- **コメント**: 複雑なロジックには日本語コメントを追加
- **アーキテクチャ**: イベント駆動、データ層の抽象化、WebView通信パターン
- **OpenSpec**: 変更はOpenSpecのchange proposalに基づいて実施されているか

詳細なチェックリストとガイドラインは `references/code-review-checklist.md` と `references/typescript-react-guidelines.md` を参照してください。

## レビュー時の注意事項

### 建設的なフィードバック

- 問題点だけでなく、改善案も提示する
- コードの意図を理解してから指摘する
- 個人攻撃ではなく、コードに対する指摘に留める

### 優先順位の明確化

- 必須修正と推奨改善を明確に区別する
- 重要度の高い問題から順に指摘する

### コンテキストの考慮

- 変更の目的と背景を理解する
- 完璧を求めすぎず、実用的な判断をする
- プロジェクトの現状と将来のバランスを考慮する

## Resources

### references/

- `code-review-checklist.md`: 詳細なコードレビューチェックリスト
- `typescript-react-guidelines.md`: TypeScript/React固有のレビューガイドライン
