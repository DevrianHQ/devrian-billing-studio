import React from 'react';
import { LineItem, BusinessProfile, DocumentType, QuotationType } from '../../types';
import { formatINR } from '../../services/indianCurrency';
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

interface LineItemManagerProps {
  type: DocumentType;
  quotationType?: QuotationType;
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  presets: BusinessProfile['itemPresets'];
}

export const LineItemManager: React.FC<LineItemManagerProps> = ({
  type,
  quotationType,
  items,
  onChange,
  presets,
}) => {
  const isReceipt = type === 'receipt';
  const isQuotation = type === 'quotation';
  const isHybridQuotation = isQuotation && quotationType === 'hybrid';

  const addItem = (presetTitle?: string, presetRate?: number) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      description: presetTitle || '',
      subDescription: '',
      qty: 1,
      rate: presetRate || 0,
      amount: presetRate || 0,
      mode: isReceipt ? 'UPI' : undefined,
      billing: isHybridQuotation ? 'monthly' : quotationType === 'monthly' ? 'monthly' : 'one_time',
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<LineItem>) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        if ('qty' in updates || 'rate' in updates) {
          const qty = Math.max(0, updated.qty || 0);
          const rate = Math.max(0, updated.rate || 0);
          updated.qty = qty;
          updated.rate = rate;
          updated.amount = qty * rate;
        }
        return updated;
      })
    );
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      // Clear instead of removing last item
      onChange([{
        id: `item-${Date.now()}`,
        description: '',
        subDescription: '',
        qty: 1,
        rate: 0,
        amount: 0,
        mode: isReceipt ? 'UPI' : undefined,
      }]);
      return;
    }
    onChange(items.filter((item) => item.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-bold tracking-wider uppercase text-neutral-300">
          Line Items ({items.length})
        </label>

        {/* Preset Quick-Add Dropdown */}
        {presets && presets.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" /> Presets:
            </span>
            <select
              className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded px-2 py-1 outline-none focus:border-neutral-400"
              value=""
              onChange={(e) => {
                const selected = presets.find((p) => p.title === e.target.value);
                if (selected) {
                  addItem(selected.title, selected.defaultRate);
                }
              }}
            >
              <option value="" disabled>
                + Add Preset Service...
              </option>
              {presets.map((p, idx) => (
                <option key={idx} value={p.title}>
                  {p.title} {p.defaultRate ? `(₹${p.defaultRate})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="p-3 bg-neutral-900 border border-neutral-800 rounded-md space-y-2 hover:border-neutral-700 transition"
          >
            <div className="flex items-start gap-2">
              <span className="text-xs font-bold text-neutral-500 pt-2 w-5 text-center">
                #{index + 1}
              </span>

              {/* Title & Subdescription */}
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  placeholder="Service / Item Description (e.g. Short-form video editing)"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-2.5 py-1.5 rounded outline-none font-medium"
                />
                <input
                  type="text"
                  placeholder="Sub-description / details (optional, e.g. 15 reels with captions & sound design)"
                  value={item.subDescription || ''}
                  onChange={(e) => updateItem(item.id, { subDescription: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-400 text-neutral-300 text-[11px] px-2.5 py-1 rounded outline-none"
                />
              </div>

              {/* Reorder Buttons & Delete */}
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(index, 'up')}
                    className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-neutral-800"
                    title="Move Up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, 'down')}
                    className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-neutral-800"
                    title="Move Down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-950/40 ml-1"
                    title="Delete item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Numbers row: Qty, Rate, Amount (or Mode for Receipt) */}
            <div className="grid grid-cols-3 gap-2 pl-7 pt-1">
              {isReceipt ? (
                <>
                  <div>
                    <label className="block text-[9px] text-neutral-400 uppercase font-semibold mb-0.5">
                      Payment Mode
                    </label>
                    <input
                      type="text"
                      value={item.mode || 'UPI'}
                      onChange={(e) => updateItem(item.id, { mode: e.target.value })}
                      placeholder="e.g. UPI, Bank Transfer"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-2 py-1 rounded outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9px] text-neutral-400 uppercase font-semibold mb-0.5">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.amount || ''}
                      onChange={(e) => {
                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                        updateItem(item.id, { amount: val, rate: val, qty: 1 });
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-2 py-1 rounded outline-none font-bold"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[9px] text-neutral-400 uppercase font-semibold mb-0.5">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.qty || ''}
                      onChange={(e) =>
                        updateItem(item.id, { qty: Math.max(0, parseInt(e.target.value, 10) || 0) })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-2 py-1 rounded outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-neutral-400 uppercase font-semibold mb-0.5">
                      {quotationType === 'monthly' ? 'Monthly Rate (₹)' : 'Rate (₹)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.rate || ''}
                      onChange={(e) =>
                        updateItem(item.id, { rate: Math.max(0, parseFloat(e.target.value) || 0) })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-2 py-1 rounded outline-none text-right font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-neutral-400 uppercase font-semibold mb-0.5">
                      {quotationType === 'monthly' ? 'Monthly Total' : 'Line Total'}
                    </label>
                    <div className="w-full bg-neutral-950/60 border border-neutral-800/80 text-white text-xs px-2 py-1 rounded text-right font-bold text-neutral-200">
                      {formatINR(item.amount)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Hybrid quotation billing attribute selector */}
            {isHybridQuotation && (
              <div className="flex items-center justify-between pl-7 pt-1.5 border-t border-neutral-800/60">
                <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                  Billing Stream:
                </span>
                <div className="flex bg-neutral-950 p-0.5 rounded border border-neutral-800 gap-1">
                  <button
                    type="button"
                    onClick={() => updateItem(item.id, { billing: 'one_time' })}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                      item.billing === 'one_time'
                        ? 'bg-white text-black font-bold shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    One-time Setup
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItem(item.id, { billing: 'monthly' })}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                      item.billing !== 'one_time'
                        ? 'bg-amber-400 text-black font-bold shadow'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Monthly Retainer
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addItem()}
        className="w-full py-2 border border-dashed border-neutral-700 hover:border-neutral-400 text-neutral-300 hover:text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition bg-neutral-900/50 hover:bg-neutral-900"
      >
        <Plus size={14} /> Add Line Item
      </button>
    </div>
  );
};

