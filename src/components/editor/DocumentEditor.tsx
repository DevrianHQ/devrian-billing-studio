import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BillingDocument, BusinessProfile, DocumentType, DocumentCustomText } from '../../types';
import { DocumentForm } from './DocumentForm';
import { DocumentPreview } from '../document/DocumentPreview';
import { exportElementsToPdf } from '../../services/pdfExport';
import { StorageService } from '../../services/storage';
import { GoogleDriveSyncService } from '../../services/googleDriveSync';
import { generateNextDocumentNumber, isDocumentNumberDuplicate } from '../../services/numbering';
import { getTodayISODate, calculateDueDate, calculateValidTillDate } from '../../services/dateUtils';
import {
  DEFAULT_INVOICE_TEXT,
  DEFAULT_RECEIPT_TEXT,
  DEFAULT_QUOTATION_TEXT,
  DEFAULT_QUOTATION_VISIBILITY,
  DEFAULT_MONTHLY_DELIVERABLES,
  DEFAULT_QUOTATION_BLOCKS,
} from '../../services/seedData';
import { resolveQuotationTermsList, PROJECT_DEFAULT_TERMS, MONTHLY_DEFAULT_TERMS } from '../../services/policyAdapter';
import { resolveQuotationPages, measureQuotationLayout } from '../../services/quotationLayoutEngine';
import { SignatureStudioModal } from '../common/SignatureStudioModal';
import {
  Save,
  Download,
  Copy,
  Plus,
  Receipt,
  FileText,
  FileCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  Loader2,
  Stamp,
  Award,
} from 'lucide-react';

interface DocumentEditorProps {
  currentDocument: BillingDocument;
  business: BusinessProfile;
  onDocChange?: (doc: BillingDocument) => void;
  onSaveDocument: (doc: BillingDocument) => void;
  onNewDocument: (type: DocumentType) => void;
  onDuplicateDocument: (doc: BillingDocument) => void;
  onConvertToInvoice: (quotationDoc: BillingDocument) => void;
  onGenerateReceipt: (invoiceDoc: BillingDocument) => void;
  onReviseQuotation?: (quotationDoc: BillingDocument) => void;
  onGenerateAdvanceReceipt?: (quotationDoc: BillingDocument) => void;
  onUpdateBusinessSignature: (signatureDataUrl: string) => void;
  onSaveAsDefaultText: (type: BillingDocument['type'], customText: DocumentCustomText) => void;
  existingDocs: BillingDocument[];
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  currentDocument,
  business,
  onDocChange,
  onSaveDocument,
  onNewDocument,
  onDuplicateDocument,
  onConvertToInvoice,
  onGenerateReceipt,
  onReviseQuotation,
  onGenerateAdvanceReceipt,
  onUpdateBusinessSignature,
  onSaveAsDefaultText,
  existingDocs,
}) => {
  const [doc, setDoc] = useState<BillingDocument>(currentDocument);
  const [zoom, setZoom] = useState<number>(0.75);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Sync internal state when document ID changes or when parent updates the active draft (e.g. from Settings)
  useEffect(() => {
    if (currentDocument && (currentDocument.id !== doc.id || currentDocument.updatedAt !== doc.updatedAt)) {
      setDoc(currentDocument);
    }
  }, [currentDocument?.id, currentDocument?.updatedAt]);

  // Central document update handler that keeps parent and localStorage in lockstep
  const handleUpdateDoc = useCallback((newDoc: BillingDocument) => {
    setDoc(newDoc);
    onDocChange?.(newDoc);
    StorageService.saveDraft(newDoc);
  }, [onDocChange]);

  // Autosave draft into localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      StorageService.saveDraft(doc);
    }, 400);
    return () => clearTimeout(timer);
  }, [doc]);

  // Measure Quotation Layout and Pages
  const quotationPages = useMemo(() => {
    if (doc.type !== 'quotation') return null;
    return resolveQuotationPages(doc, business);
  }, [doc, business]);

  // Validation rules
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    // Document number validation
    if (!doc.documentNumber || !doc.documentNumber.trim()) {
      errors.push('Document number is required.');
    } else if (isDocumentNumberDuplicate(doc.documentNumber, doc.id, existingDocs)) {
      errors.push(`Document number "${doc.documentNumber}" is already in use by another document.`);
    }

    // Client Name validation
    if (!doc.clientName || !doc.clientName.trim()) {
      errors.push('Client name is required.');
    }

    // Bank Details validation (for invoice payment request)
    const showBank = doc.type === 'invoice' && (doc.paymentDetails.showBankOnDoc ?? business.showBankDetails);
    if (showBank) {
      const hasDocBankRow = doc.paymentRows?.some(
        r => r.enabled && r.label.toLowerCase().includes('bank') && r.value.trim().length > 10
      );
      const hasBusinessBank = Boolean(
        business.bankName?.trim() && business.bankAccountNumber?.trim() && business.bankIfsc?.trim()
      );
      if (!hasDocBankRow && !hasBusinessBank) {
        errors.push(
          'Bank Transfer is set to show on documents, but Bank details (Bank Name, Account No, IFSC) are empty in Settings.'
        );
      }
    }

    // UPI Validation (for invoice payment request)
    const showUpi = doc.type === 'invoice' && (doc.paymentDetails.showUpiOnDoc ?? business.showUpi);
    const showQr = doc.type === 'invoice' && (doc.sectionVisibility.showUpiQr || doc.paymentDetails.showQrOnDoc || business.showUpiQr);
    if ((showUpi || showQr) && !business.upiId?.trim()) {
      errors.push('UPI is set to show on documents, but UPI ID is empty in Settings.');
    }

    // Negative numbers validation
    if (doc.items.some((i) => i.qty < 0 || i.rate < 0 || i.amount < 0)) {
      errors.push('Line items cannot have negative quantities or rates.');
    }
    if ((doc.advanceReceived || 0) < 0) {
      errors.push('Advance received cannot be negative.');
    }
    if ((doc.discountValue || 0) < 0) {
      errors.push('Discount cannot be negative.');
    }

    // Quotation layout & hard limits validation (strictly blocks export on overflow or hard limits)
    if (doc.type === 'quotation') {
      const qLayout = measureQuotationLayout(doc);
      if (qLayout.hasOverflow && qLayout.overflowMessage) {
        errors.push(qLayout.overflowMessage);
      }
      if (qLayout.hardLimitViolations && qLayout.hardLimitViolations.length > 0) {
        errors.push(...qLayout.hardLimitViolations);
      }
    }

    return errors;
  }, [doc, business, existingDocs]);

  // Save handler
  const handleSave = useCallback(() => {
    if (!doc.documentNumber || !doc.documentNumber.trim()) {
      alert('Cannot save: Document number is required.');
      return;
    }
    if (!doc.clientName || !doc.clientName.trim()) {
      alert('Cannot save: Client name is required.');
      return;
    }

    const duplicateError = validationErrors.find((e) => e.includes('already in use'));
    if (duplicateError) {
      alert(`Cannot save: ${duplicateError}`);
      return;
    }

    onSaveDocument(doc);
    setSaveToast('Document saved successfully');
    setTimeout(() => setSaveToast(null), 2500);

    // Auto-sync to Google Drive if configured (Database JSON only - No PDF is generated here)
    const driveConfig = GoogleDriveSyncService.getConfig();
    if (driveConfig.url && driveConfig.autoSync) {
      GoogleDriveSyncService.syncDatabase(StorageService.exportFullBackup(true)).catch((err) => {
        console.warn('Background Google Drive sync:', err);
      });
    }
  }, [doc, validationErrors, onSaveDocument]);

  // Direct Final Executor
  const executeFinalDirect = useCallback((targetDoc: BillingDocument) => {
    if (targetDoc.isFinal) {
      if (window.confirm('This document is currently locked as Final. Unlock for editing?')) {
        const unlocked: BillingDocument = {
          ...targetDoc,
          isFinal: false,
          status: targetDoc.type === 'quotation' ? 'DRAFT' : targetDoc.type === 'receipt' ? 'PAID' : 'UNPAID',
          applySignature: false,
        };
        handleUpdateDoc(unlocked);
        onSaveDocument(unlocked);
        setSaveToast('Document unlocked for editing.');
        setTimeout(() => setSaveToast(null), 2500);
      }
      return;
    }

    if (!business.signatureDataUrl) {
      setIsSignatureModalOpen(true);
      return;
    }

    const updated: BillingDocument = {
      ...targetDoc,
      isFinal: true,
      status: targetDoc.type === 'receipt' ? 'PAID' : targetDoc.type === 'quotation' ? (targetDoc.status === 'DRAFT' ? 'SENT' : targetDoc.status) : 'FINAL',
      applySignature: true,
    };
    handleUpdateDoc(updated);
    onSaveDocument(updated);
    setSaveToast('Document marked as Final & business signature applied!');
    setTimeout(() => setSaveToast(null), 3000);
  }, [business.signatureDataUrl, handleUpdateDoc, onSaveDocument]);

  // Direct PDF Export Executor
  const executeExportDirect = useCallback(async (targetDoc: BillingDocument) => {
    const wasMobileEditTab = activeTab === 'edit' && window.innerWidth < 768;

    try {
      setIsExporting(true);
      setExportMessage('Preparing high-res A4 PDF...');

      if (wasMobileEditTab) {
        setActiveTab('preview');
        await new Promise((r) => setTimeout(r, 120));
      }

      const pageElements = Array.from(
        document.querySelectorAll<HTMLElement>('.a4-page-export')
      );

      if (!pageElements || pageElements.length === 0) {
        throw new Error('Could not find document preview pages to render.');
      }

      const docTypeLabel = targetDoc.type === 'receipt' ? 'Receipt' : targetDoc.type === 'quotation' ? 'Quotation' : 'Invoice';
      const cleanClient = (targetDoc.clientName || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanNumber = (targetDoc.documentNumber || 'DOC').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `DEVRIAN_${docTypeLabel}_${cleanNumber}_${cleanClient}.pdf`;

      const exportResult = await exportElementsToPdf(pageElements, fileName, {
        onProgress: (_progress, msg) => {
          setExportMessage(msg);
        },
        metadata: {
          title: `DEVRIAN ${docTypeLabel} ${targetDoc.documentNumber}`,
          author: 'DEVRIAN',
          creator: 'DEVRIAN Billing Studio',
          subject: `${docTypeLabel} for ${targetDoc.clientName || 'Client'}`,
        },
      });

      onSaveDocument(targetDoc);

      // Auto-upload PDF and sync database to Google Drive if configured
      const driveConfig = GoogleDriveSyncService.getConfig();
      if (driveConfig.url && driveConfig.autoSync && exportResult?.pdfBase64) {
        setExportMessage('Uploading PDF to Google Drive client folder...');
        try {
          const uploadRes = await GoogleDriveSyncService.uploadPdf(
            targetDoc.type === 'receipt' ? 'receipt' : 'invoice',
            fileName,
            exportResult.pdfBase64,
            targetDoc.clientName || 'General Client'
          );
          await GoogleDriveSyncService.syncDatabase(StorageService.exportFullBackup(true));
          if (uploadRes.success) {
            setSaveToast('✓ PDF downloaded & uploaded to Google Drive folder successfully!');
          } else {
            setSaveToast(`PDF downloaded locally (${uploadRes.message || 'Drive upload failed'})`);
          }
        } catch (e: any) {
          console.warn('Google Drive upload notice:', e);
          setSaveToast(`PDF downloaded locally (Drive notice: ${e.message})`);
        }
      } else {
        setSaveToast('PDF downloaded successfully');
      }
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      alert(`Error generating PDF: ${err.message || err}`);
    } finally {
      setIsExporting(false);
      setExportMessage('');
      if (wasMobileEditTab) {
        setActiveTab('edit');
      }
    }
  }, [activeTab, onSaveDocument]);

  // Mark as Final handler (locks editing with unlock confirmation)
  const handleMarkAsFinal = useCallback(() => {
    executeFinalDirect(doc);
  }, [doc, executeFinalDirect]);

  // PDF Export handler
  const handleDownloadPdf = useCallback(async () => {
    if (validationErrors.length > 0) {
      alert(`Cannot export PDF:\n\n• ${validationErrors.join('\n• ')}`);
      return;
    }
    executeExportDirect(doc);
  }, [validationErrors, doc, executeExportDirect]);

  // Type change handler
  const handleTypeChange = (newType: DocumentType) => {
    if (newType === doc.type) return;

    // Check if an existing document is explicitly linked to this document
    const linked = existingDocs.find(
      (d) =>
        d.type === newType &&
        ((doc.type === 'invoice' && d.sourceInvoiceId === doc.id) ||
          (doc.type === 'receipt' && doc.sourceInvoiceId && d.id === doc.sourceInvoiceId))
    );
    if (linked) {
      handleUpdateDoc(linked);
      return;
    }

    let pattern = business.invoicePattern;
    if (newType === 'receipt') pattern = business.receiptPattern;
    if (newType === 'quotation') pattern = business.quotationPattern;

    const newDocNumber = generateNextDocumentNumber(newType, pattern, existingDocs);
    const today = getTodayISODate();

    const defText =
      business.defaultCustomText?.[newType] ||
      (newType === 'quotation'
        ? DEFAULT_QUOTATION_TEXT
        : newType === 'receipt'
        ? DEFAULT_RECEIPT_TEXT
        : DEFAULT_INVOICE_TEXT);

    const isSwitchingToReceipt = newType === 'receipt';
    const isSwitchingToQuotation = newType === 'quotation';
    const totalProjectCost = doc.subtotal - (doc.discountAmount || 0) + (doc.totalTaxAmount || 0);

    const isQuotationMonthly = isSwitchingToQuotation && doc.quotationType === 'monthly';
    const projDefaults = business.projectQuotationDefaults;
    const monthlyDefaults = business.monthlyQuotationDefaults;

    const quotationValidityDays = isQuotationMonthly
      ? (monthlyDefaults?.validityDays || 15)
      : (projDefaults?.validityDays || business.quotationValidityDays || 15);

    const quotationTerms = isQuotationMonthly
      ? (monthlyDefaults?.termsTemplate || MONTHLY_DEFAULT_TERMS)
      : (projDefaults?.termsTemplate || business.quotationTermsTemplate || PROJECT_DEFAULT_TERMS);

    const quotationClosing = isQuotationMonthly
      ? (monthlyDefaults?.closingLine || 'Thank you for considering DEVRIAN. We look forward to working with you.')
      : (projDefaults?.closingLine || business.quotationClosingTemplate || 'Thank you for considering DEVRIAN. We look forward to working with you.');

    const updated: BillingDocument = {
      ...doc,
      // Assign fresh ID when switching types so original document is not overwritten
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sourceInvoiceId: doc.type === 'invoice' ? doc.id : doc.sourceInvoiceId,
      sourceQuotationId: doc.type === 'quotation' ? doc.id : doc.sourceQuotationId,
      type: newType,
      documentNumber: newDocNumber,
      date: today,
      dueDate: newType === 'invoice' ? calculateDueDate(today, 'Net 7') : undefined,
      validTill: newType === 'quotation' ? calculateValidTillDate(today, quotationValidityDays) : undefined,
      status: isSwitchingToReceipt ? 'PAID' : isSwitchingToQuotation ? 'DRAFT' : 'UNPAID',
      amountReceived: isSwitchingToReceipt
        ? (doc.advanceReceived > 0 ? doc.advanceReceived : totalProjectCost)
        : undefined,
      totalProjectCost: isSwitchingToReceipt ? totalProjectCost : undefined,
      advancePercent: isSwitchingToQuotation ? (doc.advancePercent || projDefaults?.advancePercent || business.advancePercentDefault || 50) : doc.advancePercent,
      quotationType: isSwitchingToQuotation ? (doc.quotationType || 'project') : undefined,
      projectName: doc.projectName || (isSwitchingToQuotation ? (isQuotationMonthly ? 'Social Media Management & Monthly Creative Retainer' : 'Commercial Creative & Video Production Services') : ''),
      platforms: isSwitchingToQuotation ? (doc.platforms || 'Instagram, YouTube Shorts, LinkedIn') : doc.platforms,
      billingCycle: isSwitchingToQuotation ? (doc.billingCycle || monthlyDefaults?.billingCycle || 'Monthly') : doc.billingCycle,
      paymentDueDescription: isSwitchingToQuotation ? (doc.paymentDueDescription || monthlyDefaults?.paymentDueDescription || 'In advance, on or before the 1st of each cycle') : doc.paymentDueDescription,
      autoRenewalDescription: isSwitchingToQuotation ? (doc.autoRenewalDescription || monthlyDefaults?.autoRenewalDescription || 'Auto-renews monthly until cancelled in writing') : doc.autoRenewalDescription,
      contractStartDate: isSwitchingToQuotation ? (doc.contractStartDate || today) : undefined,
      minTermMonths: isSwitchingToQuotation ? (doc.minTermMonths || monthlyDefaults?.minTermMonths || 3) : undefined,
      noticePeriodDays: isSwitchingToQuotation ? (doc.noticePeriodDays || monthlyDefaults?.noticePeriodDays || 30) : undefined,
      autoRenewal: isSwitchingToQuotation ? (doc.autoRenewal ?? true) : undefined,
      monthlyDeliverables: isSwitchingToQuotation
        ? (doc.monthlyDeliverables && doc.monthlyDeliverables.length > 0
            ? doc.monthlyDeliverables
            : [...(monthlyDefaults?.deliverables || DEFAULT_MONTHLY_DELIVERABLES)])
        : undefined,
      quotationBlocks: isSwitchingToQuotation
        ? (doc.quotationBlocks && doc.quotationBlocks.length > 0
            ? doc.quotationBlocks
            : [...DEFAULT_QUOTATION_BLOCKS])
        : undefined,
      inclusions: isSwitchingToQuotation ? (doc.inclusions ?? '') : doc.inclusions,
      exclusions: isSwitchingToQuotation ? (doc.exclusions ?? '') : doc.exclusions,
      deliveryTimeline: isSwitchingToQuotation ? (doc.deliveryTimeline ?? '') : doc.deliveryTimeline,
      estimatedDelivery: isSwitchingToQuotation
        ? (doc.estimatedDelivery ?? projDefaults?.deliveryTimeline ?? '10 working days after advance and required materials')
        : doc.estimatedDelivery,
      freeNotes: isSwitchingToQuotation ? (doc.freeNotes ?? '') : doc.freeNotes,
      sectionVisibility: isSwitchingToQuotation
        ? { ...DEFAULT_QUOTATION_VISIBILITY }
        : { ...doc.sectionVisibility },
      customText: { ...defText },
      notes:
        newType === 'invoice'
          ? [...business.invoiceTermsTemplate]
          : newType === 'receipt'
          ? [...business.receiptTermsTemplate]
          : resolveQuotationTermsList(quotationTerms, business),
      closingLine:
        newType === 'receipt'
          ? business.receiptClosingTemplate
          : newType === 'quotation'
          ? quotationClosing
          : business.invoiceClosingTemplate,
    };

    handleUpdateDoc(updated);
  };

  // Keyboard shortcuts (Ctrl+S, Ctrl+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleDownloadPdf();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleDownloadPdf]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#121212]">
      {/* 1. TOP ACTION BAR */}
      <div className="h-14 border-b border-neutral-800 bg-neutral-900 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20">
        {/* Left: Document Type Switcher */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              type="button"
              onClick={() => handleTypeChange('invoice')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                doc.type === 'invoice'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileText size={13} />
              <span>Invoice</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('receipt')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                doc.type === 'receipt'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Receipt size={13} />
              <span>Receipt</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('quotation')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                doc.type === 'quotation'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileCheck size={13} />
              <span>Quotation</span>
            </button>
          </div>

          {/* Page Status Pill for Quotation */}
          {doc.type === 'quotation' && quotationPages && (
            <div
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition border shadow-sm ${
                quotationPages.length > 1
                  ? 'bg-indigo-950/70 border-indigo-500/60 text-indigo-300'
                  : 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
              }`}
              title="Quotation document page count"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  quotationPages.length > 1 ? 'bg-indigo-400' : 'bg-emerald-400'
                }`}
              />
              <span>
                {quotationPages.length > 1
                  ? `${quotationPages.length} pages`
                  : '1 page (Auto)'}
              </span>
            </div>
          )}

          {/* Quick conversions */}
          {doc.type === 'invoice' && (
            <button
              type="button"
              onClick={() => onGenerateReceipt(doc)}
              className="hidden xl:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md border border-neutral-700 transition"
              title="Create a Payment Receipt prefilled from this Invoice"
            >
              <Receipt size={12} />
              <span>Generate Receipt</span>
            </button>
          )}

          {doc.type === 'quotation' && (
            <div className="hidden xl:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onConvertToInvoice(doc)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md border border-neutral-700 transition"
                title="Convert this Quotation into an Invoice"
              >
                <FileText size={12} />
                <span>Convert to Invoice</span>
              </button>
              {onReviseQuotation && (
                <button
                  type="button"
                  onClick={() => onReviseQuotation(doc)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md border border-neutral-700 transition"
                  title="Create a revision of this Quotation (e.g. -R1)"
                >
                  <Copy size={12} />
                  <span>Revise</span>
                </button>
              )}
              {onGenerateAdvanceReceipt && (
                <button
                  type="button"
                  onClick={() => onGenerateAdvanceReceipt(doc)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md border border-neutral-700 transition"
                  title="Generate an Advance Payment Receipt from this Quotation"
                >
                  <Receipt size={12} />
                  <span>Advance Receipt</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Center: Mobile Edit | Preview Tab Switcher */}
        <div className="flex md:hidden bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              activeTab === 'edit' ? 'bg-white text-black' : 'text-neutral-400'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              activeTab === 'preview' ? 'bg-white text-black' : 'text-neutral-400'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mark as Final */}
          <button
            type="button"
            onClick={handleMarkAsFinal}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition border ${
              doc.isFinal
                ? 'bg-amber-950/60 border-amber-600/80 text-amber-300'
                : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
            }`}
            title="Mark as Final / Issued & apply signature"
          >
            <Award size={13} className={doc.isFinal ? 'text-amber-400' : 'text-neutral-400'} />
            <span className="hidden sm:inline">{doc.isFinal ? 'Final / Issued' : 'Mark as Final'}</span>
          </button>

          {/* New Document Button */}
          <button
            type="button"
            onClick={() => onNewDocument(doc.type)}
            className="p-1.5 sm:px-2 sm:py-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md text-xs font-medium flex items-center gap-1 transition"
            title="Create New Document"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* Duplicate Button */}
          <button
            type="button"
            onClick={() => onDuplicateDocument(doc)}
            className="p-1.5 sm:px-2 sm:py-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md text-xs font-medium flex items-center gap-1 transition"
            title="Duplicate Document"
          >
            <Copy size={14} />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-md text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 transition"
            title="Save Document (Ctrl+S)"
          >
            <Save size={13} />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPdf}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition ${
              validationErrors.length > 0
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                : 'bg-white hover:bg-neutral-200 text-black shadow-md'
            }`}
            title="Download Print-Ready A4 PDF (Ctrl+P)"
          >
            {isExporting ? (
              <>
                <Loader2 size={13} className="animate-spin text-black" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={13} />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0E0E0E] text-white border border-neutral-700 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* PDF Export Overlay Modal */}
      {isExporting && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <div className="bg-neutral-900 border border-neutral-700 p-6 rounded-xl shadow-2xl flex flex-col items-center space-y-4 max-w-sm text-center">
            <Loader2 size={32} className="animate-spin text-white" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">Generating A4 PDF</h3>
              <p className="text-xs text-neutral-400 mt-1">{exportMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Signature Studio Modal */}
      <SignatureStudioModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSaveSignature={(dataUrl) => {
          onUpdateBusinessSignature(dataUrl);
          const updated = { ...doc, applySignature: true };
          setDoc(updated);
          onSaveDocument(updated);
          setSaveToast('Signature saved & applied to document!');
          setTimeout(() => setSaveToast(null), 2500);
        }}
        onRemoveSignature={() => {
          onUpdateBusinessSignature('');
          const updated = { ...doc, applySignature: false };
          setDoc(updated);
          onSaveDocument(updated);
          setSaveToast('Signature removed from storage.');
          setTimeout(() => setSaveToast(null), 2500);
        }}
        currentSignature={business.signatureDataUrl}
      />

      {/* 2. SPLIT WORKSPACE: LEFT FORM, RIGHT PREVIEW */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: FORM */}
        <div
          className={`w-full md:w-[480px] lg:w-[540px] xl:w-[580px] border-r border-neutral-800 bg-[#141414] overflow-y-auto px-4 py-6 shrink-0 custom-scrollbar ${
            activeTab === 'preview' ? 'hidden md:block' : 'block'
          }`}
        >
          <DocumentForm
            document={doc}
            business={business}
            onChange={handleUpdateDoc}
            onSaveAsDefaultText={onSaveAsDefaultText}
            onOpenSignatureStudio={() => setIsSignatureModalOpen(true)}
            validationErrors={validationErrors}
          />
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW & ZOOM CONTROLS */}
        <div
          className={`flex-1 bg-[#CBD5E1] flex flex-col overflow-hidden ${
            activeTab === 'edit' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Zoom Toolbar */}
          <div className="h-10 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="font-semibold text-neutral-200">Live Preview</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-400">A4 Paper (210 × 297 mm)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))))}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>

              <span className="text-[11px] font-mono text-neutral-300 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.5, parseFloat((z + 0.1).toFixed(1))))}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>

              <button
                type="button"
                onClick={() => setZoom(1)}
                className="px-2 py-0.5 rounded text-[11px] font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-700 ml-1 transition"
                title="Reset Zoom to 100%"
              >
                100%
              </button>

              <button
                type="button"
                onClick={() => setZoom(0.75)}
                className="px-2 py-0.5 rounded text-[11px] font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-700 transition"
                title="Fit to Screen"
              >
                <Maximize2 size={11} className="inline mr-1" /> Fit
              </button>
            </div>
          </div>

          {/* Interactive Document Preview scrollable container: Neutral Grey Desk Background */}
          <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center custom-scrollbar bg-[#CBD5E1]">
            <DocumentPreview
              document={doc}
              business={business}
              zoom={zoom}
              onUpdateDoc={handleUpdateDoc}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
