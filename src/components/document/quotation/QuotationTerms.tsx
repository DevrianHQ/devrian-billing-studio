import React from 'react';

interface QuotationTermsProps {
  notes?: string[];
  heading?: string;
}

export const QuotationTerms: React.FC<QuotationTermsProps> = ({
  notes = [],
  heading = 'TERMS & NOTES',
}) => {
  if (!notes || notes.length === 0) return null;

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
        className="w-full rounded-[2px]"
        style={{
          backgroundColor: '#F0F0F0',
          borderLeft: '2.5mm solid #0E0E0E',
          padding: '2.5mm 3.5mm',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: '6.8pt',
            letterSpacing: '0.22em',
            wordSpacing: '0.45em',
            color: '#0E0E0E',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '1.2mm',
            lineHeight: 1,
          }}
        >
          {heading}
        </span>

        <ol className="list-decimal pl-4 space-y-[0.8mm] m-0" style={{ fontSize: '7.5pt', color: '#262626' }}>
          {notes.map((note, idx) => (
            <li key={idx} style={{ lineHeight: 1.35 }}>
              <span>{note}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

