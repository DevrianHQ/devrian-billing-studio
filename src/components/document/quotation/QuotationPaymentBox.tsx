import React, { useState, useEffect } from 'react';
import { BusinessProfile, PaymentDetailRow } from '../../../types';
import { generateUpiQrDataUrl } from '../../../services/upiQr';
import { formatINR } from '../../../services/indianCurrency';

interface QuotationPaymentBoxProps {
  business: BusinessProfile;
  paymentRows?: PaymentDetailRow[];
  advanceAmount: number;
  quotationNumber: string;
  showQr?: boolean;
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
      return business.upiId || 'Devrian.official@gmail.com';
    }
    return row.value;
  }
  if (lbl.includes('bank')) {
    if (!row.value || row.value.includes('[Bank Name]') || row.value.includes('[Account Number]') || row.value.includes('[IFSC]')) {
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

export const QuotationPaymentBox: React.FC<QuotationPaymentBoxProps> = ({
  business,
  paymentRows,
  advanceAmount,
  quotationNumber,
  showQr = false,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  const activeRows = paymentRows?.filter((r) => r.enabled) || [];
  const upiRow = activeRows.find((r) => r.label.toLowerCase().includes('upi'));
  const bankRow = activeRows.find((r) => r.label.toLowerCase().includes('bank'));

  const effectiveUpiVal = upiRow ? getEffectivePaymentValue(upiRow, business) : (business.upiId || 'Devrian.official@gmail.com');
  const bankRawVal = bankRow ? getEffectivePaymentValue(bankRow, business) : '';
  const bankInfo = parseBankDetails(bankRawVal, business);

  const hasUpi = Boolean(upiRow ? upiRow.enabled : (business.showUpi ?? true));
  const hasBank = Boolean(bankRow ? bankRow.enabled : (business.showBankDetails ?? true));

  useEffect(() => {
    let mounted = true;
    if (showQr && effectiveUpiVal) {
      generateUpiQrDataUrl(effectiveUpiVal, advanceAmount, quotationNumber, 'DEVRIAN')
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
  }, [showQr, effectiveUpiVal, advanceAmount, quotationNumber]);

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

  return (
    <div
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '1.5mm',
        paddingBottom: '1.5mm',
      }}
    >
      <div
        style={{
          border: '0.25mm solid #E2E8F0',
          padding: '3.5mm 4mm',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={headingStyle}>
          PAYMENT DETAILS (FOR ADVANCE PAYMENT)
        </div>

        <div className="flex items-stretch gap-[5mm] pt-[1.5mm] border-t border-[#F1F5F9]">
          {/* Left Column: UPI */}
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
                    Scan to Pay Advance ({formatINR(advanceAmount)})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Hairline Divider between UPI and Bank Transfer */}
          {hasUpi && hasBank && (
            <div className="w-[0.25mm] bg-[#EAEAEA] self-stretch" />
          )}

          {/* Right Column: Bank Transfer */}
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
    </div>
  );
};
