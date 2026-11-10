import { BillingDocument, LineItem, MonthlyDeliverable } from '../../types';
import {
  QuotationFinancials,
  QuotationLayoutResult,
  QuotationPageMeasurement,
  QuotationTemplateType,
  SavedQuotationTemplate,
} from './types';
import { QUOTATION_TOKENS } from './tokens';
import { QuotationTemplateService } from './templates';

/**
 * Calculates accurate financials for Quotations.
 * Pure, deterministic mathematical calculations.
 */
export function computeQuotationFinancials(doc: BillingDocument): QuotationFinancials {
  const isProject = !doc.quotationType || doc.quotationType === 'project';
  const isMonthly = doc.quotationType === 'monthly';
  const isHybrid = doc.quotationType === 'hybrid';

  const items = doc.items || [];
  const subtotal = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  // Discount calculation
  let discountAmount = 0;
  if (doc.discountType === 'percentage') {
    discountAmount = Math.round((subtotal * (doc.discountValue || 0)) / 100);
  } else {
    discountAmount = Math.min(subtotal, doc.discountValue || 0);
  }
  discountAmount = Math.max(0, discountAmount);

  const netTaxable = Math.max(0, subtotal - discountAmount);

  // Tax
  let taxAmount = 0;
  if (doc.gstEnabled && (doc.gstRate || 0) > 0) {
    taxAmount = Math.round((netTaxable * doc.gstRate) / 100);
  }
  const totalWithTax = netTaxable + taxAmount;

  // Project calculations
  const advPercent = doc.advancePercent ?? 50;
  let advanceAmount = 0;
  if (doc.advanceType === 'flat' && doc.advanceToStartWork !== undefined && doc.advanceToStartWork > 0) {
    advanceAmount = Math.min(totalWithTax, doc.advanceToStartWork);
  } else {
    advanceAmount = Math.round((totalWithTax * advPercent) / 100);
  }
  const balancePayable = Math.max(0, totalWithTax - advanceAmount);

  // Monthly / Hybrid calculations
  let oneTimeSetupTotal = 0;
  let monthlyFeeTotal = 0;

  if (isHybrid) {
    items.forEach((it) => {
      if (it.billing === 'one_time') {
        oneTimeSetupTotal += Number(it.amount) || 0;
      } else {
        monthlyFeeTotal += Number(it.amount) || 0;
      }
    });
  } else if (isMonthly) {
    monthlyFeeTotal = subtotal;
  } else {
    monthlyFeeTotal = subtotal;
  }

  // Fallback if oneTimeSetupFee was set directly
  if (doc.oneTimeSetupFee && oneTimeSetupTotal === 0 && isHybrid) {
    oneTimeSetupTotal = doc.oneTimeSetupFee;
  }

  const minTermMonths = doc.minTermMonths || 3;
  const firstMonthFeeNet = Math.max(0, monthlyFeeTotal - (doc.discountScope === 'monthly' || doc.discountScope === 'both' ? discountAmount : 0));
  const setupNet = Math.max(0, oneTimeSetupTotal - (doc.discountScope === 'one_time' ? discountAmount : 0));
  const dueToStart = setupNet + firstMonthFeeNet;
  const minimumCommitmentTotal = setupNet + (firstMonthFeeNet * minTermMonths);

  return {
    subtotal,
    discountAmount,
    netTaxable,
    taxAmount,
    totalWithTax,
    advanceAmount,
    advancePercent: advPercent,
    balancePayable,
    oneTimeSetupTotal,
    monthlyFeeTotal,
    monthlyTotal: monthlyFeeTotal,
    dueToStart,
    minimumCommitmentTotal,
    minTermMonths,
    isProject,
    firstMonthFeeNet,
  };
}

/**
 * Checks for unfilled bracket placeholders like [X] or [Deliverable]
 */
export function checkBracketPlaceholders(doc: BillingDocument): string[] {
  const bracketRegex = /\[.+?\]/;
  const errors: string[] = [];

  // Check items
  (doc.items || []).forEach((item, idx) => {
    if (bracketRegex.test(item.description)) {
      errors.push(`Item #${idx + 1} description contains unfilled placeholder [ ].`);
    }
    if (item.subDescription && bracketRegex.test(item.subDescription)) {
      errors.push(`Item #${idx + 1} sub-description contains unfilled placeholder [ ].`);
    }
  });

  // Check deliverables
  if (doc.quotationType === 'monthly' || doc.quotationType === 'hybrid') {
    (doc.monthlyDeliverables || []).forEach((deliv, idx) => {
      if (bracketRegex.test(deliv.item)) {
        errors.push(`Deliverable #${idx + 1} ("${deliv.item}") contains unfilled placeholder [ ].`);
      }
      if (bracketRegex.test(deliv.quantity)) {
        errors.push(`Deliverable #${idx + 1} quantity contains unfilled placeholder [ ].`);
      }
    });
  }

  // Check terms
  (doc.notes || []).forEach((note, idx) => {
    if (bracketRegex.test(note)) {
      errors.push(`Terms & Notes point #${idx + 1} contains unfilled placeholder [ ].`);
    }
  });

  return errors;
}

/**
 * Measures quotation layout and detects overflow deterministically.
 */
export function measureQuotationLayout(
  doc: BillingDocument,
  templateOverride?: SavedQuotationTemplate
): QuotationLayoutResult {
  const templateType: QuotationTemplateType =
    doc.quotationType === 'monthly' || doc.quotationType === 'hybrid' ? 'monthly' : 'project';

  const template = templateOverride || QuotationTemplateService.getTemplate(templateType);
  const hardLimitViolations: string[] = [];

  const items = doc.items || [];
  const deliverables = doc.monthlyDeliverables || template.sampleData.deliverables || [];
  const terms = doc.notes || template.terms || [];

  // 1. HARD LIMIT CHECKS
  if (templateType === 'project') {
    if (items.length > 6) {
      hardLimitViolations.push(`Maximum 6 rows allowed for Project Quotation (currently ${items.length}).`);
    }
    if (terms.length > 5) {
      hardLimitViolations.push(`Maximum 5 terms points allowed for Project Quotation (currently ${terms.length}).`);
    }
  } else {
    if (deliverables.length > 6) {
      hardLimitViolations.push(`Maximum 6 deliverables allowed for Monthly Retainer (currently ${deliverables.length}).`);
    }
    if (items.length > 3) {
      hardLimitViolations.push(`Maximum 3 pricing rows allowed for Monthly Retainer (currently ${items.length}).`);
    }
    if (terms.length > 7) {
      hardLimitViolations.push(`Maximum 7 terms points allowed for Monthly Retainer (currently ${terms.length}).`);
    }
  }

  // Bracket placeholders check
  const placeholderErrors = checkBracketPlaceholders(doc);
  hardLimitViolations.push(...placeholderErrors);

  // 2. MILLIMETER HEIGHT CALCULATION
  const pages: QuotationPageMeasurement[] = [];

  if (templateType === 'project') {
    // PAGE 1: Dark Cover Page (fixed 297mm full A4 cover, fits cleanly)
    pages.push({
      pageNumber: 1,
      contentHeightMm: 297,
      maxHeightMm: 297,
      overflowMm: 0,
      spareMm: 0,
      fits: true,
    });

    // PAGE 2: Scope of Work, Pricing, Terms & Acceptance
    const maxHeightMm = QUOTATION_TOKENS.spacing.num.page2UsableH; // 258mm
    let contentHeightMm = 0;

    // SlimHeader: 24mm
    contentHeightMm += 24 + QUOTATION_TOKENS.spacing.num.gap3;

    // Table ("SCOPE OF WORK")
    const tableHeaderH = QUOTATION_TOKENS.spacing.num.tableHeaderH; // 8.5mm
    const tableRowsH = items.reduce((sum, item) => {
      const hasSub = Boolean(item.subDescription && item.subDescription.trim());
      return sum + (hasSub ? 11.5 : 9.5);
    }, 0);
    contentHeightMm += tableHeaderH + tableRowsH + QUOTATION_TOKENS.spacing.num.gap4;

    // Two-column Block (LEFT PaymentBox, RIGHT SummaryBlock + TotalBar)
    const showQr = doc.sectionVisibility.showUpiQr || template.paymentToggles.showQr;
    const paymentBoxH = showQr ? 34 : 30;
    const summaryRowsCount = (doc.discountAmount && doc.discountAmount > 0 ? 1 : 0) + 1; // subtotal + discount
    const summaryQuietRowsH = 12; // advance + balance
    const totalBarH = 11;
    const summaryBoxH = (summaryRowsCount * 5.5) + totalBarH + summaryQuietRowsH;
    contentHeightMm += Math.max(paymentBoxH, summaryBoxH) + QUOTATION_TOKENS.spacing.num.gap3;

    // GST Line
    if (doc.sectionVisibility.showGstLine ?? template.visibility.showGstLine) {
      contentHeightMm += 4 + QUOTATION_TOKENS.spacing.num.gap3;
    }

    // NoteBox ("TERMS & NOTES")
    if (doc.sectionVisibility.showTermsAndNotes ?? template.visibility.showTermsAndNotes) {
      const notesH = terms.reduce((sum, note) => {
        const estLines = Math.ceil(note.length / 105);
        return sum + (estLines * 4.2) + 1.2;
      }, 0);
      contentHeightMm += 6 + notesH + QUOTATION_TOKENS.spacing.num.gap4; // 6mm box padding + heading
    }

    // Acceptance Block (Instruction + SignaturePair)
    if (doc.sectionVisibility.showAcceptance ?? template.visibility.showAcceptance) {
      const instructionH = 4.5;
      const pairH = 26; // label(3) + space(16) + rule(0.2) + name/desig(6.8)
      const auditDisclaimerH = 4.5;
      contentHeightMm += instructionH + pairH + auditDisclaimerH + QUOTATION_TOKENS.spacing.num.gap3;
    }

    // ClosingLine
    if (doc.sectionVisibility.showClosingLine ?? template.visibility.showClosingLine) {
      contentHeightMm += 4.5;
    }

    const overflowMm = Math.max(0, Math.round(contentHeightMm - maxHeightMm));
    const spareMm = Math.max(0, Math.round(maxHeightMm - contentHeightMm));
    const fits = overflowMm === 0 && hardLimitViolations.length === 0;

    pages.push({
      pageNumber: 2,
      contentHeightMm: Math.round(contentHeightMm),
      maxHeightMm,
      overflowMm,
      spareMm,
      fits,
    });
  } else {
    // MONTHLY RETAINER (3 Pages: Page 1 Cover, Page 2 Scope & Pricing, Page 3 Terms & Acceptance)
    // PAGE 2: Deliverables & Pricing (SlimHeader 24mm, usable 258mm)
    const p2MaxH = QUOTATION_TOKENS.spacing.num.page2UsableH; // 258mm
    let p2ContentH = 0;

    // Deliverables ListTable ("WHAT'S INCLUDED EACH MONTH")
    const listTableH = 9.5 + (deliverables.length * 8.5) + 4;
    p2ContentH += listTableH + QUOTATION_TOKENS.spacing.num.gap4;

    // Pricing Table ("PRICING")
    const pricingRowsH = items.reduce((sum, item) => {
      const hasSub = Boolean(item.subDescription && item.subDescription.trim());
      return sum + (hasSub ? 11 : 9.5);
    }, 0);
    p2ContentH += 9.5 + pricingRowsH + QUOTATION_TOKENS.spacing.num.gap4;

    // SummaryBlock (right-aligned)
    const setupRow = (doc.quotationType === 'hybrid' || items.some(i => i.billing === 'one_time')) ? 6 : 0;
    const monthlyRow = 6;
    const discountRow = (doc.discountAmount && doc.discountAmount > 0) ? 6 : 0;
    const totalBarH = 11;
    const quietRows = 14;
    p2ContentH += setupRow + monthlyRow + discountRow + totalBarH + quietRows;

    const p2Overflow = Math.max(0, Math.round(p2ContentH - p2MaxH));
    const p2Spare = Math.max(0, Math.round(p2MaxH - p2ContentH));

    pages.push({
      pageNumber: 2,
      contentHeightMm: Math.round(p2ContentH),
      maxHeightMm: p2MaxH,
      overflowMm: p2Overflow,
      spareMm: p2Spare,
      fits: p2Overflow === 0,
    });

    // PAGE 3: Terms and Acceptance (SlimHeader 24mm, usable 258mm)
    const p3MaxH = QUOTATION_TOKENS.spacing.num.page2UsableH; // 258mm
    let p3ContentH = 0;

    // KeyValueStrip ("BILLING & TERM")
    p3ContentH += 26 + QUOTATION_TOKENS.spacing.num.gap4;

    // PaymentBox (Full Width 174mm)
    const showQr = doc.sectionVisibility.showUpiQr || template.paymentToggles.showQr;
    p3ContentH += (showQr ? 32 : 28) + QUOTATION_TOKENS.spacing.num.gap4;

    // GST Line
    if (doc.sectionVisibility.showGstLine ?? template.visibility.showGstLine) {
      p3ContentH += 4 + QUOTATION_TOKENS.spacing.num.gap4;
    }

    // NoteBox ("TERMS & NOTES")
    if (doc.sectionVisibility.showTermsAndNotes ?? template.visibility.showTermsAndNotes) {
      const termsH = terms.reduce((sum, note) => {
        const estLines = Math.ceil(note.length / 105);
        return sum + (estLines * 4.2) + 1.2;
      }, 0);
      p3ContentH += 6 + termsH + QUOTATION_TOKENS.spacing.num.gap4;
    }

    // Acceptance (Instruction + SignaturePair)
    if (doc.sectionVisibility.showAcceptance ?? template.visibility.showAcceptance) {
      const instructionH = 4.5;
      const pairH = QUOTATION_TOKENS.spacing.num.signaturePairMonthlyH;
      const auditDisclaimerH = 4.5;
      p3ContentH += instructionH + pairH + auditDisclaimerH + QUOTATION_TOKENS.spacing.num.gap4;
    }

    // ClosingLine
    if (doc.sectionVisibility.showClosingLine ?? template.visibility.showClosingLine) {
      p3ContentH += 4.5;
    }

    const p3Overflow = Math.max(0, Math.round(p3ContentH - p3MaxH));
    const p3Spare = Math.max(0, Math.round(p3MaxH - p3ContentH));

    pages.push({
      pageNumber: 3,
      contentHeightMm: Math.round(p3ContentH),
      maxHeightMm: p3MaxH,
      overflowMm: p3Overflow,
      spareMm: p3Spare,
      fits: p3Overflow === 0,
    });
  }

  const hasOverflow = pages.some((p) => p.overflowMm > 0);
  let overflowMessage: string | undefined = undefined;

  if (hasOverflow) {
    if (templateType === 'project') {
      const ovPages = pages.filter(p => p.overflowMm > 0).map(p => `Page ${p.pageNumber}: +${p.overflowMm}mm`).join(', ');
      overflowMessage = `Too long for the 2-page Project Quotation (${ovPages}). Reduce rows or shorten text; put detailed scope in the Proposal.`;
    } else {
      const ovPages = pages.filter(p => p.overflowMm > 0).map(p => `Page ${p.pageNumber}: +${p.overflowMm}mm`).join(', ');
      overflowMessage = `Too long for the fixed layout (${ovPages}). Reduce rows or shorten text.`;
    }
  } else if (hardLimitViolations.length > 0) {
    overflowMessage = hardLimitViolations[0];
  }

  const canExport = !hasOverflow && hardLimitViolations.length === 0;

  return {
    templateType,
    totalPages: pages.length,
    pages,
    hasOverflow,
    overflowMessage,
    hardLimitViolations,
    canExport,
  };
}
