import * as vscode from 'vscode';
import { createSession, updateSession, getActiveSession } from '../database';

/**
 * 作業時間計測タイマー
 */
export class WorkTimer {
  private currentSessionId: number | null = null;
  private startTime: number | null = null;
  private statusBarItem: vscode.StatusBarItem;
  private statusBarUpdateInterval: NodeJS.Timeout | null = null;
  private lastActivityTime: number | null = null; // 最後のアクティビティ時刻（非アクティブセッション監視用）
  private inactivityCheckInterval: NodeJS.Timeout | null = null; // 非アクティブセッション監視用のインターバル
  private readonly INACTIVITY_TIMEOUT = 3600; // 1時間（秒）

  constructor() {
    // ステータスバーアイテムを作成
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = 'tsumiki.toggleTimer';
    this.statusBarItem.show();

    // 拡張機能起動時にアクティブなセッションを復元
    this.restoreActiveSession();
  }

  /**
   * アクティブなセッションを復元
   */
  private restoreActiveSession(): void {
    try {
      const activeSession = getActiveSession();
      if (activeSession) {
        this.currentSessionId = activeSession.id;
        this.startTime = activeSession.start_time;
        this.lastActivityTime = Math.floor(Date.now() / 1000);
        this.updateStatusBar();
        this.startInactivityCheck();
        console.log('[Tsumiki] Active session restored:', activeSession.id);
      }
    } catch (error) {
      console.error('[Tsumiki] Failed to restore active session:', error);
    }
  }

  /**
   * タイマーを開始
   */
  public start(): void {
    // 既にタイマーが動作している場合は停止してから再開
    if (this.isRunning()) {
      this.stop();
    }

    const now = Math.floor(Date.now() / 1000);
    this.startTime = now;

    try {
      this.currentSessionId = createSession(now);
      this.lastActivityTime = now;
      this.updateStatusBar();
      this.startInactivityCheck();
      vscode.window.showInformationMessage('作業時間計測を開始しました');
      console.log('[Tsumiki] Timer started, session ID:', this.currentSessionId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`タイマーの開始に失敗しました: ${errorMessage}`);
      console.error('[Tsumiki] Failed to start timer:', error);
      this.startTime = null;
      this.currentSessionId = null;
    }
  }

  /**
   * タイマーを停止
   */
  public stop(): void {
    if (!this.isRunning() || !this.currentSessionId || !this.startTime) {
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const duration = now - this.startTime;

    try {
      updateSession(this.currentSessionId, now, duration);
      vscode.window.showInformationMessage(
        `作業時間計測を停止しました (${this.formatDuration(duration)})`
      );
      console.log('[Tsumiki] Timer stopped, duration:', duration);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`タイマーの停止に失敗しました: ${errorMessage}`);
      console.error('[Tsumiki] Failed to stop timer:', error);
    } finally {
      this.currentSessionId = null;
      this.startTime = null;
      this.lastActivityTime = null;
      this.stopInactivityCheck();
      this.updateStatusBar();
    }
  }

  /**
   * タイマーをトグル（開始/停止を切り替え）
   */
  public toggle(): void {
    if (this.isRunning()) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * 既存のセッションを設定（外部から呼び出し可能）
   * ファイル保存時に自動的にセッションが作成された場合に使用
   */
  public setSession(sessionId: number, startTime: number): void {
    this.currentSessionId = sessionId;
    this.startTime = startTime;
    this.lastActivityTime = Math.floor(Date.now() / 1000);
    this.updateStatusBar();
    this.startInactivityCheck();
    console.log('[Tsumiki] Session set in timer:', sessionId);
  }

  /**
   * 最後のアクティビティ時刻を更新
   * ファイル保存時に呼び出される
   */
  public updateLastActivity(): void {
    if (this.isRunning()) {
      this.lastActivityTime = Math.floor(Date.now() / 1000);
      console.log('[Tsumiki] Last activity updated:', this.lastActivityTime);
    }
  }

  /**
   * タイマーが動作中かどうか
   */
  public isRunning(): boolean {
    return this.currentSessionId !== null && this.startTime !== null;
  }

  /**
   * 現在の経過時間を取得（秒）
   */
  public getElapsedTime(): number {
    if (!this.startTime) {
      return 0;
    }
    return Math.floor(Date.now() / 1000) - this.startTime;
  }

  /**
   * ステータスバーを更新
   */
  private updateStatusBar(): void {
    if (this.isRunning()) {
      const elapsed = this.getElapsedTime();
      this.statusBarItem.text = `$(clock) ${this.formatDuration(elapsed)}`;
      this.statusBarItem.tooltip = '作業時間計測中 - クリックで停止';
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
    } else {
      this.statusBarItem.text = '$(clock) 計測開始';
      this.statusBarItem.tooltip = '作業時間計測を開始';
      this.statusBarItem.backgroundColor = undefined;
    }
  }

  /**
   * 経過時間をフォーマット（HH:MM:SS形式）
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * 定期的にステータスバーを更新（1秒ごと）
   */
  public startStatusBarUpdate(): void {
    // 既存のインターバルがある場合はクリア
    if (this.statusBarUpdateInterval) {
      clearInterval(this.statusBarUpdateInterval);
    }
    
    this.statusBarUpdateInterval = setInterval(() => {
      if (this.isRunning()) {
        this.updateStatusBar();
      }
    }, 1000);
  }

  /**
   * 非アクティブセッション監視を開始
   */
  private startInactivityCheck(): void {
    // 既存のインターバルがある場合はクリア
    if (this.inactivityCheckInterval) {
      clearInterval(this.inactivityCheckInterval);
    }
    
    // 5分ごとにチェック
    this.inactivityCheckInterval = setInterval(() => {
      this.checkInactiveSession();
    }, 5 * 60 * 1000); // 5分
  }

  /**
   * 非アクティブセッション監視を停止
   */
  private stopInactivityCheck(): void {
    if (this.inactivityCheckInterval) {
      clearInterval(this.inactivityCheckInterval);
      this.inactivityCheckInterval = null;
    }
  }

  /**
   * 非アクティブセッションをチェックし、必要に応じて自動終了
   */
  private checkInactiveSession(): void {
    if (!this.isRunning() || !this.currentSessionId || !this.startTime || !this.lastActivityTime) {
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const inactiveDuration = now - this.lastActivityTime;

    if (inactiveDuration >= this.INACTIVITY_TIMEOUT) {
      console.log('[Tsumiki] Session inactive for', inactiveDuration, 'seconds, auto-terminating');
      const sessionDuration = now - this.startTime;
      
      try {
        updateSession(this.currentSessionId, now, sessionDuration);
        console.log('[Tsumiki] Session auto-terminated, duration:', sessionDuration);
      } catch (error) {
        console.error('[Tsumiki] Failed to auto-terminate session:', error);
      } finally {
        this.currentSessionId = null;
        this.startTime = null;
        this.lastActivityTime = null;
        this.stopInactivityCheck();
        this.updateStatusBar();
      }
    }
  }

  /**
   * リソースを解放
   */
  public dispose(): void {
    if (this.statusBarUpdateInterval) {
      clearInterval(this.statusBarUpdateInterval);
      this.statusBarUpdateInterval = null;
    }
    this.stopInactivityCheck();
    this.statusBarItem.dispose();
  }
}
