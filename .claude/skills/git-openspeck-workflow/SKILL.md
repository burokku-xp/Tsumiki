---
name: git-openspeck-workflow
description: This skill should be used when working with Git repositories that follow GitHub Flow and use OpenSpec for spec-driven development. Use this skill when creating feature branches, opening pull requests, merging changes, working with OpenSpec commands (/openspec-proposal, /openspec-apply, /openspec-archive), or when needing guidance on branch naming conventions, commit message standards, integration branch management, and deployment workflows.
---

# Git Openspec Workflow

## Overview

GitHub FlowとOpenSpec（仕様駆動開発）を組み合わせた開発フローを提供する。mainブランチを常にデプロイ可能な状態に保ち、機能ブランチで作業を行い、OpenSpecで仕様管理を行い、コードレビューと承認プロセスを経てマージする。

## ブランチ戦略: GitHub Flow

GitHub Flowは以下の原則に基づく：

- **mainブランチ**: 常にデプロイ可能な状態を維持
- **機能ブランチ**: 新機能や修正はmainから分岐して作業
- **即座のデプロイ**: マージ後は即座にデプロイ可能

### ブランチ命名規則

機能ブランチは以下の命名規則に従う：

- **機能追加**: `feature/機能名` (例: `feature/user-authentication`)
- **バグ修正**: `fix/修正内容` (例: `fix/login-error`)
- **ドキュメント**: `docs/内容` (例: `docs/api-documentation`)
- **リファクタリング**: `refactor/対象` (例: `refactor/auth-module`)
- **パフォーマンス改善**: `perf/改善内容` (例: `perf/query-optimization`)

命名規則の詳細は `references/branch-naming.md` を参照。

## OpenSpecコマンドとの連携

OpenSpecを使用した開発では、以下のコマンド実行時にGit操作を適切に行う。

### 統合ブランチの管理

OpenSpecを使用するプロジェクトでは、統合ブランチ（`integration`または`develop`）を使用する。

#### 統合ブランチの確認と作成

作業を開始する前に、統合ブランチが存在するか確認し、存在しない場合は作成する：

```bash
# 統合ブランチの存在確認
git branch -a | grep -E "(integration|develop)"

# 統合ブランチが存在しない場合、作成
git checkout main
git pull origin main
git checkout -b integration
git push -u origin integration
```

**注意**: プロジェクトで使用する統合ブランチ名（`integration`または`develop`）を確認してから作成する。

### `/openspec-proposal`実行時のブランチ切り替え

OpenSpecで提案（proposal）を作成する際は、作業ブランチに切り替える：

```bash
# 1. 統合ブランチの存在確認（存在しない場合は作成）
git branch -a | grep -E "(integration|develop)" || git checkout -b integration

# 2. 統合ブランチに切り替え（最新の状態を取得）
git checkout integration
git pull origin integration

# 3. 提案用の作業ブランチを作成
# 提案のchange-idに基づいてブランチ名を決定
git checkout -b openspec/change-id

# 4. OpenSpecの提案を作成
# /openspec-proposal コマンドを実行
```

**ブランチ命名規則**: OpenSpecの提案ブランチは `openspec/<change-id>` の形式を使用する。

### `/openspec-apply`実行時のコミット方針

OpenSpecで実装（apply）を行う際は、細かくコミットする：

```bash
# 実装作業中は、意味のある単位で頻繁にコミット
# 例: タスクの1つが完了したら即座にコミット

# タスク1.1完了時
git add .
git commit -m "feat: Implement task 1.1 - Create database schema"

# タスク1.2完了時
git add .
git commit -m "feat: Implement task 1.2 - Add API endpoint"

# タスク1.3完了時
git add .
git commit -m "feat: Implement task 1.3 - Add frontend component"
```

**コミット方針**:
- タスク（`tasks.md`の各項目）ごとにコミット
- 1つのコミットで複数のタスクをまとめない
- コミットメッセージにはタスク番号を含める
- 小さな変更でも意味があればコミット

### `/openspec-archive`実行時のPR作成

OpenSpecでアーカイブ（archive）を行う際は、統合ブランチにマージするためのPRを作成する：

```bash
# 1. 作業ブランチの変更をすべてコミット・プッシュ
git add .
git commit -m "chore: Complete implementation for change-id"
git push origin openspec/change-id

# 2. OpenSpecのアーカイブを実行
# /openspec-archive コマンドを実行

# 3. 統合ブランチにマージするためのPRを作成
# GitHubでPRを作成: openspec/change-id → integration
```

**PR作成時の注意事項**:
- ベースブランチ: `integration`（または`develop`）
- 比較ブランチ: `openspec/<change-id>`
- PRの説明には、OpenSpecのchange-idと関連するproposal.mdへのリンクを含める
- コードレビューを依頼する

**PR説明テンプレート（OpenSpec用）**:

```markdown
## OpenSpec Change
- Change ID: `<change-id>`
- Proposal: `openspec/changes/<change-id>/proposal.md`

## 変更内容
[OpenSpecのproposal.mdの内容を参照]

## チェックリスト
- [ ] OpenSpecのアーカイブが完了
- [ ] すべてのタスクが完了
- [ ] テストが通過
- [ ] OpenSpecレビュー開始済み
```

## 開発フロー

### 1. 機能ブランチの作成

mainブランチから最新の状態を取得し、新しい機能ブランチを作成する：

```bash
# mainブランチに切り替え
git checkout main

# 最新の変更を取得
git pull origin main

# 新しい機能ブランチを作成
git checkout -b feature/機能名
```

### 2. 開発とコミット

機能ブランチで開発を行い、適切なコミットメッセージでコミットする。

#### コミットメッセージ規約

コミットメッセージは以下の形式に従う：

```
<type>: <subject>

<body>

<footer>
```

**Type（必須）**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードフォーマット（動作に影響なし）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルドプロセスやツールの変更

**Subject（必須）**:
- 50文字以内
- 命令形で記述（例: "Add" ではなく "Adds"）
- 末尾にピリオドなし

**Body（任意）**:
- 変更の理由と内容を説明
- 72文字で折り返し

**Footer（任意）**:
- 関連するIssue番号（例: `Closes #123`）

コミットメッセージの詳細例は `references/commit-messages.md` を参照。

### 3. プルリクエストの作成

機能が完成したら、GitHubでプルリクエスト（PR）を作成する。

#### PR作成時のチェックリスト

- [ ] mainブランチとの差分を確認
- [ ] テストが通過していることを確認
- [ ] コードレビューを依頼するレビュアーを指定
- [ ] PRの説明に変更内容を記載
- [ ] 関連するIssue番号をリンク
- [ ] OpenSpecのレビュープロセスを開始

#### PR説明テンプレート

```markdown
## 変更内容
- [変更点1]
- [変更点2]

## 関連Issue
Closes #123

## テスト
- [ ] 単体テスト追加
- [ ] 統合テスト実行
- [ ] 手動テスト実施

## スクリーンショット（UI変更の場合）
[画像を添付]

## チェックリスト
- [ ] コードレビュー依頼済み
- [ ] OpenSpecレビュー開始済み
```

### 4. OpenSpecレビュープロセス

プルリクエスト作成後、OpenSpecを通じたコードレビューを開始する。

#### OpenSpec連携手順

1. **PR作成後、OpenSpecにレビューを登録**
   - OpenSpecのダッシュボードから新しいレビューを作成
   - PRのURLを関連付け
   - レビュアーを指定

2. **コードレビューの実施**
   - OpenSpec上でコードレビューを実施
   - コメントや指摘事項を記録
   - 承認/却下の判定を行う

3. **レビュー結果の反映**
   - OpenSpecでの承認後、GitHubのPRに反映
   - 必要に応じて変更を加える
   - 再レビューが必要な場合は再度OpenSpecでレビュー

詳細なOpenSpec連携手順は `references/openspec-integration.md` を参照。

### 5. マージとデプロイ

レビューが完了し、承認されたらmainブランチにマージする。

#### マージ前の最終確認

- [ ] すべてのレビューコメントに対応済み
- [ ] OpenSpecでの承認が完了
- [ ] CI/CDパイプラインが成功
- [ ] コンフリクトがないことを確認

#### マージ方法

GitHubのPR画面から「Squash and merge」または「Create a merge commit」を選択してマージ。

**推奨**: 機能ブランチは「Squash and merge」を使用して、mainブランチの履歴をクリーンに保つ。

#### マージ後の処理

```bash
# mainブランチに切り替え
git checkout main

# 最新の変更を取得
git pull origin main

# 不要になったブランチを削除
git branch -d feature/機能名
git push origin --delete feature/機能名
```

### 6. ホットフィックスの処理

本番環境で緊急の修正が必要な場合、mainブランチから直接ホットフィックスブランチを作成する。

```bash
# mainブランチからホットフィックスブランチを作成
git checkout main
git pull origin main
git checkout -b hotfix/修正内容

# 修正をコミット
git commit -m "fix: 緊急修正の内容"

# PRを作成（通常のフローと同様にOpenSpecレビューを経る）
```

ホットフィックスは通常の機能ブランチと同様にOpenSpecレビューを経てからマージする。

## ベストプラクティス

### ブランチ管理

- 機能ブランチは小さく保つ（1つのPRで1つの機能）
- 長期間未使用のブランチは定期的に削除
- mainブランチへの直接コミットは禁止

### コミット管理

- 関連する変更は1つのコミットにまとめる
- 意味のあるコミットメッセージを書く
- 頻繁にコミットする（小さな単位で）

### プルリクエスト

- PRは小さく保つ（レビューしやすくするため）
- 自己レビューを実施してからレビュー依頼
- レビューコメントには迅速に対応

### OpenSpec連携

- PR作成後は即座にOpenSpecレビューを開始
- レビューコメントはOpenSpec上で一元管理
- 承認プロセスを明確に定義

## トラブルシューティング

### コンフリクトの解決

mainブランチに新しい変更が入った場合、機能ブランチをリベースする：

```bash
# mainブランチの最新を取得
git checkout main
git pull origin main

# 機能ブランチに戻る
git checkout feature/機能名

# mainの変更をリベース
git rebase main

# コンフリクトがあれば解決後
git add .
git rebase --continue
```

### コミット履歴の修正

誤ったコミットメッセージを修正する場合：

```bash
# 最新のコミットメッセージを修正
git commit --amend -m "fix: 正しいコミットメッセージ"

# 既にpushしている場合はforce push（注意して使用）
git push --force-with-lease origin feature/機能名
```

詳細なトラブルシューティングガイドは `references/troubleshooting.md` を参照。

## Resources

### references/

- `branch-naming.md`: ブランチ命名規則の詳細
- `commit-messages.md`: コミットメッセージ規約と例
- `openspec-integration.md`: OpenSpec連携の詳細手順
- `openspec-integration.md`: OpenSpec連携の詳細手順
- `troubleshooting.md`: よくある問題と解決方法

### scripts/

- `create-feature-branch.sh`: 機能ブランチ作成のヘルパースクリプト
- `pr-template.md`: プルリクエストテンプレート
