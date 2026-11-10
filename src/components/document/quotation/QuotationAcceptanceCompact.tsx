import React from 'react';
import { formatDisplayDate } from '../../../services/dateUtils';
import { DocumentCustomText } from '../../../types';

interface QuotationAcceptanceCompactProps {
  clientName?: string;
  documentNumber: string;
  date: string;
  validTill?: string;
  closingLine?: string;
  signatureUrl?: string;
  applySignature?: boolean;
  isFinal?: boolean;
  showClientSignature?: boolean;
  showAuditLine?: boolean;
  showLegalDisclaimer?: boolean;
  customText?: DocumentCustomText;
}

export const QuotationAcceptanceCompact: React.FC<QuotationAcceptanceCompactProps> = ({
  clientName = '',
  documentNumber,
  date,
  validTill,
  closingLine,
  signatureUrl,
  applySignature = false,
  isFinal = false,
  showClientSignature = true,
  showAuditLine = true,
  showLegalDisclaimer = true,
  customText,
}) => {
  const formattedDate = formatDisplayDate(date);
  const formattedValidTill = validTill ? formatDisplayDate(validTill) : '';
  const canShowSignatureImage = Boolean(applySignature && isFinal && signatureUrl);

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    fontSize: '6.5pt',
    letterSpacing: '0.25em',
    wordSpacing: '0.5em',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    display: 'block',
    lineHeight: 1,
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: '9.5pt',
    color: '#0E0E0E',
    display: 'block',
    marginTop: '1.2mm',
    lineHeight: 1.25,
  };

  return (
    <div
      data-section="quotation-acceptance"
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '2mm',
        paddingBottom: '2mm',
      }}
    >
      {/* Intro Acceptance Text */}
      <p
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '7.5pt',
          color: '#4A4A4A',
          fontStyle: 'italic',
          marginBottom: '2.5mm',
          lineHeight: 1.3,
        }}
      >
        To accept, confirm in writing (WhatsApp/email) or sign below, and pay the amount due to start.
      </p>

      {/* Structured Bottom Row: Document Meta (Left) | Client Acceptance (Middle) | Devrian Signatory (Right) */}
      <div className="flex justify-between items-end gap-[6mm]">
        {/* Column 1: Document Meta (Left) - Exactly like Invoice's left signature block */}
        <div className="flex flex-col justify-end text-left pb-[0.5mm] shrink-0">
          <div className="space-y-[2.8mm]">
            {/* Quotation No. */}
            <div>
              <span style={labelStyle}>QUOTATION NO.</span>
              <span style={valueStyle} className="font-mono">
                {documentNumber || '—'}
              </span>
            </div>

            {/* Quotation Date & Valid Till */}
            <div className="flex items-center gap-[6mm]">
              <div>
                <span style={labelStyle}>QUOTATION DATE</span>
                <span style={valueStyle}>{formattedDate || '—'}</span>
              </div>

              {formattedValidTill && (
                <div>
                  <span style={labelStyle}>VALID TILL</span>
                  <span style={valueStyle}>{formattedValidTill}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Client Acceptance (Middle) - shown if showClientSignature is true */}
        {showClientSignature ? (
          <div className="flex-1 flex flex-col justify-end max-w-[55mm] pb-[0.5mm]">
            <span style={labelStyle}>CLIENT ACCEPTANCE</span>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '8.5pt',
                fontWeight: 600,
                color: '#0E0E0E',
                marginTop: '1.2mm',
                marginBottom: '5mm',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {clientName || 'Client Name'}
            </p>
            <div style={{ borderTop: '0.25mm solid #0E0E0E', paddingTop: '1.2mm' }}>
              <div
                className="flex justify-between items-center text-[#6B6B6B]"
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: '6pt' }}
              >
                <span>Authorized Signature</span>
                <span>Date: ____________</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Column 3: For DEVRIAN / Signatory (Right) - Exactly like Invoice's right signature block */}
        <div className="flex flex-col items-end text-right shrink-0">
          {canShowSignatureImage ? (
            <div
              className="flex items-end justify-end mb-1"
              style={{ height: '14mm' }}
            >
              <img
                src={signatureUrl}
                alt="Dev Rajpoot Signature"
                style={{
                  maxHeight: '14mm',
                  maxWidth: '50mm',
                  objectFit: 'contain',
                }}
              />
            </div>
          ) : (
            <div style={{ height: '6mm' }} />
          )}

          <div
            style={{
              borderTop: '0.25mm solid #0E0E0E',
              paddingTop: '1.5mm',
              minWidth: '50mm',
            }}
            className="text-right"
          >
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: '10pt',
                color: '#0E0E0E',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {customText?.signatureProprietor || 'Dev Rajpoot'}
            </p>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                fontSize: '7.5pt',
                color: '#6B6B6B',
                lineHeight: 1.2,
                marginTop: '0.5mm',
                marginBottom: 0,
              }}
            >
              {customText?.signatureTitle || 'Founder, DEVRIAN'}
            </p>

            {/* Audit Line */}
            {showAuditLine && (
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  fontSize: '6.2pt',
                  color: '#8A8A8A',
                  marginTop: '1mm',
                  marginBottom: 0,
                  lineHeight: 1.2,
                }}
              >
                Issued by DEVRIAN · Quotation {documentNumber} · {formattedDate}
              </p>
            )}

            {/* Non-Banking Legal Disclaimer */}
            {showLegalDisclaimer && (
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  fontSize: '5.8pt',
                  color: '#999999',
                  marginTop: '0.5mm',
                  marginBottom: 0,
                  lineHeight: 1.1,
                }}
              >
                {customText?.signatureDisclaimer ||
                  'Not valid for banking, cheque or legal-instrument purposes'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


