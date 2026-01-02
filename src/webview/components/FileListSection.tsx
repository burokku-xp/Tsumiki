import React from 'react';

interface FileListSectionProps {
  fileList: Array<{ path: string; lineCount: number }>;
  hasMoreFiles: boolean;
  totalFiles: number;
}

const FileListSection: React.FC<FileListSectionProps> = ({
  fileList,
  hasMoreFiles,
  totalFiles,
}) => {
  if (fileList.length === 0) {
    return null;
  }

  return (
    <div className="file-list-section">
      <div className="file-list-header">
        <div className="file-list-icon">📄</div>
        <div className="file-list-title">編集ファイル一覧</div>
      </div>
      <div className="file-list">
        {fileList.map((file, index) => (
          <div key={index} className="file-item">
            <div className="file-path">{file.path}</div>
            <div className="file-lines">{file.lineCount}行</div>
          </div>
        ))}
        {hasMoreFiles && (
          <div className="file-item-more">
            ... 他{totalFiles - 10}ファイル
          </div>
        )}
      </div>
    </div>
  );
};

export default FileListSection;
