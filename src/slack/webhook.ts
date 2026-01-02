import fetch from 'node-fetch';
import * as vscode from 'vscode';
import { getWebhookUrl } from './config';
import { formatDailySummaryForSlack } from './formatter';

/**
 * リトライ設定
 */
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1秒

/**
 * 指数バックオフで待機
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Slack Webhookにメッセージを送信
 */
export async function postToSlack(
  context: vscode.ExtensionContext,
  date?: string
): Promise<void> {
  // Webhook URLを取得
  const webhookUrl = await getWebhookUrl(context);
  if (!webhookUrl) {
    throw new Error('Webhook URLが設定されていません。設定コマンドでURLを設定してください。');
  }

  // 日次サマリーをフォーマット
  const message = formatDailySummaryForSlack(date);

  // Slack Incoming Webhookのペイロードを構築
  const payload = {
    text: message,
  };

  // リトライロジック
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // 成功
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // 最後の試行でない場合は待機してリトライ
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  // すべてのリトライが失敗した場合
  throw new Error(
    `Slackへの投稿に失敗しました（${MAX_RETRIES}回試行）: ${lastError?.message || '不明なエラー'}`
  );
}
