# OpenSpec連携ガイド

## 概要

OpenSpecは仕様駆動開発（Spec-Driven Development）のためのツール。提案（proposal）→実装（apply）→アーカイブ（archive）の3段階のワークフローで、各段階で適切なGit操作を行う必要がある。

## 統合ブランチの管理

### 統合ブランチとは

OpenSpecを使用するプロジェクトでは、統合ブランチ（`integration`または`develop`）を使用して、複数の変更を統合する。

- **mainブランチ**: 本番環境にデプロイ可能な状態
- **統合ブランチ**: 開発中の変更を統合するブランチ（`integration`または`develop`）
- **作業ブランチ**: 個別の変更を実装するブランチ（`openspec/<change-id>`）

### 統合ブランチの確認と作成

作業を開始する前に、統合ブランチが存在するか確認する：

```bash
# 統合ブランチの存在確認
git branch -a | grep -E "(integration|develop)"
```

統合ブランチが存在しない場合、作成する：

```bash
# mainブランチから統合ブランチを作成
git checkout main
git pull origin main
git checkout -b integration
git push -u origin integration
```

**注意**: プロジェクトで使用する統合ブランチ名（`integration`または`develop`）を確認してから作成する。既存のプロジェクトでは、既に決まっている可能性がある。

## `/openspec-proposal`実行時のブランチ切り替え

### 手順

1. **統合ブランチの確認・作成**

```bash
# 統合ブランチの存在確認
git branch -a | grep -E "(integration|develop)"

# 存在しない場合は作成
if ! git show-ref --verify --quiet refs/heads/integration && ! git show-ref --verify --quiet refs/heads/develop; then
    git checkout main
    git pull origin main
    git checkout -b integration
    git push -u origin integration
fi
```

2. **統合ブランチに切り替え**

```bash
# 統合ブランチに切り替え（最新の状態を取得）
git checkout integration
git pull origin integration
```

3. **作業ブランチを作成**

```bash
# 提案のchange-idに基づいてブランチ名を決定
# 例: change-idが "add-user-authentication" の場合
git checkout -b openspec/add-user-authentication
```

4. **OpenSpecの提案を作成**

```bash
# /openspec-proposal コマンドを実行
# または openspec CLIを使用
```

### ブランチ命名規則

OpenSpecの提案ブランチは以下の形式を使用：

- **形式**: `openspec/<change-id>`
- **例**: 
  - `openspec/add-user-authentication`
  - `openspec/update-payment-flow`
  - `openspec/refactor-auth-module`

**change-idの命名規則**:
- kebab-case（小文字とハイフン）
- 動詞で始まる（`add-`, `update-`, `remove-`, `refactor-`）
- 簡潔で意味が明確

## `/openspec-apply`実行時のコミット方針

### 基本方針

OpenSpecで実装を行う際は、**細かくコミット**する。`tasks.md`の各タスクが完了したら、即座にコミットする。

### コミットのタイミング

1. **タスク完了時**: `tasks.md`の各チェックボックス項目が完了したらコミット
2. **意味のある単位**: 1つのタスクが複数のファイルにまたがる場合でも、タスク単位でコミット
3. **頻繁に**: 1時間に1回以上コミットすることを推奨

### コミットメッセージの形式

```bash
# タスク1.1完了時
git add .
git commit -m "feat: Implement task 1.1 - Create database schema

- Add User table migration
- Add User model
- Add User repository

Related to openspec/changes/add-user-auth/tasks.md"
```

**コミットメッセージの要素**:
- **Type**: `feat`（新機能）、`fix`（バグ修正）、`refactor`（リファクタリング）など
- **Subject**: タスク番号と簡潔な説明
- **Body**: 実装した内容の詳細（任意だが推奨）
- **Footer**: 関連するOpenSpecのchange-idやtasks.mdへの参照

### コミット例

```bash
# タスク1.1: データベーススキーマ作成
git add migrations/create_users_table.sql
git commit -m "feat: Implement task 1.1 - Create database schema"

# タスク1.2: APIエンドポイント追加
git add src/api/users.ts
git commit -m "feat: Implement task 1.2 - Add user API endpoint"

# タスク1.3: フロントエンドコンポーネント追加
git add src/components/UserForm.tsx
git commit -m "feat: Implement task 1.3 - Add user form component"

# タスク1.4: テスト追加
git add tests/user.test.ts
git commit -m "test: Implement task 1.4 - Add user tests"
```

### 避けるべきこと

- ❌ 複数のタスクを1つのコミットにまとめる
- ❌ 1日の作業を1つのコミットにまとめる
- ❌ コミットメッセージにタスク番号を含めない
- ❌ 大きな変更を1つのコミットにまとめる

## `/openspec-archive`実行時のPR作成

### 手順

1. **作業ブランチの変更をすべてコミット・プッシュ**

```bash
# 未コミットの変更がないか確認
git status

# すべての変更をコミット
git add .
git commit -m "chore: Complete implementation for <change-id>"

# リモートにプッシュ
git push origin openspec/<change-id>
```

2. **OpenSpecのアーカイブを実行**

```bash
# /openspec-archive コマンドを実行
# または openspec CLIを使用
openspec archive <change-id> --yes
```

3. **統合ブランチにマージするためのPRを作成**

GitHubでプルリクエストを作成：

- **ベースブランチ**: `integration`（または`develop`）
- **比較ブランチ**: `openspec/<change-id>`
- **タイトル**: `[OpenSpec] <change-id>: <簡潔な説明>`
- **説明**: OpenSpecのchange-idとproposal.mdへのリンクを含める

### PR説明テンプレート

```markdown
## OpenSpec Change
- **Change ID**: `<change-id>`
- **Proposal**: `openspec/changes/<change-id>/proposal.md`
- **Tasks**: `openspec/changes/<change-id>/tasks.md`

## 変更内容
[OpenSpecのproposal.mdの「What Changes」セクションを参照]

## 実装の詳細
- [ ] すべてのタスクが完了（`tasks.md`を確認）
- [ ] テストが通過
- [ ] ドキュメントを更新（必要に応じて）

## チェックリスト
- [ ] OpenSpecのアーカイブが完了
- [ ] すべてのタスクが完了
- [ ] テストが通過
- [ ] コードレビュー依頼済み
- [ ] OpenSpecレビュー開始済み
```

### PR作成後の処理

1. **OpenSpecレビューを開始**
   - PR作成後、OpenSpecにレビューを登録
   - レビュアーを指定

2. **レビュー完了後のマージ**
   - OpenSpecでの承認が完了したら、統合ブランチにマージ
   - マージ後、作業ブランチを削除（任意）

```bash
# マージ後、ローカルの作業ブランチを削除
git checkout integration
git pull origin integration
git branch -d openspec/<change-id>
```

## ワークフロー全体の流れ

### 1. 提案フェーズ（`/openspec-proposal`）

```bash
# 1. 統合ブランチの確認・作成
git checkout integration || git checkout -b integration

# 2. 作業ブランチを作成
git checkout -b openspec/<change-id>

# 3. OpenSpecの提案を作成
# /openspec-proposal コマンドを実行
```

### 2. 実装フェーズ（`/openspec-apply`）

```bash
# 1. 作業ブランチで実装
git checkout openspec/<change-id>

# 2. タスクを順番に実装し、細かくコミット
# タスク1.1完了 → コミット
# タスク1.2完了 → コミット
# ...

# 3. 定期的にプッシュ
git push origin openspec/<change-id>
```

### 3. アーカイブフェーズ（`/openspec-archive`）

```bash
# 1. すべての変更をコミット・プッシュ
git add .
git commit -m "chore: Complete implementation for <change-id>"
git push origin openspec/<change-id>

# 2. OpenSpecのアーカイブを実行
# /openspec-archive コマンドを実行

# 3. 統合ブランチにマージするためのPRを作成
# GitHubでPRを作成: openspec/<change-id> → integration
```

## トラブルシューティング

### 統合ブランチが存在しない

```bash
# 統合ブランチを作成
git checkout main
git pull origin main
git checkout -b integration
git push -u origin integration
```

### 作業ブランチで統合ブランチの最新を取り込みたい

```bash
# 統合ブランチの最新を取得
git checkout integration
git pull origin integration

# 作業ブランチに戻ってリベース
git checkout openspec/<change-id>
git rebase integration
```

### アーカイブ後にPRを作成するのを忘れた

```bash
# 作業ブランチがまだ存在する場合
git checkout openspec/<change-id>
git push origin openspec/<change-id>

# GitHubでPRを作成
```

## ベストプラクティス

### 提案フェーズ

- 統合ブランチの存在を確認してから作業を開始
- 作業ブランチ名はchange-idに基づいて一貫性を保つ
- 提案作成後、すぐに実装に移らない（承認を待つ）

### 実装フェーズ

- タスクごとに細かくコミット
- コミットメッセージにタスク番号を含める
- 定期的にリモートにプッシュ（作業のバックアップ）

### アーカイブフェーズ

- すべてのタスクが完了してからアーカイブ
- アーカイブ後は必ずPRを作成
- PRの説明にOpenSpecのchange-idを含める
