import React from 'react';
import { formatDisplayDate } from '../../../services/dateUtils';
import { DocumentCustomText, DocumentSectionVisibility } from '../../../types';

interface QuotationClosingAndSignatureProps {
  documentNumber: string;
  date: string;
  validTill?: string;
  closingLine?: string;
  signatureUrl?: string;
  applySignature?: boolean;
  isFinal?: boolean;
  customText: DocumentCustomText;
  visibility: DocumentSectionVisibility;
}

export const QuotationClosingAndSignature: React.FC<QuotationClosingAndSignatureProps> = ({
  documentNumber,
  date,
  validTill,
  closingLine,
  signatureUrl,
  applySignature = false,
  isFinal = false,
  customText,
  visibility,
}) => {
  const formattedDate = formatDisplayDate(date);
  const formattedValidTill = validTill ? formatDisplayDate(validTill) : '';
  const showClosing = visibility.showClosingLine !== false;
  const showSignatory = visibility.showSignature !== false || applySignature;
  const canShowSignatureImage = Boolean(applySignature && isFinal && signatureUrl);

  const effectiveClosing =
    closingLine ||
    customText.closingLine ||
    'Thank you for considering DEVRIAN. We look forward to working with you.';

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
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '2.5mm',
        paddingBottom: '2mm',
      }}
    >
      <div className="flex justify-between items-end">
        {/* Left Side: Closing Line + Quotation Number & Dates */}
        <div className="flex flex-col justify-end text-left pb-[0.5mm]">
          {showClosing && (
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: '8pt',
                color: '#4A4A4A',
                lineHeight: 1.4,
                margin: '0 0 2.5mm 0',
                maxWidth: '95mm',
              }}
            >
              {effectiveClosing}
            </p>
          )}

          <div className="space-y-[3mm]">
            {/* Row 1: Document Number */}
            <div>
              <span style={labelStyle}>QUOTATION NO.</span>
              <span style={valueStyle} className="font-mono">
                {documentNumber || '—'}
              </span>
            </div>

            {/* Row 2: Date & Valid Till */}
            <div className="flex items-center gap-[7mm]">
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

        {/* Right Side: Dev Rajpoot signature & audit line */}
        {showSignatory && (
          <div className="flex flex-col items-end text-right">
            {canShowSignatureImage ? (
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
                  margin: 0,
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
                  marginBottom: 0,
                }}
              >
                {customText.signatureTitle || 'Founder, DEVRIAN'}
              </p>

              {/* Audit Line */}
              {visibility.showAuditLine !== false && (
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                    fontSize: '6.5pt',
                    color: '#8A8A8A',
                    marginTop: '1mm',
                    marginBottom: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Issued by DEVRIAN · Quotation {documentNumber} · {formattedDate}
                </p>
              )}

              {/* Disclaimer */}
              {visibility.showLegalDisclaimer !== false && (
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                    fontSize: '6pt',
                    color: '#999999',
                    marginTop: '0.5mm',
                    marginBottom: 0,
                    lineHeight: 1.1,
                  }}
                >
                  {customText.signatureDisclaimer ||
                    'Not valid for banking, cheque or legal-instrument purposes'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
