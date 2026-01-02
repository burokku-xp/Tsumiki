// VSCode APIの型定義
declare global {
  interface Window {
    vscode: {
      postMessage(message: any): void;
      getState(): any;
      setState(state: any): void;
    };
  }
}

// VSCode APIのラッパー
export const vscode = {
  postMessage: (message: any) => {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vscodeApi.ts:14','message':'vscode.postMessage called',data:{hasWindow:typeof window!=='undefined',hasVscode:!!(typeof window!=='undefined'&&window.vscode),command:message?.command},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (typeof window !== 'undefined' && window.vscode) {
      window.vscode.postMessage(message);
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/173bd699-2823-4d26-8d54-d3b7aa8c1ded',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vscodeApi.ts:18','message':'VSCode API not available in postMessage',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      console.warn('VSCode API not available');
    }
  },
  getState: () => {
    if (typeof window !== 'undefined' && window.vscode) {
      return window.vscode.getState();
    }
    return null;
  },
  setState: (state: any) => {
    if (typeof window !== 'undefined' && window.vscode) {
      window.vscode.setState(state);
    }
  },
};
