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
}

const App: React.FC = () => {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期データをリクエスト
    vscode.postMessage({ command: 'requestDailyData' });

    // メッセージリスナーを設定
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === 'updateDailyData') {
        setData(message.data);
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
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

  return (
    <div className="app">
      <Header />
      <StatsSection
        workTime={data.workTime}
        saveCount={data.saveCount}
        fileCount={data.fileCount}
      />
      <DetailsSection
        lineChanges={data.lineChanges}
        languageRatios={data.languageRatios}
      />
      <FileListSection
        fileList={data.fileList}
        hasMoreFiles={data.hasMoreFiles}
        totalFiles={data.totalFiles}
      />
    </div>
  );
};

export default App;
