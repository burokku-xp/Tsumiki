import React from 'react';

interface LineChangesCardProps {
  lineChanges: number;
}

const LineChangesCard: React.FC<LineChangesCardProps> = ({ lineChanges }) => {
  return (
    <div className="detail-card">
      <div className="detail-icon">📝</div>
      <div className="detail-content">
        <div className="detail-label">変更行数</div>
        <div className="detail-value">
          {lineChanges}行 <span className="reference-label">(参考値)</span>
        </div>
      </div>
    </div>
  );
};

export default LineChangesCard;
