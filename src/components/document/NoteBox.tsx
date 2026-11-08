import React from 'react';
import { DocumentType, DocumentCustomText, DocumentSectionVisibility } from '../../types';

interface NoteBoxProps {
  type: DocumentType;
  notes: string[];
  gstEnabled?: boolean;
  customText: DocumentCustomText;
  visibility: DocumentSectionVisibility;
}

export const NoteBox: React.FC<NoteBoxProps> = ({
  type,
  notes,
  customText,
  visibility,
}) => {
  const isInvoice = type === 'invoice';

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
      {/* Grey Note Box with 1.2mm Black Left Border */}
      {visibility.showTermsAndNotes && notes && notes.length > 0 && (
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
            {customText.termsSectionHeading || (isInvoice ? 'TERMS & NOTES' : 'NOTE')}
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
            {type === 'receipt' ? (
              // Paragraph format for receipt note
              notes.map((note, idx) => (
                <p key={idx} className="mb-0.5 last:mb-0">
                  {note}
                </p>
              ))
            ) : (
              // Numbered list format for invoice & quotation
              <ol className="list-decimal list-inside space-y-0.5">
                {notes.map((note, index) => (
                  <li key={index} style={{ paddingLeft: '1mm' }}>
                    {note}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      {/* Closing Line below Note Box: Poppins 400, 8pt, #4A4A4A */}
      {visibility.showClosingLine && customText.closingLine && (
        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 400,
            fontSize: '8pt',
            color: '#4A4A4A',
            marginTop: '2mm',
            lineHeight: 1.4,
          }}
        >
          {customText.closingLine}
        </div>
      )}
    </div>
  );
};
