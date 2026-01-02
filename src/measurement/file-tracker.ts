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
   */
  public trackFileEdit(
    document: vscode.TextDocument,
    lineCount: number,
    language: string | null
  ): void {
    try {
      // アクティブなセッションを取得
      const activeSession = getActiveSession();
      if (!activeSession) {
        // セッションが存在しない場合は記録しない
        return;
      }

      const filePath = document.uri.fsPath;
      const savedAt = Math.floor(Date.now() / 1000);

      // ファイル編集記録をデータベースに保存
      insertFileEdit(
        activeSession.id,
        filePath,
        lineCount,
        language,
        savedAt
      );

      console.log('[Tsumiki] File edit tracked:', {
        filePath,
        lineCount,
        language,
      });
    } catch (error) {
      console.error('[Tsumiki] Failed to track file edit:', error);
    }
  }
}
