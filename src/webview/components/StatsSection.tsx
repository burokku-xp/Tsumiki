import React from 'react';
import WorkTimeCard from './WorkTimeCard';
import SaveCountCard from './SaveCountCard';
import FileCountCard from './FileCountCard';
import LineChangesCard from './LineChangesCard';

interface StatsSectionProps {
  workTime: number; // 秒単位
  saveCount: number;
  fileCount: number;
  lineChanges: number;
  displaySettings: {
    workTime: boolean;
    saveCount: boolean;
    fileCount: boolean;
    lineChanges: boolean;
    languageRatio: boolean;
    fileList: boolean;
  };
}

const StatsSection: React.FC<StatsSectionProps> = ({
  workTime,
  saveCount,
  fileCount,
  lineChanges,
  displaySettings,
}) => {
  return (
    <div className="stats-section">
      {displaySettings.workTime && <WorkTimeCard workTime={workTime} />}
      {displaySettings.saveCount && <SaveCountCard saveCount={saveCount} />}
      {displaySettings.fileCount && <FileCountCard fileCount={fileCount} />}
      {displaySettings.lineChanges && <LineChangesCard lineChanges={lineChanges} />}
    </div>
  );
};

export default StatsSection;
