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

  // Decide layout: two columns if both are under 140 characters, stacked if longer
  const isShort = (inclusions?.length || 0) < 140 && (exclusions?.length || 0) < 140;

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
              <div className="flex items-center gap-1.5 mb-[0.8mm]">
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
              <p
                style={{
                  fontSize: '7.8pt',
                  fontWeight: 400,
                  color: '#262626',
                  lineHeight: 1.35,
                  paddingLeft: '3mm',
                  margin: 0,
                  whiteSpace: 'pre-line',
                }}
              >
                {inclusions}
              </p>
            </div>
          )}

          {/* Not included */}
          {exclusions && (
            <div>
              <div className="flex items-center gap-1.5 mb-[0.8mm]">
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
              <p
                style={{
                  fontSize: '7.8pt',
                  fontWeight: 400,
                  color: '#52525B',
                  lineHeight: 1.35,
                  paddingLeft: '3mm',
                  margin: 0,
                  whiteSpace: 'pre-line',
                }}
              >
                {exclusions}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
