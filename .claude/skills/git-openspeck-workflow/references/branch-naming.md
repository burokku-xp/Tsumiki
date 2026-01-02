# ブランチ命名規則

## 基本原則

- 小文字とハイフン（`-`）を使用
- 意味のある名前を付ける
- プレフィックスで種類を明確にする

## プレフィックス一覧

### feature/

新機能の追加に使用。

**形式**: `feature/機能名`

**例**:
- `feature/user-authentication`
- `feature/payment-integration`
- `feature/dark-mode-toggle`
- `feature/api-rate-limiting`

**命名のポイント**:
- 機能の目的が明確に分かる名前
- 動詞ではなく名詞を使用（例: `feature/add-user` ではなく `feature/user-addition`）

### fix/

バグ修正に使用。

**形式**: `fix/修正内容`

**例**:
- `fix/login-error`
- `fix/memory-leak`
- `fix/typo-in-readme`
- `fix/calculation-bug`

**命名のポイント**:
- 修正対象の問題を明確に示す
- 簡潔に問題を表現

### docs/

ドキュメントの追加・更新に使用。

**形式**: `docs/内容`

**例**:
- `docs/api-documentation`
- `docs/setup-guide`
- `docs/contributing-guidelines`
- `docs/readme-update`

### refactor/

リファクタリングに使用。機能追加やバグ修正ではない、コードの改善。

**形式**: `refactor/対象`

**例**:
- `refactor/auth-module`
- `refactor/database-queries`
- `refactor/component-structure`
- `refactor/error-handling`

### perf/

パフォーマンス改善に使用。

**形式**: `perf/改善内容`

**例**:
- `perf/query-optimization`
- `perf/image-loading`
- `perf/render-performance`
- `perf/database-indexing`

### test/

テストの追加・修正に使用。

**形式**: `test/対象`

**例**:
- `test/user-authentication`
- `test/api-endpoints`
- `test/integration-tests`
- `test/unit-tests`

### chore/

ビルドプロセス、ツール、依存関係の変更に使用。

**形式**: `chore/内容`

**例**:
- `chore/update-dependencies`
- `chore/ci-configuration`
- `chore/build-scripts`
- `chore/linter-setup`

### hotfix/

本番環境の緊急修正に使用。mainブランチから直接作成。

**形式**: `hotfix/修正内容`

**例**:
- `hotfix/security-patch`
- `hotfix/critical-bug`
- `hotfix/data-corruption`

## 命名のベストプラクティス

### ✅ 良い例

- `feature/user-profile-page`
- `fix/login-redirect-loop`
- `docs/deployment-guide`
- `refactor/state-management`

### ❌ 悪い例

- `feature/new-feature` (具体的でない)
- `fix/bug` (何のバグか不明)
- `update` (プレフィックスなし、内容不明)
- `feature/add-user-feature` (冗長)

## 長さの目安

- 推奨: 20-40文字
- 最大: 50文字
- 短すぎる名前は避ける（意味が不明確になるため）

## 特殊なケース

### チケット番号を含める場合

チケット管理システムを使用している場合、チケット番号を含めることも可能：

- `feature/PROJ-123-user-authentication`
- `fix/ISSUE-456-login-error`

ただし、チケット番号だけでなく、内容も含めることが推奨される。

### 複数の変更を含む場合

1つのブランチで複数の種類の変更を行う場合は、主要な変更のプレフィックスを使用：

- 機能追加とバグ修正: `feature/` を使用（機能追加が主目的の場合）
- リファクタリングとパフォーマンス改善: `refactor/` または `perf/` を使用（どちらが主目的かで判断）
