import React from 'react';

interface LineChangesCardProps {
  lineChanges: number;
}

const LineChangesCard: React.FC<LineChangesCardProps> = ({ lineChanges }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">📝</div>
      <div className="stat-label">変更行数</div>
      <div className="stat-value">
        {lineChanges}
        <span style={{ fontSize: '10px', opacity: 0.6, marginLeft: '2px', fontWeight: 'normal' }}>行</span>
      </div>
    </div>
  );
};

export default LineChangesCard;
