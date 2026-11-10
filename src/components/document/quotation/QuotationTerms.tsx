import React from 'react';

interface QuotationTermsProps {
  notes?: string[];
  heading?: string;
}

export const QuotationTerms: React.FC<QuotationTermsProps> = ({
  notes = [],
  heading = 'TERMS & CONDITIONS',
}) => {
  if (!notes || notes.length === 0) return null;

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
          backgroundColor: '#F0F0F0',
          borderLeft: '1.2mm solid #0E0E0E',
          padding: '3.5mm',
        }}
      >
        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: '7pt',
            letterSpacing: '0.25em',
            wordSpacing: '0.7em',
            color: '#0E0E0E',
            textTransform: 'uppercase',
            marginBottom: '1.5mm',
            lineHeight: 1,
          }}
        >
          {heading}
        </div>

        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 400,
            fontSize: '8pt',
            color: '#333333',
            lineHeight: 1.4,
          }}
        >
          <ol className="list-decimal list-inside space-y-0.5">
            {notes.map((note, index) => (
              <li key={index} style={{ paddingLeft: '1mm' }}>
                {note}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
