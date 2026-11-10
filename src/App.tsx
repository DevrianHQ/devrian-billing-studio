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
import { GoogleDriveSyncService } from './services/googleDriveSync';
import { generateNextDocumentNumber } from './services/numbering';
import { getTodayISODate, calculateDueDate, calculateValidTillDate, formatDisplayDate } from './services/dateUtils';
import {
  DEFAULT_INVOICE_TEXT,
  DEFAULT_RECEIPT_TEXT,
  DEFAULT_QUOTATION_TEXT,
  DEFAULT_VISIBILITY,
  getDefaultQuotationTerms,
} from './services/seedData';
import { Navbar, AppPage } from './components/common/Navbar';
import { DocumentEditor } from './components/editor/DocumentEditor';
import { HistoryView } from './components/history/HistoryView';
import { ClientsView } from './components/clients/ClientsView';
import { DashboardView } from './components/dashboard/DashboardView';
import { SettingsView } from './components/settings/SettingsView';

const PoliciesModule = React.lazy(() => import('./modules/policies/PoliciesModule'));

export const App: React.FC = () => {
  const getInitialPage = (): AppPage => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      const validPages: AppPage[] = ['create', 'history', 'clients', 'dashboard', 'settings', 'policies'];
      if (validPages.includes(hash as AppPage)) {
        return hash as AppPage;
      }
      const saved = localStorage.getItem('devrian_active_page_v1');
      if (saved && validPages.includes(saved as AppPage)) {
        return saved as AppPage;
      }
    }
    return 'create';
  };

  const [currentPage, setCurrentPage] = useState<AppPage>(getInitialPage);

  const handleNavigate = useCallback((page: AppPage) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.location.hash = `#/${page}`;
      localStorage.setItem('devrian_active_page_v1', page);
    }
  }, []);

  // Sync hash change across browser navigation (back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      const validPages: AppPage[] = ['create', 'history', 'clients', 'dashboard', 'settings', 'policies'];
      if (validPages.includes(hash as AppPage)) {
        setCurrentPage(hash as AppPage);
        localStorage.setItem('devrian_active_page_v1', hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    if (typeof window !== 'undefined' && !window.location.hash) {
      window.location.hash = `#/${currentPage}`;
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentPage]);

  const [profile, setProfile] = useState<BusinessProfile>(() => StorageService.getProfile());
  const [documents, setDocuments] = useState<BillingDocument[]>(() => StorageService.getDocuments());
  const [clients, setClients] = useState<Client[]>(() => StorageService.getClients());

  // Startup Auto-Hydration: Load permanent database from local hard disk (D: drive) or Google Drive
  useEffect(() => {
    let mounted = true;

    async function hydratePersistentData() {
      // 1. Try loading from local hard disk API (/api/storage)
      try {
        const diskRes = await fetch('/api/storage');
        if (diskRes.ok) {
          const diskData = await diskRes.json();
          if (mounted && diskData && (diskData.businessProfile || diskData.documents || diskData.clients)) {
            console.log('[Devrian Storage] Loaded permanent database from local hard disk.');
            if (diskData.businessProfile) {
              setProfile(diskData.businessProfile);
              localStorage.setItem('devrian_business_profile_v4', JSON.stringify(diskData.businessProfile));
            }
            if (diskData.documents && diskData.documents.length > 0) {
              setDocuments(diskData.documents);
              localStorage.setItem('devrian_documents_v4', JSON.stringify(diskData.documents));
            }
            if (diskData.clients && diskData.clients.length > 0) {
              setClients(diskData.clients);
              localStorage.setItem('devrian_clients_v4', JSON.stringify(diskData.clients));
            }
            return;
          }
        }
      } catch {
        // Disk API not reachable or static
      }

      // 2. If disk had nothing yet, check if Google Drive has a backup
      try {
        const driveConfig = GoogleDriveSyncService.getConfig();
        if (driveConfig.url) {
          const cloudRes = await GoogleDriveSyncService.fetchDatabase();
          if (mounted && cloudRes.success && cloudRes.data) {
            console.log('[Devrian Storage] Restored database from Google Drive cloud.');
            StorageService.importFullBackup(cloudRes.data);
            if (cloudRes.data.businessProfile) setProfile(cloudRes.data.businessProfile);
            if (cloudRes.data.documents) setDocuments(cloudRes.data.documents);
            if (cloudRes.data.clients) setClients(cloudRes.data.clients);
          }
        }
      } catch {
        // Ignore cloud fetch errors
      }
    }

    hydratePersistentData();
    return () => {
      mounted = false;
    };
  }, []);

  // Multi-tab synchronization: keep documents, clients, and profile in sync across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === 'devrian_documents_v4' || e.key === 'devrian_documents_v1') {
        setDocuments(StorageService.getDocuments());
      } else if (e.key === 'devrian_clients_v4' || e.key === 'devrian_clients_v1') {
        setClients(StorageService.getClients());
      } else if (e.key === 'devrian_business_profile_v4' || e.key === 'devrian_business_profile_v1') {
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
      if (type === 'quotation') pattern = profile.quotationPattern || 'DEV-QT-{YYYY}-{001}';

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

      const advPercent = profile.advancePercentDefault ?? 50;
      const initialAdvanceToStart = Math.round((initialSubtotal * advPercent) / 100);

      const newDoc: BillingDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type,
        documentNumber: docNumber,
        date: today,
        dueDate: type === 'invoice' ? calculateDueDate(today, 'Net 7') : undefined,
        validTill: type === 'quotation' ? calculateValidTillDate(today, profile.quotationValidityDays || 15) : undefined,
        status: type === 'receipt' ? 'PAID' : type === 'quotation' ? 'DRAFT' : 'UNPAID',
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
        balanceDue: type === 'quotation' ? Math.max(0, initialSubtotal - initialAdvanceToStart) : initialSubtotal,
        amountReceived: type === 'receipt' ? initialSubtotal : undefined,
        advancePercent: type === 'quotation' ? advPercent : undefined,
        advanceType: type === 'quotation' ? 'percentage' : undefined,
        advanceToStartWork: type === 'quotation' ? initialAdvanceToStart : undefined,
        balancePayable: type === 'quotation' ? Math.max(0, initialSubtotal - initialAdvanceToStart) : undefined,
        inclusions: type === 'quotation' ? (profile.defaultInclusions || '[e.g. editing, captions, music sync, colour grading, up to 2 revision rounds per deliverable.]') : undefined,
        exclusions: type === 'quotation' ? (profile.defaultExclusions || '[e.g. shooting, voice-over, stock licences, ad spend, extra revisions.]') : undefined,
        deliveryTimeline: type === 'quotation' ? (profile.defaultDeliveryTimeline || 'First draft within [X] working days and final delivery within [Y] working days after the advance and all required materials are received.') : undefined,
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
            : (profile.quotationTermsTemplate && profile.quotationTermsTemplate.length > 0
                ? [...profile.quotationTermsTemplate]
                : getDefaultQuotationTerms(advPercent, profile.balanceDueHoursDefault || 48)),
        closingLine:
          type === 'receipt'
            ? profile.receiptClosingTemplate
            : type === 'quotation'
            ? (profile.quotationClosingTemplate || 'Thank you for considering DEVRIAN. We look forward to working with you.')
            : profile.invoiceClosingTemplate,
        statusLog:
          type === 'quotation'
            ? [
                {
                  status: 'DRAFT',
                  timestamp: new Date().toISOString(),
                  note: 'Quotation drafted',
                },
              ]
            : undefined,
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
      handleNavigate('create');
    },
    [createFreshDocument, handleNavigate]
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
      handleNavigate('create');
    },
    [profile, documents, handleSaveDocument, handleNavigate]
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
      const newInvoiceId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      const netTaxable = Math.max(0, quotationDoc.subtotal - (quotationDoc.discountAmount || 0));
      const totalTax = quotationDoc.gstEnabled ? (quotationDoc.totalTaxAmount || 0) : 0;
      const totalCost = netTaxable + totalTax;

      // Mark Quotation as ACCEPTED if not already, and store link to converted invoice
      const updatedQuotation: BillingDocument = {
        ...quotationDoc,
        status: 'ACCEPTED',
        convertedInvoiceId: newInvoiceId,
        statusLog: [
          ...(quotationDoc.statusLog || []),
          {
            status: 'ACCEPTED',
            timestamp: new Date().toISOString(),
            note: `Converted to Invoice ${invoiceNum}`,
          },
        ],
      };
      handleSaveDocument(updatedQuotation);

      // Create prefilled Invoice
      const invoiceDoc: BillingDocument = {
        ...quotationDoc,
        id: newInvoiceId,
        type: 'invoice',
        documentNumber: invoiceNum,
        date: today,
        dueDate: calculateDueDate(today, 'Net 7'),
        validTill: undefined,
        status: 'UNPAID',
        isFinal: false,
        applySignature: false,
        sourceQuotationId: quotationDoc.id,
        advanceReceived: 0,
        balanceDue: totalCost,
        totalProjectCost: undefined,
        customText: {
          ...DEFAULT_INVOICE_TEXT,
          tagline: quotationDoc.customText.tagline || DEFAULT_INVOICE_TEXT.tagline,
          contactLine: quotationDoc.customText.contactLine || DEFAULT_INVOICE_TEXT.contactLine,
          udyamLine: quotationDoc.customText.udyamLine || DEFAULT_INVOICE_TEXT.udyamLine,
        },
        notes: [...profile.invoiceTermsTemplate],
        closingLine: profile.invoiceClosingTemplate,
        statusLog: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      handleSaveDocument(invoiceDoc);
      setActiveDoc(invoiceDoc);
      handleNavigate('create');
    },
    [documents, profile, handleSaveDocument, handleNavigate]
  );

  // Revise Quotation (creates DEV-QT-2026-001-R1)
  const handleReviseQuotation = useCallback(
    (quotationDoc: BillingDocument) => {
      const today = getTodayISODate();
      let newDocNumber = quotationDoc.documentNumber;
      const revisionMatch = quotationDoc.documentNumber.match(/-R(\d+)$/i);
      if (revisionMatch) {
        const nextRev = parseInt(revisionMatch[1], 10) + 1;
        newDocNumber = quotationDoc.documentNumber.replace(/-R\d+$/i, `-R${nextRev}`);
      } else {
        newDocNumber = `${quotationDoc.documentNumber}-R1`;
      }

      const newRevId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      // Mark original as superseded
      const updatedOriginal: BillingDocument = {
        ...quotationDoc,
        supersededBy: newRevId,
        statusLog: [
          ...(quotationDoc.statusLog || []),
          {
            status: quotationDoc.status,
            timestamp: new Date().toISOString(),
            note: `Superseded by revision ${newDocNumber}`,
          },
        ],
      };
      handleSaveDocument(updatedOriginal);

      // Create new revision document
      const revisedDoc: BillingDocument = {
        ...quotationDoc,
        id: newRevId,
        documentNumber: newDocNumber,
        supersedesId: quotationDoc.id,
        supersededBy: undefined,
        convertedInvoiceId: undefined,
        date: today,
        validTill: calculateValidTillDate(today, profile.quotationValidityDays || 15),
        status: 'DRAFT',
        isFinal: false,
        applySignature: false,
        statusLog: [
          {
            status: 'DRAFT',
            timestamp: new Date().toISOString(),
            note: `Revision created from ${quotationDoc.documentNumber}`,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      handleSaveDocument(revisedDoc);
      setActiveDoc(revisedDoc);
      handleNavigate('create');
    },
    [profile, handleSaveDocument, handleNavigate]
  );

  // Generate Advance Receipt from Quotation
  const handleGenerateAdvanceReceipt = useCallback(
    (quotationDoc: BillingDocument) => {
      const today = getTodayISODate();
      const receiptNum = generateNextDocumentNumber('receipt', profile.receiptPattern, documents);
      const netTaxable = Math.max(0, quotationDoc.subtotal - (quotationDoc.discountAmount || 0));
      const totalTax = quotationDoc.gstEnabled ? (quotationDoc.totalTaxAmount || 0) : 0;
      const totalProjectCost = netTaxable + totalTax;

      const advancePercent = quotationDoc.advancePercent ?? profile.advancePercentDefault ?? 50;
      const advanceAmount =
        quotationDoc.advanceToStartWork !== undefined && quotationDoc.advanceToStartWork > 0
          ? quotationDoc.advanceToStartWork
          : Math.round((totalProjectCost * advancePercent) / 100);

      const balanceRemaining = Math.max(0, totalProjectCost - advanceAmount);

      const receiptDoc: BillingDocument = {
        ...quotationDoc,
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'receipt',
        documentNumber: receiptNum,
        date: today,
        dueDate: undefined,
        validTill: undefined,
        status: 'PAID',
        isFinal: true,
        applySignature: false,
        sourceQuotationId: quotationDoc.id,
        customText: {
          ...DEFAULT_RECEIPT_TEXT,
          eyebrow: 'ADVANCE PAYMENT',
          tagline: quotationDoc.customText.tagline || DEFAULT_RECEIPT_TEXT.tagline,
          contactLine: quotationDoc.customText.contactLine || DEFAULT_RECEIPT_TEXT.contactLine,
          udyamLine: quotationDoc.customText.udyamLine || DEFAULT_RECEIPT_TEXT.udyamLine,
        },
        items: [
          {
            id: `item-${Date.now()}`,
            description: `${advancePercent}% Advance Payment`,
            subDescription: `${quotationDoc.projectName || 'Project'} (as per quotation ${quotationDoc.documentNumber})`,
            qty: 1,
            rate: advanceAmount,
            amount: advanceAmount,
            mode: 'UPI',
          },
        ],
        subtotal: advanceAmount,
        discountAmount: 0,
        discountValue: 0,
        totalProjectCost,
        advanceReceived: advanceAmount,
        amountReceived: advanceAmount,
        balanceDue: balanceRemaining,
        paymentRows: [
          { id: 'p1', label: 'Date & Time', value: `${formatDisplayDate(today)}, 12:00 PM`, enabled: true },
          { id: 'p2', label: 'Payment Mode', value: 'UPI', enabled: true },
          { id: 'p3', label: 'Transaction ID', value: '', enabled: true },
          { id: 'p4', label: 'UTR No.', value: '', enabled: true },
        ],
        notes: [
          `GST is not applicable (not registered). The remaining ₹${balanceRemaining.toLocaleString('en-IN')} is payable within ${
            profile.balanceDueHoursDefault || 48
          } hours after project completion and approval, as per quotation ${quotationDoc.documentNumber}.`,
        ],
        closingLine: profile.receiptClosingTemplate,
        statusLog: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      handleSaveDocument(receiptDoc);
      setActiveDoc(receiptDoc);
      handleNavigate('create');
    },
    [documents, profile, handleSaveDocument, handleNavigate]
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
      handleNavigate('create');
    },
    [documents, profile, handleSaveDocument, handleNavigate]
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
        onNavigate={handleNavigate}
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
            onReviseQuotation={handleReviseQuotation}
            onGenerateAdvanceReceipt={handleGenerateAdvanceReceipt}
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
                handleNavigate('create');
              }}
              onDuplicateDocument={handleDuplicateDocument}
              onDeleteDocument={handleDeleteDocument}
              onUpdateStatus={handleUpdateStatus}
              onConvertToInvoice={handleConvertToInvoice}
              onReviseQuotation={handleReviseQuotation}
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
                handleNavigate('create');
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
                handleNavigate('create');
              }}
              onNavigateToHistory={() => handleNavigate('history')}
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
