import React from 'react';
import { BillingDocument, GSTType } from '../../../types';
import { formatINR } from '../../../services/indianCurrency';
import { Percent, Hash } from 'lucide-react';

interface FormFinancialsSectionProps {
  document: BillingDocument;
  updateField: <K extends keyof BillingDocument>(field: K, value: BillingDocument[K]) => void;
  recalculateFinancials: (draft: BillingDocument) => void;
}

export const FormFinancialsSection: React.FC<FormFinancialsSectionProps> = ({
  document: doc,
  updateField,
  recalculateFinancials,
}) => {
  const isReceipt = doc.type === 'receipt';
  const isQuotation = doc.type === 'quotation';

  return (
    <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-4">
      <label className="text-[11px] font-bold tracking-wider uppercase text-neutral-300 block">
        Financial Summary &amp; Taxes
      </label>

      {isReceipt ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Total Project Cost (₹)
            </label>
            <input
              type="number"
              min="0"
              value={doc.totalProjectCost ?? ''}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                const updated = { ...doc, totalProjectCost: val };
                recalculateFinancials(updated);
              }}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none font-semibold"
            />
          </div>
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Payment Received (₹)
            </label>
            <input
              type="number"
              min="0"
              value={doc.advanceReceived ?? ''}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                const updated = { ...doc, advanceReceived: val, amountReceived: val };
                recalculateFinancials(updated);
              }}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none font-bold text-emerald-400"
            />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-neutral-400 font-semibold uppercase">
                  Discount
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...doc, discountType: 'flat' as const };
                      recalculateFinancials(updated);
                    }}
                    className={`p-1 rounded text-[10px] ${
                      doc.discountType === 'flat' ? 'bg-white text-black font-bold' : 'text-neutral-400'
                    }`}
                  >
                    <Hash size={10} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...doc, discountType: 'percentage' as const };
                      recalculateFinancials(updated);
                    }}
                    className={`p-1 rounded text-[10px] ${
                      doc.discountType === 'percentage' ? 'bg-white text-black font-bold' : 'text-neutral-400'
                    }`}
                  >
                    <Percent size={10} />
                  </button>
                </div>
              </div>
              <input
                type="number"
                min="0"
                value={doc.discountValue || ''}
                placeholder={doc.discountType === 'percentage' ? '%' : '₹ Flat'}
                onChange={(e) => {
                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                  const updated = { ...doc, discountValue: val };
                  recalculateFinancials(updated);
                }}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none"
              />

              {/* Discount Scope for Monthly / Hybrid */}
              {isQuotation && (doc.quotationType === 'monthly' || doc.quotationType === 'hybrid') && (
                <div className="pt-2 mt-2 border-t border-neutral-800/80">
                  <label className="block text-[9px] text-neutral-400 uppercase font-semibold mb-1">
                    Discount Scope
                  </label>
                  <div className="flex bg-neutral-950 p-0.5 rounded border border-neutral-800 gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => updateField('discountScope', 'monthly')}
                      className={`px-2 py-0.5 rounded font-semibold transition ${
                        (!doc.discountScope || doc.discountScope === 'monthly')
                          ? 'bg-amber-400 text-black font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Monthly Fee
                    </button>
                    {doc.quotationType === 'hybrid' && (
                      <button
                        type="button"
                        onClick={() => updateField('discountScope', 'one_time')}
                        className={`px-2 py-0.5 rounded font-semibold transition ${
                          doc.discountScope === 'one_time'
                            ? 'bg-white text-black font-bold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Setup
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => updateField('discountScope', 'both')}
                      className={`px-2 py-0.5 rounded font-semibold transition ${
                        doc.discountScope === 'both'
                          ? 'bg-white text-black font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Both
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              {isQuotation ? (
                (doc.quotationType === 'monthly' || doc.quotationType === 'hybrid') ? (
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                      Due to Start (Auto-Calculated)
                    </label>
                    <div className="w-full bg-neutral-950 border border-neutral-800 text-emerald-400 text-xs px-3 py-1.5 rounded font-bold font-mono">
                      {formatINR(doc.advanceToStartWork || 0)}
                    </div>
                    <span className="text-[9px] text-neutral-500 mt-1 block">
                      {doc.quotationType === 'hybrid' ? 'One-time setup + 1st month fee' : '1st Month fee in advance'}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] text-neutral-400 font-semibold uppercase">
                        Advance to Start Work
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...doc, advanceType: 'percentage' as const };
                            recalculateFinancials(updated);
                          }}
                          className={`p-1 rounded text-[10px] ${
                            doc.advanceType !== 'flat' ? 'bg-white text-black font-bold' : 'text-neutral-400'
                          }`}
                        >
                          <Percent size={10} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const currentTotal = doc.subtotal - (doc.discountAmount || 0) + (doc.totalTaxAmount || 0);
                            const flatVal = doc.advanceToStartWork || Math.round((currentTotal * (doc.advancePercent ?? 50)) / 100);
                            const updated = { ...doc, advanceType: 'flat' as const, advanceToStartWork: flatVal, advanceReceived: flatVal };
                            recalculateFinancials(updated);
                          }}
                          className={`p-1 rounded text-[10px] ${
                            doc.advanceType === 'flat' ? 'bg-white text-black font-bold' : 'text-neutral-400'
                          }`}
                        >
                          <Hash size={10} />
                        </button>
                      </div>
                    </div>
                    {doc.advanceType === 'flat' ? (
                      <input
                        type="number"
                        min="0"
                        value={doc.advanceToStartWork || ''}
                        placeholder="₹ Flat Advance"
                        onChange={(e) => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          const updated = { ...doc, advanceType: 'flat' as const, advanceToStartWork: val, advanceReceived: val };
                          recalculateFinancials(updated);
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none font-semibold text-emerald-400"
                      />
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={doc.advancePercent ?? 50}
                          placeholder="50"
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                            const updated = { ...doc, advancePercent: val, advanceType: 'percentage' as const };
                            recalculateFinancials(updated);
                          }}
                          className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none font-semibold text-emerald-400 pr-8"
                        />
                        <span className="absolute right-3 top-1.5 text-xs text-neutral-400 font-bold">%</span>
                      </div>
                    )}
                  </>
                )
              ) : (
                <>
                  <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                    Advance Received (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={doc.advanceReceived || ''}
                    placeholder="0"
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      const updated = { ...doc, advanceReceived: val, amountReceived: val };
                      recalculateFinancials(updated);
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none font-semibold"
                  />
                </>
              )}
            </div>
          </div>

          {/* GST Toggle */}
          <div className="pt-2 border-t border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-neutral-200">GST Registration Mode</span>
                <p className="text-[10px] text-neutral-400">
                  {doc.gstEnabled
                    ? isQuotation
                      ? 'GST lines active (Title remains "QUOTATION")'
                      : 'Title is "TAX INVOICE"'
                    : isQuotation
                    ? 'GST: Not applicable (not registered under GST)'
                    : 'Title is "INVOICE" (GST not registered)'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={doc.gstEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    const updated = {
                      ...doc,
                      gstEnabled: enabled,
                      gstRate: enabled ? doc.gstRate || 18 : 0,
                    };
                    recalculateFinancials(updated);
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white"></div>
              </label>
            </div>

            {doc.gstEnabled && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                    GST Rate
                  </label>
                  <select
                    value={doc.gstRate}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const updated = { ...doc, gstRate: val };
                      recalculateFinancials(updated);
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                    Tax Split
                  </label>
                  <select
                    value={doc.gstType}
                    onChange={(e) => {
                      const val = e.target.value as GSTType;
                      const updated = { ...doc, gstType: val };
                      recalculateFinancials(updated);
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none"
                  >
                    <option value="CGST_SGST">CGST + SGST (Intra-state)</option>
                    <option value="IGST">IGST (Inter-state)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

