import React from 'react';

interface QuotationInclusionsProps {
  inclusions?: string;
  exclusions?: string;
}

export const QuotationInclusions: React.FC<QuotationInclusionsProps> = ({
  inclusions,
  exclusions,
}) => {
  if (!inclusions && !exclusions) return null;

  const headingStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: '7pt',
    letterSpacing: '0.25em',
    wordSpacing: '0.7em',
    color: '#0E0E0E',
    textTransform: 'uppercase',
    marginBottom: '1.5mm',
    lineHeight: 1,
  };

  const itemLabelStyle = (color: string): React.CSSProperties => ({
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: '6.5pt',
    letterSpacing: '0.2em',
    wordSpacing: '0.5em',
    color,
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '1.5mm',
    lineHeight: 1,
  });

  const renderContent = (text: string, color: string, isPositive: boolean) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      return (
        <div className="space-y-[1mm]">
          {lines.map((line, idx) => {
            const clean = line.replace(/^[-•*✓—]\s*/, '').trim();
            return (
              <div
                key={idx}
                className="flex items-start gap-1.5"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '8pt',
                  color,
                  lineHeight: 1.35,
                }}
              >
                <span
                  className={`text-[7pt] mt-[0.6mm] shrink-0 font-bold ${
                    isPositive ? 'text-emerald-600' : 'text-neutral-400'
                  }`}
                >
                  {isPositive ? '✓' : '—'}
                </span>
                <span>{clean}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return (
      <p
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '8pt',
          fontWeight: 400,
          color,
          lineHeight: 1.35,
          margin: 0,
          whiteSpace: 'pre-line',
        }}
      >
        {text}
      </p>
    );
  };

  return (
    <div
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '1.5mm',
        paddingBottom: '1.5mm',
      }}
    >
      <div
        style={{
          border: '0.25mm solid #E2E8F0',
          padding: '3.5mm 4mm',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={headingStyle}>
          INCLUSIONS &amp; EXCLUSIONS
        </div>

        <div className="grid grid-cols-2 gap-[5mm] pt-[1.5mm] border-t border-[#F1F5F9]">
          {/* Included */}
          <div>
            <span style={itemLabelStyle('#059669')}>INCLUDED:</span>
            {inclusions ? renderContent(inclusions, '#262626', true) : <span className="text-[#8A8A8A] text-[8pt]">None specified</span>}
          </div>

          {/* Not included */}
          <div>
            <span style={itemLabelStyle('#71717A')}>NOT INCLUDED:</span>
            {exclusions ? renderContent(exclusions, '#52525B', false) : <span className="text-[#8A8A8A] text-[8pt]">None specified</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
