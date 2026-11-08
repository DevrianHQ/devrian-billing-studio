import { Clause, PolicyVariables, PolicySettings } from '../types';
import { resolveVariables } from './variableResolver';

/**
 * Strips basic markdown markers (bold, italic, links, headers) for clean WhatsApp/Email text.
 */
export function cleanMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .trim();
}

/**
 * Formats a clean, high-impact plain-text summary suitable for WhatsApp or Email.
 */
export function formatPolicySummaryForWhatsApp(
  clauses: Clause[],
  variables: PolicyVariables,
  settings: PolicySettings
): string {
  const v = variables;
  const sep = '--------------------------------------------------';

  const lines: string[] = [];

  lines.push(`${v.business_name.toUpperCase()} • TERMS & POLICIES SUMMARY`);
  lines.push(`Doc No: ${settings.documentNumber} | Version: v${settings.currentVersion}`);
  lines.push(`Proprietor: ${v.owner_name} (${v.owner_title})`);
  lines.push(`Udyam Reg. No: ${v.udyam_no}`);
  lines.push(`Contact: ${v.contact_email} | Web: ${v.website}`);
  lines.push('');
  lines.push(sep);
  lines.push('KEY TERMS AT A GLANCE:');
  lines.push(`• Advance: ${v.advance_percent}% required prior to project kick-off`);
  lines.push(`• Balance Due: Within ${v.balance_due_hours} hours of completion & approval`);
  lines.push(`• Refund Window: ${v.refund_window_days} calendar days from advance date`);
  lines.push(`• Advance Retention: ${v.refund_retention_percent}% retained on early cancellation`);
  lines.push(`• Revisions: ${v.revision_rounds} included rounds per deliverable`);
  lines.push(`• Feedback Window: Within ${v.feedback_window_hours} hours per draft`);
  lines.push(`• Work Hours: ${v.working_days}, ${v.working_hours} (reply within ${v.reply_time_hours}h)`);
  lines.push(`• Project Backup: Retained for ${v.backup_days} days post delivery`);
  lines.push(`• Legal Jurisdiction: ${v.jurisdiction_city}, ${v.jurisdiction_state}`);
  lines.push(sep);
  lines.push('');
  lines.push('CORE POLICIES:');
  lines.push('');

  // Extract key summary clauses
  const summaryKeys = [
    'payment_terms',
    'late_payment',
    'revisions',
    'cancellation_refund',
    'delivery_approval',
    'project_files',
    'communication_hours',
  ];

  const relevantClauses = clauses.filter(
    (c) => c.isVisible && summaryKeys.includes(c.key)
  );

  const clausesToRender = relevantClauses.length > 0 ? relevantClauses : clauses.filter(c => c.isVisible).slice(0, 6);

  clausesToRender.forEach((c) => {
    const title = resolveVariables(c.title, v, clauses);
    const body = cleanMarkdown(resolveVariables(c.body, v, clauses));
    lines.push(`${c.number}. ${title.toUpperCase()}`);
    lines.push(body);
    lines.push('');
  });

  lines.push(sep);
  lines.push(`By remitting the advance payment or signing the proposal, the Client agrees to these Terms & Conditions and Policies.`);
  lines.push(`For inquiries: ${v.contact_email} | Official: ${v.official_email}`);
  lines.push(`${v.business_name} Billing Studio • Official Commercial Documentation`);

  return lines.join('\n');
}

/**
 * Copies plain text to clipboard with fallback.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

