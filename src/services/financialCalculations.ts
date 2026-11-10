import { BillingDocument } from '../types';

export interface DocumentFinancialBreakdown {
  billed: number;
  received: number;
  pending: number;
}

/**
 * Calculates the gross total for an invoice (subtotal - discount + tax)
 */
export function getInvoiceTotal(doc: BillingDocument): number {
  return (doc.subtotal || 0) - (doc.discountAmount || 0) + (doc.totalTaxAmount || 0);
}

/**
 * Returns the primary display amount of a document for lists, tables, and recent activity
 */
export function getDocumentDisplayAmount(doc: BillingDocument): number {
  if (doc.type === 'receipt') {
    return doc.amountReceived ?? doc.advanceReceived ?? 0;
  }
  return getInvoiceTotal(doc);
}

/**
 * Calculates the accurate billed, received, and pending financial metrics for a document,
 * strictly derived from the document's actual status set in History.
 *
 * Rules:
 * - INVOICE:
 *   - 'PAID': Full invoice total is counted as received (net of any linked receipts already accounting for part of it). Pending is 0.
 *   - 'PARTIALLY PAID' | 'ADVANCE RECEIVED': Only confirmed advance is counted as received. Remaining balance is pending.
 *   - 'UNPAID' | 'OVERDUE': ZERO is received! The full invoice amount is pending.
 * - RECEIPT:
 *   - 'PAID' | 'FINAL': Full receipt amount is counted as received.
 *   - 'PARTIALLY PAID' | 'ADVANCE RECEIVED': Full receipt amount is received, any balanceDue is pending.
 *   - 'UNPAID' | 'OVERDUE': ZERO is received! Receipt amount is pending.
 * - QUOTATION: 0 billed, 0 received, 0 pending (not an issued billing document).
 */
export function calculateDocumentFinancials(
  doc: BillingDocument,
  allDocs: BillingDocument[] = []
): DocumentFinancialBreakdown {
  if (doc.type === 'invoice') {
    const total = getInvoiceTotal(doc);
    const billed = total;

    // Check linked receipts for this invoice that are marked PAID or FINAL
    const linkedPaidReceipts = allDocs.filter(
      (r) =>
        r.type === 'receipt' &&
        r.sourceInvoiceId === doc.id &&
        (r.status === 'PAID' || r.status === 'FINAL')
    );
    const linkedReceiptsPaid = linkedPaidReceipts.reduce(
      (sum, r) => sum + (r.amountReceived ?? r.advanceReceived ?? 0),
      0
    );

    let received = 0;
    let pending = 0;

    if (doc.status === 'PAID') {
      // Entire invoice is paid.
      // Net out linked receipts already counted to prevent double counting
      received = Math.max(0, total - linkedReceiptsPaid);
      pending = 0;
    } else if (doc.status === 'PARTIALLY PAID' || doc.status === 'ADVANCE RECEIVED') {
      const advance = doc.advanceReceived || 0;
      // If a linked receipt already accounted for advance, invoice adds 0
      received = Math.max(0, advance - linkedReceiptsPaid);
      pending = Math.max(0, total - (linkedReceiptsPaid + received));
    } else {
      // UNPAID or OVERDUE: No money received!
      received = 0;
      pending = Math.max(0, total - linkedReceiptsPaid);
    }

    return { billed, received, pending };
  }

  if (doc.type === 'receipt') {
    const amount = doc.amountReceived ?? doc.advanceReceived ?? 0;
    const isLinked = Boolean(
      doc.sourceInvoiceId && allDocs.some((inv) => inv.id === doc.sourceInvoiceId)
    );

    // If receipt is linked to an invoice, the invoice accounts for the billed total
    const billed = isLinked ? 0 : (doc.totalProjectCost || amount);

    let received = 0;
    let pending = 0;

    if (doc.status === 'PAID' || doc.status === 'FINAL') {
      received = amount;
      pending = 0;
    } else if (doc.status === 'PARTIALLY PAID' || doc.status === 'ADVANCE RECEIVED') {
      received = amount;
      pending = doc.balanceDue || 0;
    } else {
      // UNPAID or OVERDUE: No cash received!
      received = 0;
      pending = amount;
    }

    return { billed, received, pending };
  }

  // Quotations or unknown types
  return { billed: 0, received: 0, pending: 0 };
}

