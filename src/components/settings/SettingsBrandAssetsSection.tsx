import React, { useRef } from 'react';
import { BusinessProfile } from '../../types';
import { ShieldCheck, PenTool } from 'lucide-react';

interface SettingsBrandAssetsSectionProps {
  formData: BusinessProfile;
  updateField: <K extends keyof BusinessProfile>(field: K, value: BusinessProfile[K]) => void;
  onOpenSignatureModal: () => void;
}

export const SettingsBrandAssetsSection: React.FC<SettingsBrandAssetsSectionProps> = ({
  formData,
  updateField,
  onOpenSignatureModal,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const whiteLogoInputRef = useRef<HTMLInputElement>(null);
  const blackLogoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateField('logoDataUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleWhiteLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateField('whiteLogoDataUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBlackLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateField('blackLogoDataUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-5">
      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
        2. Business Signature &amp; Brand Identity
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Dedicated Signature Studio */}
        <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              Isolated Business Signature
            </span>
            {formData.signatureDataUrl && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete business signature from storage?')) {
                    updateField('signatureDataUrl', '');
                  }
                }}
                className="text-[11px] text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            )}
          </div>

          <div className="h-24 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center p-3 relative">
            {formData.signatureDataUrl ? (
              <img
                src={formData.signatureDataUrl}
                alt="Business Signature"
                className="max-h-full max-w-full object-contain filter invert"
              />
            ) : (
              <span className="text-xs text-neutral-500">No signature configured</span>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenSignatureModal}
            className="w-full py-2 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow"
          >
            <PenTool size={13} />
            <span>Open Signature Studio (Scan / Draw / Type)</span>
          </button>
        </div>

        {/* Document Logo Lockup Controls */}
        <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white">Full Logo Upload (Optional)</span>
            {formData.logoDataUrl && (
              <button
                type="button"
                onClick={() => updateField('logoDataUrl', '')}
                className="text-[11px] text-neutral-400 hover:text-red-400"
              >
                Reset to Built-in Lockup
              </button>
            )}
          </div>

          <div className="h-24 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center p-3">
            {formData.logoDataUrl ? (
              <img
                src={formData.logoDataUrl}
                alt="Logo"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-xs text-neutral-500">Built-in DEVRIAN Vector Wordmark</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold text-center"
          >
            Upload Combined PNG/SVG Logo
          </button>
          <input
            type="file"
            ref={logoInputRef}
            accept="image/png,image/svg+xml,image/jpeg"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Dedicated White & Black Logo Files */}
      <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
        <span className="text-xs font-bold text-white block">
          Official Symbol Mark Assets
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* White Logo */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-semibold text-neutral-300">White Mark (Black Header)</span>
              {formData.whiteLogoDataUrl && (
                <button
                  type="button"
                  onClick={() => updateField('whiteLogoDataUrl', '')}
                  className="text-[10px] text-neutral-400 hover:text-red-400"
                >
                  Reset Default
                </button>
              )}
            </div>
            <div className="h-16 bg-[#0E0E0E] rounded border border-neutral-800 flex items-center justify-center p-2">
              <img
                src={formData.whiteLogoDataUrl || '/brand/devrian-symbol-white.png'}
                alt="White Logo"
                className="h-9 w-auto object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => whiteLogoInputRef.current?.click()}
              className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded font-medium"
            >
              Upload White Symbol
            </button>
            <input
              type="file"
              ref={whiteLogoInputRef}
              accept="image/png,image/svg+xml"
              onChange={handleWhiteLogoUpload}
              className="hidden"
            />
          </div>

          {/* Black Logo */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-semibold text-neutral-300">Black Mark (Watermark / Light)</span>
              {formData.blackLogoDataUrl && (
                <button
                  type="button"
                  onClick={() => updateField('blackLogoDataUrl', '')}
                  className="text-[10px] text-neutral-400 hover:text-red-400"
                >
                  Reset Default
                </button>
              )}
            </div>
            <div className="h-16 bg-white rounded border border-neutral-300 flex items-center justify-center p-2">
              <img
                src={formData.blackLogoDataUrl || '/brand/devrian-symbol-black.png'}
                alt="Black Logo"
                className="h-9 w-auto object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => blackLogoInputRef.current?.click()}
              className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded font-medium"
            >
              Upload Black Symbol
            </button>
            <input
              type="file"
              ref={blackLogoInputRef}
              accept="image/png,image/svg+xml"
              onChange={handleBlackLogoUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Typography Scale, Header Shapes, Watermark & Accent Controls */}
      <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4">
        <span className="text-xs font-bold text-white block">
          Layout, Geometry &amp; Watermark Settings
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Wordmark Scale Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-neutral-400 font-semibold uppercase">
                Wordmark Lockup Scale
              </label>
              <span className="text-xs font-mono text-white font-bold">
                {Math.round((formData.wordmarkScale || 1.0) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.05"
              value={formData.wordmarkScale || 1.0}
              onChange={(e) => updateField('wordmarkScale', parseFloat(e.target.value))}
              className="w-full accent-white cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-500">
              <span>Compact (70%)</span>
              <span>Default (100%)</span>
              <span>Prominent (150%)</span>
            </div>
          </div>

          {/* Header Diagonal Geometry Toggle */}
          <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
            <div>
              <span className="text-xs font-semibold text-white block">
                Header Diagonal Geometry
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5">
                Subtle dark angular shapes (#1A1A1A / #151515) on header band
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.showHeaderShapes !== false}
              onChange={(e) => updateField('showHeaderShapes', e.target.checked)}
              className="accent-white cursor-pointer w-4 h-4"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-800">
          {/* Body Watermark Toggle & Opacity */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Body Watermark
                </span>
                <span className="text-[10px] text-neutral-400 block">
                  Default OFF. Placed bottom-right, behind content.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.showWatermark === true}
                onChange={(e) => updateField('showWatermark', e.target.checked)}
                className="accent-white cursor-pointer w-4 h-4"
              />
            </div>

            {formData.showWatermark && (
              <div className="pt-2 border-t border-neutral-800 space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Watermark Opacity</span>
                  <span className="font-mono text-white font-bold">
                    {((formData.watermarkOpacity || 0.025) * 100).toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.06"
                  step="0.005"
                  value={formData.watermarkOpacity || 0.025}
                  onChange={(e) => updateField('watermarkOpacity', parseFloat(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Accent Colour Picker */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Accent Colour</span>
              {formData.accentColor && formData.accentColor !== '#0E0E0E' && (
                <button
                  type="button"
                  onClick={() => updateField('accentColor', '#0E0E0E')}
                  className="text-[10px] text-neutral-400 hover:text-white"
                >
                  Reset to Black
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.accentColor || '#0E0E0E'}
                onChange={(e) => updateField('accentColor', e.target.value)}
                className="w-9 h-9 rounded cursor-pointer bg-transparent border border-neutral-700"
              />
              <input
                type="text"
                value={formData.accentColor || '#0E0E0E'}
                onChange={(e) => updateField('accentColor', e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1.5 rounded font-mono uppercase"
              />
            </div>
            <span className="text-[10px] text-neutral-500 block">
              Default: #0E0E0E (black and monochrome palette).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
