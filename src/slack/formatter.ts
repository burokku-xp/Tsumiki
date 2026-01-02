import { getDailyStatsByDate, getFileEditsByDate, type LanguageRatio, type FileEdit } from '../database';
import * as os from 'os';

/**
 * 作業時間をフォーマット（秒 → 時間分）
 */
function formatWorkTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0 && minutes > 0) {
    return `${hours}時間${minutes}分`;
  } else if (hours > 0) {
    return `${hours}時間`;
  } else if (minutes > 0) {
    return `${minutes}分`;
  } else {
    return '0分';
  }
}

/**
 * ユーザー名を取得
 */
function getUserName(): string {
  const username = os.userInfo().username;
  // ユーザー名を日本語風に表示（必要に応じてカスタマイズ可能）
  return username || 'ユーザー';
}

/**
 * ファイル一覧をフォーマット（最大3件表示、残りは「他N件」）
 */
function formatFileList(fileEdits: Array<{ file_path: string; line_count: number }>): string {
  if (fileEdits.length === 0) {
    return 'なし';
  }

  // ファイルパスからファイル名のみを抽出
  const fileNames = fileEdits.map(edit => {
    const parts = edit.file_path.split(/[/\\]/);
    return parts[parts.length - 1];
  });

  if (fileNames.length <= 3) {
    return fileNames.join(' / ');
  }

  const displayed = fileNames.slice(0, 3).join(' / ');
  const remaining = fileNames.length - 3;
  return `${displayed} 他${remaining}件`;
}

/**
 * 日次サマリーをSlack形式でフォーマット
 */
export function formatDailySummaryForSlack(date: string = new Date().toISOString().split('T')[0]): string {
  // データベースから日次統計とファイル編集記録を取得（エラーハンドリング付き）
  let stats;
  let fileEdits: FileEdit[] = [];
  
  try {
    stats = getDailyStatsByDate(date);
  } catch (error) {
    console.error('[Tsumiki] Failed to get daily stats:', error);
    stats = null;
  }
  
  try {
    fileEdits = getFileEditsByDate(date);
  } catch (error) {
    console.error('[Tsumiki] Failed to get file edits:', error);
    fileEdits = [];
  }

  // ファイル一覧を準備
  const fileList = fileEdits
    .reduce((acc, edit) => {
      const existing = acc.find((f) => f.path === edit.file_path);
      if (existing) {
        existing.lineCount += edit.line_count;
      } else {
        acc.push({
          path: edit.file_path,
          lineCount: edit.line_count,
        });
      }
      return acc;
    }, [] as Array<{ path: string; lineCount: number }>)
    .sort((a, b) => b.lineCount - a.lineCount);

  const userName = getUserName();
  const workTime = stats?.work_time || 0;
  const saveCount = stats?.save_count || 0;
  const fileCount = stats?.file_count || 0;
  const lineChanges = stats?.line_changes || 0;
  const formattedFileList = formatFileList(fileList);

  // Slack形式のメッセージを構築
  const lines: string[] = [];
  lines.push(`🧱 ${userName}さんの本日の記録`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━');
  
  if (workTime > 0) {
    lines.push(`⏱️ 作業時間: ${formatWorkTime(workTime)}`);
  }
  
  if (saveCount > 0 || fileCount > 0) {
    lines.push(`💾 保存: ${saveCount}回 / ${fileCount}ファイル`);
  }
  
  if (lineChanges > 0) {
    lines.push(`📝 変更行数: ${lineChanges}行`);
  }
  
  if (fileList.length > 0) {
    lines.push('');
    lines.push(`📁 編集ファイル:`);
    lines.push(`・${formattedFileList}`);
  }

  return lines.join('\n');
}
