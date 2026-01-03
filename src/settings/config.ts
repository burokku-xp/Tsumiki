import * as vscode from 'vscode';

/**
 * 設定キー
 */
export const ConfigKeys = {
  display: {
    workTime: 'tsumiki.display.workTime',
    saveCount: 'tsumiki.display.saveCount',
    fileCount: 'tsumiki.display.fileCount',
    lineChanges: 'tsumiki.display.lineChanges',
    languageRatio: 'tsumiki.display.languageRatio',
    fileList: 'tsumiki.display.fileList',
  },
  appearance: {
    theme: 'tsumiki.appearance.theme',
  },
  slack: {
    postItems: 'tsumiki.slack.postItems',
  },
} as const;

/**
 * テーマの型
 */
export type Theme = 'orange' | 'blue' | 'green' | 'monochrome';

/**
 * デフォルト設定値
 */
export const DefaultSettings = {
  display: {
    workTime: true,
    saveCount: true,
    fileCount: true,
    lineChanges: true,
    languageRatio: true,
    fileList: true,
  },
  appearance: {
    theme: 'orange' as Theme,
  },
  slack: {
    postItems: [
      'workTime',
      'saveCount',
      'fileCount',
      'lineChanges',
      'languageRatio',
      'fileList',
    ] as const,
  },
} as const;

/**
 * Slack投稿項目の型
 */
export type SlackPostItem =
  | 'workTime'
  | 'saveCount'
  | 'fileCount'
  | 'lineChanges'
  | 'languageRatio'
  | 'fileList';

/**
 * 設定管理クラス
 */
export class SettingsManager {
  private _config: vscode.WorkspaceConfiguration;
  private _onDidChangeEmitter: vscode.EventEmitter<void>;
  public readonly onDidChange: vscode.Event<void>;

  constructor() {
    this._config = vscode.workspace.getConfiguration('tsumiki');
    this._onDidChangeEmitter = new vscode.EventEmitter<void>();
    this.onDidChange = this._onDidChangeEmitter.event;

    // 設定変更を監視
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('tsumiki')) {
        this._config = vscode.workspace.getConfiguration('tsumiki');
        this._onDidChangeEmitter.fire();
      }
    });
  }

  /**
   * 作業時間表示のON/OFFを取得
   */
  getDisplayWorkTime(): boolean {
    return this._config.get<boolean>(
      'display.workTime',
      DefaultSettings.display.workTime
    );
  }

  /**
   * 保存回数表示のON/OFFを取得
   */
  getDisplaySaveCount(): boolean {
    return this._config.get<boolean>(
      'display.saveCount',
      DefaultSettings.display.saveCount
    );
  }

  /**
   * ファイル数表示のON/OFFを取得
   */
  getDisplayFileCount(): boolean {
    return this._config.get<boolean>(
      'display.fileCount',
      DefaultSettings.display.fileCount
    );
  }

  /**
   * 変更行数表示のON/OFFを取得
   */
  getDisplayLineChanges(): boolean {
    return this._config.get<boolean>(
      'display.lineChanges',
      DefaultSettings.display.lineChanges
    );
  }

  /**
   * 言語比率表示のON/OFFを取得
   */
  getDisplayLanguageRatio(): boolean {
    return this._config.get<boolean>(
      'display.languageRatio',
      DefaultSettings.display.languageRatio
    );
  }

  /**
   * 編集ファイル一覧表示のON/OFFを取得
   */
  getDisplayFileList(): boolean {
    return this._config.get<boolean>(
      'display.fileList',
      DefaultSettings.display.fileList
    );
  }

  /**
   * テーマを取得
   */
  getTheme(): Theme {
    const theme = this._config.get<string>(
      'appearance.theme',
      DefaultSettings.appearance.theme
    );
    // 有効なテーマかチェック
    const validThemes: Theme[] = ['orange', 'blue', 'green', 'monochrome'];
    return validThemes.includes(theme as Theme) ? (theme as Theme) : DefaultSettings.appearance.theme;
  }

  /**
   * Slack投稿項目を取得
   */
  getSlackPostItems(): SlackPostItem[] {
    const items = this._config.get<SlackPostItem[]>(
      'slack.postItems',
      [...DefaultSettings.slack.postItems]
    );
    // 型安全性のため、有効な項目のみを返す
    const validItems: SlackPostItem[] = [
      'workTime',
      'saveCount',
      'fileCount',
      'lineChanges',
      'languageRatio',
      'fileList',
    ];
    return items.filter((item) =>
      validItems.includes(item)
    ) as SlackPostItem[];
  }

  /**
   * すべての表示設定を取得
   */
  getDisplaySettings() {
    return {
      workTime: this.getDisplayWorkTime(),
      saveCount: this.getDisplaySaveCount(),
      fileCount: this.getDisplayFileCount(),
      lineChanges: this.getDisplayLineChanges(),
      languageRatio: this.getDisplayLanguageRatio(),
      fileList: this.getDisplayFileList(),
      theme: this.getTheme(),
    };
  }
}

/**
 * シングルトンインスタンス
 */
let settingsManagerInstance: SettingsManager | null = null;

/**
 * 設定マネージャーのインスタンスを取得
 */
export function getSettingsManager(): SettingsManager {
  if (!settingsManagerInstance) {
    settingsManagerInstance = new SettingsManager();
  }
  return settingsManagerInstance;
}
