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
  const signatureSpaceH = isProject ? '14mm' : '20mm';
  const pairTotalH = isProject ? `${QUOTATION_TOKENS.spacing.num.signaturePairProjectH}mm` : `${QUOTATION_TOKENS.spacing.num.signaturePairMonthlyH}mm`; // 28mm or 35mm
  const colWidth = '82mm';
  const gutterWidth = '10mm';
  const canShowSignature = (applySignature || isFinal) && Boolean(signatureUrl);
  const sigMaxHeight = isProject ? '16mm' : '22mm';

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
      <div style={{ height: '4.5mm', marginBottom: '2mm' }} className="flex items-center">
        <p
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            fontSize: '9.2pt',
            fontStyle: 'italic',
            fontWeight: 400,
            color: QUOTATION_TOKENS.colors.greyDark, // #4A4A4A
            margin: 0,
            lineHeight: 1.2,
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
        {/* Column 1 (Left): CLIENT SIGNATURE (or Instruction text if client column is off) */}
        <div style={{ width: colWidth, height: '100%' }} className="flex flex-col justify-end">
          {showClientSignature ? (
            <>
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
                    fontSize: '10.5pt',
                    fontWeight: 600,
                    color: QUOTATION_TOKENS.colors.black,
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {clientName || 'Authorized Signatory'}
                </p>
                <p
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '8.5pt',
                    fontWeight: 400,
                    color: QUOTATION_TOKENS.colors.greyMid,
                    margin: 0,
                    marginTop: '0.6mm',
                    lineHeight: 1,
                  }}
                >
                  Client Representative
                </p>
              </div>

              {/* "DATE" (LABEL) with a 30mm line */}
              <div className="flex items-center gap-1.5 pt-[1.5mm]">
                <span
                  style={{
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '7.5pt',
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: QUOTATION_TOKENS.colors.greyMid,
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

        {/* Column 2 (Right): DEVRIAN SIGNATURE (Right-to-Left aligned flush to right margin) */}
        <div style={{ width: colWidth, height: '100%' }} className="flex flex-col justify-end">
          {/* Signature space (11mm Project, 18mm Monthly) */}
          <div
            style={{
              height: signatureSpaceH,
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
            }}
          >
            {canShowSignature && (
              <img
                src={signatureUrl}
                alt="Signature"
                style={{
                  maxHeight: sigMaxHeight,
                  maxWidth: '62mm',
                  objectFit: 'contain',
                  position: 'absolute',
                  bottom: '1mm',
                  right: 0,
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

          {/* Name: "Dev Rajpoot" / Designation: "Founder, DEVRIAN" (Right-aligned) */}
          <div className="pt-[1mm]" style={{ textAlign: 'right' }}>
            <p
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                fontSize: '10.5pt',
                fontWeight: 600,
                color: QUOTATION_TOKENS.colors.black,
                margin: 0,
                lineHeight: 1.2,
                textAlign: 'right',
              }}
            >
              Dev Rajpoot
            </p>
            <p
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                fontSize: '8.5pt',
                fontWeight: 400,
                color: QUOTATION_TOKENS.colors.greyMid,
                margin: 0,
                marginTop: '0.6mm',
                lineHeight: 1,
                textAlign: 'right',
              }}
            >
              Founder, DEVRIAN
            </p>
          </div>

          {/* "DATE" (LABEL) with formatted Date (Right-aligned) */}
          <div className="flex items-center justify-end gap-1.5 pt-[1.5mm]">
            <span
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                fontSize: '7.5pt',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: QUOTATION_TOKENS.colors.greyMid,
                lineHeight: 1,
              }}
            >
              DATE
            </span>
            <span
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                fontSize: '8.5pt',
                color: QUOTATION_TOKENS.colors.black,
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {formatDisplayDate(date) || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Under the DEVRIAN column only, right-aligned SMALL, printed once */}
      <div
        className="flex flex-col items-end w-full"
        style={{
          marginTop: '2mm',
        }}
      >
        <span
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            fontSize: '7.5pt',
            lineHeight: 1.25,
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
              fontSize: '6.8pt',
              lineHeight: 1.25,
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
