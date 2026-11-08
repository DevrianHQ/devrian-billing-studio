import React from 'react';
import { DocumentType, BusinessProfile, DocumentCustomText } from '../../types';

interface PartyColumnsProps {
  type: DocumentType;
  business: BusinessProfile;
  customText: DocumentCustomText;
  clientName: string;
  projectName?: string;
  contactPerson?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientGstin?: string;
  gstEnabled?: boolean;
}

export const PartyColumns: React.FC<PartyColumnsProps> = ({
  type,
  business,
  customText,
  clientName,
  projectName,
  contactPerson,
  clientAddress,
  clientPhone,
  clientEmail,
  clientGstin,
  gstEnabled = false,
}) => {
  const isReceipt = type === 'receipt';
  const leftLabel = isReceipt ? 'RECEIVED BY' : 'BILLED BY';
  const rightLabel = customText.clientSectionHeading || (isReceipt ? 'RECEIVED FROM' : 'BILLED TO');

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
      {!isReceipt ? (
        /* Invoice: "Billed To" only, per DEVRIAN.docx section 4 */
        <div className="max-w-[140mm]">
          <span style={labelStyle}>{rightLabel}</span>
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
            {gstEnabled && clientGstin && (
              <p style={secondaryStyle} className="font-mono text-[8pt]">
                GSTIN: {clientGstin}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Receipt: 2 Columns ("Received By" & "Received From") per DEVRIAN_Payment_Receipt_001.pdf */
        <div className="grid grid-cols-2 gap-[10mm]">
          {/* Left Column: DEVRIAN Business Profile */}
          <div>
            <span style={labelStyle}>{leftLabel}</span>
            <div className="space-y-[0.8mm]">
              <p style={nameStyle}>{business.businessName || 'DEVRIAN'}</p>
              <p style={{ ...secondaryStyle, fontWeight: 500, color: '#111827' }}>
                {business.proprietor || 'Dev Rajpoot, Founder & CEO'}
              </p>
              {business.showAddress && (
                <p style={secondaryStyle}>{business.address || 'Mathura, Uttar Pradesh'}</p>
              )}
              {business.showPhone && business.phone && (
                <p style={secondaryStyle}>{business.phone}</p>
              )}
              {gstEnabled && business.businessGstin && (
                <p style={secondaryStyle} className="font-mono text-[8pt]">
                  GSTIN: {business.businessGstin}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Client Information */}
          <div>
            <span style={labelStyle}>{rightLabel}</span>
            <div className="space-y-[0.8mm]">
              <p style={nameStyle}>{clientName || 'Client Name'}</p>
              {projectName && (
                <p style={secondaryStyle}>Project: {projectName}</p>
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
              {gstEnabled && clientGstin && (
                <p style={secondaryStyle} className="font-mono text-[8pt]">
                  GSTIN: {clientGstin}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
