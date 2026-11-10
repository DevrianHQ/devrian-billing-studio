import React, { useState } from 'react';
import { QuotationTemplateType, SavedQuotationTemplate } from '../types';
import { QuotationTemplateService } from '../templates';
import { QuotationPreview } from './QuotationPreview';
import { StorageService } from '../../../services/storage';
import { BusinessProfile, BillingDocument } from '../../../types';
import {
  Sliders,
  RotateCcw,
  CheckCircle2,
  FileText,
  AlertCircle,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const QuotationTemplatesSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<QuotationTemplateType>('project');
  const [templates, setTemplates] = useState(() => QuotationTemplateService.loadTemplates());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const business: BusinessProfile = StorageService.getProfile();
  const currentTemplate: SavedQuotationTemplate =
    activeTab === 'project' ? templates.project : templates.monthly;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdate = (updated: SavedQuotationTemplate) => {
    QuotationTemplateService.updateTemplate(activeTab, updated);
    setTemplates(QuotationTemplateService.loadTemplates());
    showToast(`Template settings saved for ${activeTab === 'project' ? 'Project' : 'Monthly'}`);
  };

  const handleResetToFactory = () => {
    if (
      !window.confirm(
        `Reset ${activeTab === 'project' ? 'PROJECT' : 'MONTHLY'} template to factory defaults? Any customizations will be restored to factory values.`
      )
    ) {
      return;
    }
    QuotationTemplateService.resetTemplate(activeTab);
    setTemplates(QuotationTemplateService.loadTemplates());
    showToast(`Reset ${activeTab} template to factory defaults.`);
  };

  // Mock document from template sample data for live preview
  const sampleDoc: BillingDocument = {
    id: `sample-doc-${activeTab}`,
    type: 'quotation',
    quotationType: activeTab,
    documentNumber: 'DEV-QT-2026-001',
    date: '2026-11-10',
    validTill: '2026-11-25',
    status: 'DRAFT',
    isFinal: false,
    applySignature: false,
    clientName: currentTemplate.sampleData.clientName,
    clientContactPerson: currentTemplate.sampleData.contactPerson,
    clientAddress: currentTemplate.sampleData.clientAddress,
    clientPhone: currentTemplate.sampleData.clientPhone,
    clientEmail: currentTemplate.sampleData.clientEmail,
    projectName: currentTemplate.sampleData.projectName,
    platforms: currentTemplate.sampleData.platforms,
    estimatedDelivery: currentTemplate.sampleData.estimatedDelivery,
    items: currentTemplate.sampleData.items,
    monthlyDeliverables: currentTemplate.sampleData.deliverables,
    subtotal: currentTemplate.sampleData.items.reduce((sum, it) => sum + (it.amount || 0), 0),
    discountType: 'percentage',
    discountValue: 0,
    discountAmount: 0,
    gstEnabled: false,
    gstRate: 0,
    gstType: 'CGST_SGST',
    advanceReceived: 0,
    balanceDue: 0,
    advancePercent: currentTemplate.advancePercentDefault,
    billingCycle: currentTemplate.billingDefaults?.billingCycle,
    minTermMonths: currentTemplate.billingDefaults?.minTermMonths,
    paymentDueDescription: currentTemplate.billingDefaults?.paymentDue,
    noticePeriodDays: currentTemplate.billingDefaults?.noticeDays,
    autoRenewalDescription: currentTemplate.billingDefaults?.autoRenewal,
    notes: currentTemplate.terms,
    closingLine: currentTemplate.labels.closingLine,
    customText: {
      tagline: business.tagline,
      contactLine: business.contactLine,
      udyamLine: `Udyam Reg. No.: ${business.udyamNo || 'UDYAM-UP-54-0127731'} | Proprietor: Dev Rajpoot`,
      documentTitle: currentTemplate.labels.documentTitle,
      eyebrow: currentTemplate.labels.eyebrow,
      clientSectionHeading: currentTemplate.labels.clientHeading,
      itemsSectionHeading: currentTemplate.labels.tableHeading,
      summarySectionHeading: 'Summary',
      paymentSectionHeading: currentTemplate.labels.paymentSectionHeading,
      termsSectionHeading: currentTemplate.labels.termsSectionHeading,
      colNumber: currentTemplate.labels.colNumber,
      colDescription: currentTemplate.labels.colDescription,
      colQty: currentTemplate.labels.colQty,
      colRate: currentTemplate.labels.colRate,
      colAmount: currentTemplate.labels.colAmount,
      colMode: 'Mode',
      labelSubtotal: currentTemplate.labels.labelSubtotal,
      labelDiscount: currentTemplate.labels.labelDiscount,
      labelAdvanceReceived: 'Advance Received',
      labelBalanceDue: currentTemplate.labels.labelBalanceDue,
      labelKeyFigure: currentTemplate.labels.labelTotal,
      labelAdvanceToStart: currentTemplate.labels.labelAdvanceToStart,
      gstLine: currentTemplate.labels.gstLine,
      closingLine: currentTemplate.labels.closingLine,
      signatureProprietor: currentTemplate.labels.signatureProprietor,
      signatureTitle: currentTemplate.labels.signatureTitle,
      signatureAuditLine: 'Issued by DEVRIAN',
      signatureDisclaimer: 'Not valid for banking, cheque or legal-instrument purposes',
    },
    sectionVisibility: {
      showDiscount: true,
      showAdvance: activeTab === 'project',
      showGstLine: currentTemplate.visibility.showGstLine,
      showPaymentDetails: currentTemplate.visibility.showPaymentDetails,
      showTermsAndNotes: currentTemplate.visibility.showTermsAndNotes,
      showClosingLine: currentTemplate.visibility.showClosingLine,
      showSignature: true,
      showAuditLine: true,
      showLegalDisclaimer: currentTemplate.visibility.showLegalDisclaimer,
      showAmountInWords: false,
      showUpiQr: currentTemplate.paymentToggles.showQr,
      showAcceptance: currentTemplate.visibility.showAcceptance,
      showClientSignature: currentTemplate.visibility.showClientSignature,
      hideZeroRows: currentTemplate.visibility.hideZeroRows,
    },
    paymentRows: [],
    paymentDetails: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            <Sliders size={18} className="text-emerald-400" />
            <span>Quotation Saved Templates</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Set once, stays saved. New quotations start from these templates without altering existing documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* PROJECT vs MONTHLY Tabs */}
          <div className="p-1 bg-neutral-900 border border-neutral-800 rounded-lg flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('project')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                activeTab === 'project'
                  ? 'bg-white text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              PROJECT (1 Page)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                activeTab === 'monthly'
                  ? 'bg-white text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              MONTHLY RETAINER (2 Pages)
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetToFactory}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw size={13} />
            <span>Reset to Factory</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Template Config Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Default Labels */}
          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
              Header &amp; Document Labels
            </span>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Eyebrow Caption</label>
                <input
                  type="text"
                  value={currentTemplate.labels.eyebrow}
                  onChange={(e) =>
                    handleUpdate({
                      ...currentTemplate,
                      labels: { ...currentTemplate.labels, eyebrow: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={currentTemplate.labels.documentTitle}
                  onChange={(e) =>
                    handleUpdate({
                      ...currentTemplate,
                      labels: { ...currentTemplate.labels, documentTitle: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Table Heading</label>
                <input
                  type="text"
                  value={currentTemplate.labels.tableHeading}
                  onChange={(e) =>
                    handleUpdate({
                      ...currentTemplate,
                      labels: { ...currentTemplate.labels, tableHeading: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">GST Exemption Notice</label>
                <input
                  type="text"
                  value={currentTemplate.labels.gstLine}
                  onChange={(e) =>
                    handleUpdate({
                      ...currentTemplate,
                      labels: { ...currentTemplate.labels, gstLine: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Closing Courtesy Line</label>
                <input
                  type="text"
                  value={currentTemplate.labels.closingLine}
                  onChange={(e) =>
                    handleUpdate({
                      ...currentTemplate,
                      labels: { ...currentTemplate.labels, closingLine: e.target.value },
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-white"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Billing & Retainer Strip (Monthly only) */}
          {activeTab === 'monthly' && currentTemplate.billingDefaults && (
            <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
                Billing &amp; Retainer Defaults
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-[11px] text-neutral-400">Minimum Term (Months)</label>
                    {!currentTemplate.billingDefaults.minTermMonthsReviewed && (
                      <span
                        onClick={() => {
                          const defs = currentTemplate.billingDefaults!;
                          handleUpdate({
                            ...currentTemplate,
                            billingDefaults: { ...defs, minTermMonthsReviewed: true },
                          });
                        }}
                        className="cursor-pointer text-[9px] bg-amber-900/80 text-amber-300 border border-amber-600 px-1.5 py-0.2 rounded font-bold"
                        title="Click to mark reviewed"
                      >
                        Needs review
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={currentTemplate.billingDefaults.minTermMonths}
                    onChange={(e) => {
                      const defs = currentTemplate.billingDefaults!;
                      handleUpdate({
                        ...currentTemplate,
                        billingDefaults: {
                          ...defs,
                          minTermMonths: parseInt(e.target.value, 10) || 3,
                          minTermMonthsReviewed: true,
                        },
                      });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className="text-[11px] text-neutral-400">Notice Period (Days)</label>
                    {!currentTemplate.billingDefaults.noticeDaysReviewed && (
                      <span
                        onClick={() => {
                          const defs = currentTemplate.billingDefaults!;
                          handleUpdate({
                            ...currentTemplate,
                            billingDefaults: { ...defs, noticeDaysReviewed: true },
                          });
                        }}
                        className="cursor-pointer text-[9px] bg-amber-900/80 text-amber-300 border border-amber-600 px-1.5 py-0.2 rounded font-bold"
                        title="Click to mark reviewed"
                      >
                        Needs review
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={currentTemplate.billingDefaults.noticeDays}
                    onChange={(e) => {
                      const defs = currentTemplate.billingDefaults!;
                      handleUpdate({
                        ...currentTemplate,
                        billingDefaults: {
                          ...defs,
                          noticeDays: parseInt(e.target.value, 10) || 30,
                          noticeDaysReviewed: true,
                        },
                      });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Card 3: Terms & Notes List */}
          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Default Terms &amp; Notes ({currentTemplate.terms.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  const maxLimit = activeTab === 'project' ? 5 : 7;
                  if (currentTemplate.terms.length >= maxLimit) {
                    alert(`Maximum ${maxLimit} terms points allowed for ${activeTab} quotation.`);
                    return;
                  }
                  handleUpdate({
                    ...currentTemplate,
                    terms: [...currentTemplate.terms, 'New terms point...'],
                  });
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus size={12} /> Add Point
              </button>
            </div>

            <div className="space-y-2">
              {currentTemplate.terms.map((term, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-[11px] font-mono text-neutral-500 pt-2 shrink-0">
                    {index + 1}.
                  </span>
                  <textarea
                    rows={2}
                    value={term}
                    onChange={(e) => {
                      const updatedTerms = [...currentTemplate.terms];
                      updatedTerms[index] = e.target.value;
                      handleUpdate({ ...currentTemplate, terms: updatedTerms });
                    }}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded p-1.5 text-xs text-white outline-none focus:border-white resize-y"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updatedTerms = currentTemplate.terms.filter((_, i) => i !== index);
                      handleUpdate({ ...currentTemplate, terms: updatedTerms });
                    }}
                    className="text-neutral-500 hover:text-red-400 pt-2"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Toggles & Visibility */}
          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
              Default Toggles
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentTemplate.paymentToggles.showQr}
                  onChange={(e) =>
                    handleUpdate({
                      ...currentTemplate,
                      paymentToggles: {
                        ...currentTemplate.paymentToggles,
                        showQr: e.target.checked,
                      },
                    })
                  }
                  className="rounded bg-neutral-950 border-neutral-800 text-emerald-500"
                />
                <span>Show UPI QR Code</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentTemplate.visibility.showClientSignature}
                  onChange={(e) =>
                    handleUpdate({
                      ...currentTemplate,
                      visibility: {
                        ...currentTemplate.visibility,
                        showClientSignature: e.target.checked,
                      },
                    })
                  }
                  className="rounded bg-neutral-950 border-neutral-800 text-emerald-500"
                />
                <span>Show Client Signature</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentTemplate.visibility.showLegalDisclaimer}
                  onChange={(e) =>
                    handleUpdate({
                      ...currentTemplate,
                      visibility: {
                        ...currentTemplate.visibility,
                        showLegalDisclaimer: e.target.checked,
                      },
                    })
                  }
                  className="rounded bg-neutral-950 border-neutral-800 text-emerald-500"
                />
                <span>Show Legal Disclaimer</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentTemplate.visibility.hideZeroRows}
                  onChange={(e) =>
                    handleUpdate({
                      ...currentTemplate,
                      visibility: {
                        ...currentTemplate.visibility,
                        hideZeroRows: e.target.checked,
                      },
                    })
                  }
                  className="rounded bg-neutral-950 border-neutral-800 text-emerald-500"
                />
                <span>Hide Zero Rows</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Paper-Sheet Preview (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <FileText size={14} className="text-emerald-400" />
              <span>Live Sample Preview ({activeTab === 'project' ? '1 Page' : '2 Pages Stacked'})</span>
            </span>
          </div>

          <div className="overflow-x-auto flex justify-center">
            <QuotationPreview
              document={sampleDoc}
              business={business}
              zoom={0.65}
              templateOverride={currentTemplate}
              showFitIndicator={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
