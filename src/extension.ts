import * as vscode from 'vscode';
import { initDatabase, initializeDatabase, closeDatabase } from './database';
import { TsumikiViewProvider } from './views/tsumikiView';
import { SettingsViewProvider } from './views/settingsView';
import { WorkTimer } from './measurement/timer';
import { FileTracker } from './measurement/file-tracker';
import { LineCounter } from './measurement/line-counter';
import { LanguageDetector } from './measurement/language-detector';
import { getActiveSession, createSession, getSession } from './database';
import { setWebhookUrl, removeWebhookUrl, hasWebhookUrl } from './slack/config';
import { postToSlack } from './slack/webhook';
import { startAutoPostTimer, stopAutoPostTimer } from './slack/timer';

// WebViewプロバイダーのインスタンスを保持（リアルタイム更新用）
let viewProvider: TsumikiViewProvider | undefined;
let settingsViewProvider: SettingsViewProvider | undefined;

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
    console.log('[Tsumiki] Extension context:', {
      extensionPath: context.extensionPath,
      globalStorageUri: context.globalStorageUri?.toString(),
      extensionUri: context.extensionUri?.toString()
    });
    try {
      const db = initDatabase(context);
      if (db) {
        console.log('[Tsumiki] Database instance created');
        try {
          initializeDatabase();
          console.log('[Tsumiki] Database initialized successfully');
        } catch (migrationError) {
          console.error('[Tsumiki] Database migration failed:', migrationError);
          activationError('database migration', migrationError, true); // マイグレーションエラーは表示する
        }
      } else {
        console.error('[Tsumiki] Database initialization returned null');
        console.error('[Tsumiki] This is a critical error - database is required for core functionality');
        vscode.window.showErrorMessage(
          'Tsumiki: データベースの初期化に失敗しました。拡張機能の一部機能が動作しない可能性があります。',
          '詳細を確認'
        ).then(selection => {
          if (selection === '詳細を確認') {
            vscode.window.showInformationMessage(
              `データベースパス: ${context.globalStorageUri?.fsPath || '不明'}\n` +
              'コンソールログを確認してください。'
            );
          }
        });
      }
    } catch (error) {
      activationError('database initialization', error, true); // データベースエラーは表示する
      console.error('[Tsumiki] Critical: Database initialization failed completely');
    }

    // ステップ2: WebViewプロバイダーを登録
    console.log('[Tsumiki] Step 2: Registering WebView provider...');
    try {
      // workTimerは後で設定される可能性があるため、一時的にundefinedで作成
      // 後でsetWorkTimerメソッドで設定する
      viewProvider = new TsumikiViewProvider(context.extensionUri);
      console.log('[Tsumiki] WebView provider instance created');
      
      const registration = vscode.window.registerWebviewViewProvider('tsumikiView', viewProvider);
      context.subscriptions.push(registration);
      console.log('[Tsumiki] WebView provider registered successfully');
    } catch (error) {
      activationError('WebView provider registration', error, true); // WebViewエラーは表示する
      // WebViewが登録できなくても拡張機能は動作する
    }

    // ステップ2-2: 設定画面のWebViewプロバイダーを登録
    console.log('[Tsumiki] Step 2-2: Registering Settings WebView provider...');
    try {
      settingsViewProvider = new SettingsViewProvider(context.extensionUri, context);
      console.log('[Tsumiki] Settings WebView provider instance created');
      
      const settingsRegistration = vscode.window.registerWebviewViewProvider('tsumikiSettingsView', settingsViewProvider);
      context.subscriptions.push(settingsRegistration);
      console.log('[Tsumiki] Settings WebView provider registered successfully');
    } catch (error) {
      activationError('Settings WebView provider registration', error, true);
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
      
      // WebViewプロバイダーにworkTimerを設定
      if (viewProvider) {
        viewProvider.setWorkTimer(workTimer);
        console.log('[Tsumiki] WorkTimer set to viewProvider');
      } else {
        console.warn('[Tsumiki] viewProvider is undefined, cannot set workTimer');
      }
      
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

      // Slack Webhook URL設定コマンド
      const setWebhookUrlCommand = vscode.commands.registerCommand('tsumiki.slack.setWebhookUrl', async () => {
        try {
          const currentUrl = await hasWebhookUrl(context);
          const prompt = currentUrl
            ? 'Slack Webhook URLを入力してください（既存のURLを上書きします）:'
            : 'Slack Webhook URLを入力してください:';
          
          const url = await vscode.window.showInputBox({
            prompt,
            placeHolder: 'https://hooks.slack.com/services/...',
            validateInput: (value) => {
              if (!value) {
                return 'URLを入力してください';
              }
              if (!value.startsWith('https://hooks.slack.com/')) {
                return '無効なWebhook URLです。Slack Incoming WebhookのURLを入力してください。';
              }
              return null;
            },
          });

          if (url) {
            await setWebhookUrl(context, url);
            vscode.window.showInformationMessage('Slack Webhook URLを設定しました。');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          vscode.window.showErrorMessage(`Webhook URLの設定に失敗しました: ${errorMessage}`);
        }
      });
      context.subscriptions.push(setWebhookUrlCommand);

      // Slack Webhook URL削除コマンド
      const removeWebhookUrlCommand = vscode.commands.registerCommand('tsumiki.slack.removeWebhookUrl', async () => {
        try {
          const hasUrl = await hasWebhookUrl(context);
          if (!hasUrl) {
            vscode.window.showInformationMessage('Webhook URLが設定されていません。');
            return;
          }

          const confirm = await vscode.window.showWarningMessage(
            'Webhook URLを削除しますか？',
            { modal: true },
            '削除'
          );

          if (confirm === '削除') {
            await removeWebhookUrl(context);
            vscode.window.showInformationMessage('Webhook URLを削除しました。');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          vscode.window.showErrorMessage(`Webhook URLの削除に失敗しました: ${errorMessage}`);
        }
      });
      context.subscriptions.push(removeWebhookUrlCommand);

      // 設定画面を開くコマンド
      const openSettingsCommand = vscode.commands.registerCommand('tsumiki.openSettings', () => {
        vscode.commands.executeCommand('tsumiki.tsumikiSettingsView.focus');
      });
      context.subscriptions.push(openSettingsCommand);

      // Slack投稿コマンド
      const postToSlackCommand = vscode.commands.registerCommand('tsumiki.slack.postToSlack', async () => {
        try {
          const hasUrl = await hasWebhookUrl(context);
          if (!hasUrl) {
            const action = await vscode.window.showWarningMessage(
              'Webhook URLが設定されていません。設定しますか？',
              '設定',
              'キャンセル'
            );
            if (action === '設定') {
              await vscode.commands.executeCommand('tsumiki.slack.setWebhookUrl');
            }
            return;
          }

          // 投稿確認
          const confirm = await vscode.window.showInformationMessage(
            '本日の記録をSlackに投稿しますか？',
            '投稿',
            'キャンセル'
          );

          if (confirm !== '投稿') {
            return;
          }

          // 投稿処理（非同期で実行）
          vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: 'Slackに投稿中...',
              cancellable: false,
            },
            async (progress) => {
              try {
                await postToSlack(context);
                vscode.window.showInformationMessage('Slackに投稿しました。');
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                vscode.window.showErrorMessage(`Slackへの投稿に失敗しました: ${errorMessage}`);
              }
            }
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          vscode.window.showErrorMessage(`Slack投稿処理でエラーが発生しました: ${errorMessage}`);
        }
      });
      context.subscriptions.push(postToSlackCommand);

      // WebViewを更新するコマンド
      const refreshCommand = vscode.commands.registerCommand('tsumiki.refresh', () => {
        refreshWebView();
      });
      context.subscriptions.push(refreshCommand);

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
          let activeSession = getActiveSession();
          let sessionAutoCreated = false;
          
          // セッションが存在しない場合は自動的に作成
          if (!activeSession) {
            try {
              const now = Math.floor(Date.now() / 1000);
              const sessionId = createSession(now);
              activeSession = getSession(sessionId);
              sessionAutoCreated = true;
              console.log('[Tsumiki] Auto-created session for file save:', sessionId);
              
              // タイマーも更新（存在する場合）
              if (workTimer) {
                workTimer.setSession(sessionId, now);
              }
              
              // セッション自動作成時にユーザーに通知（初回のみ）
              vscode.window.showInformationMessage('セッションを自動作成しました。作業記録を開始します。');
            } catch (error) {
              console.error('[Tsumiki] Failed to auto-create session:', error);
              // セッション作成に失敗した場合は記録しない
              setTimeout(() => {
                refreshWebView();
              }, 500);
              return;
            }
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
          // セッションIDを明示的に渡すことで、自動作成直後でも確実に記録される
          if (fileTracker && activeSession) {
            fileTracker.trackFileEdit(document, lineCount, language, activeSession.id);
          }

          // 最後のアクティビティ時刻を更新（非アクティブセッション監視用）
          if (workTimer) {
            workTimer.updateLastActivity();
          }

          const filePath = document.uri.fsPath;
          console.log('[Tsumiki] File save tracked:', {
            filePath,
            lineCount,
            language,
            sessionId: activeSession?.id,
            sessionAutoCreated,
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

    // ステップ6: 自動投稿タイマーを開始
    console.log('[Tsumiki] Step 6: Starting auto-post timer...');
    try {
      startAutoPostTimer(context);
      
      // 設定変更を監視してタイマーを再起動
      context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('tsumiki.slack.autoPostEnabled') || 
            e.affectsConfiguration('tsumiki.slack.autoPostTime')) {
          console.log('[Tsumiki] Auto-post settings changed, restarting timer...');
          startAutoPostTimer(context);
        }
      }));
      console.log('[Tsumiki] Auto-post timer started');
    } catch (error) {
      activationError('auto-post timer start', error, false);
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
  
  // 自動投稿タイマーを停止
  stopAutoPostTimer();
  
  // リソースを解放
  if (workTimer) {
    workTimer.dispose();
  }
  
  // WebViewプロバイダーを解放
  if (viewProvider) {
    viewProvider.dispose();
  }
  
  if (settingsViewProvider) {
    settingsViewProvider.dispose();
  }
  
  closeDatabase();
}