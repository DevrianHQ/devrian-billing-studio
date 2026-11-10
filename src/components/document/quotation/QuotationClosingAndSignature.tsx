import React from 'react';
import { formatDisplayDate } from '../../../services/dateUtils';
import { DocumentCustomText, DocumentSectionVisibility } from '../../../types';

interface QuotationClosingAndSignatureProps {
  documentNumber: string;
  date: string;
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
  closingLine,
  signatureUrl,
  applySignature = false,
  isFinal = false,
  customText,
  visibility,
}) => {
  const formattedDate = formatDisplayDate(date);
  const showClosing = visibility.showClosingLine !== false;
  const showSignatory = visibility.showSignature !== false || applySignature;
  const canShowSignatureImage = Boolean(applySignature && isFinal && signatureUrl);

  const effectiveClosing =
    closingLine ||
    customText.closingLine ||
    'Thank you for considering DEVRIAN. We look forward to working with you.';

  return (
    <div
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '1mm',
        paddingBottom: '2mm',
      }}
    >
      <div className="flex justify-between items-end">
        {/* Left: Closing line */}
        <div className="flex-1 pr-6 pb-[1mm]">
          {showClosing && (
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: '8.2pt',
                color: '#555555',
                lineHeight: 1.35,
                margin: 0,
              }}
            >
              {effectiveClosing}
            </p>
          )}
        </div>

        {/* Right: Signature block */}
        {showSignatory && (
          <div className="flex flex-col items-end shrink-0 text-right">
            {/* Signature Image */}
            <div
              style={{
                height: '11mm',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                marginBottom: '1mm',
              }}
            >
              {canShowSignatureImage ? (
                <img
                  src={signatureUrl}
                  alt="Dev Rajpoot Signature"
                  style={{
                    maxHeight: '10.5mm',
                    maxWidth: '38mm',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <div style={{ height: '7mm' }} />
              )}
            </div>

            {/* Dev Rajpoot & Founder info */}
            <div
              style={{
                borderTop: '0.25mm solid #0E0E0E',
                paddingTop: '1.2mm',
                minWidth: '45mm',
              }}
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
                {customText.signatureProprietor || 'Dev Rajpoot'}
              </p>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  fontSize: '7.8pt',
                  color: '#6B6B6B',
                  lineHeight: 1.2,
                  marginTop: '0.4mm',
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
                    fontSize: '6.2pt',
                    color: '#8A8A8A',
                    marginTop: '0.8mm',
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
                    fontSize: '5.5pt',
                    color: '#A1A1AA',
                    marginTop: '0.6mm',
                    marginBottom: 0,
                    lineHeight: 1.2,
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

