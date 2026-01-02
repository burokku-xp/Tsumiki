import React from 'react';

interface WorkTimeCardProps {
  workTime: number; // 秒単位
}

const WorkTimeCard: React.FC<WorkTimeCardProps> = ({ workTime }) => {
  const formatWorkTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0 && minutes > 0) {
      return `${hours}時間${minutes}分`;
    } else if (hours > 0) {
      return `${hours}時間`;
    } else if (minutes > 0) {
      return `${minutes}分`;
    } else {
      return '0分';
    }
  };

  return (
    <div className="stat-card">
      <div className="stat-icon">⏱️</div>
      <div className="stat-label">作業時間</div>
      <div className="stat-value">{formatWorkTime(workTime)}</div>
    </div>
  );
};

export default WorkTimeCard;
