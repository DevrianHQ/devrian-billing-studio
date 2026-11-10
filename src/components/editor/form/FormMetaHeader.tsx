import React from 'react';
import { BillingDocument, BusinessProfile, DocumentStatus } from '../../../types';
import { calculateDueDate, calculateValidTillDate } from '../../../services/dateUtils';

interface FormMetaHeaderProps {
  document: BillingDocument;
  business: BusinessProfile;
  onChange: (updated: BillingDocument) => void;
  updateField: <K extends keyof BillingDocument>(field: K, value: BillingDocument[K]) => void;
}

export const FormMetaHeader: React.FC<FormMetaHeaderProps> = ({
  document: doc,
  business,
  onChange,
  updateField,
}) => {
  const isInvoice = doc.type === 'invoice';
  const isQuotation = doc.type === 'quotation';

  return (
    <div className="space-y-3 p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold tracking-wider uppercase text-neutral-300 block">
          Document Identification
        </label>
        {/* Apply Signature Toggle */}
        <label className="flex items-center gap-2 cursor-pointer bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
          <span className="text-[11px] text-neutral-300 font-medium">Apply Signature</span>
          <input
            type="checkbox"
            checked={doc.applySignature}
            onChange={(e) => updateField('applySignature', e.target.checked)}
            className="accent-white cursor-pointer"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            Document No. <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={doc.documentNumber}
            onChange={(e) => updateField('documentNumber', e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none font-bold font-mono"
          />
        </div>

        <div>
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            Status
          </label>
          {isQuotation ? (
            <select
              value={doc.status}
              onChange={(e) => {
                const newStatus = e.target.value as DocumentStatus;
                const log = doc.statusLog || [];
                const updated = {
                  ...doc,
                  status: newStatus,
                  statusLog: [
                    ...log,
                    {
                      status: newStatus,
                      timestamp: new Date().toISOString(),
                      note: `Status updated to ${newStatus}`,
                    },
                  ],
                };
                onChange(updated);
              }}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none font-semibold text-amber-400"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="SENT">SENT</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          ) : (
            <select
              value={doc.status}
              onChange={(e) => updateField('status', e.target.value as DocumentStatus)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none font-semibold"
            >
              <option value="PAID">PAID</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PARTIALLY PAID">PARTIALLY PAID</option>
              <option value="ADVANCE RECEIVED">ADVANCE RECEIVED</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="FINAL">FINAL / ISSUED</option>
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            required
            value={doc.date}
            onChange={(e) => {
              const newDate = e.target.value;
              const updated = { ...doc, date: newDate };
              if (isInvoice) {
                updated.dueDate = calculateDueDate(newDate, doc.paymentTermsPreset || 'Net 7');
              }
              if (isQuotation) {
                updated.validTill = calculateValidTillDate(newDate, business.quotationValidityDays || 15);
              }
              onChange(updated);
            }}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none"
          />
        </div>

        {isInvoice && (
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={doc.dueDate || ''}
              onChange={(e) => updateField('dueDate', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none"
            />
          </div>
        )}

        {isQuotation && (
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Valid Till Date
            </label>
            <input
              type="date"
              value={doc.validTill || ''}
              onChange={(e) => updateField('validTill', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none text-amber-300 font-medium"
            />
          </div>
        )}
      </div>
    </div>
  );
};

