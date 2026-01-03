import React, { useEffect, useState } from 'react';
import { vscode } from './vscodeApi';
import Header from './components/Header';
import TimerControl from './components/TimerControl';
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
    theme?: string;
  };
}

const App: React.FC = () => {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timerState, setTimerState] = useState({ isRunning: false, elapsedTime: 0 });

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
          } else if (message && message.command === 'updateTimerState') {
            setTimerState({
              isRunning: message.data.isRunning,
              elapsedTime: message.data.elapsedTime,
            });
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

  if (loading || !data) {
    return (
      <div className="app">
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  // データがない状態でも通常のUIを表示する（「本日のデータはありません」は表示しない）

  const displaySettings = data.displaySettings || {
    workTime: true,
    saveCount: true,
    fileCount: true,
    lineChanges: true,
    languageRatio: true,
    fileList: true,
    theme: 'orange',
  };

  const showStats = displaySettings.workTime || 
                    displaySettings.saveCount || 
                    displaySettings.fileCount || 
                    displaySettings.lineChanges;

  return (
    <div className="app" data-theme={displaySettings.theme || 'orange'}>
      <Header />
      <TimerControl
        isRunning={timerState.isRunning}
        elapsedTime={timerState.elapsedTime}
        onStateChange={(isRunning, elapsedTime) => {
          setTimerState({ isRunning, elapsedTime });
        }}
      />
      
      {showStats && (
        <StatsSection
          workTime={data.workTime}
          saveCount={data.saveCount}
          fileCount={data.fileCount}
          lineChanges={data.lineChanges}
          displaySettings={displaySettings}
        />
      )}

      {displaySettings.languageRatio && (
        <DetailsSection
          languageRatios={data.languageRatios}
          displaySettings={displaySettings}
        />
      )}

      {displaySettings.fileList && (
        <FileListSection
          fileList={data.fileList}
          hasMoreFiles={data.hasMoreFiles}
          totalFiles={data.totalFiles}
        />
      )}
    </div>
  );
};

export default App;
