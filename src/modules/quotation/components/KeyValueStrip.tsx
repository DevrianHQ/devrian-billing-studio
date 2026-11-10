import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { formatDisplayDate } from '../../../services/dateUtils';

interface KeyValueStripProps {
  billingCycle?: string;
  startDate?: string;
  minTermMonths?: number;
  paymentDue?: string;
  noticeDays?: number;
  autoRenewal?: string;
}

export const KeyValueStrip: React.FC<KeyValueStripProps> = ({
  billingCycle = 'Monthly',
  startDate,
  minTermMonths = 3,
  paymentDue = 'In advance, on or before the 1st of each cycle',
  noticeDays = 30,
  autoRenewal = 'Auto-renews monthly until cancelled in writing',
}) => {
  const cellWidth = '43.5mm';
  const rowHeight = '13mm';

  return (
    <div
      data-section="quotation-key-value-strip"
      className="w-full box-border bg-white select-none relative"
      style={{
        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight, // 18mm
        width: QUOTATION_TOKENS.layout.pageWidth,
      }}
    >
      <div
        className="w-full flex flex-col"
        style={{
          width: QUOTATION_TOKENS.layout.contentWidth, // 174mm
          padding: '0mm',
        }}
      >
        {/* ROW 1: 4 columns with balanced widths (174mm total: 40 + 38 + 38 + 58) */}
        <div
          className="flex items-start w-full"
          style={{
            minHeight: rowHeight,
            padding: '2.5mm 0mm',
            borderBottom: `${QUOTATION_TOKENS.layout.ruleThickness} solid ${QUOTATION_TOKENS.colors.rule}`,
            boxSizing: 'border-box',
          }}
        >
          {/* Col 1: BILLING CYCLE (40mm) */}
          <div style={{ width: '40mm', paddingRight: '2mm' }}>
            <span
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.label,
                display: 'block',
              }}
            >
              BILLING CYCLE
            </span>
            <p
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.valueS,
                margin: 0,
                marginTop: `${QUOTATION_TOKENS.spacing.num.labelToValue}mm`,
              }}
            >
              {billingCycle}
            </p>
          </div>

          {/* Col 2: START DATE (38mm) */}
          <div style={{ width: '38mm', paddingRight: '2mm' }}>
            <span
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.label,
                display: 'block',
              }}
            >
              START DATE
            </span>
            <p
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.valueS,
                margin: 0,
                marginTop: `${QUOTATION_TOKENS.spacing.num.labelToValue}mm`,
              }}
            >
              {startDate ? formatDisplayDate(startDate) : 'Upon Agreement'}
            </p>
          </div>

          {/* Col 3: MINIMUM TERM (38mm) */}
          <div style={{ width: '38mm', paddingRight: '2mm' }}>
            <span
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.label,
                display: 'block',
              }}
            >
              MINIMUM TERM
            </span>
            <p
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.valueS,
                margin: 0,
                marginTop: `${QUOTATION_TOKENS.spacing.num.labelToValue}mm`,
              }}
            >
              {minTermMonths} {minTermMonths === 1 ? 'Month' : 'Months'}
            </p>
          </div>

          {/* Col 4: PAYMENT DUE (58mm - extra width to prevent line wrapping) */}
          <div style={{ width: '58mm' }}>
            <span
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.label,
                display: 'block',
              }}
            >
              PAYMENT DUE
            </span>
            <p
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.valueS,
                margin: 0,
                marginTop: `${QUOTATION_TOKENS.spacing.num.labelToValue}mm`,
                lineHeight: 1.25,
              }}
            >
              {paymentDue}
            </p>
          </div>
        </div>

        {/* ROW 2: 4 columns of 43.5mm (13mm tall) */}
        <div
          className="flex items-start w-full"
          style={{
            height: rowHeight,
            padding: '2.5mm 0mm',
            borderBottom: `${QUOTATION_TOKENS.layout.ruleThickness} solid ${QUOTATION_TOKENS.colors.rule}`,
            boxSizing: 'border-box',
          }}
        >
          {/* Col 1: NOTICE PERIOD */}
          <div style={{ width: cellWidth, paddingRight: '2mm' }}>
            <span
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.label,
                display: 'block',
              }}
            >
              NOTICE PERIOD
            </span>
            <p
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.valueS,
                margin: 0,
                marginTop: `${QUOTATION_TOKENS.spacing.num.labelToValue}mm`,
              }}
            >
              {noticeDays} Days Written Notice
            </p>
          </div>

          {/* Col 2: RENEWAL */}
          <div style={{ width: cellWidth, paddingRight: '2mm' }}>
            <span
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.label,
                display: 'block',
              }}
            >
              RENEWAL
            </span>
            <p
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.valueS,
                margin: 0,
                marginTop: `${QUOTATION_TOKENS.spacing.num.labelToValue}mm`,
                lineHeight: 1.2,
              }}
            >
              {autoRenewal}
            </p>
          </div>

          {/* Col 3: empty cell */}
          <div style={{ width: cellWidth }} />

          {/* Col 4: empty cell */}
          <div style={{ width: cellWidth }} />
        </div>
      </div>
    </div>
  );
};
