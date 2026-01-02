import React from 'react';
import WorkTimeCard from './WorkTimeCard';
import SaveCountCard from './SaveCountCard';
import FileCountCard from './FileCountCard';

interface StatsSectionProps {
  workTime: number; // 秒単位
  saveCount: number;
  fileCount: number;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  workTime,
  saveCount,
  fileCount,
}) => {
  return (
    <div className="stats-section">
      <WorkTimeCard workTime={workTime} />
      <SaveCountCard saveCount={saveCount} />
      <FileCountCard fileCount={fileCount} />
    </div>
  );
};

export default StatsSection;
