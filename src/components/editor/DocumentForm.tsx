import React, { useState } from 'react';
import {
  BillingDocument,
  BusinessProfile,
  DocumentCustomText,
} from '../../types';
import { LineItemManager } from './LineItemManager';
import {
  DEFAULT_INVOICE_TEXT,
  DEFAULT_RECEIPT_TEXT,
  DEFAULT_QUOTATION_TEXT,
} from '../../services/seedData';
import { computeQuotationFinancials } from '../../services/quotationLayoutEngine';
import { StorageService } from '../../services/storage';
import { FormMetaHeader } from './form/FormMetaHeader';
import { FormPartyDetails } from './form/FormPartyDetails';
import { FormQuotationSettings } from './form/FormQuotationSettings';
import { FormFinancialsSection } from './form/FormFinancialsSection';
import { FormQuotationClauses } from './form/FormQuotationClauses';
import { FormPaymentSection } from './form/FormPaymentSection';
import { FormTermsSection } from './form/FormTermsSection';
import { FormVisibilitySection } from './form/FormVisibilitySection';
import { FormCustomTextSection } from './form/FormCustomTextSection';
import {
  AlertCircle,
  FileText,
  Sliders,
  Eye,
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

  const updateVisibility = <K extends keyof BillingDocument['sectionVisibility']>(
    field: K,
    val: BillingDocument['sectionVisibility'][K]
  ) => {
    const updated = {
      ...doc,
      sectionVisibility: {
        ...doc.sectionVisibility,
        [field]: val,
      },
    };
    StorageService.saveDefaultVisibility(doc.type, updated.sectionVisibility);
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
    let balanceDue = 0;

    if (draft.type === 'receipt') {
      balanceDue = draft.totalProjectCost !== undefined && draft.totalProjectCost > 0
        ? Math.max(0, draft.totalProjectCost - advance)
        : Math.max(0, totalWithTax - advance);
      draft.amountReceived = advance;
    } else if (draft.type === 'quotation') {
      const fin = computeQuotationFinancials(draft);
      if (draft.advanceType === 'percentage' || !draft.advanceType) {
        draft.advanceToStartWork = fin.advanceAmount;
      }
      draft.balancePayable = fin.balancePayable;
      draft.totalProjectCost = fin.totalWithTax;
      balanceDue = fin.isProject ? fin.totalWithTax : fin.dueToStart;
    } else {
      balanceDue = Math.max(0, totalWithTax - advance);
    }

    draft.subtotal = subtotal;
    draft.discountAmount = discountAmount;
    draft.cgstAmount = cgstAmount;
    draft.sgstAmount = sgstAmount;
    draft.igstAmount = igstAmount;
    draft.totalTaxAmount = totalTaxAmount;
    draft.balanceDue = balanceDue;

    onChange({ ...draft });
  };

  const resetTextToDefault = () => {
    let def = DEFAULT_INVOICE_TEXT;
    if (doc.type === 'receipt') def = DEFAULT_RECEIPT_TEXT;
    if (doc.type === 'quotation') def = DEFAULT_QUOTATION_TEXT;
    onChange({
      ...doc,
      customText: { ...def },
    });
  };

  return (
    <div className="space-y-6">
      {/* Validation Warnings */}
      {validationErrors.length > 0 && (
        <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertCircle size={15} />
            <span>Missing required fields:</span>
          </div>
          <ul className="list-disc list-inside text-[11px] space-y-0.5 text-neutral-300">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Editor Sub-Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
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
          {/* 1. Document Identification */}
          <FormMetaHeader
            document={doc}
            business={business}
            onChange={onChange}
            updateField={updateField}
          />

          {/* 2. Client & Project Details */}
          <FormPartyDetails
            document={doc}
            onChange={onChange}
            updateField={updateField}
          />

          {/* 3. Quotation Model & Settings */}
          <FormQuotationSettings
            document={doc}
            business={business}
            onChange={onChange}
            updateField={updateField}
            recalculateFinancials={recalculateFinancials}
          />

          {/* 5. Line Items Manager */}
          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl">
            <LineItemManager
              type={doc.type}
              quotationType={doc.type === 'quotation' ? (doc.quotationType || 'project') : undefined}
              items={doc.items}
              onChange={(newItems) => {
                const updated = { ...doc, items: newItems };
                recalculateFinancials(updated);
              }}
              presets={business.itemPresets}
            />
          </div>

          {/* 6. Financial Summary & Taxes */}
          <FormFinancialsSection
            document={doc}
            updateField={updateField}
            recalculateFinancials={recalculateFinancials}
          />

          {/* 7. Quotation Clauses (Inclusions, Exclusions, Delivery Timeline, Acceptance) */}
          <FormQuotationClauses
            document={doc}
            updateField={updateField}
            updateVisibility={updateVisibility}
          />

          {/* 8. Payment Details Rows & UPI QR */}
          <FormPaymentSection
            document={doc}
            onChange={onChange}
            updateVisibility={updateVisibility}
          />

          {/* 9. Terms, Notes Points & Signature Studio */}
          <FormTermsSection
            document={doc}
            business={business}
            onChange={onChange}
            updateCustomText={updateCustomText}
            onOpenSignatureStudio={onOpenSignatureStudio}
          />
        </div>
      )}

      {/* TAB 2: FULLY EDITABLE STATIC TEXT & HEADINGS */}
      {activeTab === 'text' && (
        <FormCustomTextSection
          document={doc}
          updateCustomText={updateCustomText}
          resetTextToDefault={resetTextToDefault}
          onSaveAsDefaultText={onSaveAsDefaultText}
        />
      )}

      {/* TAB 3: SECTION VISIBILITY TOGGLES */}
      {activeTab === 'visibility' && (
        <FormVisibilitySection
          document={doc}
          updateVisibility={updateVisibility}
        />
      )}
    </div>
  );
};
