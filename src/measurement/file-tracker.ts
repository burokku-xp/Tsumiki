import * as vscode from 'vscode';
import { insertFileEdit, getActiveSession } from '../database';

/**
 * ファイル編集追跡機能
 */
export class FileTracker {
  /**
   * ファイル編集を記録
   * @param document 保存されたドキュメント
   * @param lineCount 行数（空行・コメント除外）
   * @param language 言語
   * @param sessionId セッションID（オプション、指定されていない場合はgetActiveSession()で取得）
   */
  public trackFileEdit(
    document: vscode.TextDocument,
    lineCount: number,
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

      // ファイル編集記録をデータベースに保存
      insertFileEdit(
        targetSessionId,
        filePath,
        lineCount,
        language,
        savedAt
      );

      console.log('[Tsumiki] File edit tracked:', {
        filePath,
        lineCount,
        language,
        sessionId: targetSessionId,
      });
    } catch (error) {
      console.error('[Tsumiki] Failed to track file edit:', error);
    }
  }
}
