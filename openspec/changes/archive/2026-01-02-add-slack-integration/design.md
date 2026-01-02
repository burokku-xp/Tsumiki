# Design: Slack Integration

## Context

日次サマリーをSlackに投稿する機能を実装します。Incoming Webhookを使用して、シンプルで安全な連携を実現します。

## Goals / Non-Goals

### Goals
- Incoming Webhookによる日次サマリーの投稿
- Webhook URLのセキュアな保存
- エラーハンドリングとリトライ機能
- 手動投稿機能（v1では手動のみ）

### Non-Goals
- Slack Appとしての実装（OAuth、Bot機能など）
- 自動投稿機能（v1では手動のみ、v2以降で検討）
- 複数のWebhook URL対応（v1では1つのみ）

## Decisions

### Decision: Incoming Webhookを使用
- **理由**: シンプルで実装が容易、認証不要、Bot機能が不要
- **代替案**: Slack App（OAuthが必要、複雑）

### Decision: Secret Storage APIでWebhook URLを保存
- **理由**: VSCode APIの標準機能、セキュアな保存
- **代替案**: 設定ファイル（平文保存、非推奨）

### Decision: node-fetchを使用
- **理由**: 軽量、標準的なAPI、TypeScript対応
- **代替案**: axios（より多機能だが重い）

### Decision: 手動投稿のみ（v1）
- **理由**: シンプルな実装、ユーザーが制御可能
- **将来拡張**: 自動投稿機能（v2以降）

## Risks / Trade-offs

- **リスク**: Webhook URLの漏洩
- **対策**: Secret Storage API使用、URLの表示を制限

- **リスク**: ネットワークエラー
- **対策**: リトライ機能、エラーメッセージ表示

- **リスク**: 無効なWebhook URL
- **対策**: URL検証（将来実装）、エラーメッセージ表示

## Migration Plan

新規機能のため、マイグレーションは不要です。

## Open Questions

- 自動投稿のタイミング（v2以降で検討）
