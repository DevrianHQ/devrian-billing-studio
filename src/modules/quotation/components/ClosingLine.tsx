import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';

interface ClosingLineProps {
  text?: string;
}

export const ClosingLine: React.FC<ClosingLineProps> = ({
  text = 'Thank you for considering DEVRIAN. We look forward to working with you.',
}) => {
  if (!text || !text.trim()) return null;

  return (
    <div
      data-section="quotation-closing-line"
      className="w-full box-border"
      style={{
        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight, // 18mm
        paddingTop: QUOTATION_TOKENS.spacing.s2, // 2mm
        paddingBottom: QUOTATION_TOKENS.spacing.s2, // 2mm
      }}
    >
      <p
        style={{
          fontFamily: QUOTATION_TOKENS.font.family,
          fontStyle: 'italic',
          fontSize: '10.5pt',
          fontWeight: 500,
          color: QUOTATION_TOKENS.colors.bodyText,
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {text}
      </p>
    </div>
  );
};
