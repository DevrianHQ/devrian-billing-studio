import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { formatDisplayDate } from '../../../services/dateUtils';

interface SignaturePairProps {
  clientName: string;
  documentNumber: string;
  date: string;
  signatureUrl?: string;
  applySignature?: boolean;
  isFinal?: boolean;
  showClientSignature?: boolean;
  showLegalDisclaimer?: boolean;
  instructionText?: string;
  isProject?: boolean;
}

export const SignaturePair: React.FC<SignaturePairProps> = ({
  clientName,
  documentNumber,
  date,
  signatureUrl,
  applySignature = false,
  isFinal = false,
  showClientSignature = true,
  showLegalDisclaimer = true,
  instructionText = 'To accept, confirm in writing (WhatsApp/email) or sign below, and pay the amount due to start.',
  isProject = true,
}) => {
  const signatureSpaceH = isProject ? '11mm' : '18mm';
  const pairTotalH = isProject ? `${QUOTATION_TOKENS.spacing.num.signaturePairProjectH}mm` : `${QUOTATION_TOKENS.spacing.num.signaturePairMonthlyH}mm`; // 26mm or 33mm
  const colWidth = '82mm';
  const gutterWidth = '10mm';
  const canShowSignature = applySignature && isFinal && Boolean(signatureUrl);
  const sigMaxHeight = isProject ? '10mm' : '14mm';

  return (
    <div
      data-section="quotation-acceptance"
      className="w-full box-border select-none"
      style={{
        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight, // 18mm
        width: QUOTATION_TOKENS.layout.pageWidth,
      }}
    >
      {/* 1. Instruction line: 4mm tall, then 2mm gap */}
      <div style={{ height: '4mm', marginBottom: '2mm' }} className="flex items-center">
        <p
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            fontSize: QUOTATION_TOKENS.font.scale.body.fontSize,
            fontStyle: 'italic',
            fontWeight: 400,
            color: QUOTATION_TOKENS.colors.greyDark, // #4A4A4A
            margin: 0,
            lineHeight: 1,
          }}
        >
          {instructionText}
        </p>
      </div>

      {/* 2. Signature Pair: Two Equal Columns (82mm + 10mm gutter = 174mm) */}
      <div
        className="flex items-start justify-between w-full"
        style={{
          height: pairTotalH,
          width: QUOTATION_TOKENS.layout.contentWidth, // 174mm
        }}
      >
        {/* Column 1 (Left): CLIENT ACCEPTANCE or Instruction text if client column is off */}
        <div style={{ width: colWidth, height: '100%' }} className="flex flex-col justify-between">
          {showClientSignature ? (
            <>
              {/* Label on ONE line (never wraps) */}
              <span
                style={{
                  fontFamily: QUOTATION_TOKENS.font.family,
                  ...QUOTATION_TOKENS.font.scale.label,
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                }}
              >
                CLIENT ACCEPTANCE
              </span>

              {/* Signature space (11mm Project, 18mm Monthly) */}
              <div style={{ height: signatureSpaceH }} className="w-full" />

              {/* 0.2mm #0E0E0E rule */}
              <div
                style={{
                  width: '100%',
                  height: '0.2mm',
                  backgroundColor: QUOTATION_TOKENS.colors.black,
                }}
              />

              {/* Name (VALUE-S bold) + Designation (SMALL) */}
              <div className="pt-[1mm]">
                <p
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    ...QUOTATION_TOKENS.font.scale.valueS,
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {clientName || 'Authorized Signatory'}
                </p>
                <p
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    ...QUOTATION_TOKENS.font.scale.small,
                    margin: 0,
                    marginTop: '0.4mm',
                    lineHeight: 1,
                  }}
                >
                  Client Representative
                </p>
              </div>

              {/* "DATE" (LABEL) with a 30mm line */}
              <div className="flex items-center gap-1.5 pt-[1mm]">
                <span
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    ...QUOTATION_TOKENS.font.scale.label,
                    lineHeight: 1,
                  }}
                >
                  DATE
                </span>
                <div
                  style={{
                    width: '30mm',
                    height: '0.2mm',
                    backgroundColor: QUOTATION_TOKENS.colors.rule,
                  }}
                />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center pr-4">
              <span
                style={{
                  fontFamily: QUOTATION_TOKENS.font.family,
                  ...QUOTATION_TOKENS.font.scale.small,
                  fontStyle: 'italic',
                }}
              >
                Written confirmation (WhatsApp/Email) constitutes binding acceptance.
              </span>
            </div>
          )}
        </div>

        {/* Gutter: 10mm (x=100 to x=110, handled by gutterWidth / justify-between) */}

        {/* Column 2 (Right): FOR DEVRIAN */}
        <div style={{ width: colWidth, height: '100%' }} className="flex flex-col justify-between">
          {/* Label on ONE line (never wraps) */}
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              ...QUOTATION_TOKENS.font.scale.label,
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            FOR DEVRIAN
          </span>

          {/* Signature space (11mm Project, 18mm Monthly) */}
          <div
            style={{
              height: signatureSpaceH,
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {canShowSignature && (
              <img
                src={signatureUrl}
                alt="Signature"
                style={{
                  maxHeight: sigMaxHeight,
                  maxWidth: '48mm',
                  objectFit: 'contain',
                  position: 'absolute',
                  bottom: '1mm',
                }}
              />
            )}
          </div>

          {/* 0.2mm #0E0E0E rule */}
          <div
            style={{
              width: '100%',
              height: '0.2mm',
              backgroundColor: QUOTATION_TOKENS.colors.black,
            }}
          />

          {/* Name: "Dev Rajpoot" / Designation: "Founder, DEVRIAN" */}
          <div className="pt-[1mm]">
            <p
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.valueS,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Dev Rajpoot
            </p>
            <p
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.small,
                margin: 0,
                marginTop: '0.4mm',
                lineHeight: 1,
              }}
            >
              Founder, DEVRIAN
            </p>
          </div>

          {/* "DATE" (LABEL) with formatted Date */}
          <div className="flex items-center gap-1.5 pt-[1mm]">
            <span
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.label,
                lineHeight: 1,
              }}
            >
              DATE
            </span>
            <span
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.small,
                color: QUOTATION_TOKENS.colors.black,
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              {formatDisplayDate(date) || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Under the DEVRIAN column only, right-aligned SMALL, printed once (3.5mm block height) */}
      <div
        className="flex flex-col items-end w-full"
        style={{
          height: `${QUOTATION_TOKENS.spacing.num.issueLinesH}mm`, // 3.5mm
          marginTop: '1.5mm',
        }}
      >
        <span
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            ...QUOTATION_TOKENS.font.scale.small,
            fontSize: '6.5pt',
            lineHeight: 1.15,
            color: QUOTATION_TOKENS.colors.greyMid,
            textAlign: 'right',
          }}
        >
          Issued by DEVRIAN · Quotation {documentNumber} · {formatDisplayDate(date)}
        </span>
        {showLegalDisclaimer && (
          <span
            style={{
              fontFamily: QUOTATION_TOKENS.font.family,
              ...QUOTATION_TOKENS.font.scale.small,
              fontSize: '6pt',
              lineHeight: 1.15,
              color: QUOTATION_TOKENS.colors.greyLight,
              textAlign: 'right',
            }}
          >
            Not valid for banking, cheque or legal-instrument purposes
          </span>
        )}
      </div>
    </div>
  );
};
