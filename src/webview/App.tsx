import React, { useEffect, useState } from 'react';
import { vscode } from './vscodeApi';
import Header from './components/Header';
import StatsSection from './components/StatsSection';
import DetailsSection from './components/DetailsSection';
import FileListSection from './components/FileListSection';
import './App.css';

export interface DailyData {
  workTime: number; // 秒単位
  saveCount: number;
  fileCount: number;
  lineChanges: number;
  languageRatios: Array<{ language: string; percent: number }>;
  fileList: Array<{ path: string; lineCount: number }>;
  hasMoreFiles: boolean;
  totalFiles: number;
  displaySettings?: {
    workTime: boolean;
    saveCount: boolean;
    fileCount: boolean;
    lineChanges: boolean;
    languageRatio: boolean;
    fileList: boolean;
  };
}

const App: React.FC = () => {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // 初期データをリクエスト
      if (window.vscode) {
        vscode.postMessage({ command: 'requestDailyData' });
      } else {
        console.warn('VSCode API not available, using fallback');
        setLoading(false);
      }

      // メッセージリスナーを設定
      const handleMessage = (event: MessageEvent) => {
        try {
          const message = event.data;
          if (message && message.command === 'updateDailyData') {
            setData(message.data);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error handling message:', error);
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

  if (loading) {
    return (
      <div className="app">
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (!data || (data.saveCount === 0 && data.workTime === 0)) {
    return (
      <div className="app">
        <Header />
        <div className="no-data">本日のデータはありません</div>
      </div>
    );
  }

  const displaySettings = data.displaySettings || {
    workTime: true,
    saveCount: true,
    fileCount: true,
    lineChanges: true,
    languageRatio: true,
    fileList: true,
  };

  return (
    <div className="app">
      <Header />
      {displaySettings.workTime ||
      displaySettings.saveCount ||
      displaySettings.fileCount ? (
        <StatsSection
          workTime={data.workTime}
          saveCount={data.saveCount}
          fileCount={data.fileCount}
          displaySettings={displaySettings}
        />
      ) : null}
      {displaySettings.lineChanges || displaySettings.languageRatio ? (
        <DetailsSection
          lineChanges={data.lineChanges}
          languageRatios={data.languageRatios}
          displaySettings={displaySettings}
        />
      ) : null}
      {displaySettings.fileList ? (
        <FileListSection
          fileList={data.fileList}
          hasMoreFiles={data.hasMoreFiles}
          totalFiles={data.totalFiles}
        />
      ) : null}
    </div>
  );
};

export default App;
