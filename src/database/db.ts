import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import Database from 'better-sqlite3';

let dbInstance: Database.Database | null = null;
let extensionContext: vscode.ExtensionContext | null = null;
let dbInitializationFailed = false; // 初期化失敗フラグ

/**
 * データベースを初期化（拡張機能コンテキストを設定）
 */
export function initDatabase(context: vscode.ExtensionContext): Database.Database | null {
  extensionContext = context;
  return getDatabase();
}

/**
 * データベースインスタンスを取得（シングルトンパターン）
 */
export function getDatabase(): Database.Database | null {
  // 既にインスタンスがある場合は返す
  if (dbInstance) {
    return dbInstance;
  }

  // 既に初期化を試みて失敗した場合は、再度試みない
  if (dbInitializationFailed) {
    return null;
  }

  try {
    const globalStoragePath = getGlobalStoragePath();
    const dbPath = path.join(globalStoragePath, 'tsumiki.db');

    console.log('[Tsumiki] Database path:', dbPath);
    console.log('[Tsumiki] Extension context:', extensionContext ? 'available' : 'null');

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(globalStoragePath)) {
      console.log('[Tsumiki] Creating directory:', globalStoragePath);
      try {
        fs.mkdirSync(globalStoragePath, { recursive: true });
        console.log('[Tsumiki] Directory created successfully');
      } catch (mkdirError) {
        console.error('[Tsumiki] Failed to create directory:', mkdirError);
        throw new Error(`Failed to create database directory: ${mkdirError instanceof Error ? mkdirError.message : String(mkdirError)}`);
      }
    }

    console.log('[Tsumiki] Creating database instance...');
    dbInstance = new Database(dbPath);
    
    console.log('[Tsumiki] Database instance created, setting pragmas...');
    
    // 外部キー制約を有効化
    dbInstance.pragma('foreign_keys = ON');
    
    // WALモードを有効化（パフォーマンス向上）
    dbInstance.pragma('journal_mode = WAL');

    console.log('[Tsumiki] Database initialized successfully');
    return dbInstance;
  } catch (error) {
    // エラーメッセージを詳細に記録
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    console.error('[Tsumiki] Database initialization failed:', errorMessage);
    console.error('[Tsumiki] Error name:', errorName);
    if (errorStack) {
      console.error('[Tsumiki] Stack trace:', errorStack);
    }
    
    // better-sqlite3のロードエラーの詳細を記録
    if (errorMessage.includes('better-sqlite3') || errorMessage.includes('Cannot find module') || errorMessage.includes('native module')) {
      console.error('[Tsumiki] better-sqlite3 module load error detected');
      console.error('[Tsumiki] Node version:', process.version);
      console.error('[Tsumiki] Platform:', process.platform);
      console.error('[Tsumiki] Architecture:', process.arch);
      console.error('[Tsumiki] Extension path:', extensionContext?.extensionPath || 'unknown');
      
      // モジュールの存在確認
      try {
        const modulePath = require.resolve('better-sqlite3');
        console.error('[Tsumiki] better-sqlite3 module path:', modulePath);
      } catch (resolveError) {
        console.error('[Tsumiki] better-sqlite3 module not found in require.resolve');
      }
    }
    
    // エラーが発生した場合は、フラグを設定して再度試みないようにする
    dbInstance = null;
    dbInitializationFailed = true;
    return null;
  }
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
  dbInitializationFailed = false; // リセット
}
