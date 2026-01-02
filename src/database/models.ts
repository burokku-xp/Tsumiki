import Database from 'better-sqlite3';
import { getDatabase } from './db';

/**
 * セッションモデル
 */
export interface Session {
  id: number;
  start_time: number;
  end_time: number | null;
  duration: number | null;
  created_at: number;
  updated_at: number;
}

/**
 * ファイル編集記録モデル
 */
export interface FileEdit {
  id: number;
  session_id: number;
  file_path: string;
  line_count: number;
  language: string | null;
  saved_at: number;
  created_at: number;
}

/**
 * 日次統計モデル
 */
export interface DailyStat {
  id: number;
  date: string; // YYYY-MM-DD形式
  work_time: number; // 秒単位
  save_count: number;
  file_count: number;
  line_changes: number;
  language_ratios: string | null; // JSON形式の文字列
  created_at: number;
  updated_at: number;
}

/**
 * 言語比率の型定義
 */
export interface LanguageRatio {
  [language: string]: number; // 言語名: パーセンテージ
}

// ==================== セッション操作 ====================

/**
 * 新しいセッションを作成
 */
export function createSession(startTime: number): number {
  const db = getDatabase();
  if (!db) {
    throw new Error('Database is not available');
  }
  const result = db.prepare(`
    INSERT INTO sessions (start_time, created_at, updated_at)
    VALUES (?, strftime('%s', 'now'), strftime('%s', 'now'))
  `).run(startTime);
  return result.lastInsertRowid as number;
}

/**
 * セッションを更新（終了時刻と作業時間を設定）
 */
export function updateSession(sessionId: number, endTime: number, duration: number): void {
  const db = getDatabase();
  if (!db) {
    throw new Error('Database is not available');
  }
  db.prepare(`
    UPDATE sessions
    SET end_time = ?, duration = ?, updated_at = strftime('%s', 'now')
    WHERE id = ?
  `).run(endTime, duration, sessionId);
}

/**
 * セッションを取得（ID指定）
 */
export function getSession(sessionId: number): Session | null {
  const db = getDatabase();
  if (!db) {
    return null;
  }
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as Session | null;
}

/**
 * 日付範囲でセッションを取得
 */
export function getSessionsByDateRange(startDate: number, endDate: number): Session[] {
  const db = getDatabase();
  if (!db) {
    return [];
  }
  return db.prepare(`
    SELECT * FROM sessions
    WHERE start_time >= ? AND start_time <= ?
    ORDER BY start_time DESC
  `).all(startDate, endDate) as Session[];
}

/**
 * アクティブなセッション（終了していないセッション）を取得
 */
export function getActiveSession(): Session | null {
  const db = getDatabase();
  if (!db) {
    return null;
  }
  return db.prepare(`
    SELECT * FROM sessions
    WHERE end_time IS NULL
    ORDER BY start_time DESC
    LIMIT 1
  `).get() as Session | null;
}

// ==================== ファイル編集記録操作 ====================

/**
 * ファイル編集記録を挿入
 */
export function insertFileEdit(
  sessionId: number,
  filePath: string,
  lineCount: number,
  language: string | null,
  savedAt: number
): number {
  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO file_edits (session_id, file_path, line_count, language, saved_at, created_at)
    VALUES (?, ?, ?, ?, ?, strftime('%s', 'now'))
  `).run(sessionId, filePath, lineCount, language, savedAt);
  return result.lastInsertRowid as number;
}

/**
 * セッションIDでファイル編集記録を取得
 */
export function getFileEditsBySession(sessionId: number): FileEdit[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM file_edits
    WHERE session_id = ?
    ORDER BY saved_at ASC
  `).all(sessionId) as FileEdit[];
}

/**
 * 日付範囲でファイル編集記録を取得
 */
export function getFileEditsByDateRange(startDate: number, endDate: number): FileEdit[] {
  const db = getDatabase();
  if (!db) {
    return [];
  }
  
  return db.prepare(`
    SELECT * FROM file_edits
    WHERE saved_at >= ? AND saved_at <= ?
    ORDER BY saved_at DESC
  `).all(startDate, endDate) as FileEdit[];
}

/**
 * 特定日のファイル編集記録を取得
 */
export function getFileEditsByDate(date: string): FileEdit[] {
  const db = getDatabase();
  if (!db) {
    return [];
  }
  
  const startOfDay = new Date(date + 'T00:00:00').getTime() / 1000;
  const endOfDay = new Date(date + 'T23:59:59').getTime() / 1000;
  return getFileEditsByDateRange(startOfDay, endOfDay);
}

// ==================== 日次統計操作 ====================

/**
 * 日次統計を計算
 */
export function calculateDailyStats(date: string): DailyStat {
  const db = getDatabase();
  if (!db) {
    // データベースが利用できない場合は空の統計を返す
    return {
      id: 0,
      date,
      work_time: 0,
      save_count: 0,
      file_count: 0,
      line_changes: 0,
      language_ratios: null,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };
  }
  
  const startOfDay = new Date(date + 'T00:00:00').getTime() / 1000;
  const endOfDay = new Date(date + 'T23:59:59').getTime() / 1000;

  // セッションから作業時間を集計
  const sessions = getSessionsByDateRange(startOfDay, endOfDay);
  const workTime = sessions.reduce((total, session) => {
    return total + (session.duration || 0);
  }, 0);

  // ファイル編集記録から統計を集計
  const fileEdits = getFileEditsByDateRange(startOfDay, endOfDay);
  const saveCount = fileEdits.length;
  const uniqueFiles = new Set(fileEdits.map(edit => edit.file_path));
  const fileCount = uniqueFiles.size;
  const lineChanges = fileEdits.reduce((total, edit) => total + edit.line_count, 0);

  // 言語比率を計算
  const languageCounts: { [key: string]: number } = {};
  fileEdits.forEach(edit => {
    if (edit.language) {
      languageCounts[edit.language] = (languageCounts[edit.language] || 0) + edit.line_count;
    }
  });

  const totalLines = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);
  const languageRatios: LanguageRatio = {};
  if (totalLines > 0) {
    Object.entries(languageCounts).forEach(([lang, count]) => {
      languageRatios[lang] = Math.round((count / totalLines) * 100);
    });
  }

  return {
    id: 0, // 新規作成時は0
    date,
    work_time: workTime,
    save_count: saveCount,
    file_count: fileCount,
    line_changes: lineChanges,
    language_ratios: Object.keys(languageRatios).length > 0 ? JSON.stringify(languageRatios) : null,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
  };
}

/**
 * 日次統計を保存または更新
 */
export function saveDailyStats(stats: DailyStat): void {
  const db = getDatabase();
  if (!db) {
    return;
  }
  const existing = getDailyStatsByDate(stats.date);
  
  if (existing) {
    // 更新
    db.prepare(`
      UPDATE daily_stats
      SET work_time = ?, save_count = ?, file_count = ?, line_changes = ?,
          language_ratios = ?, updated_at = strftime('%s', 'now')
      WHERE date = ?
    `).run(
      stats.work_time,
      stats.save_count,
      stats.file_count,
      stats.line_changes,
      stats.language_ratios,
      stats.date
    );
  } else {
    // 新規作成
    db.prepare(`
      INSERT INTO daily_stats (date, work_time, save_count, file_count, line_changes, language_ratios, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, strftime('%s', 'now'), strftime('%s', 'now'))
    `).run(
      stats.date,
      stats.work_time,
      stats.save_count,
      stats.file_count,
      stats.line_changes,
      stats.language_ratios
    );
  }
}

/**
 * 日付で日次統計を取得（存在しない場合は計算して返す）
 */
export function getDailyStatsByDate(date: string): DailyStat | null {
  const db = getDatabase();
  if (!db) {
    return null;
  }
  
  const result = db.prepare('SELECT * FROM daily_stats WHERE date = ?').get(date) as DailyStat | null;
  
  if (result) {
    return result;
  }
  
  // 存在しない場合は計算
  try {
    const calculated = calculateDailyStats(date);
    if (calculated.save_count > 0 || calculated.work_time > 0) {
      saveDailyStats(calculated);
      return getDailyStatsByDate(date);
    }
  } catch (error) {
    console.error('Failed to calculate daily stats:', error);
  }
  
  return null;
}

/**
 * 日付範囲で日次統計を取得
 */
export function getDailyStatsByDateRange(startDate: string, endDate: string): DailyStat[] {
  const db = getDatabase();
  if (!db) {
    return [];
  }
  return db.prepare(`
    SELECT * FROM daily_stats
    WHERE date >= ? AND date <= ?
    ORDER BY date DESC
  `).all(startDate, endDate) as DailyStat[];
}
