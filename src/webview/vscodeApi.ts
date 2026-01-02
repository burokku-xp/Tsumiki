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
    if (typeof window !== 'undefined' && window.vscode) {
      window.vscode.postMessage(message);
    } else {
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
