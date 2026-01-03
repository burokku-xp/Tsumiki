import * as vscode from 'vscode';
import { insertFileEdit, getActiveSession, getLatestFileEdit } from '../database';

/**
 * ファイル編集追跡機能
 */
export class FileTracker {
  // ファイルが開かれた時の初期行数を記録（file_path -> initial_line_count）
  private initialLineCounts = new Map<string, number>();

  /**
   * ファイルが開かれた時に初期行数を記録
   * @param document 開かれたドキュメント
   * @param lineCount 初期行数（空行・コメント除外）
   */
  public recordInitialLineCount(document: vscode.TextDocument, lineCount: number): void {
    const filePath = document.uri.fsPath;
    // 既に記録されている場合は更新しない（最初の開き時のみ記録）
    if (!this.initialLineCounts.has(filePath)) {
      this.initialLineCounts.set(filePath, lineCount);
      console.log('[Tsumiki] Initial line count recorded:', {
        filePath,
        lineCount,
      });
    }
  }

  /**
   * ファイル編集を記録（差分ベースの変更行数を計算）
   * @param document 保存されたドキュメント
   * @param currentLineCount 現在の行数（空行・コメント除外）
   * @param language 言語
   * @param sessionId セッションID（オプション、指定されていない場合はgetActiveSession()で取得）
   */
  public trackFileEdit(
    document: vscode.TextDocument,
    currentLineCount: number,
    language: string | null,
    sessionId?: number
  ): void {
    try {
      let targetSessionId: number | null = null;

      // セッションIDが指定されている場合はそれを使用
      if (sessionId !== undefined) {
        targetSessionId = sessionId;
      } else {
        // セッションIDが指定されていない場合はアクティブなセッションを取得
        const activeSession = getActiveSession();
        if (!activeSession) {
          // セッションが存在しない場合は記録しない
          console.warn('[Tsumiki] No active session found, skipping file edit tracking');
          return;
        }
        targetSessionId = activeSession.id;
      }

      if (targetSessionId === null) {
        console.warn('[Tsumiki] Session ID is null, skipping file edit tracking');
        return;
      }

      const filePath = document.uri.fsPath;
      const savedAt = Math.floor(Date.now() / 1000);

      // 初期行数を取得（ファイルが開かれた時に記録された値）
      const initialLineCount = this.initialLineCounts.get(filePath);
      
      // 前回保存時の行数を取得（データベースから）
      const latestEdit = getLatestFileEdit(filePath);
      
      // file_editsテーブルには「その時点でのファイル全体の行数」を保存する
      // calculateDailyStatsで各保存時の差分を計算して合計する
      const lineCountToSave = currentLineCount;

      // ファイル編集記録をデータベースに保存（ファイル全体の行数を記録）
      insertFileEdit(
        targetSessionId,
        filePath,
        lineCountToSave,
        language,
        savedAt
      );

      console.log('[Tsumiki] File edit tracked:', {
        filePath,
        isFirstSave: !latestEdit,
        initialLineCount,
        previousLineCount: latestEdit ? latestEdit.line_count : null,
        currentLineCount,
        lineCountToSave,
        language,
        sessionId: targetSessionId,
      });
    } catch (error) {
      console.error('[Tsumiki] Failed to track file edit:', error);
    }
  }
}
