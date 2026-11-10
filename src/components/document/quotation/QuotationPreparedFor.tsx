import React from 'react';

interface QuotationPreparedForProps {
  clientName: string;
  projectName?: string;
  contactPerson?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientGstin?: string;
  customHeading?: string;
}

export const QuotationPreparedFor: React.FC<QuotationPreparedForProps> = ({
  clientName,
  projectName,
  contactPerson,
  clientAddress,
  clientPhone,
  clientEmail,
  clientGstin,
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
    marginBottom: '2mm',
    lineHeight: 1,
  };

  const nameStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
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
        paddingTop: '3.5mm',
        paddingBottom: '3.5mm',
        borderBottom: '0.2mm solid #E5E5E5',
      }}
    >
      <div className="max-w-[140mm]">
        <span style={labelStyle}>{customHeading}</span>
        <div className="space-y-[0.8mm]">
          <p style={nameStyle}>{clientName || 'Client Name'}</p>
          {projectName && (
            <p style={{ ...secondaryStyle, fontWeight: 500 }}>Project: {projectName}</p>
          )}
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
    </div>
  );
};
