import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BillingDocument, BusinessProfile, DocumentType, DocumentCustomText } from '../../types';
import { DocumentForm } from './DocumentForm';
import { DocumentPreview } from '../document/DocumentPreview';
import { exportElementsToPdf } from '../../services/pdfExport';
import { StorageService } from '../../services/storage';
import { GoogleDriveSyncService } from '../../services/googleDriveSync';
import { generateNextDocumentNumber, isDocumentNumberDuplicate } from '../../services/numbering';
import { getTodayISODate, calculateDueDate } from '../../services/dateUtils';
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

    return errors;
  }, [doc, business, existingDocs]);

  // Save handler
  const handleSave = useCallback(() => {
    onSaveDocument(doc);
    setSaveToast('Document saved successfully');
    setTimeout(() => setSaveToast(null), 2500);

    // Auto-sync to Google Drive if configured
    const driveConfig = GoogleDriveSyncService.getConfig();
    if (driveConfig.url && driveConfig.autoSync) {
      GoogleDriveSyncService.syncDatabase(StorageService.exportFullBackup(true)).catch((err) => {
        console.warn('Background Google Drive sync:', err);
      });
    }
  }, [doc, onSaveDocument]);

  // Mark as Final handler
  const handleMarkAsFinal = useCallback(() => {
    if (!business.signatureDataUrl) {
      setIsSignatureModalOpen(true);
      return;
    }

    const updated: BillingDocument = {
      ...doc,
      isFinal: true,
      status: doc.type === 'receipt' ? 'PAID' : 'FINAL',
      applySignature: true,
    };
    setDoc(updated);
    onSaveDocument(updated);
    setSaveToast('Document marked as Final & business signature applied!');
    setTimeout(() => setSaveToast(null), 3000);
  }, [doc, business.signatureDataUrl, onSaveDocument]);

  // PDF Export handler
  const handleDownloadPdf = useCallback(async () => {
    if (validationErrors.length > 0) {
      alert(`Cannot export PDF:\n\n• ${validationErrors.join('\n• ')}`);
      return;
    }

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

      const docTypeLabel = doc.type === 'receipt' ? 'Receipt' : 'Invoice';
      const cleanClient = (doc.clientName || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanNumber = (doc.documentNumber || 'DOC').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `DEVRIAN_${docTypeLabel}_${cleanNumber}_${cleanClient}.pdf`;

      const exportResult = await exportElementsToPdf(pageElements, fileName, {
        onProgress: (_progress, msg) => {
          setExportMessage(msg);
        },
        metadata: {
          title: `DEVRIAN ${docTypeLabel} ${doc.documentNumber}`,
          author: 'DEVRIAN',
          creator: 'DEVRIAN Billing Studio',
          subject: `${docTypeLabel} for ${doc.clientName || 'Client'}`,
        },
      });

      onSaveDocument(doc);
      setSaveToast('PDF downloaded successfully');
      setTimeout(() => setSaveToast(null), 2500);

      // Auto-upload PDF and sync database to Google Drive if configured
      const driveConfig = GoogleDriveSyncService.getConfig();
      if (driveConfig.url && driveConfig.autoSync) {
        (async () => {
          try {
            if (exportResult?.pdfBase64) {
              await GoogleDriveSyncService.uploadPdf(
                doc.type === 'receipt' ? 'receipt' : 'invoice',
                fileName,
                exportResult.pdfBase64
              );
            }
            await GoogleDriveSyncService.syncDatabase(StorageService.exportFullBackup(true));
          } catch (e) {
            console.warn('Background Google Drive upload notice:', e);
          }
        })();
      }
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
  }, [validationErrors, activeTab, doc, onSaveDocument]);

  // Type change handler
  const handleTypeChange = (newType: DocumentType) => {
    if (newType === doc.type) return;

    // Check if an existing document of this type exists in list
    const existing = existingDocs.find((d) => d.type === newType);
    if (existing) {
      setDoc(existing);
      return;
    }

    let pattern = business.invoicePattern;
    if (newType === 'receipt') pattern = business.receiptPattern;
    if (newType === 'quotation') pattern = business.quotationPattern;

    const newDocNumber = generateNextDocumentNumber(newType, pattern, existingDocs);
    const today = getTodayISODate();

    const defText = business.defaultCustomText?.[newType] || {
      ...doc.customText,
      documentTitle: newType === 'invoice' ? 'INVOICE' : newType === 'receipt' ? 'PAYMENT RECEIPT' : 'QUOTATION',
      eyebrow: newType === 'receipt' ? 'ADVANCE PAYMENT' : newType.toUpperCase(),
    };

    const updated: BillingDocument = {
      ...doc,
      type: newType,
      documentNumber: newDocNumber,
      date: today,
      dueDate: newType === 'invoice' ? calculateDueDate(today, 'Net 7') : undefined,
      validTill: newType === 'quotation' ? calculateDueDate(today, 'Net 7') : undefined,
      status: newType === 'receipt' ? 'PAID' : 'UNPAID',
      customText: { ...defText },
      notes:
        newType === 'invoice'
          ? [...business.invoiceTermsTemplate]
          : newType === 'receipt'
          ? [...business.receiptTermsTemplate]
          : [...business.quotationTermsTemplate],
      closingLine:
        newType === 'receipt'
          ? business.receiptClosingTemplate
          : business.invoiceClosingTemplate,
    };

    setDoc(updated);
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
          </div>

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
            <DocumentPreview document={doc} business={business} zoom={zoom} />
          </div>
        </div>
      </div>
    </div>
  );
};
