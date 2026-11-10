import { DocumentType, BillingDocument } from '../types';

/**
 * Generates the next sequential document number based on pattern and existing documents
 * For quotations: DEV-QT-<year of quotation date>-<3-digit sequence>, e.g. DEV-QT-2026-001
 */
export function generateNextDocumentNumber(
  type: DocumentType,
  pattern: string,
  existingDocs: BillingDocument[],
  docDate?: string
): string {
  let dateYear = new Date().getFullYear().toString();
  if (docDate) {
    try {
      const parsedYear = new Date(docDate).getFullYear();
      if (!isNaN(parsedYear) && parsedYear > 2000 && parsedYear < 2100) {
        dateYear = parsedYear.toString();
      }
    } catch {
      // fallback
    }
  }

  let effectivePattern = pattern;
  if (type === 'quotation') {
    if (!effectivePattern || !effectivePattern.includes('{001}') || effectivePattern === 'DEV-QT-2027') {
      effectivePattern = 'DEV-QT-{YYYY}-{001}';
    }
  }

  // Find all document numbers of this type
  const matchingDocs = existingDocs.filter((d) => d.type === type);

  // Extract padding length from pattern, e.g. {001} -> 3
  const paddingMatch = effectivePattern.match(/\{([0]+1)\}/);
  const paddingLength = paddingMatch ? paddingMatch[1].length : 3;

  // Prefix with year replaced
  const prefixPattern = effectivePattern
    .replace('{YYYY}', dateYear)
    .replace('{YY}', dateYear.slice(-2))
    .replace(/\{[0]+1\}/, '');

  let maxNum = 0;

  for (const doc of matchingDocs) {
    const docNum = (doc.documentNumber || '').trim();

    // Specific match against current prefix
    const regex = new RegExp(`^${escapeRegex(prefixPattern)}(\\d+)`);
    const match = docNum.match(regex);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed < 2000 && parsed > maxNum) {
        maxNum = parsed;
      }
    } else {
      // Check if it matches DEV-QT-YYYY-NNN format for current year
      const qtMatch = docNum.match(/^DEV-QT-\d{4}-(\d+)/i);
      if (qtMatch && qtMatch[1]) {
        const parsed = parseInt(qtMatch[1], 10);
        if (!isNaN(parsed) && parsed < 2000 && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    }
  }

  const nextNum = maxNum + 1;
  const paddedNum = nextNum.toString().padStart(paddingLength, '0');

  return effectivePattern
    .replace('{YYYY}', dateYear)
    .replace('{YY}', dateYear.slice(-2))
    .replace(/\{[0]+1\}/, paddedNum);
}

/**
 * Sanitizes malformed quotation numbers (e.g. DEV-QT-2027 -> DEV-QT-2026-001)
 */
export function sanitizeQuotationNumber(docNumber?: string, dateStr?: string): string {
  if (!docNumber || !docNumber.trim()) return 'DEV-QT-2026-001';
  const trimmed = docNumber.trim();
  const year = dateStr ? new Date(dateStr).getFullYear() : 2026;

  // Well-formed format: DEV-QT-2026-001 or DEV-QT-2026-001-R1
  if (/^DEV-QT-\d{4}-\d{3,}/i.test(trimmed)) {
    return trimmed;
  }

  // Malformed like DEV-QT-2027
  const yearOnlyMatch = trimmed.match(/^DEV-QT-(\d{4})$/i);
  if (yearOnlyMatch) {
    return `DEV-QT-${year}-001`;
  }

  // Malformed like DEV-QT-001 (missing year)
  const seqOnlyMatch = trimmed.match(/^DEV-QT-(\d{1,3})$/i);
  if (seqOnlyMatch) {
    return `DEV-QT-${year}-${seqOnlyMatch[1].padStart(3, '0')}`;
  }

  return trimmed;
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a document number is already in use by another document
 */
export function isDocumentNumberDuplicate(
  documentNumber: string,
  currentDocId: string,
  existingDocs: BillingDocument[]
): boolean {
  if (!documentNumber || !documentNumber.trim()) return false;
  const cleanTarget = documentNumber.trim().toLowerCase();

  return existingDocs.some(
    (d) => d.id !== currentDocId && d.documentNumber && d.documentNumber.trim().toLowerCase() === cleanTarget
  );
}
