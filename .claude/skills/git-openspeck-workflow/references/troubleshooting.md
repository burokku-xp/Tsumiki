# トラブルシューティングガイド

## よくある問題と解決方法

### コンフリクトの解決

#### 問題: mainブランチに新しい変更が入り、コンフリクトが発生

**解決方法**: リベースを使用してmainの変更を取り込む

```bash
# mainブランチの最新を取得
git checkout main
git pull origin main

# 機能ブランチに戻る
git checkout feature/機能名

# mainの変更をリベース
git rebase main
```

コンフリクトが発生した場合：

```bash
# コンフリクトファイルを確認
git status

# コンフリクトを解決（エディタで編集）
# <<<<<<< HEAD
# 現在のブランチの変更
# =======
# mainブランチの変更
# >>>>>>> main

# 解決後、ステージング
git add .

# リベースを続行
git rebase --continue

# リベースを中止したい場合
git rebase --abort
```

#### 問題: リベース後にforce pushが必要

**解決方法**: `--force-with-lease`を使用（安全なforce push）

```bash
git push --force-with-lease origin feature/機能名
```

**注意**: `--force-with-lease`は、リモートブランチが予期しない変更を受けていない場合のみpushする。`--force`より安全。

### コミット履歴の修正

#### 問題: 誤ったコミットメッセージを修正したい

**解決方法**: `git commit --amend`を使用

```bash
# 最新のコミットメッセージを修正
git commit --amend -m "fix: 正しいコミットメッセージ"

# エディタで修正する場合
git commit --amend
```

既にpushしている場合：

```bash
git commit --amend -m "fix: 正しいコミットメッセージ"
git push --force-with-lease origin feature/機能名
```

#### 問題: 複数のコミットを1つにまとめたい（squash）

**解決方法**: インタラクティブリベースを使用

```bash
# 最新の3つのコミットをまとめる場合
git rebase -i HEAD~3

# エディタで以下のように編集
# pick abc1234 最初のコミット
# squash def5678 2番目のコミット
# squash ghi9012 3番目のコミット

# 保存後、新しいコミットメッセージを入力
```

### ブランチの管理

#### 問題: 間違ったブランチで作業してしまった

**解決方法**: 変更を新しいブランチに移動

```bash
# 現在の変更を一時保存
git stash

# 正しいブランチを作成
git checkout -b feature/正しいブランチ名

# 変更を復元
git stash pop
```

#### 問題: 不要なブランチを削除したい

**解決方法**: ローカルとリモートの両方から削除

```bash
# ローカルブランチを削除
git branch -d feature/不要なブランチ名

# 強制削除（マージされていない場合）
git branch -D feature/不要なブランチ名

# リモートブランチを削除
git push origin --delete feature/不要なブランチ名
```

### 変更の取り消し

#### 問題: ステージングした変更を取り消したい

**解決方法**: `git reset`を使用

```bash
# すべてのステージングを取り消し
git reset

# 特定のファイルのみ取り消し
git reset HEAD ファイル名
```

#### 問題: コミットしていない変更を破棄したい

**解決方法**: `git checkout`または`git restore`を使用

```bash
# すべての変更を破棄（注意: 元に戻せません）
git checkout .

# または（Git 2.23以降）
git restore .

# 特定のファイルのみ破棄
git checkout -- ファイル名
# または
git restore ファイル名
```

#### 問題: コミットを元に戻したい（まだpushしていない）

**解決方法**: `git reset`を使用

```bash
# コミットを取り消し、変更は保持
git reset --soft HEAD~1

# コミットを取り消し、変更も破棄
git reset --hard HEAD~1
```

### リモートとの同期

#### 問題: リモートの変更を取得したい

**解決方法**: `git pull`を使用

```bash
# 現在のブランチの最新を取得
git pull origin feature/機能名

# mainブランチの最新を取得
git checkout main
git pull origin main
```

#### 問題: ローカルの変更とリモートの変更が競合している

**解決方法**: 状況に応じて選択

**オプション1: リモートを優先**

```bash
git fetch origin
git reset --hard origin/feature/機能名
```

**オプション2: ローカルを優先**

```bash
git push --force-with-lease origin feature/機能名
```

**オプション3: マージ**

```bash
git pull origin feature/機能名
# コンフリクトがあれば解決
```

### PR関連の問題

#### 問題: PRがマージできない（ブランチ保護ルール）

**解決方法**: 以下を確認

1. 必須レビュアーからの承認が得られているか
2. CI/CDパイプラインが成功しているか
3. ブランチが最新のmainと同期されているか
4. OpenSpecでの承認が完了しているか

#### 問題: PRの説明を更新したい

**解決方法**: GitHubのPR画面から直接編集可能

1. PR画面を開く
2. 説明欄の「編集」ボタンをクリック
3. 内容を更新して保存

### その他の問題

#### 問題: `.gitignore`に追加したファイルがまだ追跡されている

**解決方法**: キャッシュから削除

```bash
# ファイルを追跡から外す（ファイルは保持）
git rm --cached ファイル名

# ディレクトリ全体の場合
git rm -r --cached ディレクトリ名

# コミット
git commit -m "chore: Remove tracked files from gitignore"
```

#### 問題: 大きなファイルを誤ってコミットしてしまった

**解決方法**: Git履歴から削除（注意: 履歴を書き換える）

```bash
# git-filter-repoを使用（推奨）
git filter-repo --path ファイル名 --invert-paths

# またはBFG Repo-Cleanerを使用
# https://rtyley.github.io/bfg-repo-cleaner/
```

**注意**: 履歴を書き換えるため、チームメンバーと調整が必要。

## 緊急時の対応

### 本番環境に緊急の修正が必要

1. mainブランチから直接ホットフィックスブランチを作成
2. 修正をコミット
3. PRを作成（通常のフローと同様にOpenSpecレビューを経る）
4. 承認後、即座にマージ・デプロイ

```bash
git checkout main
git pull origin main
git checkout -b hotfix/緊急修正内容
# 修正を実施
git commit -m "fix: 緊急修正の内容"
git push origin hotfix/緊急修正内容
# PRを作成
```

## 参考リソース

- [Git公式ドキュメント](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)
