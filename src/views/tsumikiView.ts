import * as vscode from 'vscode';
import * as path from 'path';
import { getDailyStatsByDate, getFileEditsByDate, calculateDailyStats, deleteDailyStats, resetDailyData, type LanguageRatio, type FileEdit } from '../database';
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
          case 'resetToday':
            await this._handleResetToday();
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
      // ローカルタイムゾーンで「今日」の日付を取得（YYYY-MM-DD形式）
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      console.log('[Tsumiki] Today (local timezone):', today);
      
      // データベース関数を安全に呼び出す
      let stats = null;
      let fileEdits: any[] = [];
      
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tsumikiView.ts:135',message:'_sendDailyData before getDailyStatsByDate',data:{today},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      try {
        stats = getDailyStatsByDate(today);
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tsumikiView.ts:139',message:'_sendDailyData after getDailyStatsByDate',data:{today,statsExists:!!stats,workTime:stats?.work_time,saveCount:stats?.save_count},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        console.log('[Tsumiki] getDailyStatsByDate result:', stats ? `workTime=${stats.work_time}, saveCount=${stats.save_count}` : 'null');
        // statsがnullの場合でも、アクティブなセッションがある可能性があるため再計算
        if (!stats) {
          console.log('[Tsumiki] stats is null, recalculating...');
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tsumikiView.ts:145',message:'_sendDailyData before calculateDailyStats',data:{today},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          const calculated = calculateDailyStats(today);
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tsumikiView.ts:148',message:'_sendDailyData after calculateDailyStats',data:{today,workTime:calculated.work_time,saveCount:calculated.save_count},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          console.log('[Tsumiki] calculated stats:', `workTime=${calculated.work_time}, saveCount=${calculated.save_count}`);
          // アクティブなセッションがある場合（work_time > 0）は計算結果を使用
          if (calculated.work_time > 0) {
            stats = calculated;
            console.log('[Tsumiki] Using calculated stats with workTime > 0');
          }
        }
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
    // 変更行数（差分）の合計を計算してソート
    // file_editsテーブルには「その時点でのファイル全体の行数」が保存されているので、差分を計算する
    const fileEditsByFile = new Map<string, FileEdit[]>();
    fileEdits.forEach(edit => {
      if (!fileEditsByFile.has(edit.file_path)) {
        fileEditsByFile.set(edit.file_path, []);
      }
      fileEditsByFile.get(edit.file_path)!.push(edit);
    });
    
    const fileList = Array.from(fileEditsByFile.entries())
      .map(([filePath, edits]) => {
        // 時系列でソート（saved_atの昇順）
        edits.sort((a, b) => a.saved_at - b.saved_at);
        
        // 変更行数の合計を計算
        let totalLineChanges = 0;
        for (let i = 1; i < edits.length; i++) {
          const previousLineCount = edits[i - 1].line_count;
          const currentLineCount = edits[i].line_count;
          const diff = Math.max(0, currentLineCount - previousLineCount);
          totalLineChanges += diff;
        }
        
        // ファイル名を取得（パスから最後の部分のみ）
        const fileName = filePath.split(/[/\\]/).pop() || filePath;
        
        return {
          path: fileName, // ファイル名のみ
          lineCount: totalLineChanges,
        };
      })
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

      const dataToSend = {
        workTime: stats?.work_time || 0,
        saveCount: stats?.save_count || 0,
        fileCount: stats?.file_count || 0,
        lineChanges: stats?.line_changes || 0,
        languageRatios: sortedLanguageRatios,
        fileList,
        hasMoreFiles,
        totalFiles,
        displaySettings,
      };
      console.log('[Tsumiki] Sending daily data to WebView:', {
        workTime: dataToSend.workTime,
        saveCount: dataToSend.saveCount,
        fileCount: dataToSend.fileCount,
        lineChanges: dataToSend.lineChanges,
        fileListLength: dataToSend.fileList.length,
      });
      this._view.webview.postMessage({
        command: 'updateDailyData',
        data: dataToSend,
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
            background-color: transparent;
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
    // 日次統計のキャッシュを無効化（最新データを反映するため）
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    deleteDailyStats(today);
    this._updateTimerState();
    // 日次データも更新（作業時間が変わるため）
    this._sendDailyData();
  }

  /**
   * 本日のデータをリセット
   */
  private async _handleResetToday() {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tsumikiView.ts:412',message:'_handleResetToday entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const confirm = await vscode.window.showWarningMessage(
      '本日のデータをリセットしますか？この操作は取り消せません。',
      { modal: true },
      'リセット',
      'キャンセル'
    );
    
    if (confirm === 'リセット') {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tsumikiView.ts:428',message:'before resetDailyData',data:{today},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        resetDailyData(today);
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tsumikiView.ts:430',message:'after resetDailyData, before _sendDailyData',data:{today},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        this._sendDailyData();
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'tsumikiView.ts:432',message:'after _sendDailyData',data:{today},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        vscode.window.showInformationMessage('本日のデータをリセットしました。');
      } catch (error) {
        console.error('[Tsumiki] Failed to reset today data:', error);
        vscode.window.showErrorMessage('データのリセットに失敗しました。');
      }
    }
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
