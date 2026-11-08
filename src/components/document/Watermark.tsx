import React from 'react';

interface WatermarkProps {
  enabled?: boolean;
  opacity?: number;
}

export const Watermark: React.FC<WatermarkProps> = ({
  enabled = false,
  opacity = 0.025,
}) => {
  if (!enabled) return null;

  return (
    <div
      className="absolute pointer-events-none select-none overflow-hidden z-0"
      style={{
        bottom: '-10mm',
        right: '-10mm',
        width: '95mm',
        height: '95mm',
      }}
      aria-hidden="true"
    >
      <img
        src="/brand/devrian-symbol-black.png"
        alt=""
        style={{
          width: '100%',
          height: '100%',
          opacity: opacity,
        }}
        className="object-contain select-none pointer-events-none"
      />
    </div>
  );
};
