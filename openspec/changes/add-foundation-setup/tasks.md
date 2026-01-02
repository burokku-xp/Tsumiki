## 1. プロジェクト設定

- [x] 1.1 `package.json`を作成（拡張機能マニフェスト、依存関係定義）
- [x] 1.2 `tsconfig.json`を作成（TypeScript設定）
- [x] 1.3 `.vscodeignore`を作成（パッケージ除外設定）
- [x] 1.4 `pnpm-lock.yaml`を生成（`pnpm install`実行）

## 2. ビルド設定

- [x] 2.1 esbuild設定ファイルを作成（`esbuild.config.js`または`build.js`）
- [x] 2.2 ビルドスクリプトを`package.json`に追加
- [x] 2.3 開発用watchモードの設定

## 3. 拡張機能本体

- [x] 3.1 `src/extension.ts`を作成（アクティベーション処理）
- [x] 3.2 基本的なコマンド登録（`registerCommand`）
- [x] 3.3 拡張機能の有効化/無効化処理

## 4. 検証

- [x] 4.1 拡張機能が正常にロードされることを確認
- [x] 4.2 基本的なコマンドが実行できることを確認
- [x] 4.3 ビルドが正常に完了することを確認
