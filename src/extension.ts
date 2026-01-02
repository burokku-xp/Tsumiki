import * as vscode from 'vscode';
import { initDatabase, initializeDatabase, closeDatabase } from './database';
import { TsumikiViewProvider } from './views/tsumikiView';
import { WorkTimer } from './measurement/timer';
import { FileTracker } from './measurement/file-tracker';
import { LineCounter } from './measurement/line-counter';
import { LanguageDetector } from './measurement/language-detector';
import { getActiveSession } from './database';

// WebViewプロバイダーのインスタンスを保持（リアルタイム更新用）
let viewProvider: TsumikiViewProvider | undefined;

// 計測機能のインスタンス
let workTimer: WorkTimer | undefined;
let fileTracker: FileTracker | undefined;
let lineCounter: LineCounter | undefined;
let languageDetector: LanguageDetector | undefined;

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

    // ステップ3: 計測機能を初期化
    console.log('[Tsumiki] Step 3: Initializing measurement features...');
    try {
      workTimer = new WorkTimer();
      fileTracker = new FileTracker();
      lineCounter = new LineCounter();
      languageDetector = new LanguageDetector();
      
      // ステータスバーの定期更新を開始
      workTimer.startStatusBarUpdate();
      
      context.subscriptions.push(workTimer);
      console.log('[Tsumiki] Measurement features initialized successfully');
    } catch (error) {
      activationError('measurement features initialization', error, false);
    }

    // ステップ4: コマンドを登録
    console.log('[Tsumiki] Step 4: Registering commands...');
    try {
      const helloWorldCommand = vscode.commands.registerCommand('tsumiki.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from Tsumiki!');
      });
      context.subscriptions.push(helloWorldCommand);

      // タイマー開始/停止コマンド
      const toggleTimerCommand = vscode.commands.registerCommand('tsumiki.toggleTimer', () => {
        if (workTimer) {
          workTimer.toggle();
          refreshWebView();
        }
      });
      context.subscriptions.push(toggleTimerCommand);

      // タイマー開始コマンド
      const startTimerCommand = vscode.commands.registerCommand('tsumiki.startTimer', () => {
        if (workTimer) {
          workTimer.start();
          refreshWebView();
        }
      });
      context.subscriptions.push(startTimerCommand);

      // タイマー停止コマンド
      const stopTimerCommand = vscode.commands.registerCommand('tsumiki.stopTimer', () => {
        if (workTimer) {
          workTimer.stop();
          refreshWebView();
        }
      });
      context.subscriptions.push(stopTimerCommand);

      console.log('[Tsumiki] Commands registered successfully');
    } catch (error) {
      activationError('command registration', error, true);
    }

    // ステップ5: ファイル保存イベントを監視（計測機能統合）
    console.log('[Tsumiki] Step 5: Registering file save event listener...');
    try {
      const disposable = vscode.workspace.onDidSaveTextDocument((document) => {
        try {
          // アクティブなセッションを取得
          const activeSession = getActiveSession();
          if (!activeSession) {
            // セッションが存在しない場合は計測しない
            setTimeout(() => {
              refreshWebView();
            }, 500);
            return;
          }

          // 行数を計算
          let lineCount = 0;
          if (lineCounter) {
            lineCount = lineCounter.countLines(document);
          }

          // 言語を検出
          let language: string | null = null;
          if (languageDetector) {
            language = languageDetector.detectLanguageFromDocument(document);
          }

          // ファイル編集を追跡（行数と言語を含む）
          if (fileTracker) {
            fileTracker.trackFileEdit(document, lineCount, language);
          }

          const filePath = document.uri.fsPath;
          console.log('[Tsumiki] File save tracked:', {
            filePath,
            lineCount,
            language,
          });

          // WebViewを更新
          setTimeout(() => {
            refreshWebView();
          }, 500);
        } catch (error) {
          console.error('[Tsumiki] Error processing file save:', error);
          // エラーが発生してもWebViewは更新する
          setTimeout(() => {
            refreshWebView();
          }, 500);
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
  
  // タイマーが動作中の場合は停止
  if (workTimer && workTimer.isRunning()) {
    workTimer.stop();
  }
  
  // リソースを解放
  if (workTimer) {
    workTimer.dispose();
  }
  
  // WebViewプロバイダーを解放
  if (viewProvider) {
    viewProvider.dispose();
  }
  
  closeDatabase();
}
