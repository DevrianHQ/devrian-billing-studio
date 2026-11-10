import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';

interface SectionHeadingProps {
  title: string;
  className?: string;
  withoutAccentBar?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  className = '',
  withoutAccentBar = false,
}) => {
  return (
    <div className={`flex flex-col select-none ${className}`}>
      <span
        style={{
          fontFamily: QUOTATION_TOKENS.font.family,
          ...QUOTATION_TOKENS.font.scale.sectionHeading,
          display: 'block',
          lineHeight: 1,
        }}
      >
        {title}
      </span>
      {!withoutAccentBar && (
        <div
          style={{
            width: QUOTATION_TOKENS.layout.accentBarW, // 8mm
            height: QUOTATION_TOKENS.layout.accentBarH, // 0.6mm
            backgroundColor: QUOTATION_TOKENS.colors.black,
            marginTop: '1.2mm',
          }}
        />
      )}
    </div>
  );
};

