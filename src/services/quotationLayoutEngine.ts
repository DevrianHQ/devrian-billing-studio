/**
 * Compatibility bridge for quotation layout engine.
 * Exports pure functions from the modularized quotation engine.
 */
export * from '../modules/quotation/layoutEngine';

import { BillingDocument, BusinessProfile } from '../types';
import { measureQuotationLayout, computeQuotationFinancials as computeFinancials } from '../modules/quotation/layoutEngine';

/**
 * Returns array of active page numbers [1] or [1, 2] for the given quotation.
 */
export function resolveQuotationPages(doc: BillingDocument, _business?: BusinessProfile): number[] {
  const result = measureQuotationLayout(doc);
  return result.totalPages === 2 ? [1, 2] : [1];
}

/**
 * Legacy alias for computeQuotationFinancials
 */
export const calculateQuotationFinancials = computeFinancials;
