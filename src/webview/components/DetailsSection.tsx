import React from 'react';
import LineChangesCard from './LineChangesCard';
import LanguageRatioCard from './LanguageRatioCard';

interface DetailsSectionProps {
  lineChanges: number;
  languageRatios: Array<{ language: string; percent: number }>;
}

const DetailsSection: React.FC<DetailsSectionProps> = ({
  lineChanges,
  languageRatios,
}) => {
  return (
    <div className="details-section">
      <LineChangesCard lineChanges={lineChanges} />
      <LanguageRatioCard languageRatios={languageRatios} />
    </div>
  );
};

export default DetailsSection;
