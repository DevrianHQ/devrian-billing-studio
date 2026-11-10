import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';

interface PartyRowProps {
  clientName: string;
  contactPerson?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientGstin?: string;
  projectHeading?: string; // "PROJECT" or "SERVICE"
  projectName: string;
  projectDescription?: string;
  platforms?: string;
  estimatedDelivery?: string;
}

export const PartyRow: React.FC<PartyRowProps> = ({
  clientName,
  contactPerson,
  clientAddress,
  clientPhone,
  clientEmail,
  projectHeading = 'PROJECT',
  projectName,
  platforms,
  estimatedDelivery,
}) => {
  const isService = projectHeading.includes('SERVICE');

  return (
    <div
      data-section="quotation-party-row"
      className="w-full box-border bg-white select-none relative"
      style={{
        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight, // 18mm
        height: '19mm',
      }}
    >
      {/* 2 Columns: 84mm + 6mm gutter + 84mm */}
      <div className="flex items-start justify-between w-full">
        {/* Column 1: PREPARED FOR (x=18..102, width 84mm) */}
        <div style={{ width: QUOTATION_TOKENS.layout.colWidth }}>
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              ...QUOTATION_TOKENS.font.scale.label,
              display: 'block',
              lineHeight: 1,
            }}
          >
            PREPARED FOR
          </span>

          <p
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              fontSize: '11pt',
              fontWeight: 600,
              color: QUOTATION_TOKENS.colors.black,
              margin: 0,
              marginTop: '1.2mm',
              lineHeight: 1.2,
            }}
          >
            {clientName || 'Client Name'}
          </p>

          <p
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              fontSize: '9pt',
              fontWeight: 400,
              color: QUOTATION_TOKENS.colors.greyDark,
              margin: 0,
              marginTop: '0.8mm',
              lineHeight: 1.25,
            }}
          >
            {[contactPerson, clientAddress].filter(Boolean).join(' · ')}
          </p>

          {(clientEmail || clientPhone) && (
            <p
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                fontSize: '8pt',
                fontWeight: 400,
                color: QUOTATION_TOKENS.colors.greyLight,
                margin: 0,
                marginTop: '0.6mm',
                lineHeight: 1.2,
              }}
            >
              {[clientEmail, clientPhone].filter(Boolean).join(' | ')}
            </p>
          )}
        </div>

        {/* Gutter: 6mm is handled by justify-between or gap */}

        {/* Column 2: PROJECT or SERVICE (x=108..192, width 84mm) */}
        <div style={{ width: QUOTATION_TOKENS.layout.colWidth }}>
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              ...QUOTATION_TOKENS.font.scale.label,
              display: 'block',
              lineHeight: 1,
            }}
          >
            {projectHeading}
          </span>

          <p
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              fontSize: '11pt',
              fontWeight: 600,
              color: QUOTATION_TOKENS.colors.black,
              margin: 0,
              marginTop: '1.2mm',
              lineHeight: 1.2,
            }}
          >
            {projectName || (isService ? 'Social Media Management' : 'Project Scope & Deliverables')}
          </p>

          {/* Small line for Platforms (Monthly) or Estimated Delivery (Project) */}
          {isService && platforms && (
            <p
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                fontSize: '8pt',
                fontWeight: 400,
                color: QUOTATION_TOKENS.colors.greyDark,
                margin: 0,
                marginTop: '0.8mm',
                lineHeight: 1.25,
              }}
            >
              Platforms: {platforms}
            </p>
          )}

          {!isService && estimatedDelivery && (
            <p
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                fontSize: '8pt',
                fontWeight: 400,
                color: QUOTATION_TOKENS.colors.greyDark,
                margin: 0,
                marginTop: '0.8mm',
                lineHeight: 1.25,
              }}
            >
              Estimated delivery: {estimatedDelivery}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
