import React, { useState, useEffect } from 'react';
import { vscode } from '../vscodeApi';
import './DailyComment.css';

interface DailyCommentProps {
  initialComment: string;
}

const DailyComment: React.FC<DailyCommentProps> = ({ initialComment }) => {
  const [comment, setComment] = useState(initialComment);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // 値が実際に変更された場合のみ更新（undefined/null対策含む）
    if (initialComment !== comment && initialComment !== undefined) {
      // ユーザーが入力中でない（＝現在値と初期値が同じ、または初期値が空から変更された）場合のみ反映
      // ここでは簡易的に、外部からの値が有効な場合は反映する形にする
      // ただし、ユーザーが編集中に上書きされるのを防ぐため、
      // 本当はフォーカス状態を確認したいが、ここでは値の変更を検知した時のみにする
      setComment(initialComment || '');
    }
  }, [initialComment]);

  const handleSave = () => {
    setIsSaving(true);
    vscode.postMessage({
      command: 'updateDailyComment',
      comment,
    });
    
    // 保存完了の視覚的フィードバックのために少し待機
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="daily-comment-section">
      <div className="daily-comment-header">
        <h2 className="daily-comment-title">📝 今日のひとこと</h2>
        <button 
          className="daily-comment-save-button" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>
      <textarea
        className="daily-comment-input"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="今日の作業内容や感想を入力...（自動投稿時に使用されます）"
        rows={3}
      />
    </div>
  );
};

export default DailyComment;
