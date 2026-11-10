import React from 'react';

interface QuotationAcceptanceBoxProps {
  showClientSignature?: boolean;
  clientName?: string;
}

export const QuotationAcceptanceBox: React.FC<QuotationAcceptanceBoxProps> = ({
  showClientSignature = true,
  clientName = '',
}) => {
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
      {/* Intro text */}
      <p
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '7.8pt',
          color: '#3F3F46',
          marginBottom: '1.5mm',
          lineHeight: 1.3,
        }}
      >
        To accept this quotation, please confirm in writing (WhatsApp/email) or sign below, and pay the advance.
      </p>

      {/* Two-column acceptance box (or single column if client signature hidden) */}
      <div
        className="w-full bg-[#FFFFFF] rounded-[2px]"
        style={{
          border: '0.2mm solid #E5E5E5',
          padding: '2.5mm 3.5mm',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div className={`grid ${showClientSignature ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {/* Column 1: Client Acceptance */}
          {showClientSignature && (
            <div className="flex flex-col justify-between">
              <div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '7pt',
                    letterSpacing: '0.18em',
                    color: '#0E0E0E',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '1.5mm',
                  }}
                >
                  CLIENT ACCEPTANCE
                </span>
                <p style={{ fontSize: '7.5pt', color: '#52525B', margin: 0 }}>
                  Name: <span className="font-medium text-[#0E0E0E]">{clientName || '_______________________'}</span>
                </p>
              </div>

              {/* Generous signature line (min 14mm) */}
              <div style={{ marginTop: '14mm', borderTop: '0.2mm solid #0E0E0E', paddingTop: '1mm' }}>
                <div className="flex justify-between items-center text-[7pt] text-[#52525B]">
                  <span>Authorized Signature</span>
                  <span>Date: _______________</span>
                </div>
              </div>
            </div>
          )}

          {/* Column 2: For DEVRIAN */}
          <div className="flex flex-col justify-between">
            <div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '7pt',
                  letterSpacing: '0.18em',
                  color: '#0E0E0E',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '1.5mm',
                }}
              >
                FOR DEVRIAN
              </span>
              <p style={{ fontSize: '7.5pt', color: '#52525B', margin: 0 }}>
                Name: <span className="font-semibold text-[#0E0E0E]">Dev Rajpoot</span> (Founder & CEO)
              </p>
            </div>

            {/* Generous signature line (min 14mm) */}
            <div style={{ marginTop: '14mm', borderTop: '0.2mm solid #0E0E0E', paddingTop: '1mm' }}>
              <div className="flex justify-between items-center text-[7pt] text-[#52525B]">
                <span>Authorized Signatory</span>
                <span>Date: _______________</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
