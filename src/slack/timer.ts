import * as vscode from 'vscode';
import { getSettingsManager } from '../settings/config';
import { postToSlack } from './webhook';

let autoPostTimer: NodeJS.Timeout | undefined;
let lastPostedDate: string | undefined;

/**
 * 自動投稿タイマーを開始する
 * @param context 拡張機能コンテキスト
 */
export function startAutoPostTimer(context: vscode.ExtensionContext) {
  // 既存のタイマーをクリア
  stopAutoPostTimer();

  console.log('[Tsumiki] Starting auto-post timer...');

  // 1分ごとにチェック
  autoPostTimer = setInterval(() => {
    checkAndPost(context);
  }, 60 * 1000);

  // 初回即時チェック（起動時に時間が過ぎてしまっている場合などの考慮は今回はせず、設定時刻と現在時刻の一致を見る）
  checkAndPost(context);
}

/**
 * 自動投稿タイマーを停止する
 */
export function stopAutoPostTimer() {
  if (autoPostTimer) {
    clearInterval(autoPostTimer);
    autoPostTimer = undefined;
    console.log('[Tsumiki] Auto-post timer stopped');
  }
}

/**
 * 時刻をチェックして投稿を実行する
 */
async function checkAndPost(context: vscode.ExtensionContext) {
  const settingsManager = getSettingsManager();
  
  // 自動投稿が無効なら何もしない
  if (!settingsManager.getSlackAutoPostEnabled()) {
    return;
  }

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;
  
  // 今日の日付文字列
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  // すでに今日投稿済みならスキップ
  if (lastPostedDate === today) {
    return;
  }

  const targetTime = settingsManager.getSlackAutoPostTime();
  
  // 時刻が一致する場合のみ投稿
  // 注意: 拡張機能が起動していない間に時間を過ぎた場合は投稿されない
  if (currentTime === targetTime) {
    try {
      // コメントを取得
      const comment = settingsManager.getSlackDailyComment();
      
      console.log(`[Tsumiki] Auto-posting to Slack at ${currentTime}...`);
      await postToSlack(context, undefined, comment);
      
      lastPostedDate = today;
      vscode.window.showInformationMessage(`本日の記録をSlackに自動投稿しました`);
    } catch (error) {
      console.error('[Tsumiki] Auto-post failed:', error);
      vscode.window.showErrorMessage(`Slack自動投稿に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
