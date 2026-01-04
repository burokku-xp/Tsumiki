import React, { useEffect, useState } from 'react';
import { vscode } from '../vscodeApi';
import SlackPostButton from '../components/SlackPostButton';
import './SettingsApp.css';

export interface SettingsData {
  display: {
    workTime: boolean;
    saveCount: boolean;
    fileCount: boolean;
    lineChanges: boolean;
    languageRatio: boolean;
    fileList: boolean;
    theme: string;
  };
  slack: {
    postItems: string[];
    webhookUrl: string;
    autoPostEnabled: boolean;
    autoPostTime: string;
    userName: string;
  };
  dataPersistence?: {
    resetTime: string;
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

const THEMES = [
  { key: 'orange', label: 'オレンジ (デフォルト)' },
  { key: 'blue', label: 'ブルー' },
  { key: 'green', label: 'グリーン' },
  { key: 'monochrome', label: 'モノクロ (ダークテーマ推奨)' },
] as const;

const SettingsApp: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      // 初期設定をリクエスト
      if (window.vscode) {
        vscode.postMessage({ command: 'requestSettings' });
      } else {
        console.warn('VSCode API not available, using fallback');
        setLoading(false);
      }

      // メッセージリスナーを設定
      const handleMessage = (event: MessageEvent) => {
        try {
          const message = event.data;
          if (message && message.command === 'updateSettings') {
            const newSettings = message.data;
            setSettings(newSettings);
            // 初回ロード時のみ入力フィールドを初期化
            if (loading) {
              setWebhookUrlInput(newSettings.slack?.webhookUrl || '');
              setUserNameInput(newSettings.slack?.userName || '');
            }
            setLoading(false);
          }
        } catch (error) {
          console.error('Error handling message:', error);
          setLoading(false);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    } catch (error) {
      console.error('Error in useEffect:', error);
      setLoading(false);
    }
  }, []);

  const handleDisplayToggle = async (key: string, value: boolean) => {
    // 楽観的更新
    if (settings) {
      setSettings({
        ...settings,
        display: {
          ...settings.display,
          [key]: value,
        },
      });
    }

    const configKey = `display.${key}`;
    vscode.postMessage({
      command: 'updateDisplaySetting',
      key: configKey,
      value,
    });
  };

  const handleThemeChange = (theme: string) => {
    // 楽観的更新
    if (settings) {
      setSettings({
        ...settings,
        display: {
          ...settings.display,
          theme,
        },
      });
    }

    vscode.postMessage({
      command: 'updateTheme',
      theme,
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

  const handleSlackUserNameChange = (name: string) => {
    // ローカルステートのみ更新
    setUserNameInput(name);
  };

  const handleSlackUserNameSave = () => {
    if (!settings) return;
    
    // 変更がなければ何もしない
    if (userNameInput === settings.slack.userName) return;

    // 楽観的更新
    setSettings({
      ...settings,
      slack: {
        ...settings.slack,
        userName: userNameInput,
      },
    });
    
    vscode.postMessage({
      command: 'updateSlackUserName',
      name: userNameInput,
    });
  };

  const handleResetToday = () => {
    if (window.vscode) {
      vscode.postMessage({ command: 'resetToday' });
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
        <h2 className="section-title">外観</h2>
        <p className="section-description">拡張機能のテーマカラーを選択できます</p>
        <div className="settings-list">
          {THEMES.map((theme) => (
            <div key={theme.key} className="setting-item">
              <label className="setting-label">
                <input
                  type="radio"
                  name="theme"
                  value={theme.key}
                  checked={settings.display.theme === theme.key}
                  onChange={() => handleThemeChange(theme.key)}
                  className="setting-checkbox"
                />
                <div className="setting-content">
                  <span className="setting-name">{theme.label}</span>
                </div>
              </label>
            </div>
          ))}
        </div>
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

        <div className="setting-item" style={{ marginTop: '16px' }}>
          <label className="setting-label" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            <div className="setting-content">
              <span className="setting-name">表示名（Slack投稿用）</span>
              <span className="setting-description">Slack投稿のヘッダーに表示される名前（空欄の場合はOSのユーザー名）</span>
            </div>
            <input
              type="text"
              value={userNameInput}
              onChange={(e) => handleSlackUserNameChange(e.target.value)}
              onBlur={handleSlackUserNameSave}
              className="webhook-url-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
              placeholder="例: 山田太郎"
            />
          </label>
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

      <div className="settings-section">
        <h2 className="section-title">手動投稿</h2>
        <p className="section-description">本日の記録をSlackに手動で投稿します</p>
        <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
          <SlackPostButton />
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">自動投稿設定</h2>
        <p className="section-description">定期的にSlackに自動投稿する設定</p>
        <div className="settings-list">
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.slack.autoPostEnabled || false}
                onChange={(e) => {
                  vscode.postMessage({
                    command: 'updateSlackAutoPostEnabled',
                    enabled: e.target.checked,
                  });
                  if (settings) {
                    setSettings({
                      ...settings,
                      slack: {
                        ...settings.slack,
                        autoPostEnabled: e.target.checked,
                      },
                    });
                  }
                }}
                className="setting-checkbox"
              />
              <div className="setting-content">
                <span className="setting-name">自動投稿を有効にする</span>
                <span className="setting-description">設定した時刻に自動的にSlackに投稿します</span>
              </div>
            </label>
          </div>
          {settings.slack.autoPostEnabled && (
            <div className="setting-item">
              <label className="setting-label">
                <div className="setting-content">
                  <span className="setting-name">投稿時刻</span>
                  <span className="setting-description">自動投稿の時刻を設定します（HH:mm形式、例: 18:00）</span>
                </div>
                <input
                  type="time"
                  value={settings.slack.autoPostTime || '18:00'}
                  onChange={(e) => {
                    const time = e.target.value;
                    vscode.postMessage({
                      command: 'updateSlackAutoPostTime',
                      time,
                    });
                    if (settings) {
                      setSettings({
                        ...settings,
                        slack: {
                          ...settings.slack,
                          autoPostTime: time,
                        },
                      });
                    }
                  }}
                  className="setting-time-input"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">自動リセット設定</h2>
        <p className="section-description">日次データを自動的にリセットする時刻を設定します</p>
        <div className="settings-list">
          <div className="setting-item">
            <label className="setting-label">
              <div className="setting-content">
                <span className="setting-name">リセット時刻</span>
                <span className="setting-description">日次データを自動的にリセットする時刻（HH:mm形式、例: 00:00）</span>
              </div>
              <input
                type="time"
                value={settings.dataPersistence?.resetTime || '00:00'}
                onChange={(e) => {
                  const time = e.target.value;
                  vscode.postMessage({
                    command: 'updateResetTime',
                    time,
                  });
                  if (settings) {
                    setSettings({
                      ...settings,
                      dataPersistence: {
                        ...settings.dataPersistence,
                        resetTime: time,
                      },
                    });
                  }
                }}
                className="setting-time-input"
              />
            </label>
          </div>
          {settings.slack.autoPostEnabled && (
            <div className="setting-item" style={{ marginTop: '8px' }}>
              <button
                onClick={() => {
                  vscode.postMessage({
                    command: 'syncResetTimeWithAutoPostTime',
                  });
                  if (settings) {
                    setSettings({
                      ...settings,
                      dataPersistence: {
                        ...settings.dataPersistence,
                        resetTime: settings.slack.autoPostTime,
                      },
                    });
                  }
                }}
                className="webhook-url-save-button"
                style={{ width: '100%' }}
              >
                Slack自動投稿時間と合わせる
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">データ管理</h2>
        <p className="section-description">本日の記録データをリセットします</p>
        <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleResetToday}
            className="reset-button"
            title="本日のデータをリセット"
          >
            🔄 本日のデータをリセット
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;
