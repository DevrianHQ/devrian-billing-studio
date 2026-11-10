import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';

interface SlimHeaderProps {
  documentNumber: string;
  blackLogoUrl?: string;
  titleLabel?: string;
}

export const SlimHeader: React.FC<SlimHeaderProps> = ({
  documentNumber,
  titleLabel = 'SCOPE OF WORK & ACCEPTANCE',
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
      {/* Top y=10mm: Official Logo Mark + Wordmark Image (Matching Terms SS 2), Right: Section Title */}
      <div
        className="absolute flex items-center justify-between"
        style={{
          left: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
          top: '10mm',
          width: QUOTATION_TOKENS.layout.contentWidth, // 174mm
          height: '6mm',
        }}
      >
        {/* Left: Devrian Symbol Mark (Black) + Devrian Wordmark Image (Black) + | + Doc info */}
        <div className="flex items-center" style={{ gap: '3.5mm' }}>
          <img
            src="/brand/devrian-symbol-black.png"
            alt="DEVRIAN"
            style={{
              height: '5mm',
              width: 'auto',
              maxHeight: '5mm',
            }}
            className="object-contain shrink-0"
            crossOrigin="anonymous"
          />
          <img
            src="/brand/devrian-brand-wordmark.png"
            alt="DEVRIAN"
            style={{
              height: '3.5mm',
              width: 'auto',
              maxHeight: '3.5mm',
            }}
            className="object-contain shrink-0"
            crossOrigin="anonymous"
          />
          <span
            style={{
              color: QUOTATION_TOKENS.colors.rule,
              fontWeight: 300,
              fontSize: '9pt',
              marginLeft: '1mm',
              marginRight: '1mm',
            }}
          >
            |
          </span>
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              fontSize: '7pt',
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: QUOTATION_TOKENS.colors.greyMid,
              textTransform: 'uppercase',
            }}
          >
            QUOTATION · {documentNumber}
          </span>
        </div>

        {/* Right: Section Title */}
        <span
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            fontSize: '7pt',
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: QUOTATION_TOKENS.colors.greyMid,
            textTransform: 'uppercase',
          }}
        >
          {titleLabel}
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
