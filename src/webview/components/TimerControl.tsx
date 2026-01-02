import React, { useEffect, useState } from 'react';
import { vscode } from '../vscodeApi';
import './TimerControl.css';

interface TimerControlProps {
  isRunning: boolean;
  elapsedTime: number; // 秒単位
  onStateChange?: (isRunning: boolean, elapsedTime: number) => void;
}

const TimerControl: React.FC<TimerControlProps> = ({
  isRunning: initialIsRunning,
  elapsedTime: initialElapsedTime,
  onStateChange,
}) => {
  const [isRunning, setIsRunning] = useState(initialIsRunning);
  const [elapsedTime, setElapsedTime] = useState(initialElapsedTime);

  // 初期状態を反映
  useEffect(() => {
    setIsRunning(initialIsRunning);
    setElapsedTime(initialElapsedTime);
  }, [initialIsRunning, initialElapsedTime]);

  // タイマーが動作中の場合、1秒ごとに経過時間を更新（拡張機能から実際の値を取得）
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      // 拡張機能に現在の状態をリクエスト
      vscode.postMessage({ command: 'requestTimerState' });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // メッセージリスナーを設定（拡張機能からの状態更新を受信）
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = event.data;
        if (message && message.command === 'updateTimerState') {
          setIsRunning(message.data.isRunning);
          setElapsedTime(message.data.elapsedTime);
          onStateChange?.(message.data.isRunning, message.data.elapsedTime);
        } else if (message && message.command === 'timerError') {
          console.error('[TimerControl] Timer error:', message.data.message);
          // エラーが発生した場合、状態をリセット
          setIsRunning(false);
        }
      } catch (error) {
        console.error('Error handling timer state message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onStateChange]);

  // 初期状態をリクエスト
  useEffect(() => {
    vscode.postMessage({ command: 'requestTimerState' });
  }, []);

  const handleStart = () => {
    vscode.postMessage({ command: 'startTimer' });
    // UIの状態は即座に更新せず、拡張機能からの応答を待つ
  };

  const handleStop = () => {
    vscode.postMessage({ command: 'stopTimer' });
    setIsRunning(false);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeJapanese = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
      return `${hours}時間${minutes}分`;
    } else if (hours > 0) {
      return `${hours}時間`;
    } else if (minutes > 0) {
      return `${minutes}分`;
    } else {
      return '0分';
    }
  };

  return (
    <div className="timer-control">
      <div className="timer-control-content">
        <div className="timer-display">
          <div className="timer-icon">⏱️</div>
          <div className="timer-time">
            {isRunning ? formatTime(elapsedTime) : formatTimeJapanese(elapsedTime)}
          </div>
          <div className="timer-status">
            {isRunning ? '計測中' : '停止中'}
          </div>
        </div>
        <div className="timer-actions">
          {isRunning ? (
            <button className="timer-button timer-button-stop" onClick={handleStop}>
              <span className="button-icon">⏸</span>
              <span className="button-text">停止</span>
            </button>
          ) : (
            <button className="timer-button timer-button-start" onClick={handleStart}>
              <span className="button-icon">▶</span>
              <span className="button-text">開始</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimerControl;
