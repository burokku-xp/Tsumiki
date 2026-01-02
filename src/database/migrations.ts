import Database from 'better-sqlite3';
import { getDatabase } from './db';

const SCHEMA_VERSION = 1;

/**
 * 現在のスキーマバージョンを取得
 */
function getCurrentSchemaVersion(db: Database.Database): number {
  try {
    const result = db.prepare("SELECT version FROM schema_version LIMIT 1").get() as { version: number } | undefined;
    return result?.version || 0;
  } catch {
    // schema_versionテーブルが存在しない場合は0を返す
    return 0;
  }
}

/**
 * スキーマバージョンを更新
 */
function updateSchemaVersion(db: Database.Database, version: number): void {
  db.prepare("UPDATE schema_version SET version = ?").run(version);
}

/**
 * 初回マイグレーション: テーブル作成
 */
function migration_001_initial_schema(db: Database.Database): void {
  db.exec(`
    -- スキーマバージョン管理テーブル
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL PRIMARY KEY
    );

    -- 作業セッションテーブル
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      duration INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    -- ファイル編集記録テーブル
    CREATE TABLE IF NOT EXISTS file_edits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      line_count INTEGER NOT NULL,
      language TEXT,
      saved_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    -- 日次統計テーブル
    CREATE TABLE IF NOT EXISTS daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      work_time INTEGER NOT NULL DEFAULT 0,
      save_count INTEGER NOT NULL DEFAULT 0,
      file_count INTEGER NOT NULL DEFAULT 0,
      line_changes INTEGER NOT NULL DEFAULT 0,
      language_ratios TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    -- インデックス作成
    CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
    CREATE INDEX IF NOT EXISTS idx_sessions_end_time ON sessions(end_time);
    CREATE INDEX IF NOT EXISTS idx_file_edits_session_id ON file_edits(session_id);
    CREATE INDEX IF NOT EXISTS idx_file_edits_saved_at ON file_edits(saved_at);
    CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
  `);

  // 初回マイグレーションの場合はスキーマバージョンを設定
  const currentVersion = getCurrentSchemaVersion(db);
  if (currentVersion === 0) {
    db.prepare("INSERT INTO schema_version (version) VALUES (?)").run(SCHEMA_VERSION);
  }
}

/**
 * すべてのマイグレーションを実行
 */
export function runMigrations(): void {
  const db = getDatabase();
  
  try {
    db.transaction(() => {
      const currentVersion = getCurrentSchemaVersion(db);
      
      if (currentVersion < 1) {
        migration_001_initial_schema(db);
        updateSchemaVersion(db, 1);
      }
      
      // 将来のマイグレーションはここに追加
      // if (currentVersion < 2) {
      //   migration_002_xxx(db);
      //   updateSchemaVersion(db, 2);
      // }
    })();
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * データベースを初期化（マイグレーション実行）
 */
export function initializeDatabase(): void {
  runMigrations();
}
