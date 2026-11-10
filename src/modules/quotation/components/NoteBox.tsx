import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';

interface NoteBoxProps {
  heading?: string;
  notes: string[];
  variables?: Record<string, string | number | undefined>;
}

export const NoteBox: React.FC<NoteBoxProps> = ({
  heading = 'TERMS & NOTES',
  notes = [],
  variables = {},
}) => {
  if (!notes || notes.length === 0) return null;

  // Replace variable placeholders like {{advance_percent}}
  const resolveVariables = (text: string): string => {
    let resolved = text;
    Object.entries(variables).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        resolved = resolved.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(val));
      }
    });
    return resolved;
  };

  return (
    <div
      data-section="quotation-terms"
      className="w-full box-border select-none"
      style={{
        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight, // 18mm
        width: QUOTATION_TOKENS.layout.pageWidth,
      }}
    >
      <div
        style={{
          ...QUOTATION_TOKENS.boxes.note,
          width: QUOTATION_TOKENS.layout.contentWidth, // 174mm
          padding: QUOTATION_TOKENS.boxes.note.padding, // 4mm
        }}
      >
        {/* Heading */}
        <span
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            ...QUOTATION_TOKENS.font.scale.sectionHeading,
            display: 'block',
            lineHeight: 1,
            marginBottom: '2mm',
          }}
        >
          {heading}
        </span>

        {/* Numbered List at TERMS size with 2mm gap between points, numbers in 700 weight */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2mm' }}>
          {notes.map((note, index) => (
            <div key={index} className="flex items-start">
              <span
                style={{
                  fontFamily: QUOTATION_TOKENS.font.family,
                  fontSize: QUOTATION_TOKENS.font.scale.terms.fontSize,
                  fontWeight: 700,
                  color: QUOTATION_TOKENS.colors.black,
                  lineHeight: QUOTATION_TOKENS.font.scale.terms.lineHeight,
                  width: '4.5mm',
                  flexShrink: 0,
                }}
              >
                {index + 1}.
              </span>
              <p
                style={{
                  fontFamily: QUOTATION_TOKENS.font.family,
                  ...QUOTATION_TOKENS.font.scale.terms,
                  margin: 0,
                  flex: 1,
                }}
              >
                {resolveVariables(note)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
