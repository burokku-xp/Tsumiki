import React, { useEffect, useState } from 'react';
import { vscode } from '../vscodeApi';
import './SettingsApp.css';

export interface SettingsData {
  display: {
    workTime: boolean;
    saveCount: boolean;
    fileCount: boolean;
    lineChanges: boolean;
    languageRatio: boolean;
    fileList: boolean;
  };
  slack: {
    postItems: string[];
    webhookUrl: string;
  };
}

const DISPLAY_ITEMS = [
  { key: 'workTime', label: '作業時間', description: '作業時間を表示する' },
  { key: 'saveCount', label: '保存回数', description: '保存回数を表示する' },
  { key: 'fileCount', label: 'ファイル数', description: 'ファイル数を表示する' },
  { key: 'lineChanges', label: '変更行数', description: '変更行数を表示する' },
  { key: 'languageRatio', label: '言語比率', description: '言語比率を表示する' },
  { key: 'fileList', label: '編集ファイル一覧', description: '編集ファイル一覧を表示する' },
] as const;

const SLACK_POST_ITEMS = [
  { key: 'workTime', label: '作業時間' },
  { key: 'saveCount', label: '保存回数' },
  { key: 'fileCount', label: 'ファイル数' },
  { key: 'lineChanges', label: '変更行数' },
  { key: 'languageRatio', label: '言語比率' },
  { key: 'fileList', label: '編集ファイル一覧' },
] as const;

const SettingsApp: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SettingsApp.tsx:44','message':'useEffect started',data:{hasVscode:!!window.vscode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      // 初期設定をリクエスト
      if (window.vscode) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SettingsApp.tsx:48','message':'Requesting settings from extension',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        vscode.postMessage({ command: 'requestSettings' });
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SettingsApp.tsx:51','message':'VSCode API not available',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        console.warn('VSCode API not available, using fallback');
        setLoading(false);
      }

      // メッセージリスナーを設定
      const handleMessage = (event: MessageEvent) => {
        try {
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SettingsApp.tsx:58','message':'Message received in React',data:{command:event.data?.command},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          const message = event.data;
          if (message && message.command === 'updateSettings') {
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SettingsApp.tsx:61','message':'updateSettings command received',data:{hasData:!!message.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            setSettings(message.data);
            setWebhookUrlInput(message.data.slack.webhookUrl || '');
            setLoading(false);
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SettingsApp.tsx:65','message':'Settings updated in React state',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
          }
        } catch (error) {
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SettingsApp.tsx:68','message':'Error handling message',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          console.error('Error handling message:', error);
        }
      };

      window.addEventListener('message', handleMessage);
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SettingsApp.tsx:72','message':'Message listener registered',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SettingsApp.tsx:77','message':'Error in useEffect',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.error('Error in useEffect:', error);
      setLoading(false);
    }
  }, []);

  const handleDisplayToggle = async (key: string, value: boolean) => {
    const configKey = `display.${key}`;
    vscode.postMessage({
      command: 'updateDisplaySetting',
      key: configKey,
      value,
    });
  };

  const handleSlackPostItemToggle = async (itemKey: string, checked: boolean) => {
    if (!settings) return;

    const currentItems = [...settings.slack.postItems];
    if (checked) {
      if (!currentItems.includes(itemKey)) {
        currentItems.push(itemKey);
      }
    } else {
      const index = currentItems.indexOf(itemKey);
      if (index > -1) {
        currentItems.splice(index, 1);
      }
    }

    vscode.postMessage({
      command: 'updateSlackPostItems',
      items: currentItems,
    });
  };

  const handleWebhookUrlChange = (value: string) => {
    setWebhookUrlInput(value);
  };

  const handleWebhookUrlSave = async () => {
    if (saving) return;
    
    // フロントエンドでの基本的なバリデーション
    const trimmedUrl = webhookUrlInput.trim();
    if (trimmedUrl && !trimmedUrl.startsWith('https://hooks.slack.com/')) {
      // エラーメッセージはバックエンドで表示されるが、UX向上のためここでも検証
      // バックエンドで検証されるので、ここでは送信を許可
    }
    
    setSaving(true);
    try {
      vscode.postMessage({
        command: 'updateWebhookUrl',
        url: webhookUrlInput,
      });
    } finally {
      setTimeout(() => setSaving(false), 1000);
    }
  };

  if (loading) {
    return (
      <div className="settings-app">
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="settings-app">
        <div className="error">設定の読み込みに失敗しました</div>
      </div>
    );
  }

  return (
    <div className="settings-app">
      <div className="settings-header">
        <h1>設定</h1>
      </div>

      <div className="settings-section">
        <h2 className="section-title">表示項目</h2>
        <p className="section-description">サイドパネルに表示する項目を選択できます</p>
        <div className="settings-list">
          {DISPLAY_ITEMS.map((item) => (
            <div key={item.key} className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.display[item.key as keyof typeof settings.display] ?? false}
                  onChange={(e) => handleDisplayToggle(item.key, e.target.checked)}
                  className="setting-checkbox"
                />
                <div className="setting-content">
                  <span className="setting-name">{item.label}</span>
                  <span className="setting-description">{item.description}</span>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">Slack投稿項目</h2>
        <p className="section-description">Slackに投稿する項目を選択できます</p>
        <div className="settings-list">
          {SLACK_POST_ITEMS.map((item) => (
            <div key={item.key} className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.slack.postItems.includes(item.key)}
                  onChange={(e) => handleSlackPostItemToggle(item.key, e.target.checked)}
                  className="setting-checkbox"
                />
                <div className="setting-content">
                  <span className="setting-name">{item.label}</span>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">Slack Webhook URL</h2>
        <p className="section-description">Slack Incoming WebhookのURLを設定します</p>
        <div className="webhook-url-section">
          <input
            type="text"
            value={webhookUrlInput}
            onChange={(e) => handleWebhookUrlChange(e.target.value)}
            placeholder="https://hooks.slack.com/services/..."
            className="webhook-url-input"
          />
          <button
            onClick={handleWebhookUrlSave}
            disabled={saving}
            className="webhook-url-save-button"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
        {settings.slack.webhookUrl && (
          <p className="webhook-url-status">✓ Webhook URLが設定されています</p>
        )}
      </div>
    </div>
  );
};

export default SettingsApp;
