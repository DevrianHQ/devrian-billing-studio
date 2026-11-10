import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { DocumentStatus } from '../../../types';
import { formatDisplayDate, calculateValidTillDate } from '../../../services/dateUtils';

interface MetaRowProps {
  documentNumber: string;
  date: string;
  validTill?: string;
  status: DocumentStatus;
  validityDays?: number;
}

export const MetaRow: React.FC<MetaRowProps> = ({
  documentNumber,
  date,
  validTill,
  status,
  validityDays = 15,
}) => {
  const displayValidTill = validTill || (date ? calculateValidTillDate(date, validityDays) : '—');

  return (
    <div
      data-section="quotation-meta-row"
      className="w-full box-border bg-white select-none relative"
      style={{
        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight, // 18mm
        height: '12mm',
      }}
    >
      {/* 4 Equal Columns (43.5mm each) */}
      <div className="grid grid-cols-4 items-start w-full" style={{ gap: '0mm' }}>
        {/* Col 1: Quotation No */}
        <div style={{ width: '43.5mm' }}>
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              ...QUOTATION_TOKENS.font.scale.label,
              display: 'block',
            }}
          >
            QUOTATION NO.
          </span>
          <p
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              ...QUOTATION_TOKENS.font.scale.value,
              margin: 0,
              marginTop: `${QUOTATION_TOKENS.spacing.num.labelToValue}mm`,
              ...QUOTATION_TOKENS.font.scale.numbers,
            }}
          >
            {documentNumber || 'DEV-QT-2026-001'}
          </p>
        </div>

        {/* Col 2: Quotation Date */}
        <div style={{ width: '43.5mm' }}>
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              ...QUOTATION_TOKENS.font.scale.label,
              display: 'block',
            }}
          >
            QUOTATION DATE
          </span>
          <p
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              ...QUOTATION_TOKENS.font.scale.value,
              margin: 0,
              marginTop: `${QUOTATION_TOKENS.spacing.num.labelToValue}mm`,
            }}
          >
            {formatDisplayDate(date) || '—'}
          </p>
        </div>

        {/* Col 3: Valid Till */}
        <div style={{ width: '43.5mm' }}>
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              ...QUOTATION_TOKENS.font.scale.label,
              display: 'block',
            }}
          >
            VALID TILL
          </span>
          <p
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              ...QUOTATION_TOKENS.font.scale.value,
              margin: 0,
              marginTop: `${QUOTATION_TOKENS.spacing.num.labelToValue}mm`,
            }}
          >
            {formatDisplayDate(displayValidTill) || '—'}
          </p>
        </div>

        {/* Col 4: Status Badge (outlined rectangular 0.5mm #0E0E0E, no fill, padding 3mm x 1.2mm, 7.5pt/600 tracking 0.3em) */}
        <div style={{ width: '43.5mm' }}>
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              ...QUOTATION_TOKENS.font.scale.label,
              display: 'block',
            }}
          >
            STATUS
          </span>
          <div style={{ marginTop: `${QUOTATION_TOKENS.spacing.num.labelToValue}mm` }}>
            <span
              style={{
                display: 'inline-block',
                border: '0.5mm solid #0E0E0E',
                backgroundColor: 'transparent',
                padding: '1.2mm 3mm',
                borderRadius: '0mm',
                fontFamily: QUOTATION_TOKENS.font.family,
                fontSize: '7.5pt',
                fontWeight: 600,
                letterSpacing: '0.3em',
                color: QUOTATION_TOKENS.colors.black,
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              {status || 'DRAFT'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom rule 11mm below top */}
      <div
        className="w-full absolute left-0"
        style={{
          top: '11mm',
          paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
          paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            height: QUOTATION_TOKENS.layout.ruleThickness, // 0.2mm
            backgroundColor: QUOTATION_TOKENS.colors.rule, // #E5E5E5
          }}
        />
      </div>
    </div>
  );
};
