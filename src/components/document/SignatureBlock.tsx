import React from 'react';
import { DocumentType, DocumentCustomText, DocumentSectionVisibility } from '../../types';
import { formatDisplayDate } from '../../services/dateUtils';

interface SignatureBlockProps {
  type: DocumentType;
  documentNumber: string;
  date: string;
  dueDate?: string;
  signatureUrl?: string;
  applySignature?: boolean;
  customText: DocumentCustomText;
  visibility: DocumentSectionVisibility;
}

export const SignatureBlock: React.FC<SignatureBlockProps> = ({
  type,
  documentNumber,
  date,
  dueDate,
  signatureUrl,
  applySignature = false,
  customText,
  visibility,
}) => {
  const isInvoice = type === 'invoice';
  const isReceipt = type === 'receipt';
  const isQuotation = type === 'quotation';
  const typeLabel = isInvoice ? 'Invoice' : isReceipt ? 'Payment Receipt' : 'Quotation';
  const formattedDate = formatDisplayDate(date);
  const formattedDueDate = dueDate ? formatDisplayDate(dueDate) : '';

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

  // Right-side signatory block is shown if visibility.showSignature or applySignature is enabled (default true)
  const showRightSignatory = visibility.showSignature !== false || applySignature;

  return (
    <div
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '2.5mm',
        paddingBottom: '2mm',
      }}
    >
      <div className="flex justify-between items-end">
        {/* Left Side: Document Number & Date (and Due Date for Invoice) */}
        <div className="flex flex-col justify-end text-left pb-[0.5mm]">
          <div className="space-y-[3mm]">
            {/* Row 1: Document Number */}
            <div>
              <span style={labelStyle}>
                {isInvoice ? 'INVOICE NO.' : 'RECEIPT NO.'}
              </span>
              <span style={valueStyle} className="font-mono">
                {documentNumber || '—'}
              </span>
            </div>

            {/* Row 2: Date (and Due Date if Invoice) */}
            <div className="flex items-center gap-[7mm]">
              <div>
                <span style={labelStyle}>
                  {isInvoice ? 'INVOICE DATE' : 'DATE'}
                </span>
                <span style={valueStyle}>
                  {formattedDate || '—'}
                </span>
              </div>

              {isInvoice && formattedDueDate && (
                <div>
                  <span style={labelStyle}>
                    DUE DATE
                  </span>
                  <span style={valueStyle}>
                    {formattedDueDate}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Proprietor / Signature Block */}
        {showRightSignatory ? (
          <div className="flex flex-col items-end text-right">
            {applySignature && signatureUrl ? (
              <div
                className="flex items-end justify-end mb-1"
                style={{ height: '16mm' }}
              >
                <img
                  src={signatureUrl}
                  alt="Dev Rajpoot Signature"
                  style={{
                    maxHeight: '16mm',
                    maxWidth: '55mm',
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
                  fontSize: '10.5pt',
                  color: '#0E0E0E',
                  lineHeight: 1.2,
                }}
              >
                {customText.signatureProprietor || 'Dev Rajpoot'}
              </p>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  fontSize: '8pt',
                  color: '#6B6B6B',
                  lineHeight: 1.2,
                  marginTop: '0.5mm',
                }}
              >
                {customText.signatureTitle || 'Founder, DEVRIAN'}
              </p>

              {/* Document Isolation Audit Line */}
              {visibility.showAuditLine && (
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                    fontSize: '6.5pt',
                    color: '#8A8A8A',
                    marginTop: '1mm',
                    lineHeight: 1.2,
                  }}
                >
                  Issued by DEVRIAN · {typeLabel} {documentNumber} · {formattedDate}
                </p>
              )}

              {/* Safety Non-Banking Disclaimer */}
              {visibility.showLegalDisclaimer && (
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                    fontSize: '6pt',
                    color: '#999999',
                    marginTop: '0.5mm',
                    lineHeight: 1.1,
                  }}
                >
                  {customText.signatureDisclaimer || 'Not valid for banking, cheque or legal-instrument purposes'}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};
