import React, { useState, useEffect } from 'react';
import { vscode } from '../vscodeApi';
import './SlackPostButton.css';

const SlackPostButton: React.FC = () => {
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    // メッセージリスナーを設定（投稿結果を受信）
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.command === 'slackPostResult') {
        setIsPosting(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handlePost = async () => {
    if (isPosting) {
      return;
    }

    // 確認のみで投稿を実行
    setIsPosting(true);
    
    try {
      // コメントは拡張機能側で自動取得するため、undefinedを送信
      vscode.postMessage({ 
        command: 'postToSlack',
        comment: undefined
      });
    } catch (error) {
      console.error('Error posting to Slack:', error);
      setIsPosting(false);
    }
    // 投稿完了は拡張機能側からメッセージで通知される
  };

  return (
    <button
      className="slack-post-button"
      onClick={handlePost}
      disabled={isPosting}
      title="本日の記録をSlackに投稿"
    >
      {isPosting ? '📤 投稿中...' : '📤 Slackに投稿'}
    </button>
  );
};

export default SlackPostButton;
