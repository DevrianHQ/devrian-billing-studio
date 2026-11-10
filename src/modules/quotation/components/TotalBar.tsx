import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { formatINR } from '../../../services/indianCurrency';

interface TotalBarProps {
  label?: string;
  amount: number;
}

export const TotalBar: React.FC<TotalBarProps> = ({
  label = 'TOTAL',
  amount,
}) => {
  return (
    <div
      data-section="quotation-total-bar"
      className="w-full box-border flex items-center justify-between select-none"
      style={{
        backgroundColor: QUOTATION_TOKENS.colors.black,
        height: '10.5mm',
        paddingLeft: '3.5mm',
        paddingRight: '3.5mm',
        color: QUOTATION_TOKENS.colors.white,
      }}
    >
      <span
        style={{
          fontFamily: QUOTATION_TOKENS.font.family,
          fontSize: '8pt',
          fontWeight: 700,
          letterSpacing: '0.22em',
          wordSpacing: '0.5em',
          textTransform: 'uppercase',
          color: QUOTATION_TOKENS.colors.white,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: QUOTATION_TOKENS.font.family,
          fontSize: '12.5pt',
          fontWeight: 700,
          color: QUOTATION_TOKENS.colors.white,
          lineHeight: 1,
          ...QUOTATION_TOKENS.font.scale.numbers,
        }}
      >
        {formatINR(amount || 0)}
      </span>
    </div>
  );
};
