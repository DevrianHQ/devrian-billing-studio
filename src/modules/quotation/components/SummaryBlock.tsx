import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { TotalBar } from './TotalBar';
import { formatINR } from '../../../services/indianCurrency';

interface SummaryBlockProps {
  summaryType?: 'project' | 'monthly';
  subtotal: number;
  discountAmount?: number;
  discountType?: 'percentage' | 'flat';
  discountValue?: number;
  taxAmount?: number;
  gstEnabled?: boolean;
  gstRate?: number;
  // Project
  advanceAmount?: number;
  advancePercent?: number;
  balancePayable?: number;
  // Monthly / Recurring
  oneTimeSetupTotal?: number;
  monthlyFeeTotal?: number;
  minTermMonths?: number;
  minimumCommitmentTotal?: number;
  showMinimumCommitment?: boolean;
  dueToStart?: number;
  // Labels
  labelSubtotal?: string;
  labelDiscount?: string;
  labelTotal?: string;
  hideZeroRows?: boolean;
}

export const SummaryBlock: React.FC<SummaryBlockProps> = ({
  summaryType = 'project',
  subtotal,
  discountAmount = 0,
  taxAmount = 0,
  gstEnabled = false,
  advanceAmount = 0,
  advancePercent = 50,
  balancePayable = 0,
  oneTimeSetupTotal = 0,
  monthlyFeeTotal = 0,
  minTermMonths = 3,
  minimumCommitmentTotal = 0,
  showMinimumCommitment = true,
  dueToStart = 0,
  labelSubtotal = 'Subtotal',
  labelDiscount = 'Discount',
  labelTotal,
  hideZeroRows = true,
}) => {
  const isProject = summaryType === 'project';
  const showDiscount = discountAmount > 0;
  const netTaxable = Math.max(0, subtotal - discountAmount);
  const totalAmount = netTaxable + (gstEnabled ? taxAmount : 0);

  // Row style: 5.5mm, 9pt, label #4A4A4A, value right-aligned, rule between rows
  const rowStyle: React.CSSProperties = {
    fontFamily: QUOTATION_TOKENS.font.family,
    fontSize: '9pt',
    fontWeight: 400,
    color: QUOTATION_TOKENS.colors.greyDark, // #4A4A4A
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '5.5mm',
    borderBottom: `${QUOTATION_TOKENS.layout.ruleThickness} solid ${QUOTATION_TOKENS.colors.rule}`,
    lineHeight: 1,
    boxSizing: 'border-box',
  };

  // Quiet row style below the bar: 5mm, SMALL (7pt/400 #6B6B6B)
  const quietRowStyle: React.CSSProperties = {
    fontFamily: QUOTATION_TOKENS.font.family,
    ...QUOTATION_TOKENS.font.scale.small,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '5mm',
    color: QUOTATION_TOKENS.colors.greyMid,
    lineHeight: 1,
    boxSizing: 'border-box',
  };

  if (isProject) {
    const totalLabel = labelTotal || 'TOTAL';

    return (
      <div
        data-section="quotation-summary"
        style={{ width: QUOTATION_TOKENS.layout.colWidth }} // 84mm
        className="shrink-0 box-border ml-auto select-none"
      >
        {/* Subtotal */}
        <div style={rowStyle}>
          <span>{labelSubtotal}</span>
          <span
            style={{
              fontWeight: 600,
              color: QUOTATION_TOKENS.colors.black,
              ...QUOTATION_TOKENS.font.scale.numbers,
            }}
          >
            {formatINR(subtotal)}
          </span>
        </div>

        {/* Discount (flat or %) */}
        {showDiscount && (
          <div style={rowStyle}>
            <span>{labelDiscount}</span>
            <span
              style={{
                fontWeight: 600,
                color: QUOTATION_TOKENS.colors.black,
                ...QUOTATION_TOKENS.font.scale.numbers,
              }}
            >
              -{formatINR(discountAmount)}
            </span>
          </div>
        )}

        {/* GST if enabled */}
        {gstEnabled && taxAmount > 0 && (
          <div style={rowStyle}>
            <span>GST</span>
            <span
              style={{
                fontWeight: 600,
                color: QUOTATION_TOKENS.colors.black,
                ...QUOTATION_TOKENS.font.scale.numbers,
              }}
            >
              +{formatINR(taxAmount)}
            </span>
          </div>
        )}

        {/* TotalBar: 10.5mm solid #0E0E0E */}
        <TotalBar label={totalLabel} amount={totalAmount} />

        {/* Quiet Row 1: Advance to start (<X>%) */}
        <div style={quietRowStyle}>
          <span>Advance to start ({advancePercent}%)</span>
          <span
            style={{
              fontWeight: 600,
              color: QUOTATION_TOKENS.colors.black,
              ...QUOTATION_TOKENS.font.scale.numbers,
            }}
          >
            {formatINR(advanceAmount)}
          </span>
        </div>

        {/* Quiet Row 2: Balance due on completion (within 48 hrs) */}
        {(!hideZeroRows || balancePayable > 0) && (
          <div style={quietRowStyle}>
            <span>Balance due on completion (within 48 hrs)</span>
            <span
              style={{
                fontWeight: 600,
                color: QUOTATION_TOKENS.colors.black,
                ...QUOTATION_TOKENS.font.scale.numbers,
              }}
            >
              {formatINR(balancePayable)}
            </span>
          </div>
        )}
      </div>
    );
  }

  // MONTHLY RETAINER SUMMARY BLOCK
  const effectiveDueToStart = dueToStart || (oneTimeSetupTotal + monthlyFeeTotal - discountAmount);

  return (
    <div
      data-section="quotation-summary"
      style={{ width: QUOTATION_TOKENS.layout.colWidth }} // 84mm
      className="shrink-0 box-border ml-auto select-none"
    >
      {/* One-time Setup Fee (only if present) */}
      {oneTimeSetupTotal > 0 && (
        <div style={rowStyle}>
          <span>One-time Setup Fee</span>
          <span
            style={{
              fontWeight: 600,
              color: QUOTATION_TOKENS.colors.black,
              ...QUOTATION_TOKENS.font.scale.numbers,
            }}
          >
            {formatINR(oneTimeSetupTotal)}
          </span>
        </div>
      )}

      {/* Monthly Retainer */}
      <div style={rowStyle}>
        <span>Monthly Retainer</span>
        <span
          style={{
            fontWeight: 600,
            color: QUOTATION_TOKENS.colors.black,
            ...QUOTATION_TOKENS.font.scale.numbers,
          }}
        >
          {formatINR(monthlyFeeTotal || subtotal)}
        </span>
      </div>

      {/* Discount */}
      {showDiscount && (
        <div style={rowStyle}>
          <span>{labelDiscount}</span>
          <span
            style={{
              fontWeight: 600,
              color: QUOTATION_TOKENS.colors.black,
              ...QUOTATION_TOKENS.font.scale.numbers,
            }}
          >
            -{formatINR(discountAmount)}
          </span>
        </div>
      )}

      {/* TotalBar: DUE TO START (= one-time + first month) */}
      <TotalBar label="DUE TO START" amount={effectiveDueToStart} />

      {/* Quiet Row 1: From Month 2 onwards: ₹<monthly>/month */}
      <div style={quietRowStyle}>
        <span>From Month 2 onwards</span>
        <span
          style={{
            fontWeight: 600,
            color: QUOTATION_TOKENS.colors.black,
            ...QUOTATION_TOKENS.font.scale.numbers,
          }}
        >
          {formatINR(monthlyFeeTotal || subtotal)} / month
        </span>
      </div>

      {/* Quiet Row 2: Minimum commitment ({{min_term_months}} months): ₹<Y> */}
      {showMinimumCommitment && minimumCommitmentTotal > 0 && (
        <div style={quietRowStyle}>
          <span>Minimum commitment ({minTermMonths} months)</span>
          <span
            style={{
              fontWeight: 600,
              color: QUOTATION_TOKENS.colors.black,
              ...QUOTATION_TOKENS.font.scale.numbers,
            }}
          >
            {formatINR(minimumCommitmentTotal)}
          </span>
        </div>
      )}
    </div>
  );
};
