import React from 'react';

interface DevrianLogoMarkProps {
  logoUrl?: string; // custom upload if any
  whiteLogoUrl?: string;
  blackLogoUrl?: string;
  invert?: boolean; // true if dark text on light background
  scale?: number; // scale multiplier from settings (default 1)
  className?: string;
}

export const DevrianLogoMark: React.FC<DevrianLogoMarkProps> = ({
  logoUrl,
  whiteLogoUrl = '/brand/devrian-symbol-pure-white.png',
  blackLogoUrl = '/brand/devrian-symbol-dark.png',
  invert = false,
  scale = 1,
  className = '',
}) => {
  // If user uploaded a custom combined full logo
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="DEVRIAN"
        style={{
          height: `${7.5 * scale}mm`,
          width: 'auto',
          objectFit: 'contain',
        }}
        className={`${invert ? 'filter invert brightness-0' : ''} ${className}`}
      />
    );
  }

  // Official DEVRIAN Lockup matching reference PDF:
  // White symbol (height ~7.2mm) + official wordmark image (height ~5.2mm)
  const symbolSrc = invert ? blackLogoUrl : whiteLogoUrl;
  const wordmarkSrc = invert
    ? '/brand/devrian-brand-wordmark.png'
    : '/brand/devrian-brand-wordmark-white.png';

  return (
    <div
      className={`flex items-center select-none ${className}`}
      style={{
        gap: `${3.2 * scale}mm`,
        height: `${7.5 * scale}mm`,
        transformOrigin: 'left center',
      }}
    >
      {/* Official Symbol Mark */}
      <img
        src={symbolSrc}
        alt="DEVRIAN"
        style={{
          height: `${7.2 * scale}mm`,
          width: 'auto',
          maxHeight: `${7.2 * scale}mm`,
        }}
        className="object-contain shrink-0"
      />

      {/* Official Wordmark Image (Matches PDF exactly) */}
      <img
        src={wordmarkSrc}
        alt="DEVRIAN"
        style={{
          height: `${5.2 * scale}mm`,
          width: 'auto',
          maxHeight: `${5.2 * scale}mm`,
        }}
        className="object-contain shrink-0"
      />
    </div>
  );
};
