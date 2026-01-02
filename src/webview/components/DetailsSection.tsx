import React from 'react';
import LineChangesCard from './LineChangesCard';
import LanguageRatioCard from './LanguageRatioCard';

interface DetailsSectionProps {
  lineChanges: number;
  languageRatios: Array<{ language: string; percent: number }>;
  displaySettings: {
    workTime: boolean;
    saveCount: boolean;
    fileCount: boolean;
    lineChanges: boolean;
    languageRatio: boolean;
    fileList: boolean;
  };
}

const DetailsSection: React.FC<DetailsSectionProps> = ({
  lineChanges,
  languageRatios,
  displaySettings,
}) => {
  return (
    <div className="details-section">
      {displaySettings.lineChanges && (
        <LineChangesCard lineChanges={lineChanges} />
      )}
      {displaySettings.languageRatio && (
        <LanguageRatioCard languageRatios={languageRatios} />
      )}
    </div>
  );
};

export default DetailsSection;
