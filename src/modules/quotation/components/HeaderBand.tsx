import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { BusinessProfile, DocumentCustomText } from '../../../types';

interface HeaderBandProps {
  customText?: DocumentCustomText;
  business?: BusinessProfile;
  eyebrow?: string;
  documentTitle?: string;
}

export const HeaderBand: React.FC<HeaderBandProps> = ({
  customText,
  business,
  eyebrow = 'QUOTATION · ONE-TIME PROJECT',
  documentTitle = 'QUOTATION',
}) => {
  const tagline =
    customText?.tagline ||
    business?.tagline ||
    'Building Attention, Authority & Growth for Modern Businesses';

  const contactLine = 'Devrian.official@gmail.com | inquiry@devrian.in | devrian.in';
  const udyamLine = 'Udyam Reg. No.: UDYAM-UP-54-0127731 | Proprietor: Dev Rajpoot';
  const whiteLogoUrl = business?.whiteLogoDataUrl || '/brand/devrian-symbol-pure-white.png';

  return (
    <div
      data-section="quotation-header-band"
      className="relative w-full overflow-hidden text-white select-none box-border"
      style={{
        backgroundColor: QUOTATION_TOKENS.colors.black,
        height: QUOTATION_TOKENS.layout.page1HeaderHeight, // 48mm
        width: QUOTATION_TOKENS.layout.pageWidth, // 210mm
      }}
    >
      {/* Two Darker Diagonal Shapes on the Right Half (Same Geometry as Invoice) */}
      <svg
        className="absolute right-0 top-0 h-full w-[105mm] pointer-events-none"
        viewBox="0 0 105 48"
        preserveAspectRatio="none"
        style={{ height: '48mm', width: '105mm' }}
      >
        {/* Shape 1 */}
        <polygon
          points="25,0 105,0 105,48 5,48"
          fill={QUOTATION_TOKENS.colors.shapeDark1}
          opacity="0.6"
        />
        {/* Shape 2 */}
        <polygon
          points="55,0 105,0 105,48 35,48"
          fill={QUOTATION_TOKENS.colors.shapeDark2}
          opacity="0.8"
        />
      </svg>

      {/* Row 1: Logo Lockup at x=18mm, y=10mm */}
      <div
        className="absolute flex items-center"
        style={{
          left: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
          top: '10mm',
          height: '9mm',
          gap: '3.5mm',
        }}
      >
        {/* Mark 9mm High */}
        <img
          src={whiteLogoUrl}
          alt="DEVRIAN"
          style={{
            height: '9mm',
            width: 'auto',
            maxHeight: '9mm',
          }}
          className="object-contain shrink-0"
        />
        {/* Wordmark Poppins 500 15pt white uppercase tracking 0.42em */}
        <span
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            fontSize: '15pt',
            fontWeight: 500,
            letterSpacing: '0.42em',
            color: QUOTATION_TOKENS.colors.white,
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          DEVRIAN
        </span>
      </div>

      {/* Tagline at y=24mm (italic 7.5pt #D9D9D9) */}
      <div
        className="absolute"
        style={{
          left: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
          top: '24mm',
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            fontStyle: 'italic',
            fontSize: '7.5pt',
            fontWeight: 400,
            color: QUOTATION_TOKENS.colors.taglineLight,
            letterSpacing: '0.02em',
          }}
        >
          {tagline}
        </span>
      </div>

      {/* Contact line at y=28.5mm (7pt #9A9A9A) */}
      <div
        className="absolute"
        style={{
          left: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
          top: '28.5mm',
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            fontSize: '7pt',
            fontWeight: 400,
            color: QUOTATION_TOKENS.colors.metaLight,
            letterSpacing: '0.02em',
          }}
        >
          {contactLine}
        </span>
      </div>

      {/* Udyam line at y=32.5mm (7pt #9A9A9A) */}
      <div
        className="absolute"
        style={{
          left: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
          top: '32.5mm',
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            fontSize: '7pt',
            fontWeight: 400,
            color: QUOTATION_TOKENS.colors.metaLight,
            letterSpacing: '0.02em',
          }}
        >
          {udyamLine}
        </span>
      </div>

      {/* Hairline at y=36.5mm (0.2mm #2A2A2A, x 18 to 192) */}
      <div
        className="absolute"
        style={{
          left: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
          top: '36.5mm',
          width: QUOTATION_TOKENS.layout.contentWidth, // 174mm
          height: QUOTATION_TOKENS.layout.ruleThickness, // 0.2mm
          backgroundColor: QUOTATION_TOKENS.colors.hairlineDark,
        }}
      />

      {/* Eyebrow at y=39.5mm (6.5pt/500 uppercase tracking 0.35em #8A8A8A) */}
      <div
        className="absolute"
        style={{
          left: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
          top: '39.5mm',
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            ...QUOTATION_TOKENS.font.scale.eyebrow,
          }}
        >
          {eyebrow}
        </span>
      </div>

      {/* Document Title baseline at y=45.5mm (22pt/700 white uppercase) */}
      <div
        className="absolute"
        style={{
          left: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
          top: '42.5mm',
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            ...QUOTATION_TOKENS.font.scale.title,
          }}
        >
          {documentTitle}
        </span>
      </div>
    </div>
  );
};
