import React from 'react';

interface QuotationTimelineProps {
  timeline?: string;
}

export const QuotationTimeline: React.FC<QuotationTimelineProps> = ({ timeline }) => {
  if (!timeline || !timeline.trim()) return null;

  return (
    <div
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '1mm',
        paddingBottom: '1.5mm',
      }}
    >
      <div
        className="w-full bg-[#FAFAFA] rounded-[2px]"
        style={{
          borderLeft: '2mm solid #0E0E0E',
          borderTop: '0.2mm solid #E5E5E5',
          borderRight: '0.2mm solid #E5E5E5',
          borderBottom: '0.2mm solid #E5E5E5',
          padding: '2mm 3.5mm',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: '6.5pt',
            letterSpacing: '0.22em',
            wordSpacing: '0.45em',
            color: '#8A8A8A',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '0.8mm',
            lineHeight: 1,
          }}
        >
          DELIVERY TIMELINE
        </span>
        <p
          style={{
            fontSize: '8pt',
            fontWeight: 400,
            color: '#0E0E0E',
            lineHeight: 1.35,
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {timeline}
        </p>
      </div>
    </div>
  );
};
