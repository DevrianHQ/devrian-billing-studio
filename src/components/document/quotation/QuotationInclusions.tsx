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

  // Decide layout: two columns if both are under 160 characters or have <= 4 lines, stacked if longer
  const incLines = (inclusions || '').split('\n').filter(Boolean).length;
  const excLines = (exclusions || '').split('\n').filter(Boolean).length;
  const isShort = (inclusions?.length || 0) < 180 && (exclusions?.length || 0) < 180 && incLines <= 4 && excLines <= 4;

  const renderContent = (text: string, color: string, isPositive: boolean) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      return (
        <div className="space-y-[0.8mm] pl-[1.5mm]">
          {lines.map((line, idx) => {
            const clean = line.replace(/^[-•*]\s*/, '').trim();
            return (
              <div key={idx} className="flex items-start gap-1.5 text-[7.8pt]" style={{ color, lineHeight: 1.35 }}>
                <span className={`text-[7pt] mt-[0.5mm] shrink-0 font-bold ${isPositive ? 'text-emerald-600' : 'text-neutral-400'}`}>
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
          fontSize: '7.8pt',
          fontWeight: 400,
          color,
          lineHeight: 1.35,
          paddingLeft: '2mm',
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
        className="w-full bg-[#FAFAFA] rounded-[2px]"
        style={{
          border: '0.2mm solid #E5E5E5',
          padding: '2.5mm 3.5mm',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div className={isShort ? 'grid grid-cols-2 gap-4' : 'space-y-2'}>
          {/* Included */}
          {inclusions && (
            <div>
              <div className="flex items-center gap-1.5 mb-[1mm]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '7.5pt',
                    color: '#0E0E0E',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Included:
                </span>
              </div>
              {renderContent(inclusions, '#262626', true)}
            </div>
          )}

          {/* Not included */}
          {exclusions && (
            <div>
              <div className="flex items-center gap-1.5 mb-[1mm]">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '7.5pt',
                    color: '#0E0E0E',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Not included:
                </span>
              </div>
              {renderContent(exclusions, '#52525B', false)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

