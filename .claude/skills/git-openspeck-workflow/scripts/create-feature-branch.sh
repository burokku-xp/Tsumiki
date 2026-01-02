#!/bin/bash
#
# 機能ブランチ作成ヘルパースクリプト
#
# 使用方法:
#   ./create-feature-branch.sh feature/機能名
#   ./create-feature-branch.sh fix/修正内容
#
# 例:
#   ./create-feature-branch.sh feature/user-authentication
#   ./create-feature-branch.sh fix/login-error

set -e

# 引数チェック
if [ $# -eq 0 ]; then
    echo "❌ エラー: ブランチ名を指定してください"
    echo ""
    echo "使用方法:"
    echo "  $0 feature/機能名"
    echo "  $0 fix/修正内容"
    echo ""
    echo "例:"
    echo "  $0 feature/user-authentication"
    echo "  $0 fix/login-error"
    exit 1
fi

BRANCH_NAME=$1

# ブランチ名の形式チェック
if [[ ! $BRANCH_NAME =~ ^(feature|fix|docs|refactor|perf|test|chore|hotfix)/ ]]; then
    echo "❌ エラー: ブランチ名は適切なプレフィックスで始まる必要があります"
    echo ""
    echo "有効なプレフィックス:"
    echo "  feature/, fix/, docs/, refactor/, perf/, test/, chore/, hotfix/"
    echo ""
    echo "例: feature/user-authentication"
    exit 1
fi

# 現在のブランチを確認
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "⚠️  警告: 現在のブランチは '$CURRENT_BRANCH' です"
    echo "mainブランチから作成することを推奨します"
    read -p "続行しますか? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 作業ディレクトリの状態を確認
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ エラー: 未コミットの変更があります"
    echo "変更をコミットするか、stashしてから実行してください"
    exit 1
fi

# mainブランチに切り替え（必要に応じて）
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "📦 mainブランチに切り替え中..."
    git checkout main 2>/dev/null || git checkout master
fi

# 最新の変更を取得
echo "📥 最新の変更を取得中..."
git pull origin main 2>/dev/null || git pull origin master

# ブランチが既に存在するか確認
if git show-ref --verify --quiet refs/heads/"$BRANCH_NAME"; then
    echo "❌ エラー: ブランチ '$BRANCH_NAME' は既に存在します"
    read -p "既存のブランチに切り替えますか? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout "$BRANCH_NAME"
        echo "✅ ブランチ '$BRANCH_NAME' に切り替えました"
    fi
    exit 1
fi

# リモートに同名のブランチが存在するか確認
if git show-ref --verify --quiet refs/remotes/origin/"$BRANCH_NAME"; then
    echo "⚠️  警告: リモートに同名のブランチが存在します"
    read -p "リモートブランチを追跡するローカルブランチを作成しますか? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout -b "$BRANCH_NAME" origin/"$BRANCH_NAME"
        echo "✅ リモートブランチ '$BRANCH_NAME' を追跡するローカルブランチを作成しました"
        exit 0
    else
        exit 1
    fi
fi

# 新しいブランチを作成
echo "🌿 新しいブランチ '$BRANCH_NAME' を作成中..."
git checkout -b "$BRANCH_NAME"

echo ""
echo "✅ ブランチ '$BRANCH_NAME' を作成しました"
echo ""
echo "次のステップ:"
echo "  1. 開発を開始"
echo "  2. 変更をコミット: git commit -m 'feat: 変更内容'"
echo "  3. プッシュ: git push origin $BRANCH_NAME"
echo "  4. プルリクエストを作成"
echo "  5. OpenSpecでレビューを開始"
