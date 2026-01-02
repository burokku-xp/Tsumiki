import React from 'react';

interface SaveCountCardProps {
  saveCount: number;
}

const SaveCountCard: React.FC<SaveCountCardProps> = ({ saveCount }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">💾</div>
      <div className="stat-label">保存回数</div>
      <div className="stat-value">{saveCount}回</div>
    </div>
  );
};

export default SaveCountCard;
