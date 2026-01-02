import * as vscode from 'vscode';
import * as path from 'path';
import { getDailyStatsByDate, getFileEditsByDate, type LanguageRatio } from '../database';

/**
 * WebViewプロバイダー
 */
export class TsumikiViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'tsumikiView';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

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

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const stats = getDailyStatsByDate(today);
    const fileEdits = getFileEditsByDate(today);

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
      },
    });
  }

  /**
   * WebViewのHTMLを生成
   */
  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'webview.js')
    );

    // VSCode APIを設定するスクリプト
    const vscodeApiScript = `
      (function() {
        const vscode = acquireVsCodeApi();
        window.vscode = vscode;
      })();
    `;

    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tsumiki</title>
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
    </style>
</head>
<body>
    <div id="root"></div>
    <script>${vscodeApiScript}</script>
    <script src="${scriptUri}"></script>
</body>
</html>`;
  }

  /**
   * データ更新を通知（外部から呼び出し可能）
   */
  public refresh() {
    this._sendDailyData();
  }
}
