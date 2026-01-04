/**
 * データベースモジュールのエクスポート
 */

export { initDatabase, getDatabase, closeDatabase } from './db';
export { initializeDatabase, runMigrations } from './migrations';
export {
  // 型定義
  type Session,
  type FileEdit,
  type DailyStat,
  type LanguageRatio,
  // セッション操作
  createSession,
  updateSession,
  getSession,
  getSessionsByDateRange,
  getActiveSession,
  // ファイル編集記録操作
  insertFileEdit,
  getFileEditsBySession,
  getFileEditsByDateRange,
  getFileEditsByDate,
  getLatestFileEdit,
  // 日次統計操作
  calculateDailyStats,
  saveDailyStats,
  getDailyStatsByDate,
  getDailyStatsByDateRange,
  deleteDailyStats,
  resetDailyData,
} from './models';
