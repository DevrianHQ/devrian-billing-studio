import React from 'react';
import { DocumentType, GSTType, DocumentCustomText, DocumentSectionVisibility } from '../../types';
import { formatINR, numberToIndianWords } from '../../services/indianCurrency';

interface TotalsBlockProps {
  type: DocumentType;
  subtotal: number;
  discountAmount?: number;
  discountType?: 'flat' | 'percentage';
  discountValue?: number;
  gstEnabled?: boolean;
  gstRate?: number;
  gstType?: GSTType;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  advanceReceived?: number;
  totalProjectCost?: number;
  balanceDue: number;
  amountReceived?: number;
  advanceToStartWork?: number;
  customText: DocumentCustomText;
  visibility: DocumentSectionVisibility;
  accentColor?: string;
}

export const TotalsBlock: React.FC<TotalsBlockProps> = ({
  type,
  subtotal,
  discountAmount = 0,
  discountType = 'flat',
  discountValue = 0,
  gstEnabled = false,
  gstRate = 0,
  gstType = 'CGST_SGST',
  cgstAmount = 0,
  sgstAmount = 0,
  igstAmount = 0,
  advanceReceived = 0,
  totalProjectCost,
  balanceDue,
  amountReceived,
  customText,
  visibility,
  accentColor = '#0E0E0E',
}) => {
  const isReceipt = type === 'receipt';

  const rowStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 400,
    fontSize: '9pt',
    color: '#4A4A4A',
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '1.2mm',
    paddingBottom: '1.2mm',
    borderBottom: '0.2mm solid #E5E5E5',
    lineHeight: 1.3,
  };

  const keyFigureLabel = isReceipt
    ? customText.labelKeyFigure || 'AMOUNT RECEIVED'
    : customText.labelKeyFigure || 'BALANCE DUE';

  // For Receipts
  if (isReceipt) {
    const receivedAmt = amountReceived ?? advanceReceived;
    const projectTotal = totalProjectCost !== undefined && totalProjectCost > 0
      ? totalProjectCost
      : subtotal + (balanceDue || 0);
    const remainingAmt = totalProjectCost !== undefined && totalProjectCost > 0
      ? Math.max(0, totalProjectCost - receivedAmt)
      : balanceDue;

    return (
      <div
        className="w-full box-border"
        style={{
          paddingLeft: '18mm',
          paddingRight: '18mm',
          paddingTop: '1mm',
          paddingBottom: '1mm',
        }}
      >
        <div className="flex flex-col items-end">
          <div style={{ width: '88mm' }}>
            <div style={rowStyle}>
              <span>{customText.labelSubtotal || 'Total project cost'}</span>
              <span className="font-semibold text-[#0E0E0E] font-mono">{formatINR(projectTotal)}</span>
            </div>

            {visibility.showAdvance && (
              <div style={rowStyle}>
                <span>{customText.labelAdvanceReceived || 'Advance received'}</span>
                <span className="font-semibold text-[#0E0E0E] font-mono">{formatINR(receivedAmt)}</span>
              </div>
            )}

            <div style={{ ...rowStyle, fontWeight: 600, color: '#0E0E0E' }}>
              <span>{customText.labelBalanceDue || 'Balance remaining'}</span>
              <span className="font-mono">{formatINR(remainingAmt)}</span>
            </div>

            {/* Solid Black Bar: 11mm tall, spaced-caps white label left, bold 11pt amount right */}
            <div
              style={{
                backgroundColor: accentColor || '#0E0E0E',
                height: '11mm',
                marginTop: '1.5mm',
                paddingLeft: '4mm',
                paddingRight: '4mm',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#FFFFFF',
              }}
            >
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: '7.5pt',
                  letterSpacing: '0.25em',
                  wordSpacing: '0.7em',
                  textTransform: 'uppercase',
                }}
              >
                {keyFigureLabel}
              </span>
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  fontSize: '12pt',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatINR(receivedAmt)}
              </span>
            </div>

            {/* Amount in Words for Receipt */}
            <div className="mt-[1.5mm] text-right">
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  fontSize: '7.5pt',
                  color: '#6B6B6B',
                  fontStyle: 'italic',
                }}
              >
                {numberToIndianWords(receivedAmt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For Invoices
  return (
    <div
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '2mm',
        paddingBottom: '2mm',
      }}
    >
      <div className="flex flex-col items-end">
        <div style={{ width: '90mm' }}>
          {/* Subtotal */}
          <div style={rowStyle}>
            <span>{customText.labelSubtotal || 'Subtotal'}</span>
            <span className="font-semibold text-[#0E0E0E] font-mono">{formatINR(subtotal)}</span>
          </div>

          {/* Discount */}
          {visibility.showDiscount && discountAmount > 0 && (
            <div style={rowStyle}>
              <span>
                {customText.labelDiscount || 'Discount'} {discountType === 'percentage' ? `(${discountValue}%)` : ''}
              </span>
              <span className="font-semibold text-[#0E0E0E] font-mono">-{formatINR(discountAmount)}</span>
            </div>
          )}

          {/* GST Tax Breakdown */}
          {gstEnabled && gstRate > 0 && (
            <>
              {gstType === 'CGST_SGST' ? (
                <>
                  <div style={rowStyle}>
                    <span>CGST ({(gstRate / 2).toFixed(1)}%)</span>
                    <span className="font-semibold text-[#0E0E0E] font-mono">{formatINR(cgstAmount)}</span>
                  </div>
                  <div style={rowStyle}>
                    <span>SGST ({(gstRate / 2).toFixed(1)}%)</span>
                    <span className="font-semibold text-[#0E0E0E] font-mono">{formatINR(sgstAmount)}</span>
                  </div>
                </>
              ) : (
                <div style={rowStyle}>
                  <span>IGST ({gstRate}%)</span>
                  <span className="font-semibold text-[#0E0E0E] font-mono">{formatINR(igstAmount)}</span>
                </div>
              )}
            </>
          )}

          {/* Advance Received */}
          {visibility.showAdvance && advanceReceived > 0 && (
            <div style={rowStyle}>
              <span>{customText.labelAdvanceReceived || 'Advance Received'}</span>
              <span className="font-semibold text-[#0E0E0E] font-mono">-{formatINR(advanceReceived)}</span>
            </div>
          )}

          {/* Solid Black Bar: 11mm tall, spaced-caps white label left, bold 11pt amount right */}
          <div
            style={{
              backgroundColor: accentColor || '#0E0E0E',
              height: '11mm',
              marginTop: '1.5mm',
              paddingLeft: '4mm',
              paddingRight: '4mm',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#FFFFFF',
            }}
          >
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: '7.5pt',
                letterSpacing: '0.25em',
                wordSpacing: '0.7em',
                textTransform: 'uppercase',
              }}
            >
              {keyFigureLabel}
            </span>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: '12pt',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatINR(balanceDue)}
            </span>
          </div>

          {/* Optional Amount in Words */}
          {visibility.showAmountInWords && (
            <div className="mt-[1.5mm] text-right">
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  fontSize: '7.5pt',
                  color: '#6B6B6B',
                  fontStyle: 'italic',
                }}
              >
                {numberToIndianWords(balanceDue)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
