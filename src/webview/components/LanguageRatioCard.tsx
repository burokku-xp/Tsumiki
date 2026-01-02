import React from 'react';

interface LanguageRatioCardProps {
  languageRatios: Array<{ language: string; percent: number }>;
}

const LanguageRatioCard: React.FC<LanguageRatioCardProps> = ({
  languageRatios,
}) => {
  if (languageRatios.length === 0) {
    return (
      <div className="detail-card">
        <div className="detail-icon">💻</div>
        <div className="detail-content">
          <div className="detail-label">言語比率</div>
          <div className="detail-value">データなし</div>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-card">
      <div className="detail-icon">💻</div>
      <div className="detail-content">
        <div className="detail-label">言語比率</div>
        <div className="language-ratios">
          {languageRatios.map(({ language, percent }) => (
            <div key={language} className="language-ratio-item">
              <div className="language-name">{language}</div>
              <div className="language-progress">
                <div
                  className="language-progress-bar"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="language-percent">{percent}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageRatioCard;
