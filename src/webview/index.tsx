import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

try {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  } else {
    console.error('Root container not found');
    document.body.innerHTML = '<div style="padding: 20px; color: red;">エラー: ルートコンテナが見つかりませんでした</div>';
  }
} catch (error) {
  console.error('Failed to initialize React app:', error);
  document.body.innerHTML = `<div style="padding: 20px; color: red;">エラー: Reactアプリの初期化に失敗しました<br>${error instanceof Error ? error.message : String(error)}</div>`;
}
