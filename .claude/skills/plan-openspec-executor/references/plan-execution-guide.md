# プラン実行ガイド

## プランファイルの構造

プランファイル（`.cursor/plans/*.plan.md`）は以下の構造を持つ：

```yaml
---
name: プラン名
overview: プランの概要
todos:
  - id: todo-id-1
    content: todoの内容
    status: pending|in_progress|completed
  - id: todo-id-2
    content: todoの内容
    status: pending|in_progress|completed
---
```

## Todoの種類判定

各todoの`content`を解析し、以下のキーワードで種類を判定する：

### Change Proposal作成

以下のキーワードを含むtodoはproposal作成タスク：

- "change proposalを作成"
- "proposalを作成"
- "のchange proposalを作成"
- "のproposalを作成"

**例**:
- "add-foundation-setupのchange proposalを作成"
- "add-data-persistenceのproposalを作成"

**抽出方法**:
- パターン: `([a-z0-9-]+)のchange proposalを作成` または `([a-z0-9-]+)のproposalを作成`
- change-idを抽出（例: `add-foundation-setup`）

### 実装タスク

以下のキーワードを含むtodoは実装タスク：

- "実装"
- "実装する"
- "を実装"
- "を実装する"

**例**:
- "add-foundation-setupを実装"
- "基盤セットアップを実装する"

**抽出方法**:
- パターン: `([a-z0-9-]+)を実装` または `([a-z0-9-]+)を実装する`
- change-idを抽出（例: `add-foundation-setup`）

### アーカイブタスク

以下のキーワードを含むtodoはアーカイブタスク：

- "アーカイブ"
- "archive"
- "をアーカイブ"
- "をアーカイブする"

**例**:
- "add-foundation-setupをアーカイブ"
- "change-idをアーカイブする"

**抽出方法**:
- パターン: `([a-z0-]+)をアーカイブ` または `([a-z0-9-]+)をアーカイブする`
- change-idを抽出（例: `add-foundation-setup`）

### その他のタスク

上記に該当しないtodoは、通常のタスクとして処理：

- プロジェクト設定の更新
- ドキュメントの作成
- 設定ファイルの変更

## 依存関係の管理

プランファイル内のtodoは、依存関係を持つ場合がある：

**例**:
```yaml
todos:
  - id: create-foundation-proposal
    content: add-foundation-setupのchange proposalを作成
    status: pending
  - id: create-persistence-proposal
    content: add-data-persistenceのchange proposalを作成
    status: pending
  - id: implement-foundation
    content: add-foundation-setupを実装
    status: pending
  - id: implement-persistence
    content: add-data-persistenceを実装
    status: pending
```

**依存関係の判定**:

1. 実装タスクは、対応するproposal作成タスクが完了している必要がある
2. プランの本文に依存関係が明記されている場合がある（例: "依存関係: add-foundation-setup"）
3. 依存関係が満たされていない場合は、先に依存するtodoを実行する

**実行順序**:

1. 依存関係のないproposal作成タスクから開始
2. proposal作成 → 設計確認 → 承認
3. 承認済みのproposalに対応する実装タスクを実行
4. 実装 → 動作確認 → アーカイブ
5. 次のtodoに進む

## セッションリセットのタイミング

以下のタイミングでセッションをリセットする：

1. **アーカイブ完了後**: `/openspec-archive`コマンド実行後、必ずセッションをリセット
2. **次のtodoに進む前**: 現在のコンテキストをクリアし、次のtodoに集中

**セッションリセットの方法**:

- 現在のコンテキストをクリア
- 次のtodoの内容を確認
- 次のtodoの種類に応じて適切なフェーズに移行

## ステータス管理

プランファイル内のtodoのステータスを適切に更新する：

- **pending**: 未実行
- **in_progress**: 実行中
- **completed**: 完了

**更新タイミング**:

- todoの実行開始時: `status: in_progress`
- todoの完了時: `status: completed`
- アーカイブ完了時: 対応するtodoを`status: completed`に更新

## エラーハンドリング

### Proposalが見つからない場合

実装タスクを実行しようとしたが、対応するproposalが見つからない場合：

1. エラーメッセージを表示
2. 先にproposal作成タスクを実行するよう促す

### 依存関係が満たされていない場合

依存関係が満たされていないtodoを実行しようとした場合：

1. 依存するtodoを特定
2. 先に依存するtodoを実行するよう促す

### スコープ外のファイルを変更しようとした場合

スコープ定義に含まれていないファイルを変更しようとした場合：

1. 警告を表示
2. スコープ定義を確認
3. 必要に応じてスコープ定義を更新
