import React, { useState } from 'react';
import { BusinessProfile } from '../../types';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface SettingsPaymentConfigProps {
  formData: BusinessProfile;
  updateField: <K extends keyof BusinessProfile>(field: K, value: BusinessProfile[K]) => void;
}

export const SettingsPaymentConfig: React.FC<SettingsPaymentConfigProps> = ({
  formData,
  updateField,
}) => {
  const [showAccountNum, setShowAccountNum] = useState(false);

  return (
    <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
        3. Payment Details Configuration
      </h2>

      {/* Bank Details */}
      <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-white">Bank Transfer Details</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-xs text-neutral-300">Show on documents</span>
            <input
              type="checkbox"
              checked={formData.showBankDetails}
              onChange={(e) => updateField('showBankDetails', e.target.checked)}
              className="accent-white"
            />
          </label>
        </div>

        {formData.showBankDetails &&
          (!formData.bankName?.trim() ||
            !formData.bankAccountNumber?.trim() ||
            !formData.bankIfsc?.trim()) && (
            <div className="text-[11px] text-red-400 flex items-center gap-1.5 bg-red-950/40 p-2 rounded border border-red-800/40">
              <AlertTriangle size={13} />
              <span>
                Warning: Bank transfer is toggled ON, but Bank Name, A/c Number, or IFSC are empty.
                PDF export will be blocked until filled.
              </span>
            </div>
          )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Account Name
            </label>
            <input
              type="text"
              value={formData.bankAccountName}
              onChange={(e) => updateField('bankAccountName', e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Bank Name
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC Bank"
              value={formData.bankName}
              onChange={(e) => updateField('bankName', e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase">
                Account Number
              </label>
              <button
                type="button"
                onClick={() => setShowAccountNum(!showAccountNum)}
                className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
                title={showAccountNum ? 'Mask account number' : 'Reveal account number'}
              >
                {showAccountNum ? <EyeOff size={11} /> : <Eye size={11} />}
                <span>{showAccountNum ? 'Mask' : 'Reveal'}</span>
              </button>
            </div>
            <input
              type={showAccountNum ? 'text' : 'password'}
              placeholder="e.g. 50100..."
              value={formData.bankAccountNumber}
              onChange={(e) => updateField('bankAccountNumber', e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              IFSC Code
            </label>
            <input
              type="text"
              placeholder="e.g. HDFC0001234"
              value={formData.bankIfsc}
              onChange={(e) => updateField('bankIfsc', e.target.value.toUpperCase())}
              className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none uppercase font-mono"
            />
          </div>
        </div>
      </div>

      {/* UPI Details */}
      <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-white">UPI Details & QR Code</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <span className="text-xs text-neutral-300">Show UPI ID</span>
              <input
                type="checkbox"
                checked={formData.showUpi}
                onChange={(e) => updateField('showUpi', e.target.checked)}
                className="accent-white"
              />
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <span className="text-xs text-neutral-300">Show UPI QR</span>
              <input
                type="checkbox"
                checked={formData.showUpiQr}
                onChange={(e) => updateField('showUpiQr', e.target.checked)}
                className="accent-white"
              />
            </label>
          </div>
        </div>

        {(formData.showUpi || formData.showUpiQr) && !formData.upiId?.trim() && (
          <div className="text-[11px] text-red-400 flex items-center gap-1.5 bg-red-950/40 p-2 rounded border border-red-800/40">
            <AlertTriangle size={13} />
            <span>
              Warning: UPI is toggled ON, but UPI ID is empty. PDF export will be blocked until
              filled.
            </span>
          </div>
        )}

        <div>
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            UPI ID (VPA)
          </label>
          <input
            type="text"
            placeholder="e.g. inquiry@devrian.in"
            value={formData.upiId}
            onChange={(e) => updateField('upiId', e.target.value.trim())}
            className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none font-mono"
          />
        </div>
      </div>
    </div>
  );
};

