import * as vscode from 'vscode';
import { getSettingsManager, type SlackPostItem } from '../settings/config';
import { setWebhookUrl, getWebhookUrl, removeWebhookUrl } from '../slack/config';
import { resetDailyData } from '../database';

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
          case 'updateSlackAutoPostEnabled':
            if (typeof message.enabled === 'boolean') {
              await this._handleUpdateSlackAutoPostEnabled(message.enabled);
            }
            break;
          case 'updateSlackAutoPostTime':
            if (typeof message.time === 'string') {
              await this._handleUpdateSlackAutoPostTime(message.time);
            }
            break;
          case 'updateSlackUserName':
            if (typeof message.name === 'string') {
              await this._handleUpdateSlackUserName(message.name);
            }
            break;
          case 'postToSlack':
            // コマンドを実行（コメントを引数として渡す）
            // 注意: コマンドは非同期で実行されるが、ユーザーがキャンセルした場合などは
            // コマンド自体は成功するため、常に完了通知を送信する
            vscode.commands.executeCommand('tsumiki.slack.postToSlack', message.comment)
              .then(() => {
                // 投稿完了をWebViewに通知（成功・キャンセル問わず）
                if (this._view) {
                  this._view.webview.postMessage({
                    command: 'slackPostResult',
                    success: true
                  });
                }
              })
              .catch((error) => {
                console.error('[Tsumiki] Failed to post to Slack:', error);
                // エラーをWebViewに通知
                if (this._view) {
                  this._view.webview.postMessage({
                    command: 'slackPostResult',
                    success: false
                  });
                }
              });
            break;
          case 'resetToday':
            await this._handleResetToday();
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
   * 自動投稿の有効/無効を更新
   */
  private async _handleUpdateSlackAutoPostEnabled(enabled: boolean) {
    try {
      await this._settingsManager.setSlackAutoPostEnabled(enabled);
      // 設定変更イベントが発火してタイマーが再起動される
      vscode.window.showInformationMessage(`自動投稿を${enabled ? '有効' : '無効'}にしました`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`自動投稿設定の更新に失敗しました: ${errorMessage}`);
    }
  }

  /**
   * 自動投稿の時刻を更新
   */
  private async _handleUpdateSlackAutoPostTime(time: string) {
    try {
      await this._settingsManager.setSlackAutoPostTime(time);
      // 設定変更イベントが発火してタイマーが再起動される
      vscode.window.showInformationMessage(`自動投稿時刻を${time}に設定しました`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`自動投稿時刻の更新に失敗しました: ${errorMessage}`);
    }
  }

  /**
   * Slack表示名を更新
   */
  private async _handleUpdateSlackUserName(name: string) {
    try {
      await this._settingsManager.setSlackUserName(name);
      vscode.window.showInformationMessage('Slack表示名を更新しました');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Slack表示名の更新に失敗しました: ${errorMessage}`);
    }
  }

  /**
   * 本日のデータをリセット
   */
  private async _handleResetToday() {
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
        
        resetDailyData(today);
        
        // メインのサイドパネルに更新を通知（コマンド経由）
        vscode.commands.executeCommand('tsumiki.refresh');
        
        vscode.window.showInformationMessage('本日のデータをリセットしました。');
      } catch (error) {
        console.error('[Tsumiki] Failed to reset today data:', error);
        vscode.window.showErrorMessage('データのリセットに失敗しました。');
      }
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
      const autoPostEnabled = this._settingsManager.getSlackAutoPostEnabled();
      const autoPostTime = this._settingsManager.getSlackAutoPostTime();
      const userName = this._settingsManager.getSlackUserName();

      this._view.webview.postMessage({
        command: 'updateSettings',
        data: {
          display: displaySettings,
          slack: {
            postItems: slackPostItems,
            webhookUrl: webhookUrl || '',
            autoPostEnabled,
            autoPostTime,
            userName,
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
