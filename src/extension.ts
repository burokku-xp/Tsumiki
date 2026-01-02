import * as vscode from 'vscode';
import { initDatabase, initializeDatabase } from './database';
import { TsumikiViewProvider } from './views/tsumikiView';

// WebViewプロバイダーのインスタンスを保持（リアルタイム更新用）
let viewProvider: TsumikiViewProvider | undefined;

/**
 * WebViewを更新（外部から呼び出し可能）
 */
export function refreshWebView() {
  if (viewProvider) {
    viewProvider.refresh();
  }
}

/**
 * 拡張機能がアクティブ化されたときに呼ばれる
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Tsumiki extension is now active!');

  // データベースを初期化
  initDatabase(context);
  initializeDatabase();

  // WebViewプロバイダーを登録
  viewProvider = new TsumikiViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('tsumikiView', viewProvider)
  );

  // ファイル保存イベントを監視（リアルタイム更新用）
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => {
      // ファイル保存時にWebViewを更新
      setTimeout(() => {
        refreshWebView();
      }, 500); // データベース更新を待つ
    })
  );
}

/**
 * 拡張機能が非アクティブ化されたときに呼ばれる
 */
export function deactivate() {
  console.log('Tsumiki extension is now deactivated!');
}
