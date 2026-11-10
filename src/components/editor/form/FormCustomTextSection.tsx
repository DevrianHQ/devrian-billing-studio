import React from 'react';
import { BillingDocument, DocumentCustomText } from '../../../types';
import { RotateCcw, Bookmark } from 'lucide-react';

interface FormCustomTextSectionProps {
  document: BillingDocument;
  updateCustomText: (field: keyof DocumentCustomText, val: string) => void;
  resetTextToDefault: () => void;
  onSaveAsDefaultText: (type: BillingDocument['type'], customText: DocumentCustomText) => void;
}

export const FormCustomTextSection: React.FC<FormCustomTextSectionProps> = ({
  document: doc,
  updateCustomText,
  resetTextToDefault,
  onSaveAsDefaultText,
}) => {
  const isQuotation = doc.type === 'quotation';

  return (
    <div className="space-y-4 p-5 bg-neutral-900 border border-neutral-800 rounded-xl">
      <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Customize All Static Text Labels
          </h3>
          <p className="text-[10px] text-neutral-400">
            Changes apply only to this document snapshot. Save as default or reset at any time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetTextToDefault}
            className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded flex items-center gap-1"
            title="Reset to default text"
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            type="button"
            onClick={() => {
              onSaveAsDefaultText(doc.type, doc.customText);
              alert(`Saved as default template for all future ${doc.type}s!`);
            }}
            className="px-2.5 py-1 text-xs text-white bg-neutral-700 hover:bg-neutral-600 rounded flex items-center gap-1 font-semibold"
            title="Save as my default template"
          >
            <Bookmark size={12} /> Save as My Default
          </button>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {/* Header Details */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase text-neutral-400 block">Header Band</span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] text-neutral-500 uppercase">Document Title</label>
              <input
                type="text"
                value={doc.customText.documentTitle}
                onChange={(e) => updateCustomText('documentTitle', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-[9px] text-neutral-500 uppercase">Eyebrow</label>
              <input
                type="text"
                value={doc.customText.eyebrow}
                onChange={(e) => updateCustomText('eyebrow', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] text-neutral-500 uppercase">Italic Tagline</label>
            <input
              type="text"
              value={doc.customText.tagline}
              onChange={(e) => updateCustomText('tagline', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded italic"
            />
          </div>

          <div>
            <label className="block text-[9px] text-neutral-500 uppercase">Contact Line</label>
            <input
              type="text"
              value={doc.customText.contactLine}
              onChange={(e) => updateCustomText('contactLine', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
            />
          </div>

          <div>
            <label className="block text-[9px] text-neutral-500 uppercase">Udyam Line</label>
            <input
              type="text"
              value={doc.customText.udyamLine}
              onChange={(e) => updateCustomText('udyamLine', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
            />
          </div>
        </div>

        {/* Section Headings */}
        <div className="pt-2 border-t border-neutral-800 space-y-2">
          <span className="text-[10px] font-bold uppercase text-neutral-400 block">Section Headings</span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] text-neutral-500 uppercase">Client Section Heading</label>
              <input
                type="text"
                value={doc.customText.clientSectionHeading}
                onChange={(e) => updateCustomText('clientSectionHeading', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-[9px] text-neutral-500 uppercase">Items Section Heading</label>
              <input
                type="text"
                value={doc.customText.itemsSectionHeading}
                onChange={(e) => updateCustomText('itemsSectionHeading', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-[9px] text-neutral-500 uppercase">Payment Section Heading</label>
              <input
                type="text"
                value={doc.customText.paymentSectionHeading}
                onChange={(e) => updateCustomText('paymentSectionHeading', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-[9px] text-neutral-500 uppercase">Terms Section Heading</label>
              <input
                type="text"
                value={doc.customText.termsSectionHeading}
                onChange={(e) => updateCustomText('termsSectionHeading', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
              />
            </div>
            {isQuotation && (
              <>
                <div>
                  <label className="block text-[9px] text-neutral-500 uppercase">Deliverables Section Heading</label>
                  <input
                    type="text"
                    value={doc.customText.deliverablesSectionHeading || "WHAT'S INCLUDED EACH MONTH"}
                    onChange={(e) => updateCustomText('deliverablesSectionHeading', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-neutral-500 uppercase">Pricing Section Heading</label>
                  <input
                    type="text"
                    value={doc.customText.pricingSectionHeading || 'PRICING'}
                    onChange={(e) => updateCustomText('pricingSectionHeading', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-neutral-500 uppercase">Billing &amp; Term Heading</label>
                  <input
                    type="text"
                    value={doc.customText.billingSectionHeading || 'BILLING & TERM'}
                    onChange={(e) => updateCustomText('billingSectionHeading', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Table Columns */}
        <div className="pt-2 border-t border-neutral-800 space-y-2">
          <span className="text-[10px] font-bold uppercase text-neutral-400 block">Table Column Labels</span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[9px] text-neutral-500 uppercase">Description Column</label>
              <input
                type="text"
                value={doc.customText.colDescription}
                onChange={(e) => updateCustomText('colDescription', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-[9px] text-neutral-500 uppercase">Rate Column</label>
              <input
                type="text"
                value={doc.customText.colRate}
                onChange={(e) => updateCustomText('colRate', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-[9px] text-neutral-500 uppercase">Amount Column</label>
              <input
                type="text"
                value={doc.customText.colAmount}
                onChange={(e) => updateCustomText('colAmount', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2 py-1 rounded"
              />
            </div>
          </div>
        </div>

        {/* Summary Row Labels */}
        <div className="pt-2 border-t border-neutral-800 space-y-2">
          <span className="text-[10px] font-bold uppercase text-neutral-400 block">Summary Row Labels</span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] text-neutral-500 uppercase">Subtotal Label</label>
              <input
                type="text"
                value={doc.customText.labelSubtotal || ''}
                onChange={(e) => updateCustomText('labelSubtotal', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-[9px] text-neutral-500 uppercase">Discount Label</label>
              <input
                type="text"
                value={doc.customText.labelDiscount || ''}
                onChange={(e) => updateCustomText('labelDiscount', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-[9px] text-neutral-500 uppercase">
                {isQuotation ? 'Advance to Start Label' : 'Advance Received Label'}
              </label>
              <input
                type="text"
                value={isQuotation ? (doc.customText.labelAdvanceToStart || 'Advance to Start Work') : (doc.customText.labelAdvanceReceived || 'Advance Received')}
                onChange={(e) => updateCustomText(isQuotation ? 'labelAdvanceToStart' : 'labelAdvanceReceived', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-[9px] text-neutral-500 uppercase">
                {isQuotation ? 'Balance Payable Label' : 'Balance Due Label'}
              </label>
              <input
                type="text"
                value={doc.customText.labelBalanceDue || ''}
                onChange={(e) => updateCustomText('labelBalanceDue', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2 py-1 rounded"
              />
            </div>
          </div>
        </div>

        {/* GST line */}
        <div className="pt-2 border-t border-neutral-800">
          <label className="block text-[9px] text-neutral-500 uppercase">GST Disclaimer Line</label>
          <input
            type="text"
            value={doc.customText.gstLine}
            onChange={(e) => updateCustomText('gstLine', e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded italic"
          />
        </div>

        {/* Quotation Specific Cover & Instruction Labels */}
        {isQuotation && (
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <span className="text-[10px] font-bold uppercase text-neutral-400 block">Cover Page &amp; Acceptance Labels</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] text-neutral-500 uppercase">Cover Eyebrow</label>
                <input
                  type="text"
                  value={
                    doc.customText.coverEyebrow !== undefined
                      ? doc.customText.coverEyebrow
                      : (doc.quotationType === 'monthly' ? 'QUOTATION · MONTHLY RETAINER' : 'QUOTATION · ONE-TIME PROJECT')
                  }
                  onChange={(e) => updateCustomText('coverEyebrow', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
                />
              </div>
              <div>
                <label className="block text-[9px] text-neutral-500 uppercase">Cover Title</label>
                <input
                  type="text"
                  value={
                    doc.customText.coverTitle !== undefined
                      ? doc.customText.coverTitle
                      : (doc.quotationType === 'monthly' ? 'MONTHLY\nRETAINER' : 'PROJECT\nQUOTATION')
                  }
                  onChange={(e) => updateCustomText('coverTitle', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
                />
              </div>
              <div>
                <label className="block text-[9px] text-neutral-500 uppercase">Prepared By (Name)</label>
                <input
                  type="text"
                  value={
                    doc.customText.preparedByName !== undefined
                      ? doc.customText.preparedByName
                      : 'Dev Rajpoot'
                  }
                  onChange={(e) => updateCustomText('preparedByName', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
                />
              </div>
              <div>
                <label className="block text-[9px] text-neutral-500 uppercase">Prepared By (Role / Company)</label>
                <input
                  type="text"
                  value={
                    doc.customText.preparedByTitle !== undefined
                      ? doc.customText.preparedByTitle
                      : 'Founder & CEO, DEVRIAN'
                  }
                  onChange={(e) => updateCustomText('preparedByTitle', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[9px] text-neutral-500 uppercase">Prepared By (Contact Line)</label>
                <input
                  type="text"
                  value={
                    doc.customText.preparedByContact !== undefined
                      ? doc.customText.preparedByContact
                      : 'inquiry@devrian.in • devrian.in'
                  }
                  onChange={(e) => updateCustomText('preparedByContact', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[9px] text-neutral-500 uppercase">Acceptance Instruction Line</label>
                <input
                  type="text"
                  value={
                    doc.customText.instructionLine !== undefined
                      ? doc.customText.instructionLine
                      : 'To accept, confirm in writing (WhatsApp/email) or sign below, and pay the amount due to start.'
                  }
                  onChange={(e) => updateCustomText('instructionLine', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

