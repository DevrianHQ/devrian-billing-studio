import React from 'react';
import { BusinessProfile } from '../../types';
import { DEFAULT_MONTHLY_DELIVERABLES, DEFAULT_QUOTATION_TERMS, DEFAULT_MONTHLY_TERMS } from '../../services/seedData';
import { Briefcase, Calendar, Plus, Trash2 } from 'lucide-react';

interface SettingsQuotationDefaultsSectionProps {
  formData: BusinessProfile;
  updateProjectDefault: <K extends keyof NonNullable<BusinessProfile['projectQuotationDefaults']>>(
    field: K,
    value: NonNullable<BusinessProfile['projectQuotationDefaults']>[K]
  ) => void;
  updateMonthlyDefault: <K extends keyof NonNullable<BusinessProfile['monthlyQuotationDefaults']>>(
    field: K,
    value: NonNullable<BusinessProfile['monthlyQuotationDefaults']>[K]
  ) => void;
}

export const SettingsQuotationDefaultsSection: React.FC<SettingsQuotationDefaultsSectionProps> = ({
  formData,
  updateProjectDefault,
  updateMonthlyDefault,
}) => {
  return (
    <>
      {/* 6A. ONE-TIME PROJECT QUOTATION DEFAULTS */}
      <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-white" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
              6A. One-Time Project Quotation Defaults
            </h2>
          </div>
          <span className="text-[10px] bg-neutral-800 text-neutral-300 font-mono px-2 py-0.5 rounded">
            Project Defaults
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Default Validity (Days)
            </label>
            <input
              type="number"
              min="1"
              value={formData.projectQuotationDefaults?.validityDays ?? formData.quotationValidityDays ?? 15}
              onChange={(e) => updateProjectDefault('validityDays', Math.max(1, parseInt(e.target.value) || 15))}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none font-mono"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">Valid Till = Quotation Date + N days</span>
          </div>
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Advance Required (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.projectQuotationDefaults?.advancePercent ?? formData.advancePercentDefault ?? 50}
              onChange={(e) => updateProjectDefault('advancePercent', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none font-mono"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">Default advance % to start work</span>
          </div>
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Balance Due Window (Hours)
            </label>
            <input
              type="number"
              min="1"
              value={formData.projectQuotationDefaults?.balanceDueHours ?? formData.balanceDueHoursDefault ?? 48}
              onChange={(e) => updateProjectDefault('balanceDueHours', Math.max(1, parseInt(e.target.value) || 48))}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none font-mono"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">Hours to pay after completion</span>
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            Default Project Delivery Timeline Text
          </label>
          <input
            type="text"
            value={formData.projectQuotationDefaults?.deliveryTimeline || '10 working days after advance and required materials'}
            onChange={(e) => updateProjectDefault('deliveryTimeline', e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none"
            placeholder="e.g. 10 working days after advance and required materials"
          />
        </div>

        <div>
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            Default Project Closing Line
          </label>
          <input
            type="text"
            value={formData.projectQuotationDefaults?.closingLine || formData.quotationClosingTemplate || 'Thank you for considering DEVRIAN. We look forward to working with you.'}
            onChange={(e) => updateProjectDefault('closingLine', e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none"
          />
        </div>

        {/* Project Default Terms List */}
        <div className="pt-2 border-t border-neutral-800/80 space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase">
              Default Project Terms &amp; Conditions
            </label>
            <button
              type="button"
              onClick={() => {
                const currentTerms = formData.projectQuotationDefaults?.termsTemplate || DEFAULT_QUOTATION_TERMS;
                updateProjectDefault('termsTemplate', [...currentTerms, 'New project term point...']);
              }}
              className="text-[10px] text-white bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded flex items-center gap-1"
            >
              <Plus size={10} /> Add Point
            </button>
          </div>
          <div className="space-y-1.5">
            {(formData.projectQuotationDefaults?.termsTemplate || DEFAULT_QUOTATION_TERMS).map((term: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-500 font-mono w-4">{idx + 1}.</span>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const currentTerms = [...(formData.projectQuotationDefaults?.termsTemplate || DEFAULT_QUOTATION_TERMS)];
                    currentTerms[idx] = e.target.value;
                    updateProjectDefault('termsTemplate', currentTerms);
                  }}
                  className="flex-1 bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const currentTerms = [...(formData.projectQuotationDefaults?.termsTemplate || DEFAULT_QUOTATION_TERMS)];
                    currentTerms.splice(idx, 1);
                    updateProjectDefault('termsTemplate', currentTerms);
                  }}
                  className="p-1 text-neutral-500 hover:text-red-400"
                  title="Remove term"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6B. MONTHLY RECURRING QUOTATION DEFAULTS */}
      <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
              6B. Monthly Recurring Quotation Defaults
            </h2>
          </div>
          <span className="text-[10px] bg-amber-950/60 border border-amber-800/60 text-amber-300 font-mono px-2 py-0.5 rounded">
            Monthly Retainer Defaults
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Default Validity (Days)
            </label>
            <input
              type="number"
              min="1"
              value={formData.monthlyQuotationDefaults?.validityDays ?? 15}
              onChange={(e) => updateMonthlyDefault('validityDays', Math.max(1, parseInt(e.target.value) || 15))}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none font-mono"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">Valid Till = Quotation Date + N days</span>
          </div>
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Minimum Commitment (Months)
            </label>
            <input
              type="number"
              min="1"
              max="36"
              value={formData.monthlyQuotationDefaults?.minTermMonths ?? 3}
              onChange={(e) => updateMonthlyDefault('minTermMonths', Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none font-mono"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">Default minimum contract term</span>
          </div>
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Notice Period (Days)
            </label>
            <input
              type="number"
              min="0"
              max="180"
              value={formData.monthlyQuotationDefaults?.noticePeriodDays ?? 30}
              onChange={(e) => updateMonthlyDefault('noticePeriodDays', Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none font-mono"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">Cancellation notice window</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Default Billing Cycle
            </label>
            <input
              type="text"
              value={formData.monthlyQuotationDefaults?.billingCycle || 'Monthly'}
              onChange={(e) => updateMonthlyDefault('billingCycle', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Default Payment Due Policy
            </label>
            <input
              type="text"
              value={formData.monthlyQuotationDefaults?.paymentDueDescription || 'In advance, before each cycle begins'}
              onChange={(e) => updateMonthlyDefault('paymentDueDescription', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            Default Auto-Renewal Policy Description
          </label>
          <input
            type="text"
            value={formData.monthlyQuotationDefaults?.autoRenewalDescription || 'Auto-renews monthly until cancelled'}
            onChange={(e) => updateMonthlyDefault('autoRenewalDescription', e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            Default Monthly Retainer Closing Line
          </label>
          <input
            type="text"
            value={formData.monthlyQuotationDefaults?.closingLine || 'Thank you for considering DEVRIAN. We look forward to working with you.'}
            onChange={(e) => updateMonthlyDefault('closingLine', e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none"
          />
        </div>

        {/* Monthly Default Deliverables Template */}
        <div className="pt-2 border-t border-neutral-800/80 space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase">
              Default Monthly Deliverables Template
            </label>
            <button
              type="button"
              onClick={() => {
                const currentDeliv = formData.monthlyQuotationDefaults?.deliverables || DEFAULT_MONTHLY_DELIVERABLES;
                updateMonthlyDefault('deliverables', [
                  ...currentDeliv,
                  { id: `deliv-${Date.now()}`, item: 'New Deliverable', quantity: '1 / month' },
                ]);
              }}
              className="text-[10px] text-white bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded flex items-center gap-1"
            >
              <Plus size={10} /> Add Deliverable
            </button>
          </div>
          <div className="space-y-1.5">
            {(formData.monthlyQuotationDefaults?.deliverables || DEFAULT_MONTHLY_DELIVERABLES).map((deliv, idx) => (
              <div key={deliv.id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <span className="text-[10px] text-neutral-500 font-mono sm:col-span-1">{idx + 1}.</span>
                <input
                  type="text"
                  value={deliv.item}
                  onChange={(e) => {
                    const current = [...(formData.monthlyQuotationDefaults?.deliverables || DEFAULT_MONTHLY_DELIVERABLES)];
                    current[idx] = { ...deliv, item: e.target.value };
                    updateMonthlyDefault('deliverables', current);
                  }}
                  placeholder="Deliverable Name (e.g. Instagram Reels)"
                  className="sm:col-span-7 bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded outline-none"
                />
                <input
                  type="text"
                  value={deliv.quantity}
                  onChange={(e) => {
                    const current = [...(formData.monthlyQuotationDefaults?.deliverables || DEFAULT_MONTHLY_DELIVERABLES)];
                    current[idx] = { ...deliv, quantity: e.target.value };
                    updateMonthlyDefault('deliverables', current);
                  }}
                  placeholder="Qty / Freq (e.g. 8 / month)"
                  className="sm:col-span-3 bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = [...(formData.monthlyQuotationDefaults?.deliverables || DEFAULT_MONTHLY_DELIVERABLES)];
                    current.splice(idx, 1);
                    updateMonthlyDefault('deliverables', current);
                  }}
                  className="sm:col-span-1 p-1 text-neutral-500 hover:text-red-400 flex justify-center"
                  title="Remove deliverable"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Retainer Default Terms List */}
        <div className="pt-2 border-t border-neutral-800/80 space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase">
              Default Monthly Retainer Terms &amp; Conditions
            </label>
            <button
              type="button"
              onClick={() => {
                const currentTerms = formData.monthlyQuotationDefaults?.termsTemplate || DEFAULT_MONTHLY_TERMS;
                updateMonthlyDefault('termsTemplate', [...currentTerms, 'New monthly retainer term point...']);
              }}
              className="text-[10px] text-white bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded flex items-center gap-1"
            >
              <Plus size={10} /> Add Point
            </button>
          </div>
          <div className="space-y-1.5">
            {(formData.monthlyQuotationDefaults?.termsTemplate || DEFAULT_MONTHLY_TERMS).map((term: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-500 font-mono w-4">{idx + 1}.</span>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const currentTerms = [...(formData.monthlyQuotationDefaults?.termsTemplate || DEFAULT_MONTHLY_TERMS)];
                    currentTerms[idx] = e.target.value;
                    updateMonthlyDefault('termsTemplate', currentTerms);
                  }}
                  className="flex-1 bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1 rounded outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const currentTerms = [...(formData.monthlyQuotationDefaults?.termsTemplate || DEFAULT_MONTHLY_TERMS)];
                    currentTerms.splice(idx, 1);
                    updateMonthlyDefault('termsTemplate', currentTerms);
                  }}
                  className="p-1 text-neutral-500 hover:text-red-400"
                  title="Remove term"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
