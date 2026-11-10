import React from 'react';
import { BillingDocument, PaymentDetailRow } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';

interface FormPaymentSectionProps {
  document: BillingDocument;
  onChange: (updated: BillingDocument) => void;
  updateVisibility: (field: keyof BillingDocument['sectionVisibility'], val: boolean) => void;
}

export const FormPaymentSection: React.FC<FormPaymentSectionProps> = ({
  document: doc,
  onChange,
  updateVisibility,
}) => {
  const addPaymentRow = () => {
    const newRow: PaymentDetailRow = {
      id: `pr-${Date.now()}`,
      label: 'New Payment Method',
      value: '',
      enabled: true,
    };
    const rows = [...(doc.paymentRows || []), newRow];
    onChange({ ...doc, paymentRows: rows });
  };

  const updatePaymentRow = (id: string, updates: Partial<PaymentDetailRow>) => {
    const rows = (doc.paymentRows || []).map((r) => (r.id === id ? { ...r, ...updates } : r));
    const pDetails = { ...doc.paymentDetails };
    rows.forEach((r) => {
      const l = r.label.toLowerCase();
      if (l.includes('upi')) pDetails.showUpiOnDoc = r.enabled;
      if (l.includes('bank')) pDetails.showBankOnDoc = r.enabled;
    });
    onChange({ ...doc, paymentRows: rows, paymentDetails: pDetails });
  };

  const removePaymentRow = (id: string) => {
    const rows = (doc.paymentRows || []).filter((r) => r.id !== id);
    onChange({ ...doc, paymentRows: rows });
  };

  return (
    <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold tracking-wider uppercase text-neutral-300 block">
          Payment Details Table Rows
        </label>
        <button
          type="button"
          onClick={addPaymentRow}
          className="px-2.5 py-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center gap-1"
        >
          <Plus size={12} /> Add Row
        </button>
      </div>

      <div className="space-y-2">
        {(doc.paymentRows || []).map((row) => (
          <div key={row.id} className="flex items-center gap-2 bg-neutral-950 p-2 rounded-lg border border-neutral-800">
            <input
              type="checkbox"
              checked={row.enabled}
              onChange={(e) => updatePaymentRow(row.id, { enabled: e.target.checked })}
              className="accent-white cursor-pointer"
              title="Toggle row display"
            />
            <input
              type="text"
              value={row.label}
              onChange={(e) => updatePaymentRow(row.id, { label: e.target.value })}
              placeholder="Pay via label"
              className="w-32 bg-neutral-900 border border-neutral-800 text-white text-xs px-2 py-1 rounded outline-none font-bold"
            />
            <input
              type="text"
              value={row.value}
              onChange={(e) => updatePaymentRow(row.id, { value: e.target.value })}
              placeholder="Details value"
              className="flex-1 bg-neutral-900 border border-neutral-800 text-white text-xs px-2 py-1 rounded outline-none"
            />
            <button
              type="button"
              onClick={() => removePaymentRow(row.id)}
              className="p-1 text-neutral-500 hover:text-red-400"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-neutral-800 text-xs">
        <span>Show UPI QR Code on Document</span>
        <input
          type="checkbox"
          checked={doc.sectionVisibility.showUpiQr}
          onChange={(e) => updateVisibility('showUpiQr', e.target.checked)}
          className="accent-white cursor-pointer"
        />
      </div>
    </div>
  );
};

