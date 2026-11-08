import React from 'react';
import { DevrianLogoMark } from '../common/DevrianLogoMark';
import { DocumentCustomText, DocumentType, BusinessProfile } from '../../types';

interface HeaderBandProps {
  type?: DocumentType;
  business?: BusinessProfile;
  customText: DocumentCustomText;
  logoUrl?: string;
  whiteLogoUrl?: string;
  wordmarkScale?: number;
  showHeaderShapes?: boolean;
  accentColor?: string;
}

export const HeaderBand: React.FC<HeaderBandProps> = ({
  type = 'invoice',
  business,
  customText,
  logoUrl,
  whiteLogoUrl,
  wordmarkScale = 1.0,
  showHeaderShapes = true,
  accentColor = '#0E0E0E',
}) => {
  const tagline =
    customText.tagline ||
    business?.tagline ||
    'Building Attention, Authority & Growth for Modern Businesses';

  // Email & Website for Top-Right
  const email = business?.email || 'inquiry@devrian.in';
  const website = business?.website || 'devrian.in';

  // Udyam No. & Proprietor for Bottom-Right
  const udyamNo = business?.udyamNo || 'UDYAM-UP-54-0127731';
  let proprietorName = 'Dev Rajpoot';
  if (business?.proprietor) {
    proprietorName = business.proprietor.replace(/, Founder & CEO/i, '').replace(/Founder & CEO/i, '').trim() || 'Dev Rajpoot';
  }

  // If user customized the text via customText, support split or direct overrides
  let topEmail = business?.email || 'inquiry@devrian.in';
  let topWebsite = business?.website || 'devrian.in';

  if (customText.contactLine) {
    const parts = customText.contactLine.split('|').map((s) => s.trim());
    const emails = parts.filter((p) => p.includes('@'));
    const websites = parts.filter((p) => !p.includes('@'));

    if (emails.length > 0) {
      topEmail = business?.email && emails.includes(business.email) ? business.email : emails[0];
    }
    if (websites.length > 0) {
      topWebsite = websites[0];
    }
  }

  let bottomUdyam = `Udyam Reg. No.: ${udyamNo}`;
  let bottomProprietor = `Proprietor: ${proprietorName}`;
  if (customText.udyamLine) {
    const parts = customText.udyamLine.split('|').map((s) => s.trim());
    if (parts.length >= 2) {
      bottomUdyam = parts[0];
      bottomProprietor = parts[1];
    } else if (parts.length === 1 && parts[0]) {
      bottomUdyam = parts[0];
    }
  }

  return (
    <div
      className="relative w-full overflow-hidden text-white select-none box-border"
      style={{
        backgroundColor: accentColor || '#0E0E0E',
        height: '58mm',
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '6mm',
        paddingBottom: '5.5mm',
      }}
    >
      {/* Background Geometric Watermark on the Right (Soft 3.5% opacity) */}
      {showHeaderShapes && (
        <div
          className="absolute right-[-10mm] top-[-8mm] pointer-events-none select-none overflow-hidden z-0"
          style={{
            width: '90mm',
            height: '105mm',
            opacity: 0.035,
          }}
          aria-hidden="true"
        >
          <img
            src="/brand/devrian-symbol-pure-white.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Foreground Content: Perfectly balanced, non-wrapping executive hierarchy */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Row: DEVRIAN Logo on Left + Email & Website on Top-Right */}
        <div className="flex items-start justify-between w-full">
          {/* Top-Left: DEVRIAN Brand Lockup */}
          <div className="flex items-center pt-[0.5mm]">
            <DevrianLogoMark
              logoUrl={logoUrl}
              whiteLogoUrl={whiteLogoUrl}
              scale={wordmarkScale}
            />
          </div>

          {/* Top-Right: Email on line 1, Website on line 2 */}
          <div className="text-right space-y-[1.2mm] whitespace-nowrap pt-[0.5mm]">
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                fontSize: '8.5pt',
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                lineHeight: 1.25,
              }}
            >
              {topEmail}
            </p>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                fontSize: '8pt',
                color: '#D4D4D8',
                letterSpacing: '0.02em',
                lineHeight: 1.25,
              }}
            >
              {topWebsite}
            </p>
          </div>
        </div>

        {/* Row 2: Tagline directly underneath the wordmark */}
        {tagline && (
          <div className="w-full">
            <p
              className="whitespace-nowrap"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: '8.6pt',
                color: '#FFFFFF',
                letterSpacing: '0.015em',
                lineHeight: 1.2,
                marginTop: '1mm',
                marginBottom: '1mm',
              }}
            >
              {tagline}
            </p>
          </div>
        )}

        {/* Subtle Hairline Divider */}
        <div className="w-full h-[0.25mm] bg-white/12 my-[1.5mm]" />

        {/* Bottom Row: Document Title on Left + Udyam & Proprietor on Bottom-Right (directly opposite title) */}
        <div className="flex items-end justify-between w-full">
          {/* Bottom-Left: Eyebrow + Document Title */}
          <div>
            {customText.eyebrow && (
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  fontSize: '6.8pt',
                  letterSpacing: '0.28em',
                  wordSpacing: '0.6em',
                  color: '#8A8A8A',
                  textTransform: 'uppercase',
                  marginBottom: '1mm',
                  lineHeight: 1,
                }}
              >
                {customText.eyebrow}
              </p>
            )}

            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: '23pt',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                lineHeight: 1,
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              {customText.documentTitle}
            </h1>
          </div>

          {/* Bottom-Right: Udyam Reg. No. on line 1, Proprietor on line 2 (directly opposite Document Title) */}
          <div className="text-right space-y-[1.2mm] whitespace-nowrap pb-[0.5mm]">
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                fontSize: '8pt',
                color: '#E4E4E7',
                letterSpacing: '0.02em',
                lineHeight: 1.25,
              }}
            >
              {bottomUdyam}
            </p>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                fontSize: '8pt',
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                lineHeight: 1.25,
              }}
            >
              {bottomProprietor}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
