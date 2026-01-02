import React from 'react';
import { vscode } from '../vscodeApi';

const Header: React.FC = () => {
  const handleReset = async () => {
    if (window.vscode) {
      vscode.postMessage({ command: 'resetToday' });
    }
  };

  return (
    <div className="header">
      <h1>🧱 本日の記録</h1>
      <button 
        className="reset-button" 
        onClick={handleReset}
        title="本日のデータをリセット"
      >
        🔄 リセット
      </button>
    </div>
  );
};

export default Header;
