import {
  BusinessProfile,
  BillingDocument,
  Client,
  DocumentCustomText,
  DocumentSectionVisibility,
  MonthlyDeliverable,
  QuotationBlockConfig,
  QuotationType,
} from '../types';

export const DEFAULT_MONTHLY_DELIVERABLES: MonthlyDeliverable[] = [
  { id: 'del-1', item: 'Instagram Reels', quantity: '8 / month' },
  { id: 'del-2', item: 'Posts / Carousels', quantity: '12 / month' },
  { id: 'del-3', item: 'Stories', quantity: 'as per plan' },
  { id: 'del-4', item: 'Content calendar', quantity: '1' },
  { id: 'del-5', item: 'Monthly performance report', quantity: '1' },
];

export const DEFAULT_QUOTATION_BLOCKS: QuotationBlockConfig[] = [
  { id: 'deliverables', page: 1, order: 1, visible: true },
  { id: 'scope_table', page: 1, order: 2, visible: true },
  { id: 'billing_strip', page: 1, order: 3, visible: true },
  { id: 'payment_summary', page: 1, order: 4, visible: true },
  { id: 'gst_line', page: 1, order: 5, visible: true },
  { id: 'inclusions_exclusions', page: 1, order: 6, visible: false },
  { id: 'delivery_timeline', page: 1, order: 7, visible: false },
  { id: 'notes', page: 1, order: 8, visible: false },
  { id: 'terms_and_notes', page: 1, order: 9, visible: true },
  { id: 'acceptance', page: 1, order: 10, visible: true },
];

export function getQuotationEyebrow(type: QuotationType = 'project'): string {
  if (type === 'monthly') return 'QUOTATION · MONTHLY RETAINER';
  if (type === 'hybrid') return 'QUOTATION · RETAINER + SETUP';
  return 'QUOTATION · ONE-TIME PROJECT';
}

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
  instructionLine: 'To accept, confirm in writing (WhatsApp/email) or sign below, and pay the amount due to start.',
  deliverablesResetNote: 'Deliverables reset at the start of each monthly billing cycle and do not roll over.',
  deliverablesSectionHeading: "WHAT'S INCLUDED EACH MONTH",
  pricingSectionHeading: 'PRICING',
  billingSectionHeading: 'BILLING & TERM',
  coverEyebrow: 'QUOTATION · ONE-TIME PROJECT',
  coverTitle: 'PROJECT\nQUOTATION',
  preparedByName: 'Dev Rajpoot',
  preparedByTitle: 'Founder & CEO, DEVRIAN',
  preparedByContact: 'inquiry@devrian.in • devrian.in',
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
  instructionLine: 'To accept, confirm in writing (WhatsApp/email) or sign below, and pay the amount due to start.',
  deliverablesResetNote: 'Deliverables reset at the start of each monthly billing cycle and do not roll over.',
  deliverablesSectionHeading: "WHAT'S INCLUDED EACH MONTH",
  pricingSectionHeading: 'PRICING',
  billingSectionHeading: 'BILLING & TERM',
  coverEyebrow: 'QUOTATION · ONE-TIME PROJECT',
  coverTitle: 'PROJECT\nQUOTATION',
  preparedByName: 'Dev Rajpoot',
  preparedByTitle: 'Founder & CEO, DEVRIAN',
  preparedByContact: 'inquiry@devrian.in • devrian.in',
};

export const DEFAULT_INCLUSIONS = '';
export const DEFAULT_EXCLUSIONS = '';
export const DEFAULT_DELIVERY_TIMELINE = '';

export const DEFAULT_MONTHLY_TERMS = [
  'This quotation is valid until the date mentioned above. Prices may change after that.',
  'The first month\'s fee is payable before work begins. Each following month\'s fee is payable in advance, before the cycle begins.',
  'Minimum commitment is {{min_term_months}} months. The service continues monthly until cancelled with {{notice_days}} days\' written notice by email.',
  'Deliverables are as listed per month. Unused deliverables do not carry forward unless agreed in writing.',
  'Ad spend, paid promotions, shoots, stock and music licences are not included. Extra work is quoted separately.',
  'If a payment is delayed, work and delivery pause and resume once payment is received.',
  'All other terms are as per the signed Proposal and DEVRIAN Terms & Conditions v{{tnc_version}}.',
];

export const DEFAULT_QUOTATION_TERMS = [
  'This quotation is valid until the date mentioned above. Prices may change after that.',
  '{{advance_percent}}% advance is required to begin work. The balance is payable within {{balance_due_hours}} hours after project completion and approval.',
  'Timelines start after the advance and all required materials (footage, scripts, logos and other assets) are received.',
  'Scope, revisions, ownership, refund and all other terms are as per the signed Proposal and DEVRIAN Terms & Conditions v{{tnc_version}}.',
  'Any work outside the scope above will be quoted separately.',
];

export const getDefaultQuotationTerms = (advancePercent: number = 50, balanceDueHours: number = 48, tncVersion: string = '1.0'): string[] => [
  'This quotation is valid until the date mentioned above. Prices may change after that.',
  `${advancePercent}% advance is required to begin work. The balance is payable within ${balanceDueHours} hours after project completion and approval.`,
  'Timelines start after the advance and all required materials (footage, scripts, logos and other assets) are received.',
  `Scope, revisions, ownership, refund and all other terms are as per the signed Proposal and DEVRIAN Terms & Conditions v${tncVersion}.`,
  'Any work outside the scope above will be quoted separately.',
];

export const DEFAULT_QUOTATION_TEXT: DocumentCustomText = {
  tagline: 'Building Attention, Authority & Growth for Modern Businesses',
  contactLine: 'Devrian.official@gmail.com | inquiry@devrian.in | devrian.in',
  udyamLine: 'Udyam Reg. No.: UDYAM-UP-54-0127731 | Proprietor: Dev Rajpoot',
  documentTitle: 'QUOTATION',
  eyebrow: 'QUOTATION',
  clientSectionHeading: 'Prepared For',
  itemsSectionHeading: 'Scope of Work',
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
  labelAdvanceToStart: 'Advance to Start Work',
  labelBalanceDue: 'Balance Payable',
  labelKeyFigure: 'TOTAL',
  gstLine: 'GST: Not applicable (not registered under GST).',
  closingLine: 'Thank you for considering DEVRIAN. We look forward to working with you.',
  signatureProprietor: 'Dev Rajpoot',
  signatureTitle: 'Founder, DEVRIAN',
  signatureAuditLine: 'Issued by DEVRIAN',
  signatureDisclaimer: 'Not valid for banking, cheque or legal-instrument purposes',
  instructionLine: 'To accept, confirm in writing (WhatsApp/email) or sign below, and pay the amount due to start.',
  deliverablesResetNote: 'Deliverables reset at the start of each monthly billing cycle and do not roll over.',
  deliverablesSectionHeading: "WHAT'S INCLUDED EACH MONTH",
  pricingSectionHeading: 'PRICING',
  billingSectionHeading: 'BILLING & TERM',
  coverEyebrow: 'QUOTATION · ONE-TIME PROJECT',
  coverTitle: 'PROJECT\nQUOTATION',
  preparedByName: 'Dev Rajpoot',
  preparedByTitle: 'Founder & CEO, DEVRIAN',
  preparedByContact: 'inquiry@devrian.in • devrian.in',
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
  showInclusions: true,
  showTimeline: true,
  showAcceptance: true,
  showClientSignature: true,
};

export const DEFAULT_QUOTATION_VISIBILITY: DocumentSectionVisibility = {
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
  showInclusions: false, // Lean quotation: hidden by default
  showTimeline: false, // Lean quotation: hidden by default
  showFreeNotes: false, // Lean quotation: hidden by default
  showAcceptance: true,
  showClientSignature: true,
  hideZeroRows: true,
};

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  businessName: 'DEVRIAN',
  tagline: 'Building Attention, Authority & Growth for Modern Businesses',
  proprietor: 'Dev Rajpoot',
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
  quotationPattern: 'DEV-QT-{YYYY}-{001}',

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

  quotationTermsTemplate: DEFAULT_QUOTATION_TERMS,
  quotationClosingTemplate: 'Thank you for considering DEVRIAN. We look forward to working with you.',

  quotationValidityDays: 15,
  advancePercentDefault: 50,
  balanceDueHoursDefault: 48,
  defaultInclusions: DEFAULT_INCLUSIONS,
  defaultExclusions: DEFAULT_EXCLUSIONS,
  defaultDeliveryTimeline: DEFAULT_DELIVERY_TIMELINE,

  defaultCustomText: {
    invoice: DEFAULT_INVOICE_TEXT,
    receipt: DEFAULT_RECEIPT_TEXT,
    quotation: DEFAULT_QUOTATION_TEXT,
  },

  projectQuotationDefaults: {
    validityDays: 15,
    advancePercent: 50,
    balanceDueHours: 48,
    deliveryTimeline: '10 working days after advance and required materials',
    termsTemplate: [...DEFAULT_QUOTATION_TERMS],
    closingLine: 'Thank you for considering DEVRIAN. We look forward to working with you.',
  },

  monthlyQuotationDefaults: {
    validityDays: 15,
    minTermMonths: 3,
    noticePeriodDays: 30,
    billingCycle: 'Monthly',
    paymentDueDescription: 'In advance, before each cycle begins',
    autoRenewalDescription: 'Auto-renews monthly until cancelled',
    termsTemplate: [...DEFAULT_MONTHLY_TERMS],
    deliverables: [...DEFAULT_MONTHLY_DELIVERABLES],
    closingLine: 'Thank you for considering DEVRIAN. We look forward to working with you.',
  },
};

export const SEED_RECEIPT: BillingDocument = {
  id: 'seed-rec-001',
  type: 'receipt',
  documentNumber: 'DEV-REC-001',
  date: '2026-11-05',
  status: 'PAID',
  isFinal: true,
  applySignature: true,
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
    'GST is not applicable (not registered). The remaining Amount is payable within 48 hours after project completion and approval, as per the project proposal.'
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
  applySignature: true,
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

export const SEED_QUOTATION: BillingDocument = {
  id: 'seed-qt-001',
  type: 'quotation',
  documentNumber: 'DEV-QT-2026-001',
  date: '2026-11-10',
  validTill: '2026-11-25',
  status: 'DRAFT',
  isFinal: false,
  applySignature: true,
  customText: {
    ...DEFAULT_QUOTATION_TEXT,
  },
  sectionVisibility: {
    ...DEFAULT_QUOTATION_VISIBILITY,
  },
  quotationType: 'project',
  platforms: 'Instagram, YouTube Shorts, LinkedIn',
  billingCycle: 'Monthly',
  contractStartDate: '2026-11-15',
  minTermMonths: 3,
  noticePeriodDays: 30,
  paymentDueDescription: 'In advance, before each cycle begins',
  autoRenewalDescription: 'Auto-renews monthly until cancelled',
  discountScope: 'both',
  showMinimumCommitmentTotal: true,
  monthlyDeliverables: [...DEFAULT_MONTHLY_DELIVERABLES],
  quotationBlocks: [...DEFAULT_QUOTATION_BLOCKS],
  isCustomBlockLayout: false,
  isLeanQuotation: true,
  estimatedDelivery: '5-7 working days after advance and materials',
  paymentRows: [
    {
      id: 'p1',
      label: 'UPI',
      value: 'Devrian.official@gmail.com',
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
  clientContactPerson: 'Anshita Singh',
  clientAddress: 'Mathura, Uttar Pradesh - 281001',
  clientPhone: '+91 98765 43210',
  clientEmail: 'anshita@example.com',
  projectName: 'FMCG Video Editing & Content Package',
  items: [
    {
      id: 'seed-qt-item-1',
      description: 'Short-form video editing (reel)',
      subDescription: '15 vertical video edits with captions and sound design',
      qty: 15,
      rate: 800,
      amount: 12000,
      billing: 'one_time',
    },
    {
      id: 'seed-qt-item-2',
      description: 'Content strategy & calendar',
      subDescription: 'Monthly topic research, script outlines & posting schedule',
      qty: 1,
      rate: 8000,
      amount: 8000,
      billing: 'one_time',
    },
  ],
  subtotal: 20000,
  discountType: 'percentage',
  discountValue: 10,
  discountAmount: 2000,
  gstEnabled: false,
  gstRate: 0,
  gstType: 'CGST_SGST',
  advancePercent: 50,
  advanceType: 'percentage',
  advanceReceived: 0,
  advanceToStartWork: 9000,
  balanceDue: 9000,
  balancePayable: 9000,
  inclusions: 'Editing, captions, music sync, colour grading, up to 2 revision rounds per deliverable.',
  exclusions: 'Shooting, voice-over, stock licences, ad spend, extra revisions.',
  deliveryTimeline: 'First draft within 4 working days and final delivery within 7 working days after the advance and all required materials are received.',
  paymentDetails: {
    showBankOnDoc: true,
    showUpiOnDoc: true,
    showQrOnDoc: false,
  },
  notes: [...DEFAULT_QUOTATION_TERMS],
  closingLine: 'Thank you for considering DEVRIAN. We look forward to working with you.',
  statusLog: [
    {
      status: 'DRAFT',
      timestamp: '2026-11-10T10:00:00.000Z',
      note: 'Initial quotation created',
    },
  ],
  createdAt: '2026-11-10T10:00:00.000Z',
  updatedAt: '2026-11-10T10:00:00.000Z',
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
