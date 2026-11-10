import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';

interface FooterProps {
  documentNumber: string;
  currentPage: number;
  totalPages: number;
  udyamNo?: string;
  email?: string;
}

export const Footer: React.FC<FooterProps> = ({
  documentNumber,
  currentPage,
  totalPages,
  udyamNo = 'UDYAM-UP-54-0127731',
  email = 'inquiry@devrian.in',
}) => {
  return (
    <div
      data-section="quotation-footer"
      className="w-full box-border select-none bg-white absolute left-0"
      style={{
        top: QUOTATION_TOKENS.layout.footerRulePosition, // 282mm
        height: QUOTATION_TOKENS.layout.footerHeight, // 15mm
        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight, // 18mm
        paddingTop: '2mm',
        paddingBottom: '2.5mm',
        borderTop: `${QUOTATION_TOKENS.layout.ruleThickness} solid ${QUOTATION_TOKENS.colors.rule}`,
      }}
    >
      <div
        className="flex items-center justify-between h-full"
        style={{
          fontFamily: QUOTATION_TOKENS.font.family,
          fontSize: '7.5pt',
          color: QUOTATION_TOKENS.colors.greyMid,
        }}
      >
        {/* Left: Brand & Document No */}
        <div>
          <span style={{ fontWeight: 600 }}>DEVRIAN</span>
          <span className="mx-1.5 opacity-40">|</span>
          <span>Quotation {documentNumber}</span>
        </div>

        {/* Centre: Udyam Number */}
        <div>
          <span>Udyam Reg. No.: {udyamNo}</span>
        </div>

        {/* Right: Email & Page X of Y */}
        <div
          className="flex flex-col items-end"
          style={{
            lineHeight: 1.25,
          }}
        >
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              fontSize: '7.5pt',
              fontWeight: 700,
              color: QUOTATION_TOKENS.colors.greyMid, // #6B6B6B
            }}
          >
            {email}
          </span>
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              fontSize: '7pt',
              fontWeight: 400,
              color: QUOTATION_TOKENS.colors.greyLight, // #8A8A8A
              ...QUOTATION_TOKENS.font.scale.numbers,
            }}
          >
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>
    </div>
  );
};
