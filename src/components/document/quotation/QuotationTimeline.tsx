import React from 'react';

interface QuotationTimelineProps {
  timeline?: string;
}

export const QuotationTimeline: React.FC<QuotationTimelineProps> = ({ timeline }) => {
  if (!timeline || !timeline.trim()) return null;

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
          DELIVERY TIMELINE
        </div>
        <div className="pt-[1.5mm] border-t border-[#F1F5F9]">
          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '8pt',
              fontWeight: 400,
              color: '#262626',
              lineHeight: 1.4,
              margin: 0,
              whiteSpace: 'pre-line',
            }}
          >
            {timeline}
          </p>
        </div>
      </div>
    </div>
  );
};
