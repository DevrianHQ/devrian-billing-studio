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

export const QuotationPaymentBox: React.FC<QuotationPaymentBoxProps> = ({
  business,
  paymentRows,
  advanceAmount,
  quotationNumber,
  showQr = false,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  const upiId = business.upiId || 'Devrian.official@gmail.com';

  useEffect(() => {
    let mounted = true;
    if (showQr && upiId) {
      generateUpiQrDataUrl(upiId, advanceAmount, quotationNumber, 'DEVRIAN').then((url) => {
        if (mounted) setQrUrl(url);
      });
    } else {
      setQrUrl('');
    }
    return () => {
      mounted = false;
    };
  }, [showQr, upiId, advanceAmount, quotationNumber]);

  // Determine effective rows
  const effectiveRows =
    paymentRows && paymentRows.length > 0
      ? paymentRows.filter((r) => r.enabled)
      : [
          {
            id: 'p1',
            label: 'UPI',
            value: upiId,
            enabled: true,
          },
          {
            id: 'p2',
            label: 'Bank Transfer',
            value: `A/c Name: ${business.bankAccountName || 'Dev Rajpoot (DEVRIAN)'} · Bank: ${
              business.bankName || 'HDFC Bank'
            } · A/c No.: ${business.bankAccountNumber || '50100234567890'} · IFSC: ${
              business.bankIfsc || 'HDFC0001234'
            }`,
            enabled: true,
          },
        ];

  return (
    <div
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '1mm',
        paddingBottom: '1.5mm',
      }}
    >
      <div
        className="w-full bg-[#FFFFFF] rounded-[2px]"
        style={{
          border: '0.2mm solid #E5E5E5',
          padding: '2.5mm 3.5mm',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span
              style={{
                fontWeight: 600,
                fontSize: '6.5pt',
                letterSpacing: '0.22em',
                wordSpacing: '0.45em',
                color: '#8A8A8A',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '1.5mm',
                lineHeight: 1,
              }}
            >
              PAYMENT DETAILS (FOR ADVANCE PAYMENT)
            </span>

            <table className="w-full border-collapse" style={{ fontSize: '7.8pt' }}>
              <thead>
                <tr style={{ borderBottom: '0.2mm solid #E5E5E5', color: '#8A8A8A' }}>
                  <th
                    style={{
                      width: '28mm',
                      textAlign: 'left',
                      paddingBottom: '1mm',
                      fontWeight: 600,
                      fontSize: '6.5pt',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Pay Via
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      paddingBottom: '1mm',
                      fontWeight: 600,
                      fontSize: '6.5pt',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {effectiveRows.map((r) => (
                  <tr key={r.id}>
                    <td
                      style={{
                        paddingTop: '1.2mm',
                        paddingBottom: '1.2mm',
                        fontWeight: 600,
                        color: '#0E0E0E',
                        verticalAlign: 'top',
                      }}
                    >
                      {r.label}
                    </td>
                    <td
                      style={{
                        paddingTop: '1.2mm',
                        paddingBottom: '1.2mm',
                        color: '#262626',
                        fontFamily: r.label.toLowerCase().includes('upi') ? 'monospace' : "'Poppins', sans-serif",
                        fontSize: r.label.toLowerCase().includes('upi') ? '8pt' : '7.8pt',
                      }}
                    >
                      {r.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Optional UPI QR for Advance Amount */}
          {showQr && qrUrl && (
            <div className="flex flex-col items-center shrink-0 pl-2 border-l border-[#E5E5E5]">
              <img src={qrUrl} alt="UPI QR" className="w-[18mm] h-[18mm] object-contain" />
              <span
                style={{
                  fontSize: '5.5pt',
                  fontWeight: 600,
                  color: '#4A4A4A',
                  marginTop: '0.8mm',
                  textAlign: 'center',
                  letterSpacing: '0.04em',
                }}
              >
                Scan to pay {formatINR(advanceAmount)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
