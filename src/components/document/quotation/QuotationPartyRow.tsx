import React from 'react';

interface QuotationPartyRowProps {
  clientName: string;
  projectName?: string;
  contactPerson?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientGstin?: string;
  estimatedDelivery?: string;
  customHeading?: string;
}

export const QuotationPartyRow: React.FC<QuotationPartyRowProps> = ({
  clientName,
  projectName,
  contactPerson,
  clientAddress,
  clientPhone,
  clientEmail,
  clientGstin,
  estimatedDelivery,
  customHeading = 'PREPARED FOR',
}) => {
  const labelStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 400,
    fontSize: '6.5pt',
    letterSpacing: '0.3em',
    wordSpacing: '0.7em',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '1.5mm',
    lineHeight: 1,
  };

  const nameStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: '10.5pt',
    color: '#0E0E0E',
    lineHeight: 1.2,
  };

  const secondaryStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 400,
    fontSize: '8.5pt',
    color: '#262626',
    lineHeight: 1.35,
  };

  const emailStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 400,
    fontSize: '8pt',
    color: '#555555',
    lineHeight: 1.35,
  };

  return (
    <div
      className="w-full box-border bg-white"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '3mm',
        paddingBottom: '3mm',
        borderBottom: '0.2mm solid #E5E5E5',
      }}
    >
      <div className="grid grid-cols-2 gap-[8mm] items-start">
        {/* Left Column: PREPARED FOR */}
        <div>
          <span style={labelStyle}>{customHeading}</span>
          <div className="space-y-[0.8mm]">
            <p style={nameStyle}>{clientName || 'Client Name'}</p>
            {contactPerson && (
              <p style={secondaryStyle}>Attn: {contactPerson}</p>
            )}
            {clientAddress && (
              <p style={secondaryStyle} className="whitespace-pre-line">{clientAddress}</p>
            )}
            {(clientPhone || clientEmail) && (
              <p style={emailStyle}>
                {[clientPhone, clientEmail].filter(Boolean).join(' | ')}
              </p>
            )}
            {clientGstin && (
              <p style={secondaryStyle} className="font-mono text-[8pt]">
                GSTIN: {clientGstin}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: PROJECT & ESTIMATED DELIVERY */}
        <div>
          <span style={labelStyle}>PROJECT</span>
          <div className="space-y-[1.5mm]">
            <p style={nameStyle}>{projectName || 'General Project Scope'}</p>
            {estimatedDelivery && estimatedDelivery.trim() && (
              <div className="pt-[1mm]">
                <span style={{ ...labelStyle, marginBottom: '0.8mm' }}>ESTIMATED DELIVERY</span>
                <p style={{ ...secondaryStyle, fontWeight: 500, color: '#0E0E0E' }}>
                  {estimatedDelivery}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Backwards-compatible export alias
export const QuotationPreparedFor = QuotationPartyRow;

