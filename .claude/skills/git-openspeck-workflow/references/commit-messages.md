# コミットメッセージ規約

## 基本形式

```
<type>: <subject>

<body>

<footer>
```

## Type（必須）

コミットの種類を表す。以下のいずれかを使用：

### feat

新機能の追加。

**例**:
```
feat: Add user authentication module

Implement JWT-based authentication with login and logout functionality.
Includes password hashing and session management.
```

### fix

バグ修正。

**例**:
```
fix: Resolve login redirect loop issue

The login page was redirecting to itself after successful authentication.
Fixed by updating the redirect logic in the auth middleware.
```

### docs

ドキュメントの変更のみ（コード変更なし）。

**例**:
```
docs: Update API documentation

Add examples for all endpoints and clarify authentication requirements.
```

### style

コードの動作に影響しない変更（フォーマット、空白、セミコロンなど）。

**例**:
```
style: Format code with Prettier

Apply Prettier formatting rules to all TypeScript files.
```

### refactor

リファクタリング（機能追加やバグ修正ではない）。

**例**:
```
refactor: Simplify authentication logic

Extract authentication logic into separate service class for better
maintainability and testability.
```

### perf

パフォーマンス改善。

**例**:
```
perf: Optimize database queries

Add indexes to frequently queried columns and use eager loading
to reduce N+1 query problems.
```

### test

テストの追加・修正。

**例**:
```
test: Add unit tests for user service

Cover all methods in UserService with unit tests, achieving 90% code coverage.
```

### chore

ビルドプロセス、ツール、依存関係の変更。

**例**:
```
chore: Update dependencies to latest versions

Update React to 18.2.0 and TypeScript to 5.0.0.
Fix breaking changes in test utilities.
```

## Subject（必須）

- 50文字以内
- 命令形で記述（例: "Add" ではなく "Adds"）
- 末尾にピリオドなし
- 大文字で始める
- 簡潔に変更内容を説明

### ✅ 良い例

- `feat: Add user authentication`
- `fix: Resolve memory leak in image processing`
- `docs: Update installation guide`

### ❌ 悪い例

- `feat: Added user authentication` (過去形)
- `fix: fixed bug` (大文字で始まっていない、具体的でない)
- `docs: update docs.` (ピリオドあり、大文字で始まっていない)

## Body（任意）

- 変更の理由と内容を説明
- 72文字で折り返し
- 空行でsubjectと区切る
- 命令形で記述

**例**:
```
feat: Add user authentication module

Implement JWT-based authentication system to replace the previous
session-based approach. This provides better scalability and enables
stateless API design.

The implementation includes:
- JWT token generation and validation
- Password hashing with bcrypt
- Refresh token mechanism
- Middleware for protected routes
```

## Footer（任意）

- 関連するIssue番号を記載
- 複数のIssueがある場合は複数行で記載

**例**:
```
feat: Add user authentication

Closes #123
Related to #456
```

### よく使われるFooterキーワード

- `Closes #123`: Issueを閉じる
- `Fixes #123`: バグ修正でIssueを閉じる
- `Resolves #123`: Issueを解決
- `Related to #123`: 関連するIssue
- `Refs #123`: 参照するIssue

## 複数の変更を含む場合

1つのコミットで複数の種類の変更を行う場合は、主要な変更のtypeを使用：

```
feat: Add user authentication and fix login bug

Add JWT-based authentication system. Also fix the redirect loop
issue that occurred during login.

Fixes #123
```

## コミットメッセージの例

### シンプルな例

```
fix: Resolve typo in README
```

```
docs: Add API endpoint documentation
```

### 詳細な例

```
feat: Implement user profile editing

Add functionality for users to edit their profile information including
name, email, and profile picture. Includes validation and error handling.

The implementation includes:
- Profile edit form component
- API endpoint for profile updates
- Image upload functionality
- Input validation

Closes #234
```

```
refactor: Extract authentication logic to service

Move authentication-related code from controllers to a dedicated
AuthService class. This improves separation of concerns and makes
the code more testable.

- Create AuthService class
- Update controllers to use AuthService
- Add unit tests for AuthService

Related to #456
```

## ベストプラクティス

### ✅ 推奨事項

- 1つのコミットで1つの論理的な変更を行う
- 変更の理由を説明する
- 関連するIssue番号をリンクする
- 命令形で記述する

### ❌ 避けるべきこと

- 曖昧なメッセージ（例: "Update files"）
- 感情的な表現（例: "Fix stupid bug"）
- 過去形の使用（例: "Added feature"）
- 長すぎるsubject（50文字を超える）

## コミットメッセージのテンプレート

### 機能追加

```
feat: <機能名>

<機能の説明>

<実装の詳細（必要に応じて）>

Closes #<Issue番号>
```

### バグ修正

```
fix: <修正内容>

<問題の説明>
<修正方法の説明>

Fixes #<Issue番号>
```

### リファクタリング

```
refactor: <リファクタリング対象>

<リファクタリングの理由>
<変更内容の説明>

Related to #<Issue番号>
```
