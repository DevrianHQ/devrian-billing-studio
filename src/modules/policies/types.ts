export type ClauseStatus = 'CONFIRMED' | 'SUGGESTED';

export interface SubClause {
  id: string;
  number: string; // e.g. "12.1"
  body: string;
  defaultBody: string;
}

export interface Clause {
  id: string;
  number: number; // 1, 2, 3...
  key: string;
  title: string;
  defaultTitle: string;
  body: string;
  defaultBody: string;
  tags: string[];
  isVisible: boolean;
  status: ClauseStatus;
  isReviewed: boolean;
  subClauses?: SubClause[];
  hasWorkedExampleBox?: boolean;
}

export interface PolicyVariables {
  business_name: string;
  owner_name: string;
  owner_title: string;
  contact_email: string;
  official_email: string;
  website: string;
  udyam_no: string;
  advance_percent: number;
  balance_due_hours: number;
  refund_window_days: number;
  refund_retention_percent: number;
  refund_processing_days: number;
  backup_days: number;
  reply_time_hours: number;
  working_days: string;
  working_hours: string;
  jurisdiction_city: string;
  jurisdiction_state: string;
  revision_rounds: number;
  feedback_window_hours: number;
  extra_revision_charge: string;
  custom?: Record<string, string | number>;
}

export interface DocumentVersion {
  id: string;
  version: string; // e.g. "1.0", "1.1", "2.0"
  effectiveDate: string; // YYYY-MM-DD
  supersedesVersion?: string;
  changeNote: string;
  savedAt: string; // ISO
  clausesSnapshot: Clause[];
  variablesSnapshot: PolicyVariables;
  includeInAppendix: boolean;
}

export type AcceptanceMethod = 'signed' | 'email' | 'WhatsApp' | 'payment';

export interface AcceptanceRecord {
  id: string;
  clientName: string;
  projectName: string;
  date: string;
  versionAccepted: string;
  method: AcceptanceMethod;
  note: string;
  createdAt: string;
}

export interface RefundCalculationInput {
  advance: number;
  advanceDate: string;
  cancellationDate: string;
  standardRate: number;
  unitsCompleted: number;
  unitsStarted: number;
  specialDiscountedRate?: number;
}

export interface RefundCalculationResult {
  advance: number;
  daysElapsed: number;
  isWithinWindow: boolean;
  retainedPercent: number;
  retainedAmount: number;
  totalUnitsCounted: number;
  workDoneAmount: number;
  totalDeductions: number;
  refundAmount: number;
  extraPayable: number;
  statusNote: string;
  isNeedsOwnerConfirmation: boolean;
  stepByStep: string[];
}

export interface PolicySettings {
  documentNumber: string;
  currentVersion: string;
  effectiveDate: string;
  lastUpdated: string;
  showTableOfContents: boolean;
  showKeyTermsBox: boolean;
  showRevisionHistoryAppendix: boolean;
  showAcknowledgementSignatures: boolean;
  showWorkedExampleBox: boolean;
  smartFitSummary: boolean;
  summaryScale: number; // 0.88 to 1.0
  stampAcceptedVersion: boolean;
}

export type PolicyTab =
  | 'editor'
  | 'variables'
  | 'calculator'
  | 'documents'
  | 'acceptance'
  | 'versions';

export type IndividualPolicyType =
  | 'refund'
  | 'payment'
  | 'revision'
  | 'delivery'
  | 'communication';

export interface PoliciesModuleState {
  clauses: Clause[];
  variables: PolicyVariables;
  versions: DocumentVersion[];
  acceptanceLog: AcceptanceRecord[];
  settings: PolicySettings;
}

export interface PoliciesBackupData {
  namespace: string;
  version: string;
  exportedAt: string;
  data: PoliciesModuleState;
}

