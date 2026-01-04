---
name: /code-review
id: code-review
category: Code Quality
description: Review code changes before committing. Analyzes staged files or specified files using the code-review skill.
---

# Code Review Command

コミット前のコードレビューを実行します。ステージングされたファイルまたは指定されたファイルをレビューします。

## 使用方法

### ステージングされたファイルをレビュー
```
/code-review
```

### 特定のファイルをレビュー
```
/code-review src/extension.ts
/code-review src/extension.ts src/database/models.ts
```

## レビュー内容

コードレビュースキル（`code-review`）を使用して、以下の観点からコードをレビューします：

1. **機能性**: 要件を満たしているか、エラーハンドリングが適切か
2. **セキュリティ**: 入力値検証、SQLインジェクション対策など
3. **パフォーマンス**: 不要な再レンダリング、メモリリークなど
4. **可読性**: 命名、コメント、コード構造
5. **保守性**: コードの重複、モジュール化、型安全性
6. **テスト**: テストの存在と品質

詳細なチェックリストとガイドラインは `.claude/skills/code-review/` を参照してください。

## 出力形式

レビュー結果は以下の形式で提供されます：

- **必須修正**: バグやセキュリティ問題など、必ず修正すべき項目
- **推奨改善**: コード品質向上のための推奨事項
- **質問・確認**: 意図が不明確な箇所への質問

## 注意事項

- レビューは提案であり、必ずしもすべての指摘を修正する必要はありません
- プロジェクトのコンテキストと優先順位を考慮して判断してください
- 大きな変更の場合は、OpenSpecのchange proposalに基づいているか確認してください
