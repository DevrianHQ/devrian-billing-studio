import React from 'react';

interface QuotationFreeNotesProps {
  notes?: string;
  heading?: string;
}

export const QuotationFreeNotes: React.FC<QuotationFreeNotesProps> = ({
  notes,
  heading = 'NOTES',
}) => {
  if (!notes || !notes.trim()) return null;

  return (
    <div
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '1mm',
        paddingBottom: '1mm',
      }}
    >
      <div
        style={{
          border: '0.25mm solid #E2E8F0',
          padding: '2.5mm 3.5mm',
          backgroundColor: '#FFFFFF',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: '6.8pt',
            letterSpacing: '0.22em',
            wordSpacing: '0.5em',
            color: '#0E0E0E',
            textTransform: 'uppercase',
            marginBottom: '1mm',
            lineHeight: 1,
          }}
        >
          {heading}
        </div>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '7.8pt',
            color: '#333333',
            lineHeight: 1.4,
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {notes}
        </p>
      </div>
    </div>
  );
};

