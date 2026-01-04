import * as vscode from 'vscode';

const WEBHOOK_URL_KEY = 'tsumiki.slack.webhookUrl';

/**
 * Webhook URLをSecret Storageに保存
 */
export async function setWebhookUrl(context: vscode.ExtensionContext, url: string): Promise<void> {
  // 基本的なURL検証
  if (!url || !url.startsWith('https://hooks.slack.com/')) {
    throw new Error('無効なWebhook URLです。Slack Incoming WebhookのURLを入力してください。');
  }

  await context.secrets.store(WEBHOOK_URL_KEY, url);
}

/**
 * Webhook URLをSecret Storageから取得
 */
export async function getWebhookUrl(context: vscode.ExtensionContext): Promise<string | undefined> {
  return await context.secrets.get(WEBHOOK_URL_KEY);
}

/**
 * Webhook URLをSecret Storageから削除
 */
export async function removeWebhookUrl(context: vscode.ExtensionContext): Promise<void> {
  await context.secrets.delete(WEBHOOK_URL_KEY);
}

/**
 * Webhook URLが設定されているかチェック
 */
export async function hasWebhookUrl(context: vscode.ExtensionContext): Promise<boolean> {
  const url = await getWebhookUrl(context);
  return url !== undefined;
}
