import React from 'react';

interface QuotationPreparedForProps {
  clientName: string;
  contactPerson?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientGstin?: string;
  customHeading?: string;
}

export const QuotationPreparedFor: React.FC<QuotationPreparedForProps> = ({
  clientName,
  contactPerson,
  clientAddress,
  clientPhone,
  clientEmail,
  clientGstin,
  customHeading = 'PREPARED FOR',
}) => {
  const labelStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    fontSize: '6.5pt',
    letterSpacing: '0.28em',
    wordSpacing: '0.6em',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '1.8mm',
    lineHeight: 1,
  };

  const nameStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: '11pt',
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

  const contactStyle: React.CSSProperties = {
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
        paddingTop: '3.5mm',
        paddingBottom: '3.5mm',
        borderBottom: '0.2mm solid #E5E5E5',
      }}
    >
      <div className="max-w-[150mm]">
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
            <p style={contactStyle}>
              {[clientPhone, clientEmail].filter(Boolean).join(' | ')}
            </p>
          )}
          {clientGstin && (
            <p style={contactStyle}>
              GSTIN: {clientGstin}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
