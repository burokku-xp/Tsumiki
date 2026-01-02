import React from 'react';
import { createRoot } from 'react-dom/client';
import SettingsApp from './SettingsApp';

try {
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:5','message':'React app initialization started',data:{hasWindow:typeof window!=='undefined',hasVscode:!!(typeof window!=='undefined'&&window.vscode)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const container = document.getElementById('root');
  if (container) {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:8','message':'Root container found, creating React root',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const root = createRoot(container);
    root.render(<SettingsApp />);
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:11','message':'React app rendered',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
  } else {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:13','message':'Root container not found',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    console.error('Root container not found');
    document.body.innerHTML = '<div style="padding: 20px; color: red;">エラー: ルートコンテナが見つかりませんでした</div>';
  }
} catch (error) {
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:18','message':'Error initializing React app',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  console.error('Failed to initialize React app:', error);
  document.body.innerHTML = `<div style="padding: 20px; color: red;">エラー: Reactアプリの初期化に失敗しました<br>${error instanceof Error ? error.message : String(error)}</div>`;
}
