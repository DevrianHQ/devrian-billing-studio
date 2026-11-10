import React, { useState, useEffect } from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { BusinessProfile } from '../../../types';
import { generateUpiQrDataUrl } from '../../../services/upiQr';
import { formatINR } from '../../../services/indianCurrency';

interface PaymentBoxProps {
  business: BusinessProfile;
  heading?: string;
  showQr?: boolean;
  amount?: number;
  quotationNumber?: string;
  isFullWidth?: boolean;
}

export const PaymentBox: React.FC<PaymentBoxProps> = ({
  business,
  heading = 'PAYMENT DETAILS',
  showQr = true,
  amount = 0,
  quotationNumber = '',
  isFullWidth = true,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const upiId = business.upiId || 'inquiry@devrian.in';
  const payeeName = 'Dev Rajpoot';
  const bankName = business.bankName || 'State Bank of India';
  const acNo = business.bankAccountNumber || '43691322780';
  const ifsc = business.bankIfsc || 'SBIN0031010';
  const acName = business.bankAccountName || 'Dev Rajpoot (DEVRIAN)';

  useEffect(() => {
    let isMounted = true;
    if (showQr && upiId && amount > 0) {
      generateUpiQrDataUrl(upiId, amount, quotationNumber, payeeName)
        .then((url) => {
          if (isMounted) setQrDataUrl(url);
        })
        .catch(() => {
          if (isMounted) setQrDataUrl(null);
        });
    } else {
      setQrDataUrl(null);
    }
    return () => {
      isMounted = false;
    };
  }, [showQr, upiId, payeeName, amount, quotationNumber]);

  return (
    <div
      data-section="quotation-payment-details"
      className="box-border select-none"
      style={{
        width: isFullWidth ? QUOTATION_TOKENS.layout.contentWidth : QUOTATION_TOKENS.layout.colWidth, // 174mm or 84mm
        boxSizing: 'border-box',
      }}
    >
      {/* Top Black Header Bar ("black patti jaise baki sabme hai") */}
      <div
        className="flex items-center gap-[5mm] w-full"
        style={{
          backgroundColor: QUOTATION_TOKENS.colors.black,
          paddingLeft: '4.5mm',
          paddingRight: '4.5mm',
          height: '7.5mm',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Header: PAYMENT DETAILS */}
        <div className="flex-1" style={{ minWidth: isFullWidth ? '60mm' : 'auto' }}>
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              fontSize: '7pt',
              fontWeight: 700,
              letterSpacing: '0.22em',
              wordSpacing: '0.5em',
              textTransform: 'uppercase',
              color: QUOTATION_TOKENS.colors.white,
              lineHeight: 1,
            }}
          >
            {heading}
          </span>
        </div>

        {/* Vertical Divider Hairline in Header */}
        <div
          style={{
            width: QUOTATION_TOKENS.layout.ruleThickness, // 0.2mm
            height: '4mm',
            backgroundColor: QUOTATION_TOKENS.colors.hairlineDark, // #2A2A2A
          }}
        />

        {/* Right Header: BANK TRANSFER */}
        <div className={isFullWidth ? 'flex-[1.5]' : 'flex-1'}>
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              fontSize: '7pt',
              fontWeight: 700,
              letterSpacing: '0.22em',
              wordSpacing: '0.5em',
              textTransform: 'uppercase',
              color: QUOTATION_TOKENS.colors.white,
              lineHeight: 1,
            }}
          >
            BANK TRANSFER
          </span>
        </div>
      </div>

      {/* Main Body with Light Gray Background ("niche ka gray me kar do") */}
      <div
        className="w-full"
        style={{
          backgroundColor: QUOTATION_TOKENS.colors.noteBackground,
          padding: '3.5mm 4.5mm',
          boxSizing: 'border-box',
        }}
      >
        <div className="flex items-stretch gap-[5mm]">
          {/* Left Column: PAY VIA UPI + QR */}
          <div className="flex-1 flex flex-col justify-between" style={{ minWidth: isFullWidth ? '60mm' : 'auto' }}>
            <div>
              <span
                style={{
                  fontFamily: QUOTATION_TOKENS.font.family,
                  fontSize: '6.8pt',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: QUOTATION_TOKENS.colors.greyMid,
                  display: 'block',
                  marginBottom: '0.8mm',
                  lineHeight: 1,
                }}
              >
                PAY VIA UPI
              </span>
              <p
                style={{
                  fontFamily: QUOTATION_TOKENS.font.family,
                  fontSize: '10pt',
                  fontWeight: 600,
                  color: QUOTATION_TOKENS.colors.black,
                  margin: 0,
                  lineHeight: 1.2,
                  ...QUOTATION_TOKENS.font.scale.numbers,
                }}
              >
                {upiId}
              </p>
            </div>

            {showQr && qrDataUrl && (
              <div className="flex items-center gap-2 mt-2">
                <div
                  style={{
                    width: '18mm',
                    height: '18mm',
                    border: `0.25mm solid ${QUOTATION_TOKENS.colors.boxBorder}`,
                    padding: '0.5mm',
                    backgroundColor: QUOTATION_TOKENS.colors.white,
                    boxSizing: 'border-box',
                  }}
                >
                  <img
                    src={qrDataUrl}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '6.8pt',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: QUOTATION_TOKENS.colors.greyLight,
                    lineHeight: 1.25,
                  }}
                >
                  Scan to Pay<br />
                  <strong style={{ color: QUOTATION_TOKENS.colors.black, fontSize: '7.5pt' }}>
                    {formatINR(amount)}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Vertical Divider Hairline */}
          <div
            style={{
              width: QUOTATION_TOKENS.layout.ruleThickness, // 0.2mm
              backgroundColor: QUOTATION_TOKENS.colors.rule, // #E5E5E5
              alignSelf: 'stretch',
            }}
          />

          {/* Right Column: BANK TRANSFER DETAILS (2x2 Structured Grid) */}
          <div className={isFullWidth ? 'flex-[1.5]' : 'flex-1'}>
            <div className="grid grid-cols-2 gap-x-[4mm] gap-y-[2.2mm]">
              {/* Account Name */}
              <div>
                <span
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '6.8pt',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    color: QUOTATION_TOKENS.colors.greyMid,
                    display: 'block',
                    marginBottom: '0.8mm',
                    lineHeight: 1,
                  }}
                >
                  Account Name
                </span>
                <span
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '9pt',
                    fontWeight: 600,
                    color: QUOTATION_TOKENS.colors.black,
                    display: 'block',
                    lineHeight: 1.2,
                  }}
                >
                  {acName}
                </span>
              </div>

              {/* Bank Name */}
              <div>
                <span
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '6.8pt',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    color: QUOTATION_TOKENS.colors.greyMid,
                    display: 'block',
                    marginBottom: '0.8mm',
                    lineHeight: 1,
                  }}
                >
                  Bank Name
                </span>
                <span
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '9pt',
                    fontWeight: 600,
                    color: QUOTATION_TOKENS.colors.black,
                    display: 'block',
                    lineHeight: 1.2,
                  }}
                >
                  {bankName}
                </span>
              </div>

              {/* Account Number */}
              <div>
                <span
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '6.8pt',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    color: QUOTATION_TOKENS.colors.greyMid,
                    display: 'block',
                    marginBottom: '0.8mm',
                    lineHeight: 1,
                  }}
                >
                  Account Number
                </span>
                <span
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '9.5pt',
                    fontWeight: 600,
                    color: QUOTATION_TOKENS.colors.black,
                    display: 'block',
                    lineHeight: 1.2,
                    ...QUOTATION_TOKENS.font.scale.numbers,
                  }}
                >
                  {acNo}
                </span>
              </div>

              {/* IFSC Code */}
              <div>
                <span
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '6.8pt',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    color: QUOTATION_TOKENS.colors.greyMid,
                    display: 'block',
                    marginBottom: '0.8mm',
                    lineHeight: 1,
                  }}
                >
                  IFSC Code
                </span>
                <span
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '9.5pt',
                    fontWeight: 600,
                    color: QUOTATION_TOKENS.colors.black,
                    display: 'block',
                    lineHeight: 1.2,
                    ...QUOTATION_TOKENS.font.scale.numbers,
                  }}
                >
                  {ifsc}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
