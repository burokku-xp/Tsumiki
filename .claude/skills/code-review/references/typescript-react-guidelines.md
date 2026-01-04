# TypeScript/React コードレビューガイドライン

TypeScriptとReactを使用したVS Code拡張機能開発における、コードレビューの具体的なガイドラインです。

## TypeScript固有のレビュー観点

### 型安全性

#### any型の使用
```typescript
// ❌ 悪い例
function processData(data: any) {
  return data.value;
}

// ✅ 良い例
interface Data {
  value: string;
}
function processData(data: Data) {
  return data.value;
}
```

**チェックポイント:**
- [ ] any型が不必要に使用されていないか
- [ ] 適切な型定義が存在するか
- [ ] 型アサーションが最小限か

#### 型定義の明確性
```typescript
// ❌ 悪い例
function getUser(id) {
  // ...
}

// ✅ 良い例
function getUser(id: string): Promise<User | null> {
  // ...
}
```

**チェックポイント:**
- [ ] 関数の引数と戻り値の型が明確か
- [ ] オプショナルパラメータが適切にマークされているか
- [ ] ジェネリクスが適切に使用されているか

#### null/undefinedの処理
```typescript
// ❌ 悪い例
function getValue(obj: { value?: string }) {
  return obj.value.toUpperCase(); // valueがundefinedの可能性
}

// ✅ 良い例
function getValue(obj: { value?: string }) {
  return obj.value?.toUpperCase() ?? '';
}
```

**チェックポイント:**
- [ ] null/undefinedの可能性が適切に処理されているか
- [ ] オプショナルチェーン（?.）が適切に使用されているか
- [ ] null合体演算子（??）が適切に使用されているか

### strict modeの遵守

**チェックポイント:**
- [ ] strict modeが有効になっているか（tsconfig.jsonで確認）
- [ ] 型エラーがないか
- [ ] 暗黙的なanyがないか

## React固有のレビュー観点

### コンポーネント設計

#### コンポーネントの分割
```typescript
// ❌ 悪い例: 巨大なコンポーネント
function UserDashboard() {
  // 100行以上のコード
  return (
    <div>
      {/* 複数のセクション */}
    </div>
  );
}

// ✅ 良い例: 適切に分割
function UserDashboard() {
  return (
    <div>
      <UserHeader />
      <UserStats />
      <UserActivity />
    </div>
  );
}
```

**チェックポイント:**
- [ ] コンポーネントが適切なサイズか（単一責任の原則）
- [ ] 再利用可能なコンポーネントに分割されているか
- [ ] 関心の分離が適切か

#### Propsの型定義
```typescript
// ❌ 悪い例
function Button(props) {
  return <button>{props.label}</button>;
}

// ✅ 良い例
interface ButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}
function Button({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

**チェックポイント:**
- [ ] Propsの型が適切に定義されているか
- [ ] 必須/オプショナルが明確か
- [ ] デフォルト値が適切に設定されているか

### パフォーマンス最適化

#### 不要な再レンダリングの防止
```typescript
// ❌ 悪い例: 毎回新しい関数が作成される
function Parent() {
  const [count, setCount] = useState(0);
  return <Child onClick={() => console.log('click')} />;
}

// ✅ 良い例: useCallbackでメモ化
function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => {
    console.log('click');
  }, []);
  return <Child onClick={handleClick} />;
}
```

**チェックポイント:**
- [ ] useCallbackが適切に使用されているか
- [ ] useMemoが適切に使用されているか
- [ ] 依存配列が適切に設定されているか

#### メモ化の適切な使用
```typescript
// ❌ 悪い例: 不要なメモ化
const value = useMemo(() => simpleCalculation(a, b), [a, b]);

// ✅ 良い例: 重い計算のみメモ化
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

**チェックポイント:**
- [ ] メモ化が本当に必要か（過度な最適化を避ける）
- [ ] 依存配列が正確か
- [ ] メモ化のコストが利益を上回っているか

### フックの使用

#### フックのルール
```typescript
// ❌ 悪い例: 条件分岐内でフックを使用
function Component({ condition }) {
  if (condition) {
    const [state, setState] = useState(0); // エラー
  }
  return <div>...</div>;
}

// ✅ 良い例: 常に同じ順序で呼び出す
function Component({ condition }) {
  const [state, setState] = useState(0);
  if (condition) {
    // 条件分岐はOK
  }
  return <div>...</div>;
}
```

**チェックポイント:**
- [ ] フックが条件分岐内で呼ばれていないか
- [ ] フックがループ内で呼ばれていないか
- [ ] カスタムフックの命名が適切か（useで始まる）

#### useEffectの依存配列
```typescript
// ❌ 悪い例: 依存配列が不完全
useEffect(() => {
  fetchData(userId);
}, []); // userIdが変更されても再実行されない

// ✅ 良い例: 依存配列が完全
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

**チェックポイント:**
- [ ] 依存配列が完全か
- [ ] 不要な再実行がないか
- [ ] クリーンアップ関数が適切に実装されているか

### 状態管理

#### useState vs useReducer
```typescript
// シンプルな状態: useState
const [count, setCount] = useState(0);

// 複雑な状態: useReducer
const [state, dispatch] = useReducer(reducer, initialState);
```

**チェックポイント:**
- [ ] 状態管理の方法が適切か
- [ ] 状態の更新が適切に実装されているか
- [ ] 状態の持ち方が適切か（リフトアップが必要か）

## VS Code拡張機能固有のレビュー観点

### WebView通信

#### postMessageの型安全性
```typescript
// ❌ 悪い例: 型が不明確
webview.postMessage({ type: 'update', data: someData });

// ✅ 良い例: 型定義されたメッセージ
interface WebViewMessage {
  type: 'update' | 'error' | 'success';
  data: unknown;
}
webview.postMessage({ type: 'update', data: someData } as WebViewMessage);
```

**チェックポイント:**
- [ ] メッセージの型が定義されているか
- [ ] メッセージの検証が適切か
- [ ] エラーハンドリングが適切か

### イベントハンドリング

#### イベントリスナーのクリーンアップ
```typescript
// ❌ 悪い例: クリーンアップがない
useEffect(() => {
  const disposable = vscode.workspace.onDidSaveTextDocument(handleSave);
  // クリーンアップがない
}, []);

// ✅ 良い例: クリーンアップがある
useEffect(() => {
  const disposable = vscode.workspace.onDidSaveTextDocument(handleSave);
  return () => disposable.dispose();
}, []);
```

**チェックポイント:**
- [ ] イベントリスナーが適切にクリーンアップされているか
- [ ] メモリリークの可能性がないか
- [ ] 複数のイベントリスナーが適切に管理されているか

### データベース操作

#### SQLiteクエリの型安全性
```typescript
// ❌ 悪い例: 型が不明確
const result = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

// ✅ 良い例: 型が明確
interface User {
  id: string;
  name: string;
}
const result = db.prepare<User, [string]>('SELECT * FROM users WHERE id = ?').get(id);
```

**チェックポイント:**
- [ ] クエリの型が適切に定義されているか
- [ ] SQLインジェクション対策がされているか
- [ ] トランザクションが適切に使用されているか

## コードスタイル

### 命名規則

- **変数・関数**: camelCase
- **クラス・コンポーネント**: PascalCase
- **ファイル名**: kebab-case
- **定数**: UPPER_SNAKE_CASE または camelCase（プロジェクトの規約に従う）

### コメント

- 複雑なロジックには日本語コメントを追加
- 関数の目的と引数・戻り値を説明
- TODOコメントには担当者や期限を記載

### インポート

```typescript
// ✅ 良い例: 整理されたインポート
import React, { useState, useEffect } from 'react';
import { vscode } from './vscodeApi';
import type { User } from './types';
```

**チェックポイント:**
- [ ] インポートが整理されているか
- [ ] 未使用のインポートがないか
- [ ] 型インポートが適切に使用されているか（typeキーワード）
