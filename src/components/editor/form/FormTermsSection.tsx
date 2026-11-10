import React from 'react';
import { BillingDocument, BusinessProfile, DocumentCustomText } from '../../../types';
import { isRetainerTermNeedingReview } from '../../../services/policyAdapter';
import { Plus, Trash2, ArrowUp, ArrowDown, PenTool } from 'lucide-react';

interface FormTermsSectionProps {
  document: BillingDocument;
  business: BusinessProfile;
  onChange: (updated: BillingDocument) => void;
  updateCustomText: (field: keyof DocumentCustomText, val: string) => void;
  onOpenSignatureStudio: () => void;
}

export const FormTermsSection: React.FC<FormTermsSectionProps> = ({
  document: doc,
  business,
  onChange,
  updateCustomText,
  onOpenSignatureStudio,
}) => {
  const isQuotation = doc.type === 'quotation';

  const addTermPoint = () => {
    const updatedNotes = [...doc.notes, 'New point: specify details here'];
    onChange({ ...doc, notes: updatedNotes });
  };

  const updateTermPoint = (index: number, val: string) => {
    const updatedNotes = [...doc.notes];
    updatedNotes[index] = val;
    onChange({ ...doc, notes: updatedNotes });
  };

  const removeTermPoint = (index: number) => {
    const updatedNotes = doc.notes.filter((_, i) => i !== index);
    onChange({ ...doc, notes: updatedNotes });
  };

  const moveTermPoint = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= doc.notes.length) return;
    const updatedNotes = [...doc.notes];
    const temp = updatedNotes[index];
    updatedNotes[index] = updatedNotes[target];
    updatedNotes[target] = temp;
    onChange({ ...doc, notes: updatedNotes });
  };

  return (
    <div className="space-y-4">
      {/* Terms & Notes Reorderable Items */}
      <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-bold tracking-wider uppercase text-neutral-300 block">
            Terms &amp; Notes Points ({doc.notes.length})
          </label>
          <button
            type="button"
            onClick={addTermPoint}
            className="px-2.5 py-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center gap-1"
          >
            <Plus size={12} /> Add Point
          </button>
        </div>

        <div className="space-y-2">
          {doc.notes.map((note, index) => {
            const isRetainerClause =
              isQuotation &&
              (doc.quotationType === 'monthly' || doc.quotationType === 'hybrid') &&
              isRetainerTermNeedingReview(note);

            return (
              <div key={index} className="flex items-start gap-2 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                <div className="flex flex-col items-center pt-1 w-6 shrink-0">
                  <span className="text-xs text-neutral-500 font-bold text-center">
                    {index + 1}.
                  </span>
                  {isRetainerClause && (
                    <span
                      className="mt-1 px-1 py-0.5 rounded bg-amber-950/90 border border-amber-600/70 text-[8px] text-amber-300 font-bold uppercase tracking-wider text-center"
                      title="Retainer-specific rule: not yet in Policies module storage"
                    >
                      Review
                    </span>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => updateTermPoint(index, e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded outline-none resize-none leading-relaxed"
                />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveTermPoint(index, 'up')}
                    className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={index === doc.notes.length - 1}
                    onClick={() => moveTermPoint(index, 'down')}
                    className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTermPoint(index)}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing Line */}
        <div className="pt-2">
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            Closing Line
          </label>
          <input
            type="text"
            value={doc.customText.closingLine}
            onChange={(e) => updateCustomText('closingLine', e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none"
          />
        </div>
      </div>

      {/* Signature Studio Launcher */}
      <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-white block">DEVRIAN Business Signature</span>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            {business.signatureDataUrl
              ? 'Signature configured in storage.'
              : 'No signature configured yet. Create one via scan, draw or script fonts.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSignatureStudio}
          className="px-3.5 py-2 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
        >
          <PenTool size={13} />
          <span>{business.signatureDataUrl ? 'Update Signature' : 'Open Signature Studio'}</span>
        </button>
      </div>
    </div>
  );
};

