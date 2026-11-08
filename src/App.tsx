import React, { useState, useEffect, useCallback } from 'react';
import {
  BillingDocument,
  BusinessProfile,
  Client,
  DocumentType,
  DocumentStatus,
  DocumentCustomText,
} from './types';
import { StorageService, AppBackupData } from './services/storage';
import { generateNextDocumentNumber } from './services/numbering';
import { getTodayISODate, calculateDueDate } from './services/dateUtils';
import {
  DEFAULT_INVOICE_TEXT,
  DEFAULT_RECEIPT_TEXT,
  DEFAULT_QUOTATION_TEXT,
  DEFAULT_VISIBILITY,
} from './services/seedData';
import { Navbar, AppPage } from './components/common/Navbar';
import { DocumentEditor } from './components/editor/DocumentEditor';
import { HistoryView } from './components/history/HistoryView';
import { ClientsView } from './components/clients/ClientsView';
import { DashboardView } from './components/dashboard/DashboardView';
import { SettingsView } from './components/settings/SettingsView';

const PoliciesModule = React.lazy(() => import('./modules/policies/PoliciesModule'));

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>('create');
  const [profile, setProfile] = useState<BusinessProfile>(() => StorageService.getProfile());
  const [documents, setDocuments] = useState<BillingDocument[]>(() => StorageService.getDocuments());
  const [clients, setClients] = useState<Client[]>(() => StorageService.getClients());

  // Multi-tab synchronization: keep documents, clients, and profile in sync across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === 'devrian_documents_v1') {
        setDocuments(StorageService.getDocuments());
      } else if (e.key === 'devrian_clients_v1') {
        setClients(StorageService.getClients());
      } else if (e.key === 'devrian_business_profile_v1') {
        setProfile(StorageService.getProfile());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper to create fresh document with full text snapshots and section visibility
  const createFreshDocument = useCallback(
    (type: DocumentType, baseData?: Partial<BillingDocument>): BillingDocument => {
      let pattern = profile.invoicePattern;
      if (type === 'receipt') pattern = profile.receiptPattern;
      if (type === 'quotation') pattern = profile.quotationPattern;

      const docNumber = generateNextDocumentNumber(type, pattern, documents);
      const today = getTodayISODate();

      const defaultItems =
        type === 'receipt'
          ? [
              {
                id: `item-${Date.now()}`,
                description: '50% Advance Payment',
                subDescription: 'Video editing – 15 FMCG vertical videos (as per proposal dated 04 November 2026)',
                qty: 1,
                rate: 3000,
                amount: 3000,
                mode: 'UPI',
              },
            ]
          : [
              {
                id: `item-${Date.now()}`,
                description: 'Short-form video editing (reel)',
                subDescription: '15 vertical video edits with captions and sound design',
                qty: 15,
                rate: 800,
                amount: 12000,
              },
            ];

      const initialSubtotal = defaultItems.reduce((acc, i) => acc + i.amount, 0);

      // Default text snapshot for this type
      const defText =
        profile.defaultCustomText?.[type] ||
        (type === 'invoice'
          ? DEFAULT_INVOICE_TEXT
          : type === 'receipt'
          ? DEFAULT_RECEIPT_TEXT
          : DEFAULT_QUOTATION_TEXT);

      // Default payment detail rows
      const defaultPaymentRows =
        type === 'receipt'
          ? [
              { id: 'p1', label: 'Date & Time', value: '05 Nov 2026, 01:39 PM', enabled: true },
              { id: 'p2', label: 'Payment Mode', value: 'UPI (PhonePe)', enabled: true },
              { id: 'p3', label: 'Transaction ID', value: '', enabled: true },
              { id: 'p4', label: 'UTR No.', value: '', enabled: true },
            ]
          : [
              {
                id: 'p1',
                label: 'UPI',
                value: profile.upiId || 'inquiry@devrian.in',
                enabled: true,
              },
              {
                id: 'p2',
                label: 'Bank Transfer',
                value: `A/c Name: ${profile.bankAccountName || 'Dev Rajpoot (DEVRIAN)'} · Bank: ${
                  profile.bankName || '[Bank Name]'
                } · A/c No.: ${profile.bankAccountNumber || '[Account Number]'} · IFSC: ${
                  profile.bankIfsc || '[IFSC]'
                }`,
                enabled: true,
              },
            ];

      const newDoc: BillingDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type,
        documentNumber: docNumber,
        date: today,
        dueDate: type === 'invoice' ? calculateDueDate(today, 'Net 7') : undefined,
        validTill: type === 'quotation' ? calculateDueDate(today, 'Net 7') : undefined,
        status: type === 'receipt' ? 'PAID' : 'UNPAID',
        isFinal: false,
        applySignature: false,
        customText: { ...defText },
        sectionVisibility: { ...DEFAULT_VISIBILITY },
        paymentRows: defaultPaymentRows,
        clientName: '',
        clientContactPerson: '',
        clientAddress: '',
        clientPhone: '',
        clientEmail: '',
        clientGstin: '',
        projectName: '',
        items: defaultItems,
        subtotal: initialSubtotal,
        discountType: 'flat',
        discountValue: 0,
        discountAmount: 0,
        gstEnabled: false,
        gstRate: 0,
        gstType: 'CGST_SGST',
        advanceReceived: type === 'receipt' ? initialSubtotal : 0,
        totalProjectCost: type === 'receipt' ? initialSubtotal * 2 : undefined,
        balanceDue: initialSubtotal,
        amountReceived: type === 'receipt' ? initialSubtotal : undefined,
        paymentDetails: {
          dateTime: type === 'receipt' ? '05 Nov 2026, 01:39 PM' : undefined,
          mode: 'UPI (PhonePe)',
          showBankOnDoc: profile.showBankDetails,
          showUpiOnDoc: profile.showUpi,
          showQrOnDoc: profile.showUpiQr,
        },
        paymentTermsPreset: 'Net 7',
        notes:
          type === 'invoice'
            ? [...profile.invoiceTermsTemplate]
            : type === 'receipt'
            ? [...profile.receiptTermsTemplate]
            : [...profile.quotationTermsTemplate],
        closingLine:
          type === 'receipt' ? profile.receiptClosingTemplate : profile.invoiceClosingTemplate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...baseData,
      };

      return newDoc;
    },
    [profile, documents]
  );

  // Active document being edited in editor
  const [activeDoc, setActiveDoc] = useState<BillingDocument>(() => {
    const draft = StorageService.getDraft();
    if (draft) return draft;
    if (documents.length > 0) return documents[0];
    return createFreshDocument('receipt');
  });

  // Save Document
  const handleSaveDocument = useCallback((doc: BillingDocument) => {
    let docToSave = { ...doc };

    // Auto-save client if legitimate client name provided
    const cleanClientName = (doc.clientName || '').trim();
    if (cleanClientName && cleanClientName.toLowerCase() !== 'client name') {
      const savedClient = StorageService.saveOrUpdateClient({
        id: doc.clientId,
        name: cleanClientName,
        contactPerson: doc.clientContactPerson,
        address: doc.clientAddress,
        phone: doc.clientPhone,
        email: doc.clientEmail,
        gstin: doc.clientGstin,
      });
      setClients(StorageService.getClients());
      docToSave.clientId = savedClient.id;
    }

    const updatedList = StorageService.saveDocument(docToSave);
    setDocuments(updatedList);
    setActiveDoc(docToSave);
  }, []);

  // New Document
  const handleNewDocument = useCallback(
    (type: DocumentType) => {
      const fresh = createFreshDocument(type);
      setActiveDoc(fresh);
      setCurrentPage('create');
    },
    [createFreshDocument]
  );

  // Duplicate Document
  const handleDuplicateDocument = useCallback(
    (docToDup: BillingDocument) => {
      let pattern = profile.invoicePattern;
      if (docToDup.type === 'receipt') pattern = profile.receiptPattern;
      if (docToDup.type === 'quotation') pattern = profile.quotationPattern;

      const newDocNumber = generateNextDocumentNumber(docToDup.type, pattern, documents);
      const duplicated: BillingDocument = {
        ...docToDup,
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        documentNumber: newDocNumber,
        date: getTodayISODate(),
        dueDate: docToDup.type === 'invoice' ? calculateDueDate(getTodayISODate(), 'Net 7') : undefined,
        validTill: docToDup.type === 'quotation' ? calculateDueDate(getTodayISODate(), 'Net 7') : undefined,
        status: 'UNPAID',
        isFinal: false,
        applySignature: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      handleSaveDocument(duplicated);
      setActiveDoc(duplicated);
      setCurrentPage('create');
    },
    [profile, documents, handleSaveDocument]
  );

  // Delete Document
  const handleDeleteDocument = useCallback(
    (id: string) => {
      const updated = StorageService.deleteDocument(id);
      setDocuments(updated);
      if (activeDoc.id === id) {
        if (updated.length > 0) {
          setActiveDoc(updated[0]);
        } else {
          setActiveDoc(createFreshDocument('invoice'));
        }
      }
    },
    [activeDoc.id, createFreshDocument]
  );

  // Status Update from History
  const handleUpdateStatus = useCallback((id: string, newStatus: DocumentStatus) => {
    const list = StorageService.getDocuments();
    const target = list.find((d) => d.id === id);
    if (target) {
      target.status = newStatus;
      StorageService.saveDocuments(list);
      setDocuments([...list]);
    }
  }, []);

  // Convert Quotation to Invoice
  const handleConvertToInvoice = useCallback(
    (quotationDoc: BillingDocument) => {
      const today = getTodayISODate();
      const invoiceNum = generateNextDocumentNumber('invoice', profile.invoicePattern, documents);

      const invoiceDoc: BillingDocument = {
        ...quotationDoc,
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'invoice',
        documentNumber: invoiceNum,
        date: today,
        dueDate: calculateDueDate(today, 'Net 7'),
        validTill: undefined,
        status: 'UNPAID',
        isFinal: false,
        applySignature: false,
        sourceQuotationId: quotationDoc.id,
        customText: {
          ...DEFAULT_INVOICE_TEXT,
          tagline: quotationDoc.customText.tagline || DEFAULT_INVOICE_TEXT.tagline,
          contactLine: quotationDoc.customText.contactLine || DEFAULT_INVOICE_TEXT.contactLine,
          udyamLine: quotationDoc.customText.udyamLine || DEFAULT_INVOICE_TEXT.udyamLine,
        },
        notes: [...profile.invoiceTermsTemplate],
        closingLine: profile.invoiceClosingTemplate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      handleSaveDocument(invoiceDoc);
      setActiveDoc(invoiceDoc);
      setCurrentPage('create');
    },
    [documents, profile, handleSaveDocument]
  );

  // Generate Receipt from Invoice
  const handleGenerateReceipt = useCallback(
    (invoiceDoc: BillingDocument) => {
      const today = getTodayISODate();
      const receiptNum = generateNextDocumentNumber('receipt', profile.receiptPattern, documents);
      const totalProjectCost =
        invoiceDoc.subtotal - invoiceDoc.discountAmount + (invoiceDoc.totalTaxAmount || 0);
      const amountReceived = invoiceDoc.advanceReceived > 0 ? invoiceDoc.advanceReceived : totalProjectCost;
      const balanceRemaining = Math.max(0, totalProjectCost - amountReceived);

      const receiptDoc: BillingDocument = {
        ...invoiceDoc,
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'receipt',
        documentNumber: receiptNum,
        date: today,
        dueDate: undefined,
        status: 'PAID',
        isFinal: true,
        applySignature: false,
        sourceInvoiceId: invoiceDoc.id,
        customText: {
          ...DEFAULT_RECEIPT_TEXT,
          eyebrow: 'ADVANCE PAYMENT',
          tagline: invoiceDoc.customText.tagline || DEFAULT_RECEIPT_TEXT.tagline,
          contactLine: invoiceDoc.customText.contactLine || DEFAULT_RECEIPT_TEXT.contactLine,
          udyamLine: invoiceDoc.customText.udyamLine || DEFAULT_RECEIPT_TEXT.udyamLine,
        },
        paymentRows: [
          { id: 'p1', label: 'Date & Time', value: '05 Nov 2026, 01:39 PM', enabled: true },
          { id: 'p2', label: 'Payment Mode', value: 'UPI (PhonePe)', enabled: true },
          { id: 'p3', label: 'Transaction ID', value: '', enabled: true },
          { id: 'p4', label: 'UTR No.', value: '', enabled: true },
        ],
        items: [
          {
            id: `item-${Date.now()}`,
            description: `Payment for ${invoiceDoc.projectName || invoiceDoc.documentNumber}`,
            subDescription: `Advance payment for invoice ${invoiceDoc.documentNumber}`,
            qty: 1,
            rate: amountReceived,
            amount: amountReceived,
            mode: 'UPI',
          },
        ],
        subtotal: amountReceived,
        totalProjectCost: totalProjectCost,
        advanceReceived: amountReceived,
        amountReceived: amountReceived,
        balanceDue: balanceRemaining,
        notes: [
          invoiceDoc.gstEnabled
            ? `GST @ ${invoiceDoc.gstRate}% included in project valuation (${invoiceDoc.gstType === 'CGST_SGST' ? 'CGST + SGST' : 'IGST'}).`
            : 'GST is not applicable (not registered).',
          balanceRemaining > 0
            ? `The remaining ₹${balanceRemaining.toLocaleString(
                'en-IN'
              )} is payable within 48 hours after project completion and approval, as per the project proposal.`
            : 'Full project payment received in advance. No balance due.',
        ],
        closingLine: profile.receiptClosingTemplate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      handleSaveDocument(receiptDoc);
      setActiveDoc(receiptDoc);
      setCurrentPage('create');
    },
    [documents, profile, handleSaveDocument]
  );

  // Business signature updates
  const handleUpdateBusinessSignature = useCallback(
    (sigDataUrl: string) => {
      const updatedProfile = { ...profile, signatureDataUrl: sigDataUrl };
      StorageService.saveProfile(updatedProfile);
      setProfile(updatedProfile);
    },
    [profile]
  );

  // Save default text template for a doc type
  const handleSaveAsDefaultText = useCallback(
    (type: DocumentType, customText: DocumentCustomText) => {
      const updatedProfile = {
        ...profile,
        defaultCustomText: {
          invoice: profile.defaultCustomText?.invoice || DEFAULT_INVOICE_TEXT,
          receipt: profile.defaultCustomText?.receipt || DEFAULT_RECEIPT_TEXT,
          quotation: profile.defaultCustomText?.quotation || DEFAULT_QUOTATION_TEXT,
          [type]: customText,
        },
      };
      StorageService.saveProfile(updatedProfile);
      setProfile(updatedProfile);
    },
    [profile]
  );

  // Client management
  const handleSaveClient = useCallback((clientData: Partial<Client> & { name: string }) => {
    StorageService.saveOrUpdateClient(clientData);
    setClients(StorageService.getClients());
  }, []);

  const handleDeleteClient = useCallback((id: string) => {
    const updated = StorageService.deleteClient(id);
    setClients(updated);
  }, []);

  // Profile Save
  const handleSaveProfile = useCallback((updated: BusinessProfile) => {
    StorageService.saveProfile(updated);
    setProfile(updated);
    // Also sync active draft custom text & payment details
    setActiveDoc((prev) => {
      const cleanProprietor = (updated.proprietor || 'Dev Rajpoot')
        .replace(/, Founder & CEO/i, '')
        .replace(/Founder & CEO/i, '')
        .trim() || 'Dev Rajpoot';

      const updatedDoc = {
        ...prev,
        customText: {
          ...prev.customText,
          tagline: updated.tagline || prev.customText.tagline,
          contactLine: updated.contactLine || `${updated.email || 'inquiry@devrian.in'} | ${updated.website || 'devrian.in'}`,
          udyamLine: `Udyam Reg. No.: ${updated.udyamNo || 'UDYAM-UP-54-0127731'} | Proprietor: ${cleanProprietor}`,
        },
        updatedAt: new Date().toISOString(),
      };

      if (updatedDoc.type === 'invoice' && updatedDoc.paymentRows) {
        updatedDoc.paymentRows = updatedDoc.paymentRows.map((r) => {
          if (r.label.toLowerCase().includes('upi')) {
            return { ...r, value: updated.upiId || r.value || 'inquiry@devrian.in' };
          }
          if (r.label.toLowerCase().includes('bank')) {
            return {
              ...r,
              value: `A/c Name: ${updated.bankAccountName || 'Dev Rajpoot (DEVRIAN)'} · Bank: ${
                updated.bankName || '[Bank Name]'
              } · A/c No.: ${updated.bankAccountNumber || '[Account Number]'} · IFSC: ${
                updated.bankIfsc || '[IFSC]'
              }`,
            };
          }
          return r;
        });
      }
      StorageService.saveDraft(updatedDoc);
      return updatedDoc;
    });
  }, []);

  // CSV Export
  const handleExportCSV = useCallback(() => {
    const csvContent = StorageService.exportHistoryCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DEVRIAN_History_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  // Restore backup
  const handleRestoreBackup = useCallback((backup: AppBackupData) => {
    const success = StorageService.importFullBackup(backup);
    if (success) {
      setProfile(backup.businessProfile);
      setDocuments(backup.documents);
      setClients(backup.clients || []);
      if (backup.documents.length > 0) {
        setActiveDoc(backup.documents[0]);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans selection:bg-neutral-800">
      {/* Universal Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        business={profile}
        docCount={documents.length}
      />

      {/* Main View Router */}
      <main className="flex-1 overflow-hidden">
        {currentPage === 'create' && (
          <DocumentEditor
            currentDocument={activeDoc}
            business={profile}
            onDocChange={setActiveDoc}
            onSaveDocument={handleSaveDocument}
            onNewDocument={handleNewDocument}
            onDuplicateDocument={handleDuplicateDocument}
            onConvertToInvoice={handleConvertToInvoice}
            onGenerateReceipt={handleGenerateReceipt}
            onUpdateBusinessSignature={handleUpdateBusinessSignature}
            onSaveAsDefaultText={handleSaveAsDefaultText}
            existingDocs={documents}
          />
        )}

        {currentPage === 'history' && (
          <div className="h-[calc(100vh-64px)] overflow-y-auto">
            <HistoryView
              documents={documents}
              business={profile}
              onEditDocument={(d) => {
                setActiveDoc(d);
                setCurrentPage('create');
              }}
              onDuplicateDocument={handleDuplicateDocument}
              onDeleteDocument={handleDeleteDocument}
              onUpdateStatus={handleUpdateStatus}
              onExportCSV={handleExportCSV}
            />
          </div>
        )}

        {currentPage === 'clients' && (
          <div className="h-[calc(100vh-64px)] overflow-y-auto">
            <ClientsView
              clients={clients}
              documents={documents}
              onSaveClient={handleSaveClient}
              onDeleteClient={handleDeleteClient}
              onSelectDocument={(d) => {
                setActiveDoc(d);
                setCurrentPage('create');
              }}
            />
          </div>
        )}

        {currentPage === 'dashboard' && (
          <div className="h-[calc(100vh-64px)] overflow-y-auto">
            <DashboardView
              documents={documents}
              onOpenDocument={(d) => {
                setActiveDoc(d);
                setCurrentPage('create');
              }}
              onNavigateToHistory={() => setCurrentPage('history')}
            />
          </div>
        )}

        {currentPage === 'policies' && (
          <div className="h-[calc(100vh-64px)] overflow-y-auto">
            <React.Suspense
              fallback={
                <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                  Loading Terms &amp; Policies Studio...
                </div>
              }
            >
              <PoliciesModule />
            </React.Suspense>
          </div>
        )}

        {currentPage === 'settings' && (
          <div className="h-[calc(100vh-64px)] overflow-y-auto">
            <SettingsView
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onRestoreData={handleRestoreBackup}
              onExportCSV={handleExportCSV}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
