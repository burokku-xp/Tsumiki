# OpenSpecコマンドガイド

## 概要

OpenSpecのスラッシュコマンド（`/openspec-proposal`, `/openspec-apply`, `/openspec-archive`）の使い方と注意点を説明する。

## /openspec-proposal

### 用途

change proposalを作成するコマンド。

### 使い方

```
/openspec-proposal [change-id]
```

**パラメータ**:
- `change-id`: 提案のID（kebab-case、verb-led、例: `add-foundation-setup`）

### 実行前の準備

1. **change-idの決定**: プランファイルのtodoからchange-idを抽出
2. **スコープ定義**: 実装スコープを明確に定義（`references/scope-definition.md`を参照）
3. **既存の確認**: `openspec list`で既存のchange-idと重複していないか確認

### 実行手順

1. プランファイルからchange-idを抽出
2. スコープを定義
3. **Gitブランチの準備**（下記参照）
4. `/openspec-proposal [change-id]`を実行
5. proposal.md、tasks.md、design.md（必要に応じて）、spec deltasを作成
6. `openspec validate [change-id] --strict`で検証
7. **設計確認フェーズ**: ユーザーに設計を確認させる

### Gitブランチの準備

OpenSpecで提案を作成する際は、適切なブランチで作業する：

1. **統合ブランチの確認と作成**

```bash
# 統合ブランチの存在確認（integrationまたはdevelop）
git branch -a | grep -E "(integration|develop)"

# 存在しない場合は作成
git checkout main
git pull origin main
git checkout -b integration
git push -u origin integration
```

**注意**: プロジェクトで使用する統合ブランチ名（`integration`または`develop`）を確認してから作成する。

2. **統合ブランチに切り替え**

```bash
# 統合ブランチに切り替え（最新の状態を取得）
git checkout integration
git pull origin integration
```

3. **作業ブランチを作成**

```bash
# 提案のchange-idに基づいてブランチ名を決定
# 形式: openspec/<change-id>
git checkout -b openspec/<change-id>
```

**ブランチ命名規則**: OpenSpecの提案ブランチは `openspec/<change-id>` の形式を使用する。

### 設計確認フェーズ

proposal作成後、applyを実行する前に必ずユーザーに設計を確認させる：

1. proposal.mdの内容を提示
2. スコープ定義を確認
3. 影響範囲を確認
4. ユーザーの承認を得るまで次のステップに進まない

**確認項目**:
- 変更内容が適切か
- スコープ定義が適切か
- 影響範囲が想定内か
- 連携箇所が適切か

### 注意事項

- change-idはkebab-case、verb-ledで命名（例: `add-`, `update-`, `remove-`, `refactor-`）
- 既存のchange-idと重複しないようにする
- スコープ定義を必ず明記する
- 設計確認フェーズを省略しない

## /openspec-apply

### 用途

change proposalを実装するコマンド。

### 使い方

```
/openspec-apply [change-id]
```

**パラメータ**:
- `change-id`: 実装する提案のID

### 実行前の準備

1. **proposalの確認**: 対応するproposalが承認済みか確認
2. **設計確認の完了**: 設計確認フェーズが完了しているか確認
3. **依存関係の確認**: 依存するchange proposalが完了しているか確認

### 実行手順

1. プランファイルからchange-idを抽出
2. 対応するproposalが承認済みか確認
3. **作業ブランチに切り替え**（存在しない場合は作成）
4. `/openspec-apply [change-id]`を実行
5. `tasks.md`のチェックリストに従って順次実装
6. **細かくコミット**（下記参照）
7. **動作確認フェーズ**: 実装完了後、動作確認を実施

### コミット方針

OpenSpecで実装を行う際は、**細かくコミット**する。`tasks.md`の各タスクが完了したら、即座にコミットする。

**コミットのタイミング**:
- タスク完了時: `tasks.md`の各チェックボックス項目が完了したらコミット
- 意味のある単位: 1つのタスクが複数のファイルにまたがる場合でも、タスク単位でコミット
- 頻繁に: 1時間に1回以上コミットすることを推奨

**コミットメッセージの形式**:

```bash
# タスク1.1完了時
git add .
git commit -m "feat: Implement task 1.1 - Create database schema

- Add User table migration
- Add User model
- Add User repository

Related to openspec/changes/<change-id>/tasks.md"
```

**コミットメッセージの要素**:
- **Type**: `feat`（新機能）、`fix`（バグ修正）、`refactor`（リファクタリング）など
- **Subject**: タスク番号と簡潔な説明
- **Body**: 実装した内容の詳細（任意だが推奨）
- **Footer**: 関連するOpenSpecのchange-idやtasks.mdへの参照

**避けるべきこと**:
- ❌ 複数のタスクを1つのコミットにまとめる
- ❌ 1日の作業を1つのコミットにまとめる
- ❌ コミットメッセージにタスク番号を含めない
- ❌ 大きな変更を1つのコミットにまとめる

**コミット例**:

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
```

### 動作確認フェーズ

実装完了後、必ず動作確認を実施：

1. 実装した機能をテスト
2. 不具合があればユーザーと一緒に修正
3. ユーザーが問題ないと判断するまで修正を繰り返す
4. 最終的にユーザーが問題ないと判断したら、アーカイブフェーズに進む

**確認項目**:
- 機能が正常に動作するか
- エラーが発生しないか
- パフォーマンスに問題がないか
- スコープ定義に従って実装されているか

### 注意事項

- 設計確認が完了していないproposalは実装しない
- `tasks.md`のチェックリストに従って順次実装
- スコープ定義に従って実装する
- 動作確認フェーズを省略しない

## /openspec-archive

### 用途

change proposalをアーカイブするコマンド。

### 使い方

```
/openspec-archive [change-id] [--yes|-y]
```

**パラメータ**:
- `change-id`: アーカイブする提案のID
- `--yes`/`-y`: 確認プロンプトをスキップ（非対話モード）

### 実行前の準備

1. **動作確認の完了**: 動作確認フェーズが完了しているか確認
2. **ユーザーの承認**: ユーザーが問題ないと判断しているか確認
3. **実装の完了**: すべてのタスクが完了しているか確認

### 実行手順

1. プランファイルからchange-idを抽出
2. 動作確認が完了し、ユーザーが問題ないと判断したことを確認
3. **すべての変更をコミット・プッシュ**（下記参照）
4. `/openspec-archive [change-id]`を実行
5. **PRを作成**（下記参照）
6. アーカイブ完了後、**セッションリセット**を実施

### コミットとプッシュ

アーカイブ前に、すべての変更をコミット・プッシュする：

```bash
# 未コミットの変更がないか確認
git status

# すべての変更をコミット
git add .
git commit -m "chore: Complete implementation for <change-id>"

# リモートにプッシュ
git push origin openspec/<change-id>
```

### プルリクエストの作成

アーカイブ完了後、統合ブランチにマージするためのPRを作成する：

**PRの設定**:
- **ベースブランチ**: `integration`（または`develop`）
- **比較ブランチ**: `openspec/<change-id>`
- **タイトル**: `[OpenSpec] <change-id>: <簡潔な説明>`

**PR説明テンプレート**:

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

### セッションリセット

アーカイブ完了後、必ずセッションをリセット：

1. 現在のコンテキストをクリア
2. 次のtodoの内容を確認
3. 次のtodoの種類に応じて適切なフェーズに移行

**リセットのタイミング**:
- アーカイブ完了直後
- 次のtodoに進む前

### 注意事項

- 動作確認が完了していないchange proposalはアーカイブしない
- ユーザーの承認を得てからアーカイブする
- アーカイブ完了後は必ずセッションをリセット
- 次のtodoに進む前にコンテキストをクリア

## コマンドの実行順序

正しい実行順序：

1. `/openspec-proposal` → 設計確認 → 承認
2. `/openspec-apply` → 動作確認 → ユーザー承認
3. `/openspec-archive` → セッションリセット → 次のtodo

## エラーハンドリング

### Proposalが見つからない場合

`/openspec-apply`を実行しようとしたが、対応するproposalが見つからない場合：

1. エラーメッセージを表示
2. 先に`/openspec-proposal`を実行するよう促す

### 設計確認が完了していない場合

`/openspec-apply`を実行しようとしたが、設計確認が完了していない場合：

1. 警告を表示
2. 先に設計確認フェーズを実施するよう促す

### 動作確認が完了していない場合

`/openspec-archive`を実行しようとしたが、動作確認が完了していない場合：

1. 警告を表示
2. 先に動作確認フェーズを実施するよう促す

## Gitワークフロー

### ブランチ戦略

OpenSpecを使用するプロジェクトでは、以下のブランチ戦略を推奨：

- **mainブランチ**: 本番環境にデプロイ可能な状態
- **統合ブランチ** (`integration`または`develop`): 開発中の変更を統合するブランチ
- **作業ブランチ** (`openspec/<change-id>`): 個別の変更を実装するブランチ

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

一般的なブランチ命名規則の詳細は、プロジェクトのブランチ命名規則ドキュメントを参照。

### コミットメッセージ規約

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
- 命令形で記述
- 末尾にピリオドなし

**Body（任意）**:
- 変更の理由と内容を説明
- 72文字で折り返し

**Footer（任意）**:
- 関連するIssue番号やOpenSpecのchange-idへの参照

コミットメッセージ規約の詳細は、プロジェクトのコミットメッセージ規約ドキュメントを参照。

### トラブルシューティング

#### 統合ブランチが存在しない

```bash
# 統合ブランチを作成
git checkout main
git pull origin main
git checkout -b integration
git push -u origin integration
```

#### 作業ブランチで統合ブランチの最新を取り込みたい

```bash
# 統合ブランチの最新を取得
git checkout integration
git pull origin integration

# 作業ブランチに戻ってリベース
git checkout openspec/<change-id>
git rebase integration
```

#### コンフリクトの解決

```bash
# コンフリクトファイルを確認
git status

# コンフリクトを解決（エディタで編集）
# 解決後、ステージング
git add .

# リベースを続行
git rebase --continue
```

## ベストプラクティス

1. **順序の遵守**: proposal → apply → archiveの順序を守る
2. **確認フェーズの実施**: 設計確認と動作確認を必ず実施
3. **スコープの厳守**: スコープ定義に従って実装
4. **セッションリセット**: アーカイブ完了後は必ずセッションをリセット
5. **ユーザーとの協調**: 各フェーズでユーザーと確認を取りながら進める
6. **細かくコミット**: タスクごとに細かくコミットし、作業の履歴を明確に保つ
7. **PRの作成**: アーカイブ後は必ずPRを作成し、統合ブランチへのマージを依頼する
