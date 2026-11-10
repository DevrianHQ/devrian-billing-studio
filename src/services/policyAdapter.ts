import { BusinessProfile, BillingDocument } from '../types';
import { PoliciesStorage } from '../modules/policies/utils/storageAdapter';

export interface PolicyAdapterValues {
  advance_percent: number;
  balance_due_hours: number;
  tnc_version: string;
  reply_time_hours: number;
  min_term_months: number;
  notice_days: number;
}

/**
 * Read-only adapter that pulls policies variables and terms version
 * from the Terms & Policies module (PoliciesStorage).
 * Falls back to BusinessProfile settings (default 50% and 48 hours) and '1.0' / 'latest'.
 * NEVER writes to policies module storage.
 */
export function getPolicyAdapterValues(
  businessProfile?: BusinessProfile,
  doc?: BillingDocument
): PolicyAdapterValues {
  try {
    const vars = PoliciesStorage.loadVariables();
    const settings = PoliciesStorage.loadSettings();

    const advance_percent =
      typeof vars?.advance_percent === 'number' && vars.advance_percent > 0
        ? vars.advance_percent
        : businessProfile?.advancePercentDefault ?? 50;

    const balance_due_hours =
      typeof vars?.balance_due_hours === 'number' && vars.balance_due_hours > 0
        ? vars.balance_due_hours
        : businessProfile?.balanceDueHoursDefault ?? 48;

    const reply_time_hours =
      typeof vars?.reply_time_hours === 'number' && vars.reply_time_hours > 0
        ? vars.reply_time_hours
        : businessProfile?.replyTimeHoursDefault ?? 24;

    const min_term_months =
      typeof doc?.minTermMonths === 'number' && doc.minTermMonths > 0
        ? doc.minTermMonths
        : businessProfile?.minTermMonthsDefault ?? 3;

    const notice_days =
      typeof doc?.noticePeriodDays === 'number' && doc.noticePeriodDays > 0
        ? doc.noticePeriodDays
        : businessProfile?.noticePeriodDaysDefault ?? 30;

    const tnc_version = settings?.currentVersion || '1.0';

    return {
      advance_percent,
      balance_due_hours,
      tnc_version,
      reply_time_hours,
      min_term_months,
      notice_days,
    };
  } catch (err) {
    console.warn('[policyAdapter] Failed to load from PoliciesStorage, falling back to settings', err);
    return {
      advance_percent: businessProfile?.advancePercentDefault ?? 50,
      balance_due_hours: businessProfile?.balanceDueHoursDefault ?? 48,
      tnc_version: 'latest',
      reply_time_hours: businessProfile?.replyTimeHoursDefault ?? 24,
      min_term_months: doc?.minTermMonths ?? businessProfile?.minTermMonthsDefault ?? 3,
      notice_days: doc?.noticePeriodDays ?? businessProfile?.noticePeriodDaysDefault ?? 30,
    };
  }
}

/**
 * Resolves template variables like {{advance_percent}}, {{balance_due_hours}}, {{tnc_version}}, {{reply_time_hours}}, {{min_term_months}}, {{notice_days}}
 */
export function resolveQuotationVariables(text: string, values: PolicyAdapterValues): string {
  if (!text) return '';
  return text
    .replace(/\{\{advance_percent\}\}/g, String(values.advance_percent))
    .replace(/\{\{balance_due_hours\}\}/g, String(values.balance_due_hours))
    .replace(/\{\{tnc_version\}\}/g, String(values.tnc_version))
    .replace(/\{\{reply_time_hours\}\}/g, String(values.reply_time_hours))
    .replace(/\{\{min_term_months\}\}/g, String(values.min_term_months))
    .replace(/\{\{notice_days\}\}/g, String(values.notice_days));
}

/**
 * Resolves template variables on an array of terms lines
 */
export function resolveQuotationTermsList(
  terms: string[],
  business?: BusinessProfile,
  doc?: BillingDocument
): string[] {
  const values = getPolicyAdapterValues(business, doc);
  return terms.map((t) => resolveQuotationVariables(t, values));
}

/**
 * Default Project Terms (5 items)
 */
export const PROJECT_DEFAULT_TERMS = [
  'This quotation is valid until the date mentioned above. Prices may change after that.',
  '{{advance_percent}}% advance is required to begin work. The balance is payable within {{balance_due_hours}} hours after project completion and approval.',
  'Timelines start after the advance and all required materials (footage, scripts, logos and other assets) are received.',
  'Scope, revisions, ownership, refund and all other terms are as per the signed Proposal and DEVRIAN Terms & Conditions v{{tnc_version}}.',
  'Any work outside the scope above will be quoted separately.',
];

/**
 * Default Monthly / Hybrid Retainer Terms (7 items)
 */
export const MONTHLY_DEFAULT_TERMS = [
  'This quotation is valid until the date mentioned above. Prices may change after that.',
  'The first month\'s fee (and any one-time setup fee) is payable before work begins. Each following month\'s fee is payable in advance, before the cycle begins.',
  'Minimum commitment is {{min_term_months}} months. The service continues monthly until cancelled with {{notice_days}} days\' written notice by email.',
  'Deliverables are as listed per month. Unused deliverables do not carry forward unless agreed in writing.',
  'Ad spend, paid promotions, shoots, stock and music licences are not included. Extra work is quoted separately.',
  'If a payment is delayed, work and delivery pause and resume once payment is received.',
  'All other terms are as per the signed Proposal and DEVRIAN Terms & Conditions v{{tnc_version}}.',
];

export const LEAN_QUOTATION_TERMS = PROJECT_DEFAULT_TERMS;

/**
 * Identifies whether a retainer term clause contains rules that do not exist
 * in the Policies module (Minimum term commitment, notice period, carry-forward, delivery pause on delay).
 * Used ONLY to display the amber "Needs review" badge in the editor (never printed).
 */
export function isRetainerTermNeedingReview(termText: string): boolean {
  if (!termText) return false;
  const lower = termText.toLowerCase();
  return (
    lower.includes('minimum commitment') ||
    lower.includes('min_term_months') ||
    lower.includes('notice_days') ||
    lower.includes('unused deliverables') ||
    lower.includes('carry forward') ||
    (lower.includes('payment is delayed') && lower.includes('pause'))
  );
}

/**
 * List of retainer rules missing from Terms & Policies module (reported in final report)
 */
export const MISSING_RETAINER_RULES_FROM_POLICIES = [
  {
    rule: 'Minimum Commitment Period',
    clause: 'Minimum commitment is {{min_term_months}} months.',
    reason: 'Policies module currently only defines one-time milestone project advance & balance terms; recurring retainer commitment durations are missing from PolicyVariables.',
  },
  {
    rule: 'Cancellation Notice Period',
    clause: 'Service continues monthly until cancelled with {{notice_days}} days\' written notice by email.',
    reason: 'Policies module only defines cancellation within 48h/7d refund window, not recurring retainer notice periods.',
  },
  {
    rule: 'Non-Carry-Forward of Unused Deliverables',
    clause: 'Deliverables are as listed per month. Unused deliverables do not carry forward unless agreed in writing.',
    reason: 'Policies module does not specify monthly expiration/forfeiture of unused retainer volume.',
  },
  {
    rule: 'Delivery Pause on Delayed Payment',
    clause: 'If a payment is delayed, work and delivery pause and resume once payment is received.',
    reason: 'Policies module mentions interest and late-fee penalties, but not operational work-pause on recurring cycle fees.',
  },
];
