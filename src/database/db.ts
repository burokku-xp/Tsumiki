import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import Database from 'better-sqlite3';

let dbInstance: Database.Database | null = null;
let extensionContext: vscode.ExtensionContext | null = null;

/**
 * データベースを初期化（拡張機能コンテキストを設定）
 */
export function initDatabase(context: vscode.ExtensionContext): Database.Database {
  extensionContext = context;
  return getDatabase();
}

/**
 * データベースインスタンスを取得（シングルトンパターン）
 */
export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const globalStoragePath = getGlobalStoragePath();
  const dbPath = path.join(globalStoragePath, 'tsumiki.db');

  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(globalStoragePath)) {
    fs.mkdirSync(globalStoragePath, { recursive: true });
  }

  dbInstance = new Database(dbPath);
  
  // 外部キー制約を有効化
  dbInstance.pragma('foreign_keys = ON');
  
  // WALモードを有効化（パフォーマンス向上）
  dbInstance.pragma('journal_mode = WAL');

  return dbInstance;
}

/**
 * グローバルストレージパスを取得
 */
function getGlobalStoragePath(): string {
  if (extensionContext) {
    return extensionContext.globalStorageUri.fsPath;
  }
  
  // フォールバック: ホームディレクトリ配下
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  return path.join(homeDir, '.vscode', 'tsumiki');
}

/**
 * データベース接続を閉じる
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  extensionContext = null;
}
