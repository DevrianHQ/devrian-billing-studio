export type DocumentType = 'invoice' | 'receipt' | 'quotation';

export type QuotationType = 'project' | 'monthly' | 'hybrid';

export type DocumentStatus =
  | 'PAID'
  | 'UNPAID'
  | 'PARTIALLY PAID'
  | 'ADVANCE RECEIVED'
  | 'OVERDUE'
  | 'FINAL'
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export type EyebrowType = 'ADVANCE PAYMENT' | 'PART PAYMENT' | 'FINAL PAYMENT' | 'INVOICE' | 'QUOTATION' | 'CUSTOM';

export type PaymentTermsPreset = 
  | 'Due on receipt'
  | 'Within 48 hours of project completion and approval'
  | '50% advance, 50% on delivery'
  | 'Net 7'
  | 'Custom';

export type GSTType = 'CGST_SGST' | 'IGST';

export interface LineItem {
  id: string;
  description: string;
  subDescription?: string;
  qty: number;
  quantity?: number;
  rate: number;
  amount: number;
  mode?: string; // For receipts
  billing?: 'one_time' | 'monthly'; // For Quotations (Project forces one_time, Monthly forces monthly, Hybrid lets user choose)
}

export interface Client {
  id: string;
  name: string;
  contactPerson?: string;
  address?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  createdAt: string;
}

export interface PaymentDetailRow {
  id: string;
  label: string; // e.g. "UPI" or "Bank Transfer"
  value: string; // e.g. "A/c Name: ..."
  enabled: boolean;
}

export interface DocumentCustomText {
  // Header details (DEVRIAN.docx format)
  tagline: string; // "Building Attention, Authority & Growth for Modern Businesses"
  contactLine: string; // "Devrian.official@gmail.com | inquiry@devrian.in | devrian.in"
  udyamLine: string; // "Udyam Reg. No.: UDYAM-UP-54-0127731 | Proprietor: Dev Rajpoot"
  documentTitle: string; // "INVOICE" / "PAYMENT RECEIPT"
  eyebrow: string; // "INVOICE" or "ADVANCE PAYMENT", etc.
  
  // Section Headings
  clientSectionHeading: string; // "Billed To" / "Received From"
  itemsSectionHeading: string; // "Services" / "Payment For"
  summarySectionHeading: string; // "Summary"
  paymentSectionHeading: string; // "Payment Details"
  termsSectionHeading: string; // "Terms & Notes" / "NOTE"
  
  // Table Column Labels
  colNumber: string; // "#"
  colDescription: string; // "Description"
  colQty: string; // "Qty"
  colRate: string; // "Rate (₹)"
  colAmount: string; // "Amount (₹)"
  colMode: string; // "Mode"
  
  // Summary row labels
  labelSubtotal: string; // "Subtotal" or "Total project cost"
  labelDiscount: string; // "Discount"
  labelAdvanceReceived: string; // "Advance Received" or "Advance received"
  labelBalanceDue: string; // "Balance Due" or "Balance remaining"
  labelKeyFigure: string; // "BALANCE DUE" or "AMOUNT RECEIVED"
  labelAdvanceToStart?: string;
  
  // GST line
  gstLine: string; // "GST: Not applicable (not registered under GST)."
  
  // Closing line
  closingLine: string;
  
  // Signature captions
  signatureProprietor: string; // "Dev Rajpoot"
  signatureTitle: string; // "Founder, DEVRIAN"
  signatureAuditLine: string; // "Issued by DEVRIAN · [DocType] [DocNo] · [Date]"
  signatureDisclaimer: string; // "Not valid for banking, cheque or legal-instrument purposes"
}

export interface MonthlyDeliverable {
  id: string;
  item: string;
  quantity: string;
}

export type QuotationBlockId =
  | 'deliverables'          // "WHAT'S INCLUDED EACH MONTH" (Monthly/Hybrid)
  | 'scope_table'           // "SCOPE OF WORK" (Project) / "PRICING" (Monthly/Hybrid)
  | 'billing_strip'         // "BILLING & TERM" (Monthly/Hybrid)
  | 'payment_summary'       // Side-by-side Payment Details + Summary & TOTAL / DUE TO START bar
  | 'gst_line'              // Italic GST Notice line
  | 'inclusions_exclusions' // Optional
  | 'delivery_timeline'     // Optional
  | 'notes'                 // Optional Free Notes
  | 'terms_and_notes'       // TERMS & NOTES box
  | 'acceptance';           // ACCEPTANCE box

export interface QuotationBlockConfig {
  id: QuotationBlockId;
  page: 1 | 2;
  order: number;
  visible: boolean;
}

export type QuotationMovableSection =
  | 'notes'
  | 'inclusions_exclusions'
  | 'delivery_timeline'
  | 'terms_and_notes'
  | 'acceptance';

export interface QuotationPagePlan {
  mode: 'ask_me' | 'fit_one_page' | 'manual';
  page2Sections: QuotationMovableSection[];
  continueLineItemsOnPage2: boolean;
  splitLineItemIndex?: number;
  rememberForDocument: boolean;
  appliedScale?: number;
}

export interface DocumentSectionVisibility {
  showDiscount: boolean;
  showAdvance: boolean;
  showGstLine: boolean;
  showPaymentDetails: boolean;
  showTermsAndNotes: boolean;
  showClosingLine: boolean;
  showSignature: boolean;
  showAuditLine: boolean;
  showLegalDisclaimer: boolean;
  showAmountInWords: boolean;
  showUpiQr: boolean;
  showInclusions?: boolean;
  showTimeline?: boolean;
  showFreeNotes?: boolean;
  showAcceptance?: boolean;
  showClientSignature?: boolean;
  hideZeroRows?: boolean;
}

export interface BusinessProfile {
  businessName: string;
  tagline: string;
  proprietor: string; // Dev Rajpoot, Founder & CEO
  email: string;
  website: string;
  contactLine: string; // "Devrian.official@gmail.com | inquiry@devrian.in | devrian.in"
  udyamNo: string;
  address: string;
  showAddress: boolean;
  phone: string;
  showPhone: boolean;
  
  // Bank Details
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  showBankDetails: boolean;
  
  // UPI
  upiId: string;
  showUpi: boolean;
  showUpiQr: boolean;
  
  // GST
  businessGstin: string;
  
  // Media & Branding Controls
  logoDataUrl?: string; // custom upload if any
  whiteLogoDataUrl?: string; // dedicated white logo
  blackLogoDataUrl?: string; // dedicated black logo
  wordmarkScale: number; // slider for wordmark size (default 1.0)
  showHeaderShapes: boolean; // toggle header diagonal shapes (default true)
  showWatermark: boolean; // toggle body watermark (DEFAULT FALSE)
  watermarkOpacity: number; // default 0.025 (2.5%)
  accentColor?: string; // default empty/none (#0E0E0E)
  
  // Signature
  signatureDataUrl?: string;
  includeSignatureInBackup: boolean; // default false
  
  // Document number patterns
  invoicePattern: string;
  receiptPattern: string;
  quotationPattern: string;
  
  // Item presets
  itemPresets: { title: string; defaultRate?: number }[];
  
  // Default Templates
  invoiceTermsTemplate: string[];
  receiptTermsTemplate: string[];
  quotationTermsTemplate: string[];
  receiptClosingTemplate: string;
  invoiceClosingTemplate: string;
  quotationClosingTemplate?: string;
  
  // Quotation defaults
  quotationValidityDays?: number; // default 15
  advancePercentDefault?: number; // default 50
  balanceDueHoursDefault?: number; // default 48
  minTermMonthsDefault?: number; // default 3
  noticePeriodDaysDefault?: number; // default 30
  replyTimeHoursDefault?: number; // default 24
  defaultInclusions?: string;
  defaultExclusions?: string;
  defaultDeliveryTimeline?: string;
  
  // Default custom text per doc type
  defaultCustomText?: {
    invoice: DocumentCustomText;
    receipt: DocumentCustomText;
    quotation?: DocumentCustomText;
  };
}

export interface BillingDocument {
  id: string;
  type: DocumentType;
  documentNumber: string;
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  validTill?: string; // YYYY-MM-DD
  status: DocumentStatus;
  isFinal: boolean;
  applySignature: boolean;
  
  // Custom text snapshots & visibility
  customText: DocumentCustomText;
  sectionVisibility: DocumentSectionVisibility;
  paymentRows: PaymentDetailRow[];
  
  // Client details
  clientId?: string;
  clientName: string;
  clientContactPerson?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientGstin?: string;
  
  // Project
  projectName: string;
  
  // Line items
  items: LineItem[];
  
  // Financials
  subtotal: number;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  discountAmount: number;
  
  // GST
  gstEnabled: boolean;
  gstRate: number;
  gstType: GSTType;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalTaxAmount?: number;
  
  // Advance & Totals
  advanceReceived: number;
  totalProjectCost?: number;
  balanceDue: number;
  amountReceived?: number;
  advanceToStartWork?: number;
  advancePercent?: number; // default 50
  advanceType?: 'percentage' | 'flat';
  balancePayable?: number;
  
  // Quotation specific content
  quotationType?: QuotationType; // 'project' | 'monthly' | 'hybrid' (defaults to 'project')
  monthlyDeliverables?: MonthlyDeliverable[];
  billingCycle?: string; // default 'Monthly'
  contractStartDate?: string; // YYYY-MM-DD
  minTermMonths?: number; // default 3
  paymentDueDescription?: string; // default 'In advance, before each cycle begins'
  noticePeriodDays?: number; // default 30
  autoRenewal?: boolean; // default true
  autoRenewalDescription?: string; // default 'Auto-renews monthly until cancelled'
  discountScope?: 'one_time' | 'monthly' | 'both'; // default 'both'
  showMinimumCommitmentTotal?: boolean; // default true
  quotationBlocks?: QuotationBlockConfig[];
  isCustomBlockLayout?: boolean;
  oneTimeSetupTotal?: number;
  monthlyFeeTotal?: number;
  dueToStartAmount?: number;
  minimumCommitmentTotal?: number;
  inclusions?: string;
  exclusions?: string;
  deliveryTimeline?: string;
  estimatedDelivery?: string;
  freeNotes?: string;
  quotationLayoutMode?: 'ask_me' | 'fit_one_page' | 'manual';
  quotationPagePlan?: QuotationPagePlan;
  isLeanQuotation?: boolean;
  statusLog?: { status: DocumentStatus; timestamp: string; note?: string }[];
  supersedesId?: string;
  supersededBy?: string;
  convertedInvoiceId?: string;
  revisionSuffix?: string;
  
  // Payment Details
  paymentDetails: {
    dateTime?: string;
    mode?: string;
    transactionId?: string;
    utrNo?: string;
    showBankOnDoc?: boolean;
    showUpiOnDoc?: boolean;
    showQrOnDoc?: boolean;
  };
  
  // Terms & Notes list
  paymentTermsPreset?: PaymentTermsPreset;
  customTerms?: string;
  notes: string[];
  closingLine: string;
  
  // Metadata & Layout
  layoutMode?: 'auto' | 'force_one_page';
  densityMode?: 'comfortable' | 'compact' | 'tight';
  createdAt: string;
  updatedAt: string;
  sourceInvoiceId?: string;
  sourceQuotationId?: string;
}
