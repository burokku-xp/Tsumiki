import React from 'react';
import LanguageRatioCard from './LanguageRatioCard';

interface DetailsSectionProps {
  languageRatios: Array<{ language: string; percent: number }>;
  displaySettings: {
    languageRatio: boolean;
  };
}

const DetailsSection: React.FC<DetailsSectionProps> = ({
  languageRatios,
  displaySettings,
}) => {
  if (!displaySettings.languageRatio) {
    return null;
  }

  return (
    <div className="details-section">
      <LanguageRatioCard languageRatios={languageRatios} />
    </div>
  );
};

export default DetailsSection;
