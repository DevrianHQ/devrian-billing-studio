export type DocumentType = 'invoice' | 'receipt' | 'quotation';

export type DocumentStatus = 'PAID' | 'UNPAID' | 'PARTIALLY PAID' | 'ADVANCE RECEIVED' | 'OVERDUE' | 'FINAL';

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
  rate: number;
  amount: number;
  mode?: string; // For receipts
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
