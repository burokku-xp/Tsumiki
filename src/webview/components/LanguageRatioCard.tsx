import React from 'react';

interface LanguageRatioCardProps {
  languageRatios: Array<{ language: string; percent: number }>;
}

const COLORS = [
  '#FF9F1C', // Primary Orange
  '#2EC4B6', // Teal
  '#E71D36', // Red
  '#FFBF69', // Yellow/Orange
  '#3A86FF', // Blue
  '#8338EC', // Purple
  '#FB5607', // Orange Red
];

const LanguageRatioCard: React.FC<LanguageRatioCardProps> = ({
  languageRatios,
}) => {
  if (languageRatios.length === 0) {
    return (
      <div className="language-ratios">
        <div className="detail-label">言語比率</div>
        <div className="detail-value" style={{ fontSize: '12px', opacity: 0.7 }}>データなし</div>
      </div>
    );
  }

  return (
    <div className="language-ratios">
      <div className="detail-label" style={{ marginBottom: '8px' }}>
        <span className="detail-icon">💻</span> 言語比率
      </div>
      
      <div className="language-stack-bar">
        {languageRatios.map(({ language, percent }, index) => (
          <div
            key={language}
            className="language-segment"
            style={{
              width: `${percent}%`,
              backgroundColor: COLORS[index % COLORS.length],
            }}
            title={`${language}: ${percent}%`}
          />
        ))}
      </div>

      <div className="language-legend">
        {languageRatios.map(({ language, percent }, index) => (
          <div key={language} className="language-legend-item">
            <div
              className="language-dot"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="language-name">{language}</span>
            <span className="language-percent" style={{ opacity: 0.6 }}>{percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageRatioCard;
