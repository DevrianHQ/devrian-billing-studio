import { QuotationPolicyVariables } from '../types';

/**
 * Read-only adapter for Terms & Policies module variables.
 * Strictly non-mutating with mandatory fallbacks:
 * advance_percent -> 50
 * balance_due_hours -> 48
 * tnc_version -> "latest"
 */
export function getQuotationPolicyVariables(
  fallbackAdvancePercent: number = 50,
  fallbackBalanceHours: number = 48,
  fallbackTncVersion: string = 'latest',
  minTermMonths: number = 3,
  noticeDays: number = 30
): QuotationPolicyVariables {
  let advance_percent = fallbackAdvancePercent ?? 50;
  let balance_due_hours = fallbackBalanceHours ?? 48;
  let tnc_version = fallbackTncVersion || 'latest';

  if (typeof window !== 'undefined') {
    try {
      const varsRaw = localStorage.getItem('devrian_policies_variables');
      if (varsRaw) {
        const parsed = JSON.parse(varsRaw);
        if (typeof parsed.advance_percent === 'number' && parsed.advance_percent > 0) {
          advance_percent = parsed.advance_percent;
        }
        if (typeof parsed.balance_due_hours === 'number' && parsed.balance_due_hours > 0) {
          balance_due_hours = parsed.balance_due_hours;
        }
      }

      const settingsRaw = localStorage.getItem('devrian_policies_settings');
      if (settingsRaw) {
        const parsed = JSON.parse(settingsRaw);
        if (parsed.currentVersion) {
          tnc_version = parsed.currentVersion;
        }
      }
    } catch {
      // Safe fallback to defaults
    }
  }

  return {
    advance_percent,
    balance_due_hours,
    tnc_version,
    min_term_months: minTermMonths,
    notice_days: noticeDays,
  };
}

/**
 * Interpolates template variables in strings:
 * {{advance_percent}}, {{balance_due_hours}}, {{tnc_version}}, {{min_term_months}}, {{notice_days}}
 */
export function resolveQuotationVariables(
  text: string,
  vars: QuotationPolicyVariables
): string {
  if (!text) return '';
  return text
    .replace(/\{\{advance_percent\}\}/g, String(vars.advance_percent ?? 50))
    .replace(/\{\{balance_due_hours\}\}/g, String(vars.balance_due_hours ?? 48))
    .replace(/\{\{tnc_version\}\}/g, String(vars.tnc_version || 'latest'))
    .replace(/\{\{min_term_months\}\}/g, String(vars.min_term_months ?? 3))
    .replace(/\{\{notice_days\}\}/g, String(vars.notice_days ?? 30));
}
