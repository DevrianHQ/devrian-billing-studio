import React, { useState, useEffect } from 'react';
import {
  BusinessProfile,
  DocumentCustomText,
  DocumentSectionVisibility,
  PaymentDetailRow,
  QuotationType,
} from '../../../types';
import { QuotationFinancials } from '../../../services/quotationLayoutEngine';
import { generateUpiQrDataUrl } from '../../../services/upiQr';
import { formatINR, numberToIndianWords } from '../../../services/indianCurrency';

interface QuotationBottomBlockProps {
  business: BusinessProfile;
  quotationType?: QuotationType;
  financials: QuotationFinancials;
  paymentRows?: PaymentDetailRow[];
  quotationNumber: string;
  showQr?: boolean;
  customText?: DocumentCustomText;
  visibility?: DocumentSectionVisibility;
  showMinimumCommitmentTotal?: boolean;
  gstEnabled?: boolean;
  gstRate?: number;
}

function parseBankDetails(value: string, business: BusinessProfile) {
  const acNameMatch = value.match(/A\/c\s*Name:\s*([^·\n]+)/i);
  const bankMatch = value.match(/Bank:\s*([^·\n]+)/i);
  const acNoMatch = value.match(/A\/c\s*No\.?:\s*([^·\n]+)/i);
  const ifscMatch = value.match(/IFSC:\s*([^·\n]+)/i);

  const acName = acNameMatch?.[1]?.trim() || business.bankAccountName || 'Dev Rajpoot (DEVRIAN)';
  const bankName = bankMatch?.[1]?.trim() || business.bankName || 'HDFC Bank';
  const acNo = acNoMatch?.[1]?.trim() || business.bankAccountNumber || '50100234567890';
  const ifsc = ifscMatch?.[1]?.trim() || business.bankIfsc || 'HDFC0001234';

  return { acName, bankName, acNo, ifsc };
}

function getEffectivePaymentValue(row: PaymentDetailRow, business: BusinessProfile): string {
  const lbl = row.label.toLowerCase();
  if (lbl.includes('upi')) {
    if (!row.value || row.value.trim() === '' || row.value === 'inquiry@devrian.in') {
      return business.upiId || 'inquiry@devrian.in';
    }
    return row.value;
  }
  if (lbl.includes('bank')) {
    if (
      !row.value ||
      row.value.includes('[Bank Name]') ||
      row.value.includes('[Account Number]') ||
      row.value.includes('[IFSC]')
    ) {
      const bankName = business.bankName || 'HDFC Bank';
      const acNo = business.bankAccountNumber || '50100234567890';
      const ifsc = business.bankIfsc || 'HDFC0001234';
      const acName = business.bankAccountName || 'Dev Rajpoot (DEVRIAN)';
      return `A/c Name: ${acName} · Bank: ${bankName} · A/c No.: ${acNo} · IFSC: ${ifsc}`;
    }
    return row.value;
  }
  return row.value;
}

export const QuotationBottomBlock: React.FC<QuotationBottomBlockProps> = ({
  business,
  quotationType = 'project',
  financials,
  paymentRows,
  quotationNumber,
  showQr = false,
  customText,
  visibility = {
    showDiscount: true,
    showAdvance: true,
    showGstLine: true,
    showPaymentDetails: true,
    showTermsAndNotes: true,
    showClosingLine: true,
    showSignature: true,
    showAuditLine: true,
    showLegalDisclaimer: true,
    showAmountInWords: false,
    showUpiQr: false,
    hideZeroRows: true,
  },
  showMinimumCommitmentTotal = true,
  gstEnabled = false,
  gstRate = 0,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  const activeRows = paymentRows?.filter((r) => r.enabled) || [];
  const upiRow = activeRows.find((r) => r.label.toLowerCase().includes('upi'));
  const bankRow = activeRows.find((r) => r.label.toLowerCase().includes('bank'));

  const effectiveUpiVal = upiRow
    ? getEffectivePaymentValue(upiRow, business)
    : business.upiId || 'inquiry@devrian.in';
  const bankRawVal = bankRow ? getEffectivePaymentValue(bankRow, business) : '';
  const bankInfo = parseBankDetails(bankRawVal, business);

  const hasUpi = Boolean(upiRow ? upiRow.enabled : (business.showUpi ?? true));
  const hasBank = Boolean(bankRow ? bankRow.enabled : (business.showBankDetails ?? true));

  // The QR code pays the amount due to start work
  const qrAmount = financials.dueToStart > 0 ? financials.dueToStart : financials.totalProjectCost;

  useEffect(() => {
    let mounted = true;
    if (showQr && effectiveUpiVal && qrAmount > 0) {
      generateUpiQrDataUrl(effectiveUpiVal, qrAmount, quotationNumber, business.businessName || 'DEVRIAN')
        .then((url) => {
          if (mounted) setQrUrl(url);
        })
        .catch(() => {
          if (mounted) setQrUrl('');
        });
    } else {
      setQrUrl('');
    }
    return () => {
      mounted = false;
    };
  }, [showQr, effectiveUpiVal, qrAmount, quotationNumber, business.businessName]);

  const isProject = quotationType === 'project';
  const isMonthlyOrHybrid = quotationType === 'monthly' || quotationType === 'hybrid';
  const hideZero = visibility.hideZeroRows ?? true;

  // Invoice-matching typography tokens
  const rowStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 400,
    fontSize: '8.8pt',
    color: '#4A4A4A',
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '1mm',
    paddingBottom: '1mm',
    borderBottom: '0.2mm solid #E5E5E5',
    lineHeight: 1.3,
  };

  const quietRowStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 400,
    fontSize: '7.8pt',
    color: '#64748B',
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '0.8mm',
    paddingBottom: '0.8mm',
    lineHeight: 1.3,
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: '7pt',
    letterSpacing: '0.25em',
    wordSpacing: '0.7em',
    color: '#0E0E0E',
    textTransform: 'uppercase',
    marginBottom: '1.5mm',
    lineHeight: 1,
  };

  const itemLabelStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 400,
    fontSize: '6.5pt',
    letterSpacing: '0.25em',
    wordSpacing: '0.7em',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    display: 'block',
    lineHeight: 1,
  };

  let keyFigureLabel = customText?.labelKeyFigure;
  if (!keyFigureLabel || (isMonthlyOrHybrid && keyFigureLabel === 'TOTAL')) {
    keyFigureLabel = isProject ? 'TOTAL' : 'DUE TO START';
  }

  const keyFigureAmount = isProject ? financials.totalProjectCost : financials.dueToStart;

  return (
    <div
      data-section="quotation-payment-summary"
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '1mm',
        paddingBottom: '1mm',
      }}
    >
      {/* Optional Italic GST line if GST is not applicable (matching Invoice order) */}
      {visibility.showGstLine && customText?.gstLine && !gstEnabled && (
        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: '7.5pt',
            color: '#4A4A4A',
            marginBottom: '1.5mm',
          }}
        >
          {customText.gstLine}
        </div>
      )}

      {/* ================= 1. SUMMARY / TOTALS TABLE (Right-aligned 90mm, exact Invoice layout) ================= */}
      <div className="flex flex-col items-end mb-[2.5mm]">
        <div style={{ width: '90mm' }}>
          {/* PROJECT SUMMARY */}
          {isProject && (
            <>
              {/* Subtotal */}
              <div style={rowStyle}>
                <span>{customText?.labelSubtotal || 'Subtotal'}</span>
                <span className="font-semibold text-[#0E0E0E] font-mono text-[8.8pt]">
                  {formatINR(financials.subtotal)}
                </span>
              </div>

              {/* Discount */}
              {visibility.showDiscount && (!hideZero || financials.discountAmount > 0) && (
                <div style={rowStyle}>
                  <span>Discount</span>
                  <span className="font-semibold text-emerald-700 font-mono text-[8.8pt]">
                    {financials.discountAmount > 0 ? `-${formatINR(financials.discountAmount)}` : '₹0'}
                  </span>
                </div>
              )}

              {/* GST lines if enabled */}
              {gstEnabled && (
                <>
                  {financials.cgstAmount > 0 && (
                    <div style={rowStyle}>
                      <span>CGST ({(gstRate / 2).toFixed(1)}%)</span>
                      <span className="font-semibold text-[#0E0E0E] font-mono">{formatINR(financials.cgstAmount)}</span>
                    </div>
                  )}
                  {financials.sgstAmount > 0 && (
                    <div style={rowStyle}>
                      <span>SGST ({(gstRate / 2).toFixed(1)}%)</span>
                      <span className="font-semibold text-[#0E0E0E] font-mono">{formatINR(financials.sgstAmount)}</span>
                    </div>
                  )}
                  {financials.igstAmount > 0 && (
                    <div style={rowStyle}>
                      <span>IGST ({gstRate}%)</span>
                      <span className="font-semibold text-[#0E0E0E] font-mono">{formatINR(financials.igstAmount)}</span>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* MONTHLY / HYBRID SUMMARY */}
          {isMonthlyOrHybrid && (
            <>
              {/* One-Time Setup (shown for Hybrid with setup items) */}
              {financials.oneTimeGross > 0 && (
                <div style={rowStyle}>
                  <span>One-Time Setup</span>
                  <span className="font-semibold text-[#0E0E0E] font-mono text-[8.8pt]">
                    {formatINR(financials.oneTimeGross)}
                  </span>
                </div>
              )}

              {/* Monthly Fee */}
              <div style={rowStyle}>
                <span>{financials.oneTimeGross > 0 ? 'First Month Retainer' : 'Monthly Retainer'}</span>
                <span className="font-semibold text-[#0E0E0E] font-mono text-[8.8pt]">
                  {formatINR(financials.monthlyGross)}
                </span>
              </div>

              {/* Discount if any */}
              {visibility.showDiscount && (!hideZero || financials.discountAmount > 0) && (
                <div style={rowStyle}>
                  <span>Discount</span>
                  <span className="font-semibold text-emerald-700 font-mono text-[8.8pt]">
                    {financials.discountAmount > 0 ? `-${formatINR(financials.discountAmount)}` : '₹0'}
                  </span>
                </div>
              )}

              {/* GST lines if enabled */}
              {gstEnabled && (
                <>
                  {financials.cgstAmount > 0 && (
                    <div style={rowStyle}>
                      <span>CGST ({(gstRate / 2).toFixed(1)}%)</span>
                      <span className="font-semibold text-[#0E0E0E] font-mono">{formatINR(financials.cgstAmount)}</span>
                    </div>
                  )}
                  {financials.sgstAmount > 0 && (
                    <div style={rowStyle}>
                      <span>SGST ({(gstRate / 2).toFixed(1)}%)</span>
                      <span className="font-semibold text-[#0E0E0E] font-mono">{formatINR(financials.sgstAmount)}</span>
                    </div>
                  )}
                  {financials.igstAmount > 0 && (
                    <div style={rowStyle}>
                      <span>IGST ({gstRate}%)</span>
                      <span className="font-semibold text-[#0E0E0E] font-mono">{formatINR(financials.igstAmount)}</span>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* SOLID BLACK TOTAL BAR (11mm height, width 90mm, exact Invoice geometry) */}
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
              boxSizing: 'border-box',
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
              {formatINR(keyFigureAmount)}
            </span>
          </div>

          {/* QUIET ROWS BELOW BLACK BAR */}
          {isProject && visibility.showAdvance && (
            <div className="pt-1 space-y-0.5">
              <div style={quietRowStyle}>
                <span>Advance to Start Work ({docAdvancePercent(financials, customText)}%)</span>
                <span className="font-medium text-[#0E0E0E] font-mono">
                  {formatINR(financials.advanceAmount)}
                </span>
              </div>
              <div style={quietRowStyle}>
                <span>Balance Payable (on approval)</span>
                <span className="font-medium text-[#0E0E0E] font-mono">
                  {formatINR(financials.balancePayable)}
                </span>
              </div>
            </div>
          )}

          {isMonthlyOrHybrid && (
            <div className="pt-1 space-y-0.5">
              <div style={quietRowStyle}>
                <span>From Month 2 onwards</span>
                <span className="font-medium text-[#0E0E0E] font-mono">
                  {formatINR(financials.monthlyTotal)} / month
                </span>
              </div>
              {showMinimumCommitmentTotal && financials.minTermMonths > 1 && (
                <div style={quietRowStyle}>
                  <span>Minimum commitment ({financials.minTermMonths} months)</span>
                  <span className="font-medium text-[#0E0E0E] font-mono">
                    {formatINR(financials.minimumCommitmentTotal)}
                  </span>
                </div>
              )}
            </div>
          )}

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
                {numberToIndianWords(keyFigureAmount)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ================= 2. PAYMENT DETAILS BOX (Full-width card, exact Invoice layout) ================= */}
      {visibility.showPaymentDetails && (hasUpi || hasBank) && (
        <div
          data-section="quotation-payment-details"
          style={{
            border: '0.25mm solid #E2E8F0',
            padding: '2.5mm 3.5mm',
            backgroundColor: '#FFFFFF',
            boxSizing: 'border-box',
          }}
        >
          <div style={headingStyle}>
            {customText?.paymentSectionHeading || 'PAYMENT DETAILS'}
          </div>

          <div className="flex items-stretch gap-[5mm] pt-[1.5mm] border-t border-[#F1F5F9]">
            {/* Left Column: PAY VIA UPI */}
            {hasUpi && (
              <div className="flex-1 space-y-[1.2mm]">
                <span style={itemLabelStyle}>PAY VIA UPI</span>
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    fontSize: '8.5pt',
                    color: '#0E0E0E',
                    lineHeight: 1.3,
                  }}
                  className="font-mono break-all"
                >
                  {effectiveUpiVal}
                </p>
                {showQr && qrUrl && (
                  <div className="pt-[1mm] flex items-center gap-2">
                    <img
                      src={qrUrl}
                      alt="UPI QR"
                      style={{ width: '18mm', height: '18mm', objectFit: 'contain' }}
                    />
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '5.5pt',
                        fontWeight: 600,
                        color: '#8A8A8A',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Scan to Pay
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Hairline Divider between UPI and Bank Transfer */}
            {hasUpi && hasBank && (
              <div className="w-[0.25mm] bg-[#EAEAEA] self-stretch" />
            )}

            {/* Right Column: BANK TRANSFER */}
            {hasBank && (
              <div className="flex-[1.4] space-y-[1.2mm]">
                <span style={itemLabelStyle}>BANK TRANSFER</span>
                <div className="grid grid-cols-2 gap-x-[4mm] gap-y-[1.5mm]">
                  <div>
                    <span className="text-[#8A8A8A] text-[6pt] block uppercase tracking-wider leading-none mb-[0.6mm]">
                      Account Name
                    </span>
                    <span className="font-semibold text-[#0E0E0E] text-[8pt] block leading-tight truncate">
                      {bankInfo.acName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8A8A8A] text-[6pt] block uppercase tracking-wider leading-none mb-[0.6mm]">
                      Bank Name
                    </span>
                    <span className="font-semibold text-[#0E0E0E] text-[8pt] block leading-tight truncate">
                      {bankInfo.bankName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8A8A8A] text-[6pt] block uppercase tracking-wider leading-none mb-[0.6mm]">
                      Account Number
                    </span>
                    <span className="font-mono font-semibold text-[#0E0E0E] text-[8pt] block leading-tight">
                      {bankInfo.acNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8A8A8A] text-[6pt] block uppercase tracking-wider leading-none mb-[0.6mm]">
                      IFSC Code
                    </span>
                    <span className="font-mono font-semibold text-[#0E0E0E] text-[8pt] block leading-tight">
                      {bankInfo.ifsc}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function docAdvancePercent(fin: QuotationFinancials, _customText?: DocumentCustomText): number {
  if (fin.totalProjectCost > 0) {
    return Math.round((fin.advanceAmount / fin.totalProjectCost) * 100);
  }
  return 50;
}
