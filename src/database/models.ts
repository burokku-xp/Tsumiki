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
  console.log('[Tsumiki] getSessionsByDateRange: startDate=', startDate, 'endDate=', endDate);
  // デバッグ: すべてのセッションを取得して確認
  const allSessions = db.prepare('SELECT * FROM sessions ORDER BY start_time DESC LIMIT 10').all() as Session[];
  console.log('[Tsumiki] All sessions in database:', allSessions.length);
  allSessions.forEach((s, i) => {
    const startDateStr = new Date(s.start_time * 1000).toISOString();
    console.log(`[Tsumiki] session[${i}]: id=${s.id}, start_time=${s.start_time} (${startDateStr}), end_time=${s.end_time}, duration=${s.duration}`);
  });
  
  const sessions = db.prepare(`
    SELECT * FROM sessions
    WHERE start_time >= ? AND start_time <= ?
    ORDER BY start_time DESC
  `).all(startDate, endDate) as Session[];
  console.log('[Tsumiki] getSessionsByDateRange: found', sessions.length, 'sessions in range');
  sessions.forEach((s, i) => {
    console.log(`[Tsumiki] session[${i}]: id=${s.id}, start_time=${s.start_time}, end_time=${s.end_time}, duration=${s.duration}`);
  });
  return sessions;
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
  
  // ローカルタイムゾーンで日付の開始時刻と終了時刻を計算
  const startOfDayDate = new Date(date + 'T00:00:00');
  const endOfDayDate = new Date(date + 'T23:59:59');
  const startOfDay = Math.floor(startOfDayDate.getTime() / 1000);
  const endOfDay = Math.floor(endOfDayDate.getTime() / 1000);
  return getFileEditsByDateRange(startOfDay, endOfDay);
}

/**
 * 指定ファイルパスの最新のファイル編集記録を取得（前回保存時の行数を取得するため）
 */
export function getLatestFileEdit(filePath: string): FileEdit | null {
  const db = getDatabase();
  if (!db) {
    return null;
  }
  
  return db.prepare(`
    SELECT * FROM file_edits
    WHERE file_path = ?
    ORDER BY saved_at DESC
    LIMIT 1
  `).get(filePath) as FileEdit | null;
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
  
  // ローカルタイムゾーンで日付の開始時刻と終了時刻を計算
  // dateはYYYY-MM-DD形式なので、ローカルタイムゾーンで解釈する
  // セッションのstart_timeはUTCベースのUnixタイムスタンプなので、
  // ローカルタイムゾーンの日付をUTCベースのタイムスタンプに変換する必要がある
  const localStartOfDay = new Date(date + 'T00:00:00');
  const localEndOfDay = new Date(date + 'T23:59:59.999');
  
  // ローカルタイムゾーンの日付をUTCベースのUnixタイムスタンプに変換
  // 注意: getTime()はUTCのミリ秒を返すので、ローカルタイムゾーンの時刻をUTCに変換する
  const startOfDay = Math.floor(localStartOfDay.getTime() / 1000);
  const endOfDay = Math.floor(localEndOfDay.getTime() / 1000);
  
  console.log('[Tsumiki] calculateDailyStats: date=', date, 'startOfDay=', startOfDay, 'endOfDay=', endOfDay);
  console.log('[Tsumiki] calculateDailyStats: localStartOfDay=', localStartOfDay.toString(), 'localEndOfDay=', localEndOfDay.toString());
  console.log('[Tsumiki] calculateDailyStats: UTC startOfDay=', new Date(startOfDay * 1000).toISOString(), 'UTC endOfDay=', new Date(endOfDay * 1000).toISOString());

  // セッションから作業時間を集計
  const sessions = getSessionsByDateRange(startOfDay, endOfDay);
  const now = Math.floor(Date.now() / 1000);
  console.log('[Tsumiki] calculateDailyStats: sessions count:', sessions.length);
  const workTime = sessions.reduce((total, session) => {
    if (session.end_time === null) {
      // アクティブなセッション（タイマーが動作中）の場合、現在時刻から開始時刻を引く
      const elapsed = now - session.start_time;
      console.log('[Tsumiki] calculateDailyStats: active session found, elapsed:', elapsed);
      return total + elapsed;
    } else {
      // 終了したセッションの場合、durationを使用
      console.log('[Tsumiki] calculateDailyStats: completed session, duration:', session.duration);
      return total + (session.duration || 0);
    }
  }, 0);
  console.log('[Tsumiki] calculateDailyStats: total workTime:', workTime);

  // ファイル編集記録から統計を集計
  const fileEdits = getFileEditsByDateRange(startOfDay, endOfDay);
  const saveCount = fileEdits.length;
  const uniqueFiles = new Set(fileEdits.map(edit => edit.file_path));
  const fileCount = uniqueFiles.size;
  
  // 行数変更を計算：同じファイルの複数の保存を時系列で処理し、各保存時の差分を合計
  // file_editsテーブルには「その時点でのファイル全体の行数」が保存されている
  // 初回保存時は初期行数との差分、2回目以降は前回保存時との差分を計算
  const fileEditsByFile = new Map<string, FileEdit[]>(); // file_path -> [edit1, edit2, ...]
  fileEdits.forEach(edit => {
    if (!fileEditsByFile.has(edit.file_path)) {
      fileEditsByFile.set(edit.file_path, []);
    }
    fileEditsByFile.get(edit.file_path)!.push(edit);
  });
  
  let lineChanges = 0;
  fileEditsByFile.forEach((edits, filePath) => {
    // 時系列でソート（saved_atの昇順）
    edits.sort((a, b) => a.saved_at - b.saved_at);
    
    console.log('[Tsumiki] calculateDailyStats: processing file:', filePath, 'edits count:', edits.length);
    
    // 初回保存時は0行として扱う（初期行数との差分は記録されていないため）
    // 2回目以降は追加行数のみをカウント（削除は0として扱う）
    for (let i = 1; i < edits.length; i++) {
      const previousLineCount = edits[i - 1].line_count;
      const currentLineCount = edits[i].line_count;
      const diff = Math.max(0, currentLineCount - previousLineCount);
      lineChanges += diff;
      console.log('[Tsumiki] calculateDailyStats: line change diff:', {
        filePath,
        previousLineCount,
        currentLineCount,
        diff,
        totalLineChanges: lineChanges,
      });
    }
  });
  
  console.log('[Tsumiki] calculateDailyStats: total lineChanges:', lineChanges);
  
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:295',message:'calculateDailyStats lineChanges calculation',data:{fileEditsCount:fileEdits.length,uniqueFilesCount:fileCount,lineChanges,fileEditsByFileSize:fileEditsByFile.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

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
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:299',message:'saveDailyStats entry',data:{date:stats.date},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const db = getDatabase();
  if (!db) {
    return;
  }
  // 無限再帰を防ぐため、直接データベースをクエリして既存統計を確認
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:304',message:'before direct db query',data:{date:stats.date},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const existing = db.prepare('SELECT * FROM daily_stats WHERE date = ?').get(stats.date) as DailyStat | null;
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:305',message:'after direct db query',data:{date:stats.date,existing:existing?true:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
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
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:340',message:'getDailyStatsByDate entry',data:{date},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const db = getDatabase();
  if (!db) {
    return null;
  }
  
  const result = db.prepare('SELECT * FROM daily_stats WHERE date = ?').get(date) as DailyStat | null;
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:346',message:'after db query',data:{date,found:result?true:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  if (result) {
    return result;
  }
  
  // 存在しない場合は計算
  try {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:353',message:'before calculateDailyStats',data:{date},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const calculated = calculateDailyStats(date);
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:354',message:'after calculateDailyStats',data:{date,workTime:calculated.work_time,saveCount:calculated.save_count},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // アクティブなセッションがある場合もwork_timeが0より大きくなる可能性があるため、
    // work_time > 0 の場合も保存する
    if (calculated.save_count > 0 || calculated.work_time > 0) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:357',message:'before saveDailyStats call',data:{date},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      saveDailyStats(calculated);
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:358',message:'after saveDailyStats, before direct db query',data:{date},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // 無限再帰を防ぐため、保存後に直接データベースから取得
      const saved = db.prepare('SELECT * FROM daily_stats WHERE date = ?').get(date) as DailyStat | null;
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:359',message:'after direct db query',data:{date,found:saved?true:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return saved || calculated;
    }
    // 統計が存在しない場合でも、計算結果を返す（アクティブなセッションがある場合）
    // ただし、save_countとwork_timeが両方0の場合はnullを返す
    if (calculated.work_time > 0) {
      return calculated;
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

/**
 * 指定日の日次統計を削除（キャッシュ無効化用）
 */
export function deleteDailyStats(date: string): void {
  const db = getDatabase();
  if (!db) {
    return;
  }
  db.prepare('DELETE FROM daily_stats WHERE date = ?').run(date);
}

/**
 * 指定日のデータをリセット（セッション、ファイル編集、日次統計を削除）
 */
export function resetDailyData(date: string): void {
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:487',message:'resetDailyData entry',data:{date},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const db = getDatabase();
  if (!db) {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:492',message:'resetDailyData db null',data:{date},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return;
  }
  
  // ローカルタイムゾーンで日付の開始時刻と終了時刻を計算
  const localStartOfDay = new Date(date + 'T00:00:00');
  const localEndOfDay = new Date(date + 'T23:59:59.999');
  const startOfDay = Math.floor(localStartOfDay.getTime() / 1000);
  const endOfDay = Math.floor(localEndOfDay.getTime() / 1000);
  
  // アクティブなセッションを確認
  const activeSession = getActiveSession();
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:503',message:'resetDailyData activeSession check',data:{date,hasActiveSession:!!activeSession,activeSessionId:activeSession?.id,activeSessionStartTime:activeSession?.start_time},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // トランザクションで一括削除
  db.transaction(() => {
    // 日次統計を削除
    db.prepare('DELETE FROM daily_stats WHERE date = ?').run(date);
    
    // ファイル編集記録を削除（該当日のもの）
    db.prepare('DELETE FROM file_edits WHERE saved_at >= ? AND saved_at <= ?').run(startOfDay, endOfDay);
    
    // セッションを削除（該当日のもの）
    // 注意: アクティブなセッション（end_timeがnull）は削除しない
    db.prepare('DELETE FROM sessions WHERE start_time >= ? AND start_time <= ? AND end_time IS NOT NULL').run(startOfDay, endOfDay);
  })();
  
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'models.ts:520',message:'resetDailyData completed',data:{date,startOfDay,endOfDay},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
}