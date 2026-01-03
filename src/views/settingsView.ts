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
          case 'updateTheme':
            if (typeof message.theme === 'string') {
              await this._handleUpdateTheme(message.theme);
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
   * テーマを更新
   */
  private async _handleUpdateTheme(theme: string) {
    try {
      const config = vscode.workspace.getConfiguration('tsumiki');
      await config.update('appearance.theme', theme, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage('テーマを更新しました');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`テーマの更新に失敗しました: ${errorMessage}`);
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
    if (!this._view) {
      return;
    }

    try {
      const displaySettings = this._settingsManager.getDisplaySettings();
      const slackPostItems = this._settingsManager.getSlackPostItems();
      const webhookUrl = await getWebhookUrl(this._context);

      this._view.webview.postMessage({
        command: 'updateSettings',
        data: {
          display: displaySettings,
          slack: {
            postItems: slackPostItems,
            webhookUrl: webhookUrl || '',
          },
        },
      });
    } catch (error) {
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
        } catch (error) {
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
    <script src="${scriptUri}"></script>
</body>
</html>`;
  }
}
