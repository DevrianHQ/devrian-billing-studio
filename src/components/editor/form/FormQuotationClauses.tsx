import React from 'react';
import { BillingDocument, DocumentSectionVisibility } from '../../../types';
import { AlertCircle } from 'lucide-react';

interface FormQuotationClausesProps {
  document: BillingDocument;
  updateField: <K extends keyof BillingDocument>(field: K, value: BillingDocument[K]) => void;
  updateVisibility: <K extends keyof DocumentSectionVisibility>(
    key: K,
    val: DocumentSectionVisibility[K]
  ) => void;
}

export const FormQuotationClauses: React.FC<FormQuotationClausesProps> = ({
  document: doc,
  updateField,
  updateVisibility,
}) => {
  if (doc.type !== 'quotation') return null;

  const isProject = !doc.quotationType || doc.quotationType === 'project';

  return (
    <div className="space-y-4">
      {/* 1. Project Timeline / Delivery Schedule (for One-Time Project) */}
      {isProject && (
        <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <label className="text-[11px] font-bold tracking-wider uppercase text-neutral-300 block">
                Estimated Delivery &amp; Project Schedule
              </label>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                Expected turnaround timeline for the project.
              </p>
            </div>
          </div>

          <div>
            <input
              type="text"
              value={doc.estimatedDelivery || ''}
              onChange={(e) => updateField('estimatedDelivery', e.target.value)}
              placeholder="e.g. 10 working days after advance and required materials"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-2 rounded outline-none font-medium"
            />
          </div>
        </div>
      )}

      {/* 2. Optional Inclusions & Exclusions */}
      <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-bold tracking-wider uppercase text-neutral-300 block">
            Scope Inclusions &amp; Exclusions (Optional)
          </label>
          <label className="flex items-center gap-2 cursor-pointer bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
            <span className="text-[10px] text-neutral-400">Show on Doc</span>
            <input
              type="checkbox"
              checked={doc.sectionVisibility.showInclusions ?? false}
              onChange={(e) => updateVisibility('showInclusions', e.target.checked)}
              className="accent-white cursor-pointer"
            />
          </label>
        </div>

        {doc.sectionVisibility.showInclusions && (
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-neutral-400 font-semibold uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Specifically Included:</span>
                </label>
                {doc.inclusions && /\[.+?\]/.test(doc.inclusions) && (
                  <span className="text-[9px] text-red-400 font-semibold flex items-center gap-1">
                    <AlertCircle size={11} /> Unfilled placeholder [ ] blocks export
                  </span>
                )}
              </div>
              <textarea
                rows={2}
                value={doc.inclusions || ''}
                onChange={(e) => updateField('inclusions', e.target.value)}
                placeholder="e.g. Video editing, colour grading, sound design, 2 revision rounds..."
                className={`w-full bg-neutral-950 text-white text-xs px-3 py-2 rounded outline-none border resize-none leading-relaxed ${
                  doc.inclusions && /\[.+?\]/.test(doc.inclusions)
                    ? 'border-red-500 ring-1 ring-red-500/50'
                    : 'border-neutral-800 focus:border-white'
                }`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-neutral-400 font-semibold uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  <span>Not Included / Excluded:</span>
                </label>
                {doc.exclusions && /\[.+?\]/.test(doc.exclusions) && (
                  <span className="text-[9px] text-red-400 font-semibold flex items-center gap-1">
                    <AlertCircle size={11} /> Unfilled placeholder [ ] blocks export
                  </span>
                )}
              </div>
              <textarea
                rows={2}
                value={doc.exclusions || ''}
                onChange={(e) => updateField('exclusions', e.target.value)}
                placeholder="e.g. Raw footage shoots, paid stock footage licenses, ad spend..."
                className={`w-full bg-neutral-950 text-white text-xs px-3 py-2 rounded outline-none border resize-none leading-relaxed ${
                  doc.exclusions && /\[.+?\]/.test(doc.exclusions)
                    ? 'border-red-500 ring-1 ring-red-500/50'
                    : 'border-neutral-800 focus:border-white'
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Acceptance & Client Signature */}
      <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <label className="text-[11px] font-bold tracking-wider uppercase text-neutral-300 block">
              Client Acceptance &amp; Signature
            </label>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Client sign-off block on the last page.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
            <span className="text-[10px] text-neutral-400">Show on Doc</span>
            <input
              type="checkbox"
              checked={doc.sectionVisibility.showAcceptance ?? true}
              onChange={(e) => updateVisibility('showAcceptance', e.target.checked)}
              className="accent-white cursor-pointer"
            />
          </label>
        </div>

        {doc.sectionVisibility.showAcceptance && (
          <div className="space-y-2 pt-1 border-t border-neutral-800/80 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-neutral-300">Show Client Signature Column</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showClientSignature ?? true}
                onChange={(e) => updateVisibility('showClientSignature', e.target.checked)}
                className="accent-white cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-neutral-300">Show Non-Banking Legal Disclaimer</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showLegalDisclaimer ?? true}
                onChange={(e) => updateVisibility('showLegalDisclaimer', e.target.checked)}
                className="accent-white cursor-pointer"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

