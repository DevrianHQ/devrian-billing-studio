import { BillingDocument, BusinessProfile, LineItem, MonthlyDeliverable } from '../../types';

export type QuotationTemplateType = 'project' | 'monthly';

export interface QuotationPolicyVariables {
  advance_percent: number;
  balance_due_hours: number;
  tnc_version: string;
  min_term_months?: number;
  notice_days?: number;
  [key: string]: string | number | undefined;
}

export interface SavedQuotationTemplate {
  type: QuotationTemplateType;
  labels: {
    eyebrow: string;
    documentTitle: string;
    clientHeading: string;
    projectHeading: string;
    tableHeading: string;
    colNumber: string;
    colDescription: string;
    colQty: string;
    colRate: string;
    colAmount: string;
    labelSubtotal: string;
    labelDiscount: string;
    labelTotal: string;
    labelAdvanceToStart: string;
    labelBalanceDue: string;
    gstLine: string;
    paymentSectionHeading: string;
    termsSectionHeading: string;
    instructionLine: string;
    closingLine: string;
    signatureProprietor: string;
    signatureTitle: string;
  };
  terms: string[];
  billingDefaults?: {
    billingCycle: string;
    minTermMonths: number;
    paymentDue: string;
    noticeDays: number;
    autoRenewal: string;
    minTermMonthsReviewed?: boolean;
    noticeDaysReviewed?: boolean;
  };
  paymentToggles: {
    showBank: boolean;
    showUpi: boolean;
    showQr: boolean;
  };
  validityDays: number;
  advancePercentDefault: number;
  balanceDueHoursDefault: number;
  visibility: {
    showPaymentDetails: boolean;
    showGstLine: boolean;
    showTermsAndNotes: boolean;
    showAcceptance: boolean;
    showClosingLine: boolean;
    showClientSignature: boolean;
    showLegalDisclaimer: boolean;
    hideZeroRows: boolean;
    showSetupRow?: boolean;
    showMinimumCommitment?: boolean;
  };
  sampleData: {
    clientName: string;
    contactPerson: string;
    clientAddress: string;
    clientPhone: string;
    clientEmail: string;
    projectName: string;
    platforms?: string;
    estimatedDelivery?: string;
    items: LineItem[];
    deliverables?: MonthlyDeliverable[];
  };
}

export interface QuotationTemplatesStore {
  schemaVersion: 1;
  project: SavedQuotationTemplate;
  monthly: SavedQuotationTemplate;
}

export interface QuotationPageMeasurement {
  pageNumber: number;
  contentHeightMm: number;
  maxHeightMm: number;
  overflowMm: number;
  spareMm: number;
  fits: boolean;
}

export interface QuotationLayoutResult {
  templateType: QuotationTemplateType;
  totalPages: number;
  pages: QuotationPageMeasurement[];
  hasOverflow: boolean;
  overflowMessage?: string;
  hardLimitViolations: string[];
  canExport: boolean;
}

export interface QuotationFinancials {
  subtotal: number;
  discountAmount: number;
  netTaxable: number;
  taxAmount: number;
  totalWithTax: number;
  // Project
  advanceAmount: number;
  advancePercent: number;
  balancePayable: number;
  // Monthly
  oneTimeSetupTotal: number;
  monthlyFeeTotal: number;
  monthlyTotal: number;
  dueToStart: number;
  minimumCommitmentTotal: number;
  minTermMonths: number;
  isProject: boolean;
  firstMonthFeeNet: number;
}
