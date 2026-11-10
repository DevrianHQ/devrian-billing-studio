import React from 'react';

interface QuotationAcceptanceBoxProps {
  showClientSignature?: boolean;
  clientName?: string;
}

export const QuotationAcceptanceBox: React.FC<QuotationAcceptanceBoxProps> = ({
  showClientSignature = true,
  clientName = '',
}) => {
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

  const itemLabelStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: '6.5pt',
    letterSpacing: '0.25em',
    wordSpacing: '0.6em',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    display: 'block',
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
      {/* Intro text */}
      <p
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '7.8pt',
          color: '#4A4A4A',
          fontStyle: 'italic',
          marginBottom: '1.5mm',
          lineHeight: 1.35,
        }}
      >
        To accept this quotation, please confirm in writing (WhatsApp/email) or sign below, and pay the advance.
      </p>

      {/* Acceptance Box */}
      <div
        style={{
          border: '0.25mm solid #E2E8F0',
          padding: '3.5mm 4mm',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={headingStyle}>
          ACCEPTANCE OF QUOTATION
        </div>

        <div className="flex items-stretch gap-[5mm] pt-[1.5mm] border-t border-[#F1F5F9]">
          {/* Column 1: Client Acceptance */}
          {showClientSignature && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span style={itemLabelStyle}>CLIENT ACCEPTANCE</span>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '8.5pt',
                    fontWeight: 600,
                    color: '#0E0E0E',
                    marginTop: '1mm',
                    marginBottom: 0,
                  }}
                >
                  {clientName || 'Client Name'}
                </p>
              </div>

              {/* Generous signature line (min 14mm) */}
              <div style={{ marginTop: '12mm', borderTop: '0.25mm solid #0E0E0E', paddingTop: '1mm' }}>
                <div
                  className="flex justify-between items-center text-[#6B6B6B]"
                  style={{ fontFamily: "'Poppins', sans-serif", fontSize: '6.5pt' }}
                >
                  <span>Authorized Signature</span>
                  <span>Date: _______________</span>
                </div>
              </div>
            </div>
          )}

          {/* Hairline Divider between Client and Agency */}
          {showClientSignature && (
            <div className="w-[0.25mm] bg-[#EAEAEA] self-stretch" />
          )}

          {/* Column 2: For DEVRIAN */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <span style={itemLabelStyle}>FOR DEVRIAN</span>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '8.5pt',
                  fontWeight: 600,
                  color: '#0E0E0E',
                  marginTop: '1mm',
                  marginBottom: 0,
                }}
              >
                Dev Rajpoot
              </p>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '7.5pt',
                  color: '#6B6B6B',
                  marginTop: '0.4mm',
                  marginBottom: 0,
                }}
              >
                Founder, DEVRIAN
              </p>
            </div>

            {/* Generous signature line (min 14mm) */}
            <div style={{ marginTop: '10mm', borderTop: '0.25mm solid #0E0E0E', paddingTop: '1mm' }}>
              <div
                className="flex justify-between items-center text-[#6B6B6B]"
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: '6.5pt' }}
              >
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
