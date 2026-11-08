import { BusinessProfile, BillingDocument, Client, DocumentCustomText, DocumentSectionVisibility } from '../types';

export const DEFAULT_INVOICE_TEXT: DocumentCustomText = {
  tagline: 'Building Attention, Authority & Growth for Modern Businesses',
  contactLine: 'inquiry@devrian.in | devrian.in',
  udyamLine: 'Udyam Reg. No.: UDYAM-UP-54-0127731 | Proprietor: Dev Rajpoot',
  documentTitle: 'INVOICE',
  eyebrow: 'INVOICE',
  clientSectionHeading: 'Billed To',
  itemsSectionHeading: 'Services',
  summarySectionHeading: 'Summary',
  paymentSectionHeading: 'Payment Details',
  termsSectionHeading: 'Terms & Notes',
  colNumber: '#',
  colDescription: 'Description',
  colQty: 'Qty',
  colRate: 'Rate (₹)',
  colAmount: 'Amount (₹)',
  colMode: 'Mode',
  labelSubtotal: 'Subtotal',
  labelDiscount: 'Discount',
  labelAdvanceReceived: 'Advance Received',
  labelBalanceDue: 'Balance Due',
  labelKeyFigure: 'BALANCE DUE',
  gstLine: 'GST: Not applicable (not registered under GST).',
  closingLine: 'Thank you for choosing DEVRIAN. We look forward to growing with you.',
  signatureProprietor: 'Dev Rajpoot',
  signatureTitle: 'Founder, DEVRIAN',
  signatureAuditLine: 'Issued by DEVRIAN',
  signatureDisclaimer: 'Not valid for banking, cheque or legal-instrument purposes',
};

export const DEFAULT_RECEIPT_TEXT: DocumentCustomText = {
  tagline: 'Building Attention, Authority & Growth for Modern Businesses',
  contactLine: 'inquiry@devrian.in | devrian.in',
  udyamLine: 'Udyam Reg. No.: UDYAM-UP-54-0127731 | Proprietor: Dev Rajpoot',
  documentTitle: 'PAYMENT RECEIPT',
  eyebrow: 'ADVANCE PAYMENT',
  clientSectionHeading: 'Received From',
  itemsSectionHeading: 'Payment For',
  summarySectionHeading: 'Summary',
  paymentSectionHeading: 'Payment Details',
  termsSectionHeading: 'NOTE',
  colNumber: '#',
  colDescription: 'Description',
  colQty: 'Qty',
  colRate: 'Rate (₹)',
  colAmount: 'Amount (₹)',
  colMode: 'Mode',
  labelSubtotal: 'Total project cost',
  labelDiscount: 'Discount',
  labelAdvanceReceived: 'Advance received',
  labelBalanceDue: 'Balance remaining',
  labelKeyFigure: 'AMOUNT RECEIVED',
  gstLine: 'GST is not applicable (not registered).',
  closingLine: 'Thank you for your payment. Work will begin once the required materials (footage, scripts, logos and other assets) are received.',
  signatureProprietor: 'Dev Rajpoot',
  signatureTitle: 'Founder, DEVRIAN',
  signatureAuditLine: 'Issued by DEVRIAN',
  signatureDisclaimer: 'Not valid for banking, cheque or legal-instrument purposes',
};

export const DEFAULT_QUOTATION_TEXT: DocumentCustomText = {
  ...DEFAULT_INVOICE_TEXT,
  documentTitle: 'QUOTATION',
  eyebrow: 'QUOTATION',
  clientSectionHeading: 'Quotation For',
  labelKeyFigure: 'TOTAL ESTIMATE',
  closingLine: 'Thank you for considering DEVRIAN. We look forward to partnering with you.',
};

export const DEFAULT_VISIBILITY: DocumentSectionVisibility = {
  showDiscount: true,
  showAdvance: true,
  showGstLine: true,
  showPaymentDetails: true,
  showTermsAndNotes: true,
  showClosingLine: true,
  showSignature: true,
  showAuditLine: true,
  showLegalDisclaimer: true,
  showAmountInWords: false,
  showUpiQr: false,
};

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  businessName: 'DEVRIAN',
  tagline: 'Building Attention, Authority & Growth for Modern Businesses',
  proprietor: 'Dev Rajpoot, Founder & CEO',
  email: 'inquiry@devrian.in',
  website: 'devrian.in',
  contactLine: 'inquiry@devrian.in | devrian.in',
  udyamNo: 'UDYAM-UP-54-0127731',
  address: 'Mathura, Uttar Pradesh',
  showAddress: false,
  phone: '',
  showPhone: false,
  
  bankAccountName: 'Dev Rajpoot (DEVRIAN)',
  bankName: 'HDFC Bank',
  bankAccountNumber: '50100234567890',
  bankIfsc: 'HDFC0001234',
  showBankDetails: true,
  
  upiId: 'inquiry@devrian.in',
  showUpi: true,
  showUpiQr: false,
  
  businessGstin: '',
  
  // Branding Controls
  logoDataUrl: '',
  whiteLogoDataUrl: '/brand/devrian-symbol-pure-white.png',
  blackLogoDataUrl: '/brand/devrian-symbol-dark.png',
  wordmarkScale: 1.0,
  showHeaderShapes: true,
  showWatermark: false, // DEFAULT OFF
  watermarkOpacity: 0.025, // 2.5%
  accentColor: '#0E0E0E',
  
  signatureDataUrl: '',
  includeSignatureInBackup: false,
  
  invoicePattern: 'DEV-{YYYY}-{001}',
  receiptPattern: 'DEV-REC-{001}',
  quotationPattern: 'DEV-QT-{001}',
  
  itemPresets: [
    { title: 'Short-form video editing (reel)', defaultRate: 800 },
    { title: 'Social media management (monthly)', defaultRate: 15000 },
    { title: 'Graphic design / creatives', defaultRate: 500 },
    { title: 'Logo & branding', defaultRate: 6000 },
    { title: 'Website development', defaultRate: 20000 },
    { title: 'Shooting (half day)', defaultRate: 5000 },
    { title: 'Content strategy', defaultRate: 8000 }
  ],
  
  invoiceTermsTemplate: [
    'Payment is due by the due date mentioned above.',
    'Work delivery, revisions and refund terms are as per the signed proposal / DEVRIAN Terms & Conditions.',
    'Raw files and source files are shared only after full payment, unless agreed otherwise.',
    'Please share the payment screenshot or UTR number after paying.'
  ],
  invoiceClosingTemplate: 'Thank you for choosing DEVRIAN. We look forward to growing with you.',
  
  receiptTermsTemplate: [
    'GST is not applicable (not registered). The remaining balance is payable within 48 hours after project completion and approval, as per the project proposal.'
  ],
  receiptClosingTemplate: 'Thank you for your payment. Work will begin once the required materials (footage, scripts, logos and other assets) are received.',
  
  quotationTermsTemplate: [
    'This quotation is valid until the date mentioned above.',
    '50% advance is required to begin work; the balance is payable within 48 hours after project completion and approval.',
    'Revisions, delivery timelines and refund terms are as per the signed proposal / DEVRIAN Terms & Conditions.',
    'Raw files and source files are shared only after full payment, unless agreed otherwise.'
  ],
  quotationClosingTemplate: 'Thank you for considering DEVRIAN. We look forward to working with you.',

  defaultCustomText: {
    invoice: DEFAULT_INVOICE_TEXT,
    receipt: DEFAULT_RECEIPT_TEXT,
  }
};

export const SEED_RECEIPT: BillingDocument = {
  id: 'seed-rec-001',
  type: 'receipt',
  documentNumber: 'DEV-REC-001',
  date: '2026-11-05',
  status: 'PAID',
  isFinal: true,
  applySignature: false,
  customText: {
    ...DEFAULT_RECEIPT_TEXT,
    eyebrow: 'ADVANCE PAYMENT',
  },
  sectionVisibility: {
    ...DEFAULT_VISIBILITY,
    showSignature: true,
  },
  paymentRows: [
    { id: 'p1', label: 'Date & Time', value: '05 Nov 2026, 01:39 PM', enabled: true },
    { id: 'p2', label: 'Payment Mode', value: 'UPI (PhonePe)', enabled: true },
    { id: 'p3', label: 'Transaction ID', value: 'T2611051339335516879132', enabled: true },
    { id: 'p4', label: 'UTR No.', value: '866385029837', enabled: true }
  ],
  clientId: 'seed-client-001',
  clientName: 'Anshita Singh Parihar',
  projectName: 'FMCG Video Editing – 15 Videos',
  items: [
    {
      id: 'seed-item-1',
      description: '50% Advance Payment',
      subDescription: 'Video editing – 15 FMCG vertical videos (as per proposal dated 04 November 2026)',
      qty: 1,
      rate: 3000,
      amount: 3000,
      mode: 'UPI'
    }
  ],
  subtotal: 3000,
  discountType: 'flat',
  discountValue: 0,
  discountAmount: 0,
  gstEnabled: false,
  gstRate: 0,
  gstType: 'CGST_SGST',
  advanceReceived: 3000,
  totalProjectCost: 6000,
  balanceDue: 3000,
  amountReceived: 3000,
  paymentDetails: {
    dateTime: '05 Nov 2026, 01:39 PM',
    mode: 'UPI (PhonePe)',
    transactionId: 'T2611051339335516879132',
    utrNo: '866385029837',
    showBankOnDoc: false,
    showUpiOnDoc: true,
    showQrOnDoc: false
  },
  notes: [
    'GST is not applicable (not registered). The remaining ₹3,000 is payable within 48 hours after project completion and approval, as per the project proposal.'
  ],
  closingLine: 'Thank you for your payment. Work will begin once the required materials (footage, scripts, logos and other assets) are received.',
  createdAt: '2026-11-05T13:39:00.000Z',
  updatedAt: '2026-11-05T13:39:00.000Z'
};

export const SEED_INVOICE: BillingDocument = {
  id: 'seed-inv-001',
  type: 'invoice',
  documentNumber: 'DEV-2026-001',
  date: '2026-11-08',
  dueDate: '2026-11-15',
  status: 'UNPAID',
  isFinal: false,
  applySignature: false,
  customText: {
    ...DEFAULT_INVOICE_TEXT,
    eyebrow: 'INVOICE',
    documentTitle: 'INVOICE',
  },
  sectionVisibility: {
    ...DEFAULT_VISIBILITY,
    showSignature: true,
  },
  paymentRows: [
    {
      id: 'p1',
      label: 'UPI',
      value: 'inquiry@devrian.in',
      enabled: true,
    },
    {
      id: 'p2',
      label: 'Bank Transfer',
      value: 'A/c Name: Dev Rajpoot (DEVRIAN) · Bank: HDFC Bank · A/c No.: 50100234567890 · IFSC: HDFC0001234',
      enabled: true,
    },
  ],
  clientId: 'seed-client-001',
  clientName: 'Anshita Singh Parihar',
  projectName: 'FMCG Video Editing – 15 Videos',
  items: [
    {
      id: 'seed-inv-item-1',
      description: 'Short-form video editing (reel)',
      subDescription: '15 vertical video edits with captions and sound design',
      qty: 15,
      rate: 800,
      amount: 12000,
    },
  ],
  subtotal: 12000,
  discountType: 'flat',
  discountValue: 0,
  discountAmount: 0,
  gstEnabled: false,
  gstRate: 0,
  gstType: 'CGST_SGST',
  advanceReceived: 6000,
  balanceDue: 6000,
  paymentDetails: {
    showBankOnDoc: true,
    showUpiOnDoc: true,
    showQrOnDoc: false,
  },
  notes: [
    'Payment is due by the due date mentioned above.',
    'Work delivery, revisions and refund terms are as per the signed proposal / DEVRIAN Terms & Conditions.',
    'Raw files and source files are shared only after full payment, unless agreed otherwise.',
    'Please share the payment screenshot or UTR number after paying.',
  ],
  closingLine: 'Thank you for choosing DEVRIAN. We look forward to growing with you.',
  createdAt: '2026-11-08T10:00:00.000Z',
  updatedAt: '2026-11-08T10:00:00.000Z',
};

export const SEED_CLIENTS: Client[] = [
  {
    id: 'seed-client-001',
    name: 'Anshita Singh Parihar',
    contactPerson: 'Anshita Singh',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    createdAt: '2026-11-05T13:39:00.000Z'
  }
];
