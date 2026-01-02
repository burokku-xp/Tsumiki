import React from 'react';

interface FileCountCardProps {
  fileCount: number;
}

const FileCountCard: React.FC<FileCountCardProps> = ({ fileCount }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">📁</div>
      <div className="stat-label">編集ファイル数</div>
      <div className="stat-value">{fileCount}ファイル</div>
    </div>
  );
};

export default FileCountCard;
