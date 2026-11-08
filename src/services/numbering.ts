import { DocumentType, BillingDocument } from '../types';

/**
 * Generates the next sequential document number based on pattern and existing documents
 */
export function generateNextDocumentNumber(
  type: DocumentType,
  pattern: string,
  existingDocs: BillingDocument[]
): string {
  const currentYear = new Date().getFullYear().toString();
  
  // Find all document numbers of this type
  const matchingDocs = existingDocs.filter(d => d.type === type);
  
  // Extract number from pattern, e.g. {001} or {0001}
  const paddingMatch = pattern.match(/\{([0]+1)\}/);
  const paddingLength = paddingMatch ? paddingMatch[1].length : 3;

  // Pattern with year replaced
  const prefixPattern = pattern
    .replace('{YYYY}', currentYear)
    .replace('{YY}', currentYear.slice(-2))
    .replace(/\{[0]+1\}/, '');

  let maxNum = 0;

  for (const doc of matchingDocs) {
    const docNum = doc.documentNumber || '';
    // Look for digits at the end or following the prefix
    const regex = new RegExp(`^${escapeRegex(prefixPattern)}(\\d+)`);
    const match = docNum.match(regex);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    } else {
      // General fallback: search for last number sequence in string
      const genericMatch = docNum.match(/(\d+)$/);
      if (genericMatch) {
        const parsed = parseInt(genericMatch[1], 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    }
  }

  const nextNum = maxNum + 1;
  const paddedNum = nextNum.toString().padStart(paddingLength, '0');

  return pattern
    .replace('{YYYY}', currentYear)
    .replace('{YY}', currentYear.slice(-2))
    .replace(/\{[0]+1\}/, paddedNum);
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
  const normalized = documentNumber.trim().toLowerCase();
  return existingDocs.some(
    d => d.id !== currentDocId &&
         !d.id.startsWith('seed-') &&
         d.documentNumber.trim().toLowerCase() === normalized
  );
}

