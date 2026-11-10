import React from 'react';
import { formatDisplayDate } from '../../../services/dateUtils';

interface QuotationBillingStripProps {
  billingCycle?: string;
  startDate?: string;
  minTermMonths?: number;
  paymentDue?: string;
  noticeDays?: number;
  autoRenewal?: string;
}

export const QuotationBillingStrip: React.FC<QuotationBillingStripProps> = ({
  billingCycle = 'Monthly',
  startDate,
  minTermMonths = 3,
  paymentDue = 'In advance, before each cycle begins',
  noticeDays = 30,
  autoRenewal = 'Auto-renews monthly until cancelled',
}) => {
  const labelStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: '6.2pt',
    letterSpacing: '0.22em',
    wordSpacing: '0.5em',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    display: 'block',
    lineHeight: 1,
    marginBottom: '1.2mm',
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: '8.8pt',
    color: '#0E0E0E',
    lineHeight: 1.25,
  };

  const secondaryValueStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    fontSize: '8pt',
    color: '#334155',
    lineHeight: 1.25,
  };

  return (
    <div
      data-section="quotation-billing-strip"
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
          backgroundColor: '#FAFAFA',
          padding: '2.8mm 4mm',
          boxSizing: 'border-box',
          borderRadius: '1.5mm',
        }}
      >
        {/* Row 1: 4 Columns */}
        <div className="grid grid-cols-4 gap-[4mm] items-start pb-[2mm] border-b border-[#E2E8F0]/80">
          {/* Col 1: Billing Cycle */}
          <div>
            <span style={labelStyle}>BILLING CYCLE</span>
            <p style={valueStyle}>{billingCycle}</p>
          </div>

          {/* Col 2: Start Date */}
          <div>
            <span style={labelStyle}>START DATE</span>
            <p style={valueStyle}>{startDate ? formatDisplayDate(startDate) : 'Upon Agreement'}</p>
          </div>

          {/* Col 3: Minimum Term */}
          <div>
            <span style={labelStyle}>MINIMUM TERM</span>
            <p style={valueStyle}>{minTermMonths} {minTermMonths === 1 ? 'Month' : 'Months'}</p>
          </div>

          {/* Col 4: Payment Due */}
          <div>
            <span style={labelStyle}>PAYMENT DUE</span>
            <p style={secondaryValueStyle}>{paymentDue}</p>
          </div>
        </div>

        {/* Row 2: Notice Period & Renewal */}
        <div className="grid grid-cols-2 gap-[4mm] items-start pt-[1.8mm]">
          <div className="flex items-baseline gap-2">
            <span style={{ ...labelStyle, marginBottom: 0 }}>NOTICE PERIOD:</span>
            <span style={secondaryValueStyle}>{noticeDays} days' written notice</span>
          </div>
          <div className="flex items-baseline gap-2 justify-end">
            <span style={{ ...labelStyle, marginBottom: 0 }}>RENEWAL:</span>
            <span style={secondaryValueStyle}>{autoRenewal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

