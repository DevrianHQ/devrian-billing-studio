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
  isFullWidth = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const upiId = business.upiId || 'inquiry@devrian.in';
  const payeeName = 'Dev Rajpoot';
  const bankName = business.bankName || 'HDFC Bank';
  const acNo = business.bankAccountNumber || '50100234567890';
  const ifsc = business.bankIfsc || 'HDFC0001234';
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
        ...QUOTATION_TOKENS.boxes.bordered,
        width: isFullWidth ? QUOTATION_TOKENS.layout.contentWidth : QUOTATION_TOKENS.layout.colWidth, // 174mm or 84mm
        height: isFullWidth ? '34mm' : '34mm',
        padding: QUOTATION_TOKENS.boxes.bordered.padding, // 4mm
      }}
    >
      <div className="flex items-start justify-between h-full">
        {/* Left: Heading and Details */}
        <div className="flex flex-col justify-between h-full flex-1 pr-2">
          {/* Heading without accent bar */}
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              ...QUOTATION_TOKENS.font.scale.sectionHeading,
              lineHeight: 1,
              marginBottom: '1.5mm',
            }}
          >
            {heading}
          </span>

          {/* Details */}
          <div className="space-y-[1.2mm]">
            {/* UPI Row */}
            <div>
              <span
                style={{
                  fontFamily: QUOTATION_TOKENS.font.family,
                  ...QUOTATION_TOKENS.font.scale.label,
                  display: 'block',
                }}
              >
                UPI
              </span>
              <p
                style={{
                  fontFamily: QUOTATION_TOKENS.font.family,
                  ...QUOTATION_TOKENS.font.scale.valueS,
                  margin: 0,
                  marginTop: '0.6mm',
                  lineHeight: 1.2,
                }}
              >
                {upiId}
              </p>
            </div>

            {/* Bank Transfer Row */}
            <div>
              <span
                style={{
                  fontFamily: QUOTATION_TOKENS.font.family,
                  ...QUOTATION_TOKENS.font.scale.label,
                  display: 'block',
                }}
              >
                BANK TRANSFER
              </span>
              <p
                style={{
                  fontFamily: QUOTATION_TOKENS.font.family,
                  fontSize: '7.5pt',
                  fontWeight: 500,
                  color: QUOTATION_TOKENS.colors.black,
                  margin: 0,
                  marginTop: '0.6mm',
                  lineHeight: 1.25,
                }}
              >
                A/c Name: {acName}
              </p>
              <p
                style={{
                  fontFamily: QUOTATION_TOKENS.font.family,
                  fontSize: '7.5pt',
                  fontWeight: 400,
                  color: QUOTATION_TOKENS.colors.greyDark,
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                Bank: {bankName} · A/c No.: {acNo} · IFSC: {ifsc}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Optional UPI QR 22x22mm with 0.25mm #E0E0E0 frame and SMALL caption below */}
        {showQr && qrDataUrl && (
          <div className="flex flex-col items-center shrink-0 self-center">
            <div
              style={{
                width: '22mm',
                height: '22mm',
                border: '0.25mm solid #E0E0E0',
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
                ...QUOTATION_TOKENS.font.scale.small,
                fontSize: '6.5pt',
                marginTop: '1mm',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              Scan to pay {formatINR(amount)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
