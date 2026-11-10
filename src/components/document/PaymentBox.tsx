import React, { useState, useEffect } from 'react';
import { DocumentType, BusinessProfile, PaymentDetailRow, DocumentCustomText, DocumentSectionVisibility } from '../../types';
import { generateUpiQrDataUrl } from '../../services/upiQr';

interface PaymentBoxProps {
  type: DocumentType;
  business: BusinessProfile;
  paymentDetails: {
    dateTime?: string;
    mode?: string;
    transactionId?: string;
    utrNo?: string;
    showBankOnDoc?: boolean;
    showUpiOnDoc?: boolean;
    showQrOnDoc?: boolean;
  };
  paymentRows?: PaymentDetailRow[];
  balanceAmount?: number;
  documentNumber: string;
  customText: DocumentCustomText;
  visibility: DocumentSectionVisibility;
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
    if (!row.value || row.value.includes('[Bank Name]') || row.value.includes('[Account Number]') || row.value.includes('[IFSC]')) {
      const bankName = business.bankName || '[Bank Name]';
      const acNo = business.bankAccountNumber || '[Account Number]';
      const ifsc = business.bankIfsc || '[IFSC]';
      const acName = business.bankAccountName || 'Dev Rajpoot (DEVRIAN)';
      return `A/c Name: ${acName} · Bank: ${bankName} · A/c No.: ${acNo} · IFSC: ${ifsc}`;
    }
    return row.value;
  }
  return row.value;
}

export const PaymentBox: React.FC<PaymentBoxProps> = ({
  type,
  business,
  paymentDetails,
  paymentRows,
  balanceAmount = 0,
  documentNumber,
  customText,
  visibility,
}) => {
  const isReceipt = type === 'receipt';
  const [qrUrl, setQrUrl] = useState<string>('');

  if (!visibility.showPaymentDetails) {
    return null;
  }

  const showQr = visibility.showUpiQr || paymentDetails.showQrOnDoc || business.showUpiQr;

  useEffect(() => {
    if (showQr && business.upiId) {
      generateUpiQrDataUrl(business.upiId, balanceAmount, documentNumber, business.businessName)
        .then((url) => setQrUrl(url))
        .catch(() => setQrUrl(''));
    } else {
      setQrUrl('');
    }
  }, [showQr, business.upiId, balanceAmount, documentNumber, business.businessName]);

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

  const itemValueStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: '8.5pt',
    color: '#0E0E0E',
    display: 'block',
    marginTop: '0.8mm',
    lineHeight: 1.25,
  };

  // For Receipts: 2x2 grid of Date & Time, Payment Mode, Transaction ID, UTR
  if (isReceipt) {
    const dateTimeVal = paymentRows?.find(r => r.label.toLowerCase().includes('date'))?.value || paymentDetails.dateTime || '05 Nov 2026, 01:39 PM';
    const modeVal = paymentRows?.find(r => r.label.toLowerCase().includes('mode'))?.value || paymentDetails.mode || 'UPI (PhonePe)';
    const txIdVal = paymentRows?.find(r => r.label.toLowerCase().includes('transaction'))?.value || paymentDetails.transactionId;
    const utrVal = paymentRows?.find(r => r.label.toLowerCase().includes('utr'))?.value || paymentDetails.utrNo;

    const otherRows = (paymentRows || []).filter(
      r => r.enabled && !['date', 'mode', 'transaction', 'utr'].some(k => r.label.toLowerCase().includes(k))
    );

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
        <div className="w-full box-border select-none">
          {/* Top Black Header */}
          <div
            style={{
              backgroundColor: '#0E0E0E',
              paddingLeft: '4.5mm',
              paddingRight: '4.5mm',
              height: '7.5mm',
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '7pt',
                fontWeight: 700,
                letterSpacing: '0.22em',
                wordSpacing: '0.5em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                lineHeight: 1,
              }}
            >
              {customText.paymentSectionHeading || 'PAYMENT DETAILS'}
            </span>
          </div>

          {/* Gray Body */}
          <div
            className="w-full"
            style={{
              backgroundColor: '#F0F0F0',
              padding: '3.5mm 4.5mm',
              boxSizing: 'border-box',
            }}
          >
            <div className="grid grid-cols-2 gap-x-[8mm] gap-y-[2.2mm]">
              <div>
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '6.8pt',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    color: '#6B6B6B',
                    display: 'block',
                    marginBottom: '0.8mm',
                    lineHeight: 1,
                  }}
                >
                  Date &amp; Time
                </span>
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '9pt',
                    fontWeight: 600,
                    color: '#0E0E0E',
                    display: 'block',
                    lineHeight: 1.2,
                  }}
                >
                  {dateTimeVal}
                </span>
              </div>

              <div>
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '6.8pt',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    color: '#6B6B6B',
                    display: 'block',
                    marginBottom: '0.8mm',
                    lineHeight: 1,
                  }}
                >
                  Payment Mode
                </span>
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '9pt',
                    fontWeight: 600,
                    color: '#0E0E0E',
                    display: 'block',
                    lineHeight: 1.2,
                  }}
                >
                  {modeVal}
                </span>
              </div>

              {txIdVal && (
                <div>
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '6.8pt',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.16em',
                      color: '#6B6B6B',
                      display: 'block',
                      marginBottom: '0.8mm',
                      lineHeight: 1,
                    }}
                  >
                    Transaction ID
                  </span>
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '9pt',
                      fontWeight: 600,
                      color: '#0E0E0E',
                      display: 'block',
                      lineHeight: 1.2,
                    }}
                    className="font-mono break-all"
                  >
                    {txIdVal}
                  </span>
                </div>
              )}

              {utrVal && (
                <div>
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '6.8pt',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.16em',
                      color: '#6B6B6B',
                      display: 'block',
                      marginBottom: '0.8mm',
                      lineHeight: 1,
                    }}
                  >
                    UTR Number
                  </span>
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '9.5pt',
                      fontWeight: 600,
                      color: '#0E0E0E',
                      display: 'block',
                      lineHeight: 1.2,
                    }}
                    className="font-mono"
                  >
                    {utrVal}
                  </span>
                </div>
              )}

              {otherRows.map((r) => (
                <div key={r.id}>
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '6.8pt',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.16em',
                      color: '#6B6B6B',
                      display: 'block',
                      marginBottom: '0.8mm',
                      lineHeight: 1,
                    }}
                  >
                    {r.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '9pt',
                      fontWeight: 600,
                      color: '#0E0E0E',
                      display: 'block',
                      lineHeight: 1.2,
                    }}
                  >
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For Invoices: Balanced side-by-side card layout (UPI on Left, Bank Transfer on Right)
  const activeRows = paymentRows?.filter((r) => r.enabled);
  const upiRow = activeRows?.find((r) => r.label.toLowerCase().includes('upi'));
  const bankRow = activeRows?.find((r) => r.label.toLowerCase().includes('bank'));
  const otherActiveRows = activeRows?.filter(
    (r) => !r.label.toLowerCase().includes('upi') && !r.label.toLowerCase().includes('bank')
  ) || [];

  const effectiveUpiVal = upiRow ? getEffectivePaymentValue(upiRow, business) : (business.upiId || 'inquiry@devrian.in');
  const bankRawVal = bankRow ? getEffectivePaymentValue(bankRow, business) : '';
  const bankInfo = parseBankDetails(bankRawVal, business);

  const hasUpi = Boolean(upiRow ? upiRow.enabled : (business.showUpi ?? true));
  const hasBank = Boolean(bankRow ? bankRow.enabled : (business.showBankDetails ?? true));

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
      {/* Italic GST line if GST not applicable (DEVRIAN.docx section order) */}
      {visibility.showGstLine && customText.gstLine && (
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

      <div className="w-full box-border select-none">
        {/* Top Black Header */}
        <div
          className="flex items-center gap-[5mm] w-full"
          style={{
            backgroundColor: '#0E0E0E',
            paddingLeft: '4.5mm',
            paddingRight: '4.5mm',
            height: '7.5mm',
            boxSizing: 'border-box',
          }}
        >
          {/* Left Header */}
          <div className="flex-1" style={{ minWidth: '60mm' }}>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '7pt',
                fontWeight: 700,
                letterSpacing: '0.22em',
                wordSpacing: '0.5em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                lineHeight: 1,
              }}
            >
              {customText.paymentSectionHeading || 'PAYMENT DETAILS'}
            </span>
          </div>

          {hasBank && (
            <>
              <div
                style={{
                  width: '0.2mm',
                  height: '4mm',
                  backgroundColor: '#2A2A2A',
                }}
              />
              <div className="flex-[1.5]">
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '7pt',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    wordSpacing: '0.5em',
                    textTransform: 'uppercase',
                    color: '#FFFFFF',
                    lineHeight: 1,
                  }}
                >
                  BANK TRANSFER
                </span>
              </div>
            </>
          )}
        </div>

        {/* Gray Body */}
        <div
          className="w-full"
          style={{
            backgroundColor: '#F0F0F0',
            padding: '3.5mm 4.5mm',
            boxSizing: 'border-box',
          }}
        >
          <div className="flex items-stretch gap-[5mm]">
            {/* Left Column: UPI */}
            {hasUpi && (
              <div className="flex-1 flex flex-col justify-between" style={{ minWidth: '60mm' }}>
                <div>
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '6.8pt',
                      fontWeight: 600,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: '#6B6B6B',
                      display: 'block',
                      marginBottom: '0.8mm',
                      lineHeight: 1,
                    }}
                  >
                    PAY VIA UPI
                  </span>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      fontSize: '10pt',
                      color: '#0E0E0E',
                      lineHeight: 1.2,
                      margin: 0,
                    }}
                    className="font-mono break-all"
                  >
                    {effectiveUpiVal}
                  </p>
                </div>
                {showQr && qrUrl && (
                  <div className="pt-[1.5mm] flex items-center gap-2">
                    <div
                      style={{
                        width: '18mm',
                        height: '18mm',
                        border: '0.25mm solid #E0E0E0',
                        padding: '0.5mm',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box',
                      }}
                    >
                      <img
                        src={qrUrl}
                        alt="UPI QR"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '6.8pt',
                        fontWeight: 600,
                        color: '#8A8A8A',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        lineHeight: 1.2,
                      }}
                    >
                      Scan to Pay
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Divider between UPI and Bank Transfer */}
            {hasUpi && hasBank && (
              <div
                style={{
                  width: '0.2mm',
                  backgroundColor: '#E5E5E5',
                  alignSelf: 'stretch',
                }}
              />
            )}

            {/* Right Column: Bank Transfer */}
            {hasBank && (
              <div className="flex-[1.5]">
                <div className="grid grid-cols-2 gap-x-[4mm] gap-y-[2.2mm]">
                  <div>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '6.8pt',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                        color: '#6B6B6B',
                        display: 'block',
                        marginBottom: '0.8mm',
                        lineHeight: 1,
                      }}
                    >
                      Account Name
                    </span>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '9pt',
                        fontWeight: 600,
                        color: '#0E0E0E',
                        display: 'block',
                        lineHeight: 1.2,
                      }}
                      className="truncate"
                    >
                      {bankInfo.acName}
                    </span>
                  </div>

                  <div>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '6.8pt',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                        color: '#6B6B6B',
                        display: 'block',
                        marginBottom: '0.8mm',
                        lineHeight: 1,
                      }}
                    >
                      Bank Name
                    </span>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '9pt',
                        fontWeight: 600,
                        color: '#0E0E0E',
                        display: 'block',
                        lineHeight: 1.2,
                      }}
                      className="truncate"
                    >
                      {bankInfo.bankName}
                    </span>
                  </div>

                  <div>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '6.8pt',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                        color: '#6B6B6B',
                        display: 'block',
                        marginBottom: '0.8mm',
                        lineHeight: 1,
                      }}
                    >
                      Account Number
                    </span>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '9.5pt',
                        fontWeight: 600,
                        color: '#0E0E0E',
                        display: 'block',
                        lineHeight: 1.2,
                      }}
                      className="font-mono"
                    >
                      {bankInfo.acNo}
                    </span>
                  </div>

                  <div>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '6.8pt',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                        color: '#6B6B6B',
                        display: 'block',
                        marginBottom: '0.8mm',
                        lineHeight: 1,
                      }}
                    >
                      IFSC Code
                    </span>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '9.5pt',
                        fontWeight: 600,
                        color: '#0E0E0E',
                        display: 'block',
                        lineHeight: 1.2,
                      }}
                      className="font-mono"
                    >
                      {bankInfo.ifsc}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Custom rows if any */}
          {otherActiveRows.length > 0 && (
            <div
              className="mt-2 pt-2 grid grid-cols-2 gap-2"
              style={{ borderTop: '0.2mm solid #E5E5E5' }}
            >
              {otherActiveRows.map((r) => (
                <div key={r.id}>
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '6.8pt',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.16em',
                      color: '#6B6B6B',
                      display: 'block',
                      marginBottom: '0.6mm',
                    }}
                  >
                    {r.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '9pt',
                      fontWeight: 600,
                      color: '#0E0E0E',
                      display: 'block',
                    }}
                  >
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
