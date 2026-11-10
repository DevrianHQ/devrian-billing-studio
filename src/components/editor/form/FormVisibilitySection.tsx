import React, { useState } from 'react';
import { BillingDocument } from '../../../types';
import { StorageService } from '../../../services/storage';
import { Bookmark, Check } from 'lucide-react';

interface FormVisibilitySectionProps {
  document: BillingDocument;
  updateVisibility: (field: keyof BillingDocument['sectionVisibility'], val: boolean) => void;
}

export const FormVisibilitySection: React.FC<FormVisibilitySectionProps> = ({
  document: doc,
  updateVisibility,
}) => {
  const [saveToast, setSaveToast] = useState(false);
  const isQuotation = doc.type === 'quotation';

  const handleSaveDefaults = () => {
    StorageService.saveDefaultVisibility(doc.type, doc.sectionVisibility);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Section Visibility Controls
          </h3>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            Toggles auto-save as default for all future {doc.type}s.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveDefaults}
          className="px-2.5 py-1 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 rounded border border-amber-500/50 flex items-center gap-1 font-semibold transition"
          title="Save current visibility settings as default"
        >
          {saveToast ? <Check size={12} className="text-emerald-400" /> : <Bookmark size={12} />}
          <span>{saveToast ? 'Defaults Saved!' : 'Save as Default'}</span>
        </button>
      </div>

      <div className="space-y-2.5 text-xs divide-y divide-neutral-800/80">
        {isQuotation && (
          <>
            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Inclusions &amp; Exclusions Box (Optional)</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showInclusions ?? false}
                onChange={(e) => updateVisibility('showInclusions', e.target.checked)}
                className="accent-white cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Delivery Timeline Box (Optional)</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showTimeline ?? false}
                onChange={(e) => updateVisibility('showTimeline', e.target.checked)}
                className="accent-white cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Free Notes Box (Optional)</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showFreeNotes ?? false}
                onChange={(e) => updateVisibility('showFreeNotes', e.target.checked)}
                className="accent-white cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Acceptance &amp; Signatures Box</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showAcceptance ?? true}
                onChange={(e) => updateVisibility('showAcceptance', e.target.checked)}
                className="accent-white cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Client Signature Line in Acceptance</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showClientSignature ?? true}
                onChange={(e) => updateVisibility('showClientSignature', e.target.checked)}
                className="accent-white cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Hide Rows with Zero Value in Summary</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.hideZeroRows ?? true}
                onChange={(e) => updateVisibility('hideZeroRows', e.target.checked)}
                className="accent-white cursor-pointer"
              />
            </label>
          </>
        )}

        <label className="flex items-center justify-between pt-2 cursor-pointer">
          <span>Show Discount Row</span>
          <input
            type="checkbox"
            checked={doc.sectionVisibility.showDiscount}
            onChange={(e) => updateVisibility('showDiscount', e.target.checked)}
            className="accent-white cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between pt-2 cursor-pointer">
          <span>Show Advance / Initial Payment Row</span>
          <input
            type="checkbox"
            checked={doc.sectionVisibility.showAdvance}
            onChange={(e) => updateVisibility('showAdvance', e.target.checked)}
            className="accent-white cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between pt-2 cursor-pointer">
          <span>Show GST Tax Breakdown Lines</span>
          <input
            type="checkbox"
            checked={doc.sectionVisibility.showGstLine}
            onChange={(e) => updateVisibility('showGstLine', e.target.checked)}
            className="accent-white cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between pt-2 cursor-pointer">
          <span>Show Payment Details Box</span>
          <input
            type="checkbox"
            checked={doc.sectionVisibility.showPaymentDetails}
            onChange={(e) => updateVisibility('showPaymentDetails', e.target.checked)}
            className="accent-white cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between pt-2 cursor-pointer">
          <span>Show Terms &amp; Notes Section</span>
          <input
            type="checkbox"
            checked={doc.sectionVisibility.showTermsAndNotes}
            onChange={(e) => updateVisibility('showTermsAndNotes', e.target.checked)}
            className="accent-white cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between pt-2 cursor-pointer">
          <span>Show Closing Line</span>
          <input
            type="checkbox"
            checked={doc.sectionVisibility.showClosingLine}
            onChange={(e) => updateVisibility('showClosingLine', e.target.checked)}
            className="accent-white cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between pt-2 cursor-pointer">
          <span>Show Signatory Block</span>
          <input
            type="checkbox"
            checked={doc.sectionVisibility.showSignature}
            onChange={(e) => updateVisibility('showSignature', e.target.checked)}
            className="accent-white cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between pt-2 cursor-pointer">
          <span>Show Document Audit Line</span>
          <input
            type="checkbox"
            checked={doc.sectionVisibility.showAuditLine}
            onChange={(e) => updateVisibility('showAuditLine', e.target.checked)}
            className="accent-white cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between pt-2 cursor-pointer">
          <span>Show Non-Banking Legal Disclaimer</span>
          <input
            type="checkbox"
            checked={doc.sectionVisibility.showLegalDisclaimer}
            onChange={(e) => updateVisibility('showLegalDisclaimer', e.target.checked)}
            className="accent-white cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between pt-2 cursor-pointer">
          <span>Show Amount in Words (Indian Format)</span>
          <input
            type="checkbox"
            checked={doc.sectionVisibility.showAmountInWords}
            onChange={(e) => updateVisibility('showAmountInWords', e.target.checked)}
            className="accent-white cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};

