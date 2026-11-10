import React from 'react';
import { GSTType, DocumentCustomText, DocumentSectionVisibility } from '../../../types';
import { formatINR, numberToIndianWords } from '../../../services/indianCurrency';

interface QuotationTotalsBlockProps {
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
  totalTaxAmount?: number;
  advanceAmount: number;
  advancePercent?: number;
  advanceType?: 'percentage' | 'flat';
  balancePayable: number;
  customText: DocumentCustomText;
  visibility: DocumentSectionVisibility;
}

export const QuotationTotalsBlock: React.FC<QuotationTotalsBlockProps> = ({
  subtotal,
  discountAmount = 0,
  discountType = 'percentage',
  discountValue = 0,
  gstEnabled = false,
  gstRate = 0,
  gstType = 'CGST_SGST',
  cgstAmount = 0,
  sgstAmount = 0,
  igstAmount = 0,
  totalTaxAmount = 0,
  advanceAmount,
  advancePercent = 50,
  advanceType = 'percentage',
  balancePayable,
  customText,
  visibility,
}) => {
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

  const netTaxable = Math.max(0, subtotal - discountAmount);
  const totalWithTax = netTaxable + (gstEnabled ? totalTaxAmount : 0);

  // Label for advance: show percentage if type is percentage
  const advanceLabel =
    advanceType === 'percentage'
      ? `${customText.labelAdvanceToStart || 'Advance to Start Work'} (${advancePercent}%)`
      : customText.labelAdvanceToStart || 'Advance to Start Work';

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

          {/* Discount (if enabled and > 0) */}
          {visibility.showDiscount && discountAmount > 0 && (
            <div style={rowStyle}>
              <span>
                {customText.labelDiscount || 'Discount'} {discountType === 'percentage' && discountValue > 0 ? `(${discountValue}%)` : ''}
              </span>
              <span className="font-semibold text-[#0E0E0E] font-mono">-{formatINR(discountAmount)}</span>
            </div>
          )}

          {/* GST breakdown if GST is enabled */}
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

          {/* TOTAL BAR: Solid black full-width bar with white text matching TotalsBlock */}
          <div
            style={{
              backgroundColor: '#0E0E0E',
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
              TOTAL
            </span>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: '12pt',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatINR(totalWithTax)}
            </span>
          </div>

          {/* Advance to Start Work (default 50%, editable) */}
          {visibility.showAdvance && (
            <div style={rowStyle}>
              <span className="text-[#262626] font-medium">{advanceLabel}</span>
              <span className="font-semibold text-[#0E0E0E] font-mono">{formatINR(advanceAmount)}</span>
            </div>
          )}

          {/* Balance Payable */}
          <div style={{ ...rowStyle, borderBottom: 'none', fontWeight: 600 }}>
            <span className="text-[#0E0E0E]">{customText.labelBalanceDue || 'Balance Payable'}</span>
            <span className="font-bold text-[#0E0E0E] font-mono text-[9.5pt]">{formatINR(balancePayable)}</span>
          </div>
        </div>

        {/* GST Notice (Italic) */}
        {visibility.showGstLine && (
          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: '7.5pt',
              color: '#4A4A4A',
              marginTop: '1.5mm',
              textAlign: 'right',
            }}
          >
            {gstEnabled
              ? `GST registered (${gstRate}% tax included above).`
              : (customText.gstLine || 'GST: Not applicable (not registered under GST).')}
          </p>
        )}

        {/* Amount In Words (if enabled) */}
        {visibility.showAmountInWords && totalWithTax > 0 && (
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
              {numberToIndianWords(totalWithTax)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
