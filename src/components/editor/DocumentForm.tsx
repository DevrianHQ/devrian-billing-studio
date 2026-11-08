import React, { useState } from 'react';
import {
  BillingDocument,
  BusinessProfile,
  DocumentStatus,
  PaymentTermsPreset,
  GSTType,
  PaymentDetailRow,
  DocumentCustomText,
} from '../../types';
import { ClientSelector } from './ClientSelector';
import { LineItemManager } from './LineItemManager';
import { calculateDueDate } from '../../services/dateUtils';
import {
  DEFAULT_INVOICE_TEXT,
  DEFAULT_RECEIPT_TEXT,
  DEFAULT_QUOTATION_TEXT,
} from '../../services/seedData';
import {
  AlertCircle,
  Percent,
  Hash,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Bookmark,
  Eye,
  Sliders,
  PenTool,
  FileText,
} from 'lucide-react';

interface DocumentFormProps {
  document: BillingDocument;
  business: BusinessProfile;
  onChange: (updated: BillingDocument) => void;
  onSaveAsDefaultText: (type: BillingDocument['type'], customText: DocumentCustomText) => void;
  onOpenSignatureStudio: () => void;
  validationErrors: string[];
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  document: doc,
  business,
  onChange,
  onSaveAsDefaultText,
  onOpenSignatureStudio,
  validationErrors,
}) => {
  const isInvoice = doc.type === 'invoice';
  const isReceipt = doc.type === 'receipt';
  const isQuotation = doc.type === 'quotation';

  const [activeTab, setActiveTab] = useState<'content' | 'text' | 'visibility'>('content');

  // Helper to update fields
  const updateField = <K extends keyof BillingDocument>(field: K, value: BillingDocument[K]) => {
    const updated = { ...doc, [field]: value };
    recalculateFinancials(updated);
  };

  const updateCustomText = (field: keyof DocumentCustomText, val: string) => {
    const updated = {
      ...doc,
      customText: {
        ...doc.customText,
        [field]: val,
      },
    };
    onChange(updated);
  };

  const updateVisibility = (field: keyof BillingDocument['sectionVisibility'], val: boolean) => {
    const updated = {
      ...doc,
      sectionVisibility: {
        ...doc.sectionVisibility,
        [field]: val,
      },
    };
    onChange(updated);
  };

  // Recalculates subtotal, discount, GST, balance due
  const recalculateFinancials = (draft: BillingDocument) => {
    const subtotal = draft.items.reduce((sum, item) => sum + (item.amount || 0), 0);

    let discountAmount = 0;
    if (draft.discountType === 'percentage') {
      discountAmount = (subtotal * (draft.discountValue || 0)) / 100;
    } else {
      discountAmount = Math.min(subtotal, draft.discountValue || 0);
    }

    const netTaxable = Math.max(0, subtotal - discountAmount);

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let totalTaxAmount = 0;

    if (draft.gstEnabled && draft.gstRate > 0) {
      const taxTotal = (netTaxable * draft.gstRate) / 100;
      totalTaxAmount = taxTotal;
      if (draft.gstType === 'CGST_SGST') {
        cgstAmount = taxTotal / 2;
        sgstAmount = taxTotal / 2;
      } else {
        igstAmount = taxTotal;
      }
    }

    const totalWithTax = netTaxable + totalTaxAmount;
    const advance = draft.advanceReceived || 0;
    const balanceDue = draft.type === 'receipt' && draft.totalProjectCost !== undefined && draft.totalProjectCost > 0
      ? Math.max(0, draft.totalProjectCost - advance)
      : Math.max(0, totalWithTax - advance);

    draft.subtotal = subtotal;
    draft.discountAmount = discountAmount;
    draft.cgstAmount = cgstAmount;
    draft.sgstAmount = sgstAmount;
    draft.igstAmount = igstAmount;
    draft.totalTaxAmount = totalTaxAmount;
    draft.balanceDue = balanceDue;

    if (draft.type === 'receipt') {
      draft.amountReceived = advance;
    }

    onChange({ ...draft });
  };

  // Payment rows management
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
      if (l.includes('date')) pDetails.dateTime = r.value;
      if (l.includes('mode')) pDetails.mode = r.value;
      if (l.includes('transaction')) pDetails.transactionId = r.value;
      if (l.includes('utr')) pDetails.utrNo = r.value;
    });
    onChange({ ...doc, paymentRows: rows, paymentDetails: pDetails });
  };

  const removePaymentRow = (id: string) => {
    const rows = (doc.paymentRows || []).filter((r) => r.id !== id);
    onChange({ ...doc, paymentRows: rows });
  };

  // Terms points management
  const addTermPoint = () => {
    const updated = [...doc.notes, 'New condition or note point.'];
    onChange({ ...doc, notes: updated });
  };

  const updateTermPoint = (index: number, val: string) => {
    const updated = [...doc.notes];
    updated[index] = val;
    onChange({ ...doc, notes: updated });
  };

  const removeTermPoint = (index: number) => {
    const updated = [...doc.notes];
    updated.splice(index, 1);
    onChange({ ...doc, notes: updated });
  };

  const moveTermPoint = (index: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= doc.notes.length) return;
    const updated = [...doc.notes];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    onChange({ ...doc, notes: updated });
  };

  const resetTextToDefault = () => {
    let def = DEFAULT_INVOICE_TEXT;
    if (doc.type === 'receipt') def = DEFAULT_RECEIPT_TEXT;
    if (doc.type === 'quotation') def = DEFAULT_QUOTATION_TEXT;

    if (confirm('Reset all labels, headings and static text on this document to default?')) {
      onChange({
        ...doc,
        customText: { ...def },
      });
    }
  };

  return (
    <div className="space-y-5 text-white pb-16">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-950/60 border border-red-500/80 rounded-xl p-3 text-red-200 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Required to resolve before export:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-300">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Editor Sub-Tabs: Content vs Fully Editable Text vs Section Visibility */}
      <div className="grid grid-cols-3 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'content' ? 'bg-white text-black font-bold shadow' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileText size={13} />
          <span>Document Content</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'text' ? 'bg-white text-black font-bold shadow' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders size={13} />
          <span>Editable Labels</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('visibility')}
          className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === 'visibility' ? 'bg-white text-black font-bold shadow' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Eye size={13} />
          <span>Section Visibility</span>
        </button>
      </div>

      {/* TAB 1: DOCUMENT CONTENT */}
      {activeTab === 'content' && (
        <div className="space-y-5">
          {/* Document Identification */}
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={doc.date}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    const updated = { ...doc, date: newDate };
                    if (isInvoice && doc.paymentTermsPreset && doc.paymentTermsPreset !== 'Custom') {
                      updated.dueDate = calculateDueDate(newDate, doc.paymentTermsPreset);
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
                    Valid Till
                  </label>
                  <input
                    type="date"
                    value={doc.validTill || ''}
                    onChange={(e) => updateField('validTill', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none"
                  />
                </div>
              )}
            </div>

            {/* Eyebrow for Receipt */}
            {isReceipt && (
              <div>
                <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                  Select Receipt Eyebrow
                </label>
                <div className="flex gap-2">
                  {['ADVANCE PAYMENT', 'PART PAYMENT', 'FINAL PAYMENT'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateCustomText('eyebrow', opt)}
                      className={`px-2.5 py-1 text-xs rounded border transition ${
                        doc.customText.eyebrow === opt
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Project / Service Name */}
            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Project / Service Title
              </label>
              <input
                type="text"
                value={doc.projectName || ''}
                onChange={(e) => updateField('projectName', e.target.value)}
                placeholder="e.g. FMCG Video Editing – 15 Videos"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none font-medium"
              />
            </div>

            {/* Pagination & Smart Fit Layout Mode */}
            <div className="pt-2 border-t border-neutral-800">
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Layout / Pagination Mode
              </label>
              <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                <button
                  type="button"
                  onClick={() => updateField('layoutMode', 'auto')}
                  className={`py-1.5 px-2 rounded text-xs font-semibold transition ${
                    (doc.layoutMode || 'auto') === 'auto'
                      ? 'bg-white text-black font-bold shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Auto (Smart Fit)
                </button>
                <button
                  type="button"
                  onClick={() => updateField('layoutMode', 'force_one_page')}
                  className={`py-1.5 px-2 rounded text-xs font-semibold transition ${
                    doc.layoutMode === 'force_one_page'
                      ? 'bg-white text-black font-bold shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Force 1 Page
                </button>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl">
            <ClientSelector
              clientName={doc.clientName}
              contactPerson={doc.clientContactPerson}
              clientAddress={doc.clientAddress}
              clientPhone={doc.clientPhone}
              clientEmail={doc.clientEmail}
              clientGstin={doc.clientGstin}
              onSelectClient={(client) => {
                onChange({
                  ...doc,
                  clientId: client.id,
                  clientName: client.name || doc.clientName,
                  clientContactPerson: client.contactPerson || doc.clientContactPerson,
                  clientAddress: client.address || doc.clientAddress,
                  clientPhone: client.phone || doc.clientPhone,
                  clientEmail: client.email || doc.clientEmail,
                  clientGstin: client.gstin || doc.clientGstin,
                });
              }}
              onChangeField={(field, val) => updateField(field as keyof BillingDocument, val as any)}
            />
          </div>

          {/* Services & Line Items */}
          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl">
            <LineItemManager
              type={doc.type}
              items={doc.items}
              onChange={(newItems) => {
                const updated = { ...doc, items: newItems };
                recalculateFinancials(updated);
              }}
              presets={business.itemPresets}
            />
          </div>

          {/* Financials & GST */}
          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-4">
            <label className="text-[11px] font-bold tracking-wider uppercase text-neutral-300 block">
              Financial Summary & Taxes
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
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                      {isInvoice ? 'Advance Received (₹)' : 'Advance to Start Work (₹)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={doc.advanceReceived || ''}
                      placeholder="0"
                      onChange={(e) => {
                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                        const updated = { ...doc, advanceReceived: val, advanceToStartWork: val };
                        recalculateFinancials(updated);
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none font-semibold"
                    />
                  </div>
                </div>

                {/* GST Toggle */}
                <div className="pt-2 border-t border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-neutral-200">GST Registration Mode</span>
                      <p className="text-[10px] text-neutral-400">
                        {doc.gstEnabled ? 'Title is "TAX INVOICE"' : 'Title is "INVOICE" (GST not registered)'}
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

          {/* Payment Details Rows (Add, edit, remove) */}
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

          {/* Terms & Notes Reorderable Items */}
          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold tracking-wider uppercase text-neutral-300 block">
                Terms & Notes Points ({doc.notes.length})
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
              {doc.notes.map((note, index) => (
                <div key={index} className="flex items-start gap-2 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                  <span className="text-xs text-neutral-500 font-bold pt-1 w-5 text-center">
                    {index + 1}.
                  </span>
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
              ))}
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
      )}

      {/* TAB 2: FULLY EDITABLE STATIC TEXT & HEADINGS */}
      {activeTab === 'text' && (
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
          </div>
        </div>
      )}

      {/* TAB 3: SECTION VISIBILITY TOGGLES */}
      {activeTab === 'visibility' && (
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Section Visibility Controls</h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Toggle sections or rows on or off for this specific document.
            </p>
          </div>

          <div className="space-y-2.5 text-xs divide-y divide-neutral-800/80">
            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Discount Row</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showDiscount}
                onChange={(e) => updateVisibility('showDiscount', e.target.checked)}
                className="accent-white"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Advance Received / Remaining Row</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showAdvance}
                onChange={(e) => updateVisibility('showAdvance', e.target.checked)}
                className="accent-white"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Italic GST Line</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showGstLine}
                onChange={(e) => updateVisibility('showGstLine', e.target.checked)}
                className="accent-white"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Payment Details Box</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showPaymentDetails}
                onChange={(e) => updateVisibility('showPaymentDetails', e.target.checked)}
                className="accent-white"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Terms & Notes Box</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showTermsAndNotes}
                onChange={(e) => updateVisibility('showTermsAndNotes', e.target.checked)}
                className="accent-white"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Closing Thank You Line</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showClosingLine}
                onChange={(e) => updateVisibility('showClosingLine', e.target.checked)}
                className="accent-white"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Amount in Words</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showAmountInWords}
                onChange={(e) => updateVisibility('showAmountInWords', e.target.checked)}
                className="accent-white"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Signature Audit Line ("Issued by DEVRIAN...")</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showAuditLine}
                onChange={(e) => updateVisibility('showAuditLine', e.target.checked)}
                className="accent-white"
              />
            </label>

            <label className="flex items-center justify-between pt-2 cursor-pointer">
              <span>Show Non-Banking Legal Disclaimer</span>
              <input
                type="checkbox"
                checked={doc.sectionVisibility.showLegalDisclaimer}
                onChange={(e) => updateVisibility('showLegalDisclaimer', e.target.checked)}
                className="accent-white"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
