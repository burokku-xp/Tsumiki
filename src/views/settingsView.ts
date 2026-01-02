import * as vscode from 'vscode';
import { getSettingsManager, type SlackPostItem } from '../settings/config';
import { setWebhookUrl, getWebhookUrl, removeWebhookUrl } from '../slack/config';

/**
 * 設定画面のWebViewプロバイダー
 */
export class SettingsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'tsumikiSettingsView';
  private _view?: vscode.WebviewView;
  private _settingsManager = getSettingsManager();
  private _settingsChangeDisposable?: vscode.Disposable;
  private _context: vscode.ExtensionContext;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    context: vscode.ExtensionContext
  ) {
    this._context = context;
    // 設定変更を監視してリアルタイム反映
    this._settingsChangeDisposable = this._settingsManager.onDidChange(() => {
      this._sendSettings();
    });
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
      async (message: any) => {
        switch (message.command) {
          case 'requestSettings':
            await this._handleRequestSettings();
            break;
          case 'updateDisplaySetting':
            if (typeof message.key === 'string' && typeof message.value === 'boolean') {
              await this._handleUpdateDisplaySetting(message.key, message.value);
            }
            break;
          case 'updateSlackPostItems':
            if (Array.isArray(message.items)) {
              await this._handleUpdateSlackPostItems(message.items);
            }
            break;
          case 'updateWebhookUrl':
            if (typeof message.url === 'string') {
              await this._handleUpdateWebhookUrl(message.url);
            }
            break;
        }
      },
      undefined,
      []
    );

    // 初期設定を送信
    this._sendSettings();
  }

  /**
   * 設定を取得してWebViewに送信
   */
  private async _handleRequestSettings() {
    this._sendSettings();
  }

  /**
   * 表示設定を更新
   */
  private async _handleUpdateDisplaySetting(key: string, value: boolean) {
    try {
      const config = vscode.workspace.getConfiguration('tsumiki');
      await config.update(key, value, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage('設定を更新しました');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`設定の更新に失敗しました: ${errorMessage}`);
    }
  }

  /**
   * Slack投稿項目を更新
   */
  private async _handleUpdateSlackPostItems(items: SlackPostItem[]) {
    try {
      const config = vscode.workspace.getConfiguration('tsumiki');
      await config.update('slack.postItems', items, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage('Slack投稿項目を更新しました');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Slack投稿項目の更新に失敗しました: ${errorMessage}`);
    }
  }

  /**
   * Webhook URLを更新
   */
  private async _handleUpdateWebhookUrl(url: string) {
    try {
      if (url && url.trim()) {
        await setWebhookUrl(this._context, url.trim());
        vscode.window.showInformationMessage('Slack Webhook URLを設定しました');
      } else {
        // URLが空の場合は削除
        await removeWebhookUrl(this._context);
        vscode.window.showInformationMessage('Slack Webhook URLを削除しました');
      }
      // 設定を再送信して反映
      this._sendSettings();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Webhook URLの設定に失敗しました: ${errorMessage}`);
    }
  }

  /**
   * 設定をWebViewに送信
   */
  private async _sendSettings() {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settingsView.ts:135','message':'_sendSettings called',data:{hasView:!!this._view},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!this._view) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settingsView.ts:138','message':'_sendSettings: view is null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }

    try {
      const displaySettings = this._settingsManager.getDisplaySettings();
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settingsView.ts:143','message':'Display settings retrieved',data:{displaySettings},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const slackPostItems = this._settingsManager.getSlackPostItems();
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settingsView.ts:146','message':'Slack post items retrieved',data:{slackPostItems},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const webhookUrl = await getWebhookUrl(this._context);
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settingsView.ts:149','message':'Webhook URL retrieved',data:{hasWebhookUrl:!!webhookUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      const message = {
        command: 'updateSettings',
        data: {
          display: displaySettings,
          slack: {
            postItems: slackPostItems,
            webhookUrl: webhookUrl || '',
          },
        },
      };
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settingsView.ts:160','message':'Sending message to webview',data:{command:message.command},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      this._view.webview.postMessage(message);
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settingsView.ts:162','message':'Message sent to webview',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settingsView.ts:165','message':'Error in _sendSettings',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.error('Failed to send settings:', error);
    }
  }

  /**
   * WebViewのHTMLを生成
   */
  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'settings.js')
    );
    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'settings.css')
    );

    // VSCode APIを設定するスクリプト
    const vscodeApiScript = `
      (function() {
        try {
          const vscode = acquireVsCodeApi();
          window.vscode = vscode;
          fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settingsView.ts:175','message':'VSCode API acquired successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        } catch (error) {
          fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settingsView.ts:178','message':'Failed to acquire VSCode API',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          console.error('Failed to acquire VSCode API:', error);
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

    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tsumiki Settings</title>
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
    <script src="${scriptUri}"></script>
</body>
</html>`;
  }
}
