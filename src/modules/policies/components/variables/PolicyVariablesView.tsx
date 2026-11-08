import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Plus,
  Trash2,
  Sliders,
  Building,
  CreditCard,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { PolicyVariables, Clause } from '../../types';
import { getVariableReferenceCounts } from '../../utils/variableResolver';

interface PolicyVariablesViewProps {
  variables: PolicyVariables;
  clauses: Clause[];
  onChange: (variables: PolicyVariables) => void;
  onResetAll: () => void;
}

export const PolicyVariablesView: React.FC<PolicyVariablesViewProps> = ({
  variables,
  clauses,
  onChange,
  onResetAll,
}) => {
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomVal, setNewCustomVal] = useState('');
  const [customError, setCustomError] = useState('');

  const refCounts = useMemo(() => {
    return getVariableReferenceCounts(clauses, variables);
  }, [clauses, variables]);

  const handleStandardChange = (field: keyof PolicyVariables, val: any) => {
    onChange({
      ...variables,
      [field]: val,
    });
  };

  const handleAddCustom = () => {
    const cleanKey = newCustomKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!cleanKey) {
      setCustomError('Variable key cannot be empty.');
      return;
    }
    if (cleanKey in variables || (variables.custom && cleanKey in variables.custom)) {
      setCustomError('Variable key already exists.');
      return;
    }

    const updatedCustom = {
      ...(variables.custom || {}),
      [cleanKey]: newCustomVal.trim(),
    };

    onChange({
      ...variables,
      custom: updatedCustom,
    });

    setNewCustomKey('');
    setNewCustomVal('');
    setCustomError('');
  };

  const handleUpdateCustom = (key: string, val: string) => {
    onChange({
      ...variables,
      custom: {
        ...(variables.custom || {}),
        [key]: val,
      },
    });
  };

  const handleDeleteCustom = (key: string) => {
    const updated = { ...(variables.custom || {}) };
    delete updated[key];
    onChange({
      ...variables,
      custom: updated,
    });
  };

  const renderField = (
    label: string,
    keyName: keyof PolicyVariables,
    type: 'text' | 'number' = 'text',
    helpText?: string
  ) => {
    const val = variables[keyName];
    const count = refCounts[keyName] || 0;

    return (
      <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-neutral-300">{label}</label>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400"
            title={`Used ${count} time(s) across active clauses`}
          >
            {`{{${String(keyName)}}}`} ({count})
          </span>
        </div>
        <input
          type={type}
          value={val !== undefined ? String(val) : ''}
          onChange={(e) =>
            handleStandardChange(
              keyName,
              type === 'number' ? Number(e.target.value) : e.target.value
            )
          }
          className="w-full bg-neutral-900 text-neutral-100 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-500 transition font-sans"
        />
        {helpText && <p className="text-[10px] text-neutral-500 mt-1">{helpText}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sliders size={20} className="text-white" />
          <div>
            <h2 className="text-sm font-bold text-white">Policy Variables & Master Constants</h2>
            <p className="text-[11px] text-neutral-400">
              Editing any variable below automatically updates every clause, the Summary PDF, and the Refund Calculator.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all variables back to DEVRIAN standard commercial defaults?')) {
              onResetAll();
            }
          }}
          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition flex items-center gap-1.5"
        >
          <RotateCcw size={13} />
          Reset All Variables
        </button>
      </div>

      {/* Group 1: Business Identity & Registration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <Building size={14} />
          <span>Business Identity & Udyam Registration</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {renderField('Business Commercial Name', 'business_name', 'text')}
          {renderField('Owner / Signatory Name', 'owner_name', 'text')}
          {renderField('Owner Professional Title', 'owner_title', 'text')}
          {renderField('Contact Email', 'contact_email', 'text')}
          {renderField('Official Email', 'official_email', 'text')}
          {renderField('Official Website', 'website', 'text')}
          {renderField('Udyam Registration No.', 'udyam_no', 'text')}
        </div>
      </div>

      {/* Group 2: Financial & Commercial Terms */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <CreditCard size={14} />
          <span>Financial, Advance & Settlement Terms</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {renderField('Advance Payment Required (%)', 'advance_percent', 'number', 'Default 50%')}
          {renderField('Balance Due Window (Hours)', 'balance_due_hours', 'number', 'Hours after final deliverable approval (48)')}
          {renderField('Refund Eligibility Window (Days)', 'refund_window_days', 'number', 'Days from advance payment date (7)')}
          {renderField('Advance Retention Share (%)', 'refund_retention_percent', 'number', 'Share of advance retained on cancellation (50%)')}
          {renderField('Refund Processing Window (Days)', 'refund_processing_days', 'number', 'Working days required to disburse refund (15)')}
        </div>
      </div>

      {/* Group 3: Operations, Timelines & Service Standards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <Clock size={14} />
          <span>Operations, Working Hours & SLA</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {renderField('Official Working Days', 'working_days', 'text', 'e.g. Monday to Saturday')}
          {renderField('Working Hours', 'working_hours', 'text', 'e.g. 10 AM to 7 PM')}
          {renderField('Communication SLA (Hours)', 'reply_time_hours', 'number', 'Maximum response window for non-urgent queries (24)')}
          {renderField('Client Feedback SLA (Hours)', 'feedback_window_hours', 'number', 'Review window for client feedback on drafts (48)')}
          {renderField('Project File Backup Window (Days)', 'backup_days', 'number', 'Days raw assets are preserved after delivery (30)')}
        </div>
      </div>

      {/* Group 4: Scope & Suggested Defaults */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <Sparkles size={14} />
          <span>Revisions & Scope Adjustments</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {renderField('Included Revision Rounds', 'revision_rounds', 'number', 'Included revision rounds per deliverable (2)')}
          {renderField('Extra Revision Pricing', 'extra_revision_charge', 'text', 'e.g. "to be quoted" or "₹1,000 per round"')}
        </div>
      </div>

      {/* Group 5: Legal Jurisdiction */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <MapPin size={14} />
          <span>Legal Jurisdiction</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {renderField('Jurisdiction City', 'jurisdiction_city', 'text', 'City of courts')}
          {renderField('Jurisdiction State', 'jurisdiction_state', 'text', 'State of jurisdiction')}
        </div>
      </div>

      {/* Group 6: Custom User Variables */}
      <div className="space-y-3 pt-2 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Custom Policy Placeholders
          </span>
          <span className="text-[11px] text-neutral-500">
            Use in clauses as {'{{custom_name}}'}
          </span>
        </div>

        {/* Existing Custom Variables */}
        {variables.custom && Object.keys(variables.custom).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(variables.custom).map(([cKey, cVal]) => {
              const count = refCounts[cKey] || 0;
              return (
                <div key={cKey} className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-neutral-300">
                      {`{{${cKey}}}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-neutral-500 font-mono">({count})</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustom(cKey)}
                        className="p-1 text-neutral-500 hover:text-red-400 transition"
                        title="Delete custom variable"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={String(cVal)}
                    onChange={(e) => handleUpdateCustom(cKey, e.target.value)}
                    className="w-full bg-neutral-900 text-neutral-100 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-500"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-neutral-500 italic">No custom variables defined yet.</p>
        )}

        {/* Add New Custom Variable Form */}
        <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={newCustomKey}
            onChange={(e) => setNewCustomKey(e.target.value)}
            placeholder="variable_key (e.g. project_lead)"
            className="flex-1 min-w-[180px] bg-neutral-900 text-neutral-100 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-500 font-mono"
          />
          <input
            type="text"
            value={newCustomVal}
            onChange={(e) => setNewCustomVal(e.target.value)}
            placeholder="Value (e.g. Dev Rajpoot)"
            className="flex-1 min-w-[200px] bg-neutral-900 text-neutral-100 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-500"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-200 hover:bg-white text-neutral-950 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus size={13} />
            Add Placeholder
          </button>
        </div>
        {customError && <p className="text-xs text-red-400">{customError}</p>}
      </div>
    </div>
  );
};

