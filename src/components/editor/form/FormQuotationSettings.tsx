import React from 'react';
import { BillingDocument, MonthlyDeliverable, QuotationType, BusinessProfile } from '../../../types';
import { DEFAULT_MONTHLY_DELIVERABLES } from '../../../services/seedData';
import { PROJECT_DEFAULT_TERMS, MONTHLY_DEFAULT_TERMS, resolveQuotationTermsList } from '../../../services/policyAdapter';
import { Plus, Trash2, ArrowUp, ArrowDown, Briefcase, Calendar, CheckCircle2 } from 'lucide-react';

interface FormQuotationSettingsProps {
  document: BillingDocument;
  business: BusinessProfile;
  onChange: (updated: BillingDocument) => void;
  updateField: <K extends keyof BillingDocument>(field: K, value: BillingDocument[K]) => void;
  recalculateFinancials: (draft: BillingDocument) => void;
}

export const FormQuotationSettings: React.FC<FormQuotationSettingsProps> = ({
  document: doc,
  business,
  onChange,
  updateField,
  recalculateFinancials,
}) => {
  if (doc.type !== 'quotation') return null;

  const currentType: QuotationType = doc.quotationType === 'monthly' ? 'monthly' : 'project';

  const handleQuotationTypeChange = (newType: 'project' | 'monthly') => {
    if (currentType === newType && doc.quotationType) return;

    let updatedItems = doc.items;
    if (newType === 'project') {
      updatedItems = doc.items.map((it) => ({ ...it, billing: 'one_time' as const }));
    } else {
      updatedItems = doc.items.map((it) => ({ ...it, billing: 'monthly' as const }));
    }

    const projectTerms = business.projectQuotationDefaults?.termsTemplate || business.quotationTermsTemplate || PROJECT_DEFAULT_TERMS;
    const monthlyTerms = business.monthlyQuotationDefaults?.termsTemplate || MONTHLY_DEFAULT_TERMS;
    const termsTemplate = newType === 'project' ? projectTerms : monthlyTerms;
    const resolvedTerms = resolveQuotationTermsList(termsTemplate, business);

    const defaultDeliverables = business.monthlyQuotationDefaults?.deliverables || DEFAULT_MONTHLY_DELIVERABLES;

    const updated: BillingDocument = {
      ...doc,
      quotationType: newType,
      items: updatedItems,
      monthlyDeliverables:
        newType === 'monthly'
          ? (doc.monthlyDeliverables && doc.monthlyDeliverables.length > 0 ? doc.monthlyDeliverables : [...defaultDeliverables])
          : doc.monthlyDeliverables,
      contractStartDate: doc.contractStartDate || doc.date,
      minTermMonths: doc.minTermMonths || business.monthlyQuotationDefaults?.minTermMonths || 3,
      noticePeriodDays: doc.noticePeriodDays || business.monthlyQuotationDefaults?.noticePeriodDays || 30,
      autoRenewal: doc.autoRenewal ?? true,
      notes: resolvedTerms,
    };
    recalculateFinancials(updated);
  };

  const handleAddDeliverable = () => {
    const current = doc.monthlyDeliverables || [];
    const newItem: MonthlyDeliverable = {
      id: `deliv-${Date.now()}`,
      item: 'New Monthly Deliverable',
      quantity: '1 / month',
    };
    onChange({ ...doc, monthlyDeliverables: [...current, newItem] });
  };

  const handleUpdateDeliverable = (id: string, updates: Partial<MonthlyDeliverable>) => {
    const current = doc.monthlyDeliverables || [];
    const updated = current.map((d) => (d.id === id ? { ...d, ...updates } : d));
    onChange({ ...doc, monthlyDeliverables: updated });
  };

  const handleRemoveDeliverable = (id: string) => {
    const current = doc.monthlyDeliverables || [];
    const updated = current.filter((d) => d.id !== id);
    onChange({ ...doc, monthlyDeliverables: updated });
  };

  const handleMoveDeliverable = (index: number, dir: 'up' | 'down') => {
    const current = [...(doc.monthlyDeliverables || [])];
    const targetIndex = dir === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;
    const temp = current[index];
    current[index] = current[targetIndex];
    current[targetIndex] = temp;
    onChange({ ...doc, monthlyDeliverables: current });
  };

  const handleResetDeliverables = () => {
    const defaultDeliverables = business.monthlyQuotationDefaults?.deliverables || DEFAULT_MONTHLY_DELIVERABLES;
    if (window.confirm('Reset monthly deliverables to default template?')) {
      onChange({ ...doc, monthlyDeliverables: [...defaultDeliverables] });
    }
  };

  const isMonthly = currentType === 'monthly';

  return (
    <div className="space-y-4">
      {/* 1. Quotation Model Switcher (Strict Separation: One-Time Project vs Monthly Retainer) */}
      <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-2.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
            Quotation Type
          </label>
          <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
            <CheckCircle2 size={11} />
            {isMonthly ? 'Monthly Recurring Retainer' : 'One-Time Project'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1.5 rounded-lg border border-neutral-800">
          <button
            type="button"
            onClick={() => handleQuotationTypeChange('project')}
            className={`py-2 px-3 rounded text-xs font-semibold flex items-center justify-center gap-2 transition ${
              !isMonthly
                ? 'bg-white text-black font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Briefcase size={13} />
            <span>One-Time Project</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuotationTypeChange('monthly')}
            className={`py-2 px-3 rounded text-xs font-semibold flex items-center justify-center gap-2 transition ${
              isMonthly
                ? 'bg-amber-400 text-black font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calendar size={13} />
            <span>Monthly Recurring</span>
          </button>
        </div>

        {!isMonthly ? (
          <p className="text-[11px] text-neutral-400 pt-1">
            Fixed scope project with advance payment, milestone delivery, and balance payable upon completion.
          </p>
        ) : (
          <p className="text-[11px] text-neutral-400 pt-1">
            Ongoing monthly retainer service with recurring deliverables, minimum commitment term, and monthly advance billing.
          </p>
        )}
      </div>

      {/* 2. Monthly Deliverables (ONLY FOR MONTHLY RECURRING) */}
      {isMonthly && (
        <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <label className="text-[11px] font-bold tracking-wider uppercase text-neutral-300 block">
                What's Included Each Month (Deliverables)
              </label>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                Clean recurring scope table rendered on Page 1 before pricing.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetDeliverables}
                className="px-2 py-1 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700"
                title="Reset to default template"
              >
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="px-2.5 py-1 text-[11px] bg-white text-black font-bold rounded flex items-center gap-1 shadow"
              >
                <Plus size={12} /> Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {(doc.monthlyDeliverables || []).map((deliv, idx) => {
              return (
                <div
                  key={deliv.id}
                  className="p-2 rounded-lg border border-neutral-800 bg-neutral-950 flex items-start gap-2"
                >
                  <span className="text-xs text-neutral-500 font-bold pt-1.5 w-5 text-center">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={deliv.item}
                        onChange={(e) => handleUpdateDeliverable(deliv.id, { item: e.target.value })}
                        placeholder="Deliverable title (e.g. Reels, Thumbnails...)"
                        className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded outline-none font-medium"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={deliv.quantity}
                        onChange={(e) => handleUpdateDeliverable(deliv.id, { quantity: e.target.value })}
                        placeholder="Qty / Freq (e.g. 8 / month)"
                        className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 pt-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveDeliverable(idx, 'up')}
                      className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                      title="Move up"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === (doc.monthlyDeliverables || []).length - 1}
                      onClick={() => handleMoveDeliverable(idx, 'down')}
                      className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                      title="Move down"
                    >
                      <ArrowDown size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(deliv.id)}
                      className="p-1 text-neutral-500 hover:text-red-400 ml-1"
                      title="Remove deliverable"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Billing & Retainer Controls (ONLY FOR MONTHLY RECURRING) */}
      {isMonthly && (
        <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
          <label className="text-[11px] font-bold tracking-wider uppercase text-neutral-300 block">
            Billing &amp; Retainer Terms
          </label>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Contract Start Date
              </label>
              <input
                type="date"
                value={doc.contractStartDate || doc.date}
                onChange={(e) => updateField('contractStartDate', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1.5 rounded outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Minimum Commitment
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={doc.minTermMonths ?? 3}
                  onChange={(e) => updateField('minTermMonths', parseInt(e.target.value, 10) || 1)}
                  className="w-16 bg-neutral-950 border border-neutral-800 text-white text-xs px-2 py-1.5 rounded outline-none font-bold text-center"
                />
                <span className="text-[11px] text-neutral-400">months</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Cancellation Notice
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={doc.noticePeriodDays ?? 30}
                  onChange={(e) => updateField('noticePeriodDays', parseInt(e.target.value, 10) || 0)}
                  className="w-16 bg-neutral-950 border border-neutral-800 text-white text-xs px-2 py-1.5 rounded outline-none font-bold text-center"
                />
                <span className="text-[11px] text-neutral-400">days notice</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Renewal Policy
              </label>
              <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={doc.autoRenewal ?? true}
                  onChange={(e) => updateField('autoRenewal', e.target.checked)}
                  className="accent-white cursor-pointer"
                />
                <span className="text-[11px] text-neutral-300">Auto-renews monthly</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
