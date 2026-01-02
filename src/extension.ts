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
  console.log('[Tsumiki] Extension activation started');
  console.log('[Tsumiki] Extension context:', {
    extensionPath: context.extensionPath,
    globalStorageUri: context.globalStorageUri?.toString(),
    extensionUri: context.extensionUri?.toString()
  });

  // エラーをキャッチして拡張機能が確実に有効化されるようにする
  const activationError = (step: string, error: any, showToUser: boolean = false) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error(`[Tsumiki] Error in ${step}:`, errorMessage);
    if (errorStack) {
      console.error('[Tsumiki] Stack trace:', errorStack);
    }
    // データベースエラーはユーザーに表示しない（エラーハンドリングにより動作するため）
    // その他の重要なエラーのみ表示
    if (showToUser) {
      vscode.window.showErrorMessage(`Tsumiki: ${step}でエラーが発生しました: ${errorMessage}`);
    }
  };

  try {
    // ステップ1: データベースを初期化
    console.log('[Tsumiki] Step 1: Initializing database...');
    try {
      const db = initDatabase(context);
      if (db) {
        console.log('[Tsumiki] Database instance created');
        initializeDatabase();
        console.log('[Tsumiki] Database initialized successfully');
      } else {
        console.warn('[Tsumiki] Database initialization returned null, continuing without database');
      }
    } catch (error) {
      activationError('database initialization', error, false); // データベースエラーは表示しない
      // データベースがなくても拡張機能は動作する
    }

    // ステップ2: WebViewプロバイダーを登録
    console.log('[Tsumiki] Step 2: Registering WebView provider...');
    try {
      viewProvider = new TsumikiViewProvider(context.extensionUri);
      console.log('[Tsumiki] WebView provider instance created');
      
      const registration = vscode.window.registerWebviewViewProvider('tsumikiView', viewProvider);
      context.subscriptions.push(registration);
      console.log('[Tsumiki] WebView provider registered successfully');
    } catch (error) {
      activationError('WebView provider registration', error, true); // WebViewエラーは表示する
      // WebViewが登録できなくても拡張機能は動作する
    }

    // ステップ3: 基本的なコマンドを登録
    console.log('[Tsumiki] Step 3: Registering commands...');
    try {
      const helloWorldCommand = vscode.commands.registerCommand('tsumiki.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from Tsumiki!');
      });
      context.subscriptions.push(helloWorldCommand);
      console.log('[Tsumiki] Commands registered successfully');
    } catch (error) {
      activationError('command registration', error, true);
    }

    // ステップ4: ファイル保存イベントを監視
    console.log('[Tsumiki] Step 4: Registering file save event listener...');
    try {
      const disposable = vscode.workspace.onDidSaveTextDocument(() => {
        try {
          setTimeout(() => {
            refreshWebView();
          }, 500);
        } catch (error) {
          console.error('[Tsumiki] Error refreshing WebView:', error);
        }
      });
      context.subscriptions.push(disposable);
      console.log('[Tsumiki] File save event listener registered');
    } catch (error) {
      activationError('file save event listener registration', error, false); // イベントリスナーエラーは表示しない
      // イベントリスナーが登録できなくても拡張機能は動作する
    }

    console.log('[Tsumiki] Extension activation completed successfully');
  } catch (error) {
    activationError('activation', error, true); // 致命的なエラーは表示する
    // 致命的なエラーでも拡張機能を有効化し続ける
  }
}

/**
 * 拡張機能が非アクティブ化されたときに呼ばれる
 */
export function deactivate() {
  console.log('Tsumiki extension is now deactivated!');
}
