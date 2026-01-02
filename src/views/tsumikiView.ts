import * as vscode from 'vscode';
import * as path from 'path';
import { getDailyStatsByDate, getFileEditsByDate, type LanguageRatio } from '../database';
import { getDatabase } from '../database/db';
import { getSettingsManager } from '../settings/config';
import { WorkTimer } from '../measurement/timer';

/**
 * WebViewプロバイダー
 */
export class TsumikiViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'tsumikiView';
  private _view?: vscode.WebviewView;
  private _settingsManager = getSettingsManager();
  private _settingsChangeDisposable?: vscode.Disposable;
  private _workTimer?: WorkTimer;

  constructor(private readonly _extensionUri: vscode.Uri) {
    // 設定変更を監視してリアルタイム反映
    this._settingsChangeDisposable = this._settingsManager.onDidChange(() => {
      this._sendDailyData();
    });
  }

  /**
   * WorkTimerを設定（extension.tsから呼び出される）
   */
  public setWorkTimer(workTimer: WorkTimer) {
    this._workTimer = workTimer;
  }

  dispose() {
    this._settingsChangeDisposable?.dispose();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // メッセージハンドラーを設定
    webviewView.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'requestDailyData':
            await this._handleRequestDailyData();
            break;
          case 'requestTimerState':
            await this._handleRequestTimerState();
            break;
          case 'startTimer':
            await this._handleStartTimer();
            break;
          case 'stopTimer':
            await this._handleStopTimer();
            break;
        }
      },
      undefined,
      []
    );

    // 初期データを送信
    this._sendDailyData();
  }

  /**
   * 日次データを取得してWebViewに送信
   */
  private async _handleRequestDailyData() {
    this._sendDailyData();
  }

  /**
   * 日次データをWebViewに送信
   */
  private _sendDailyData() {
    if (!this._view) {
      return;
    }

    // データベースが利用可能かチェック（エラーをキャッチ）
    let dbAvailable = false;
    try {
      const db = getDatabase();
      dbAvailable = db !== null;
    } catch (error) {
      console.error('[Tsumiki] Error checking database availability:', error);
      dbAvailable = false;
    }
    
    if (!dbAvailable) {
      // データベースが利用できない場合は空のデータを送信
      console.log('[Tsumiki] Database not available, sending empty data');
      const displaySettings = this._settingsManager.getDisplaySettings();
      this._view.webview.postMessage({
        command: 'updateDailyData',
        data: {
          workTime: 0,
          saveCount: 0,
          fileCount: 0,
          lineChanges: 0,
          languageRatios: [],
          fileList: [],
          hasMoreFiles: false,
          totalFiles: 0,
          displaySettings,
        },
      });
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // データベース関数を安全に呼び出す
      let stats = null;
      let fileEdits: any[] = [];
      
      try {
        stats = getDailyStatsByDate(today);
      } catch (error) {
        console.error('[Tsumiki] Failed to get daily stats:', error);
        stats = null;
      }
      
      try {
        fileEdits = getFileEditsByDate(today);
      } catch (error) {
        console.error('[Tsumiki] Failed to get file edits:', error);
        fileEdits = [];
      }

    // ファイル一覧を準備（最大10件）
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
      .sort((a, b) => b.lineCount - a.lineCount)
      .slice(0, 10);

    const totalFiles = new Set(fileEdits.map((e) => e.file_path)).size;
    const hasMoreFiles = totalFiles > 10;

    // 言語比率をパース
    let languageRatios: LanguageRatio = {};
    if (stats?.language_ratios) {
      try {
        languageRatios = JSON.parse(stats.language_ratios);
      } catch (e) {
        console.error('Failed to parse language ratios:', e);
      }
    }

    // 言語比率をパーセンテージ順にソート
    const sortedLanguageRatios = Object.entries(languageRatios)
      .sort(([, a], [, b]) => b - a)
      .map(([lang, percent]) => ({ language: lang, percent }));

      // 設定を取得
      const displaySettings = this._settingsManager.getDisplaySettings();

      this._view.webview.postMessage({
        command: 'updateDailyData',
        data: {
          workTime: stats?.work_time || 0,
          saveCount: stats?.save_count || 0,
          fileCount: stats?.file_count || 0,
          lineChanges: stats?.line_changes || 0,
          languageRatios: sortedLanguageRatios,
          fileList,
          hasMoreFiles,
          totalFiles,
          displaySettings,
        },
      });
    } catch (error) {
      console.error('Failed to send daily data:', error);
      // エラーが発生した場合でも空のデータを送信してUIを更新
      const displaySettings = this._settingsManager.getDisplaySettings();
      this._view.webview.postMessage({
        command: 'updateDailyData',
        data: {
          workTime: 0,
          saveCount: 0,
          fileCount: 0,
          lineChanges: 0,
          languageRatios: [],
          fileList: [],
          hasMoreFiles: false,
          totalFiles: 0,
          displaySettings,
        },
      });
    }
  }

  /**
   * WebViewのHTMLを生成
   */
  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'webview.js')
    );
    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'webview.css')
    );

    // VSCode APIを設定するスクリプト（エラーハンドリング付き）
    const vscodeApiScript = `
      (function() {
        try {
          const vscode = acquireVsCodeApi();
          window.vscode = vscode;
        } catch (error) {
          console.error('Failed to acquire VSCode API:', error);
          // フォールバック: ダミーのVSCode API
          window.vscode = {
            postMessage: function(message) {
              console.log('VSCode API not available, message:', message);
            },
            getState: function() { return null; },
            setState: function(state) { console.log('VSCode API not available, state:', state); }
          };
        }
      })();
    `;

    // エラーハンドリング用のスクリプト
    const errorHandlerScript = `
      window.addEventListener('error', function(event) {
        console.error('WebView error:', event.error);
      });
      window.addEventListener('unhandledrejection', function(event) {
        console.error('WebView unhandled rejection:', event.reason);
      });
    `;

    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tsumiki</title>
    <link rel="stylesheet" href="${cssUri}">
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 0;
            margin: 0;
        }
        #root {
            width: 100%;
        }
        .error-message {
            padding: 20px;
            color: var(--vscode-errorForeground);
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            margin: 10px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div id="root">
        <div class="error-message" id="error-message" style="display: none;"></div>
    </div>
    <script>${vscodeApiScript}</script>
    <script>${errorHandlerScript}</script>
    <script>
      // スクリプト読み込みエラーのハンドリング
      window.addEventListener('error', function(event) {
        if (event.target && event.target.tagName === 'SCRIPT') {
          const errorDiv = document.getElementById('error-message');
          if (errorDiv) {
            errorDiv.textContent = 'スクリプトの読み込みに失敗しました: ' + event.target.src;
            errorDiv.style.display = 'block';
          }
        }
      });
    </script>
    <script src="${scriptUri}"></script>
</body>
</html>`;
  }

  /**
   * タイマー状態をリクエスト
   */
  private async _handleRequestTimerState() {
    if (!this._view || !this._workTimer) {
      return;
    }

    const isRunning = this._workTimer.isRunning();
    const elapsedTime = this._workTimer.getElapsedTime();

    this._view.webview.postMessage({
      command: 'updateTimerState',
      data: {
        isRunning,
        elapsedTime,
      },
    });
  }

  /**
   * タイマー開始
   */
  private async _handleStartTimer() {
    if (!this._workTimer) {
      if (this._view) {
        this._view.webview.postMessage({
          command: 'timerError',
          data: { message: 'タイマーが初期化されていません' },
        });
      }
      return;
    }

    try {
      this._workTimer.start();
      this._updateTimerState();
      // 日次データも更新（作業時間が変わるため）
      this._sendDailyData();
    } catch (error) {
      console.error('[Tsumiki] Error starting timer:', error);
      if (this._view) {
        this._view.webview.postMessage({
          command: 'timerError',
          data: { message: `タイマーの開始に失敗しました: ${error instanceof Error ? error.message : String(error)}` },
        });
      }
    }
  }

  /**
   * タイマー停止
   */
  private async _handleStopTimer() {
    if (!this._workTimer) {
      return;
    }

    this._workTimer.stop();
    this._updateTimerState();
    // 日次データも更新（作業時間が変わるため）
    this._sendDailyData();
  }

  /**
   * タイマー状態を更新
   */
  private _updateTimerState() {
    if (!this._view || !this._workTimer) {
      return;
    }

    const isRunning = this._workTimer.isRunning();
    const elapsedTime = this._workTimer.getElapsedTime();

    this._view.webview.postMessage({
      command: 'updateTimerState',
      data: {
        isRunning,
        elapsedTime,
      },
    });
  }

  /**
   * データ更新を通知（外部から呼び出し可能）
   */
  public refresh() {
    this._sendDailyData();
    this._updateTimerState();
  }
}
