import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';

interface SlimHeaderProps {
  documentNumber: string;
  blackLogoUrl?: string;
}

export const SlimHeader: React.FC<SlimHeaderProps> = ({
  documentNumber,
  blackLogoUrl = '/brand/devrian-symbol-dark.png',
}) => {
  return (
    <div
      data-section="quotation-slim-header"
      className="w-full box-border relative select-none bg-white"
      style={{
        height: '24mm',
        width: QUOTATION_TOKENS.layout.pageWidth, // 210mm
      }}
    >
      {/* Top y=10mm: Small Lockup Left (mark 6mm, wordmark 10pt), LABEL Right */}
      <div
        className="absolute flex items-center justify-between"
        style={{
          left: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
          top: '10mm',
          width: QUOTATION_TOKENS.layout.contentWidth, // 174mm
          height: '6mm',
        }}
      >
        {/* Exactly ONE small black lockup: mark 6mm + wordmark 10pt. No redundant DEVRIAN text! */}
        <div className="flex items-center gap-[2.8mm]">
          <img
            src={blackLogoUrl}
            alt="DEVRIAN"
            style={{
              height: '6mm',
              width: 'auto',
              maxHeight: '6mm',
            }}
            className="object-contain shrink-0"
          />
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              fontSize: '10pt',
              fontWeight: 500,
              letterSpacing: '0.42em',
              color: QUOTATION_TOKENS.colors.black,
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            DEVRIAN
          </span>
        </div>

        {/* Right: "QUOTATION <No.> · CONTINUED" in LABEL style */}
        <span
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            ...QUOTATION_TOKENS.font.scale.label,
            color: QUOTATION_TOKENS.colors.greyDark,
          }}
        >
          QUOTATION {documentNumber} · CONTINUED
        </span>
      </div>

      {/* 0.2mm rule at y=22mm */}
      <div
        className="absolute"
        style={{
          left: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
          top: '22mm',
          width: QUOTATION_TOKENS.layout.contentWidth, // 174mm
          height: QUOTATION_TOKENS.layout.ruleThickness, // 0.2mm
          backgroundColor: QUOTATION_TOKENS.colors.rule, // #E5E5E5
        }}
      />
    </div>
  );
};
