---
name: plan-openspec-executor
description: This skill should be used when executing Cursor plan mode plan files (.cursor/plans/*.plan.md) that involve OpenSpec-based development. Use this skill when working with plan files that contain OpenSpec change proposals, implementation tasks, or archiving tasks. Guides the proper use of OpenSpec slash commands (/openspec-proposal, /openspec-apply, /openspec-archive) during plan execution with appropriate design review phases, implementation scoping, and session management.
---

# Plan Openspec Executor

## Overview

Cursorのplanモードで作成したプランファイル（`.cursor/plans/*.plan.md`）を実行する際に、OpenSpecのスラッシュコマンドを適切に使用するためのガイドを提供する。プランファイル内のtodoを解析し、各todoの種類に応じて適切なOpenSpecコマンドを実行し、設計確認、実装、動作確認、アーカイブの各フェーズを管理する。

## プランファイルの構造

プランファイルは以下の構造を持つ：

```yaml
---
name: プラン名
overview: プランの概要
todos:
  - id: todo-id
    content: todoの内容
    status: pending|in_progress|completed
---
```

各todoの`content`を解析し、以下の種類を判定する：

- **change proposal作成**: "change proposalを作成"、"proposalを作成"などのキーワードを含む
- **実装タスク**: "実装"、"実装する"などのキーワードを含む
- **アーカイブ**: "アーカイブ"、"archive"などのキーワードを含む

詳細な解析方法は `references/plan-execution-guide.md` を参照。

## ワークフロー

### 1. Change Proposal作成フェーズ

**使用コマンド**: `/openspec-proposal`

**手順**:

1. プランファイルを読み込み、proposal作成のtodoを特定
2. todoの内容からchange-idを抽出（例: "add-foundation-setupのchange proposalを作成" → `add-foundation-setup`）
3. 実装スコープを定義（`references/scope-definition.md`を参照）:
   - 機能ごとに分離し、他の機能への影響を最小化
   - スコープ外のファイルには手を付けない
   - 必要な連携箇所は確認の上で含める
4. `/openspec-proposal`コマンドを実行してproposalを作成
5. **設計確認フェーズ**: proposal作成後、applyを実行する前にユーザーに設計を確認させる
   - proposal.mdの内容を提示
   - スコープ定義を確認
   - ユーザーの承認を得るまで次のステップに進まない

### 2. 実装タスクフェーズ

**使用コマンド**: `/openspec-apply`

**手順**:

1. 設計確認が完了したproposalを特定
2. `/openspec-apply`コマンドを実行して実装を開始
3. `tasks.md`のチェックリストに従って順次実装
4. **動作確認フェーズ**: 実装完了後、動作確認を実施
   - 不具合があればユーザーと一緒に修正
   - ユーザーが問題ないと判断するまで修正を繰り返す
5. 最終的にユーザーが問題ないと判断したら、アーカイブフェーズに進む

### 3. アーカイブフェーズ

**使用コマンド**: `/openspec-archive`

**手順**:

1. 動作確認が完了し、ユーザーが問題ないと判断したchange-idを特定
2. `/openspec-archive`コマンドを実行してアーカイブ
3. **セッションリセット**: アーカイブ完了後、セッションをリセットして次のtodoに進む
   - 現在のコンテキストをクリア
   - 次のtodoの内容を確認
   - 次のフェーズに移行

## スコープ定義の重要性

各change proposalを作成する際は、実装スコープを明確に定義することが重要。詳細は `references/scope-definition.md` を参照。

**基本原則**:

- 機能ごとに分離し、他の機能への影響を最小化
- スコープ外のファイルには手を付けない
- 必要な連携箇所は確認の上で含める
- proposal.mdにスコープ定義を明記

## プラン実行の詳細ガイド

プランファイルの解析方法、todoの種類判定、依存関係の管理については `references/plan-execution-guide.md` を参照。

## OpenSpecコマンドの詳細

各OpenSpecコマンドの使い方と注意点については `references/openspec-commands.md` を参照。

## 実行例

### 例1: プランファイルからproposal作成

```
ユーザー: プランファイルを実行して
```

1. `.cursor/plans/*.plan.md`を読み込み
2. 最初のpending状態のtodoを特定（例: "add-foundation-setupのchange proposalを作成"）
3. change-idを抽出（`add-foundation-setup`）
4. スコープを定義（基盤セットアップに関連するファイルのみ）
5. `/openspec-proposal`を実行
6. 設計確認フェーズでユーザーに確認

### 例2: 実装タスクの実行

```
ユーザー: 次のtodoを実行して
```

1. 次のpending状態のtodoを特定（例: "add-foundation-setupを実装"）
2. 対応するproposalが承認済みか確認
3. `/openspec-apply`を実行
4. 動作確認フェーズで不具合があれば修正
5. ユーザーが問題ないと判断したらアーカイブ

## 注意事項

- **設計確認は必須**: proposal作成後、applyを実行する前に必ずユーザーに設計を確認させる
- **スコープの厳守**: スコープ外のファイルには手を付けない
- **動作確認の徹底**: 実装完了後は必ず動作確認を実施し、不具合があれば修正
- **セッションリセット**: アーカイブ完了後は必ずセッションをリセットして次のtodoに進む

## Resources

### references/

- `plan-execution-guide.md`: プランファイルの解析方法と実行ガイド
- `scope-definition.md`: スコープ定義の詳細ガイドライン
- `openspec-commands.md`: OpenSpecコマンドの使い方と注意点
