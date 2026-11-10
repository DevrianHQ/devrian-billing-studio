import {
  BillingDocument,
  BusinessProfile,
  LineItem,
  MonthlyDeliverable,
  QuotationBlockConfig,
  QuotationBlockId,
  QuotationType,
} from '../types';

export const A4_HEIGHT_MM = 297;
export const MARGIN_SIDE_MM = 18;
export const FOOTER_LINE_Y_MM = 282; // Footer starts at 282mm
export const USABLE_PAGE_HEIGHT_MM = 282; // 282mm from top of page
export const PAGE1_HEADER_BAND_MM = 62;
export const PAGE2_HEADER_BAND_MM = 20;
export const META_ROW_MM = 0; // Meta row removed from top, dates and doc no placed at bottom like Invoice
export const PARTY_ROW_BASE_MM = 20;
export const TABLE_HEADER_MM = 8.5;
export const MIN_ITEM_ROW_MM = 11;
export const BLOCK_GAP_MM = 2.5;
export const MIN_BLOCK_START_SPACE_MM = 25;

export interface QuotationFinancials {
  type: QuotationType;
  isProject: boolean;
  oneTimeGross: number;
  monthlyGross: number;
  subtotal: number;
  oneTimeDiscount: number;
  monthlyDiscount: number;
  discountAmount: number;
  oneTimeNet: number;
  monthlyNet: number;
  firstMonthFeeNet: number;
  netTaxable: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  oneTimeTotal: number;
  monthlyTotal: number;
  totalProjectCost: number; // for project
  advanceAmount: number;    // for project
  balancePayable: number;   // for project
  balanceDue: number;
  dueToStart: number;       // for monthly/hybrid
  minTermMonths: number;
  minCommitmentTotal: number;
  minimumCommitmentTotal: number;
}

/**
 * Calculates exact financials for Project, Monthly Retainer, and Hybrid quotation types.
 */
export function calculateQuotationFinancials(
  doc: BillingDocument,
  business?: BusinessProfile
): QuotationFinancials {
  const type: QuotationType = doc.quotationType || 'project';
  const items = doc.items || [];
  const discountType = doc.discountType || 'flat';
  const discountValue = Math.max(0, doc.discountValue || 0);
  const discountScope = doc.discountScope || 'both';
  const minTermMonths = doc.minTermMonths || business?.minTermMonthsDefault || 3;
  const gstEnabled = Boolean(doc.gstEnabled);
  const gstRate = gstEnabled ? (doc.gstRate || 0) : 0;
  const gstType = doc.gstType || 'CGST_SGST';

  let oneTimeGross = 0;
  let monthlyGross = 0;

  for (const item of items) {
    const itemQty = item.quantity !== undefined ? item.quantity : (item.qty !== undefined ? item.qty : 1);
    const amt = Math.max(0, itemQty * (item.rate || 0));
    if (type === 'project') {
      oneTimeGross += amt;
    } else if (type === 'monthly') {
      monthlyGross += amt;
    } else {
      // Hybrid
      if (item.billing === 'one_time') {
        oneTimeGross += amt;
      } else {
        monthlyGross += amt;
      }
    }
  }

  const subtotal = oneTimeGross + monthlyGross;

  let oneTimeDiscount = 0;
  let monthlyDiscount = 0;

  if (type === 'project') {
    oneTimeDiscount =
      discountType === 'percentage'
        ? (oneTimeGross * discountValue) / 100
        : Math.min(oneTimeGross, discountValue);
  } else {
    // Monthly or Hybrid
    if (discountScope === 'one_time') {
      oneTimeDiscount =
        discountType === 'percentage'
          ? (oneTimeGross * discountValue) / 100
          : Math.min(oneTimeGross, discountValue);
    } else if (discountScope === 'monthly') {
      monthlyDiscount =
        discountType === 'percentage'
          ? (monthlyGross * discountValue) / 100
          : Math.min(monthlyGross, discountValue);
    } else {
      // Both
      if (discountType === 'percentage') {
        oneTimeDiscount = (oneTimeGross * discountValue) / 100;
        monthlyDiscount = (monthlyGross * discountValue) / 100;
      } else {
        // Flat discount distributed proportionally across one-time and monthly
        if (subtotal > 0) {
          oneTimeDiscount = Math.min(
            oneTimeGross,
            Math.round((discountValue * oneTimeGross) / subtotal)
          );
          monthlyDiscount = Math.min(
            monthlyGross,
            Math.max(0, discountValue - oneTimeDiscount)
          );
        }
      }
    }
  }

  const discountAmount = oneTimeDiscount + monthlyDiscount;
  const oneTimeNet = Math.max(0, oneTimeGross - oneTimeDiscount);
  const monthlyNet = Math.max(0, monthlyGross - monthlyDiscount);
  const netTaxable = oneTimeNet + monthlyNet;

  const totalTaxAmount = gstEnabled ? (netTaxable * gstRate) / 100 : 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (gstEnabled && totalTaxAmount > 0) {
    if (gstType === 'IGST') {
      igstAmount = totalTaxAmount;
    } else {
      cgstAmount = totalTaxAmount / 2;
      sgstAmount = totalTaxAmount / 2;
    }
  }

  const oneTimeTax = gstEnabled ? (oneTimeNet * gstRate) / 100 : 0;
  const monthlyTax = gstEnabled ? (monthlyNet * gstRate) / 100 : 0;
  const oneTimeTotal = oneTimeNet + oneTimeTax;
  const monthlyTotal = monthlyNet + monthlyTax;
  const totalProjectCost = netTaxable + totalTaxAmount;

  // Project Advance & Balance
  const advanceType = doc.advanceType || 'percentage';
  const advancePercent = doc.advancePercent ?? business?.advancePercentDefault ?? 50;
  let advanceAmount = 0;
  if (advanceType === 'flat') {
    advanceAmount = doc.advanceToStartWork !== undefined && doc.advanceToStartWork > 0
      ? Math.min(totalProjectCost, doc.advanceToStartWork)
      : (doc.advanceReceived ? Math.min(totalProjectCost, doc.advanceReceived) : 0);
  } else {
    advanceAmount = Math.round((totalProjectCost * advancePercent) / 100);
  }
  const balancePayable = Math.max(0, totalProjectCost - advanceAmount);

  // Monthly / Hybrid Due To Start (One-time setup + First month fee)
  const dueToStart = type === 'project' ? (advanceAmount > 0 ? advanceAmount : totalProjectCost) : oneTimeTotal + monthlyTotal;
  const minCommitmentTotal = oneTimeTotal + monthlyTotal * minTermMonths;

  return {
    type,
    isProject: type === 'project',
    oneTimeGross,
    monthlyGross,
    subtotal,
    oneTimeDiscount,
    monthlyDiscount,
    discountAmount,
    oneTimeNet,
    monthlyNet,
    firstMonthFeeNet: monthlyNet,
    netTaxable,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTaxAmount,
    oneTimeTotal,
    monthlyTotal,
    totalProjectCost,
    advanceAmount,
    balancePayable,
    balanceDue: balancePayable,
    dueToStart,
    minTermMonths,
    minCommitmentTotal,
    minimumCommitmentTotal: minCommitmentTotal,
  };
}

export const computeQuotationFinancials = calculateQuotationFinancials;

export interface BlockHeightEstimate {
  id: QuotationBlockId;
  height: number;
  label: string;
}

/**
 * Estimates exact height in mm for each quotation block based on document content.
 */
export function estimateBlockHeights(
  doc: BillingDocument,
  type: QuotationType
): Record<QuotationBlockId, number> {
  const vis = (doc.sectionVisibility || {}) as BillingDocument['sectionVisibility'];
  const items = doc.items || [];
  const deliverables = doc.monthlyDeliverables || [];

  // 1. Deliverables ("WHAT'S INCLUDED EACH MONTH") - only in Monthly/Hybrid
  let deliverablesH = 0;
  if ((type === 'monthly' || type === 'hybrid') && deliverables.length > 0) {
    // Title 6mm + 2 columns of rows (each row ~4mm) + box padding
    const rowCount = Math.ceil(deliverables.length / 2);
    deliverablesH = 6 + rowCount * 4.0 + 3;
  }

  // 2. Scope of Work / Pricing table
  let scopeTableH = 0;
  if (items.length > 0) {
    // Header 8.5mm + rows (9.5mm min, subdescription adds 2mm)
    const rowsTotal = items.reduce((sum, item) => {
      const hasSub = Boolean(item.subDescription && item.subDescription.trim());
      return sum + (hasSub ? 11.5 : 9.5);
    }, 0);
    scopeTableH = TABLE_HEADER_MM + rowsTotal;
  }

  // 3. Billing & Term strip - only in Monthly/Hybrid
  let billingStripH = 0;
  if (type === 'monthly' || type === 'hybrid') {
    // 4 columns strip ~12.5mm
    billingStripH = 12.5;
  }

  // 4. Payment Details + Summary (Invoice-matching layout: right-aligned summary + full-width payment box)
  const showPayment = vis.showPaymentDetails ?? true;
  const paymentSummaryH = showPayment ? 42 : 22;

  // 5. GST Notice line
  const gstLineH = vis.showGstLine ? 4.5 : 0;

  // 6. Optional Inclusions & Exclusions
  const inclusionsH =
    vis.showInclusions && (doc.inclusions || doc.exclusions) ? 16 : 0;

  // 7. Optional Delivery Timeline
  const timelineH =
    vis.showTimeline && doc.deliveryTimeline && doc.deliveryTimeline.trim() ? 12 : 0;

  // 8. Optional Free Notes
  const notesH =
    vis.showFreeNotes && doc.freeNotes && doc.freeNotes.trim() ? 14 : 0;

  // 9. Terms & Notes box (#F0F0F0, 1.2mm left border, 8.5pt body text)
  let termsH = 0;
  if (vis.showTermsAndNotes && doc.notes && doc.notes.length > 0) {
    // Heading 4mm + each point 3.4mm + padding 2mm
    termsH = 4 + doc.notes.length * 3.4 + 2;
  }

  // 10. Acceptance box (Compact with client + Devrian columns, 14mm signature)
  let acceptanceH = 0;
  if (vis.showAcceptance) {
    // Intro line + 2 columns with signature space + closing line ~20mm
    acceptanceH = 20;
  }

  return {
    deliverables: deliverablesH,
    scope_table: scopeTableH,
    billing_strip: billingStripH,
    payment_summary: paymentSummaryH,
    gst_line: gstLineH,
    inclusions_exclusions: inclusionsH,
    delivery_timeline: timelineH,
    notes: notesH,
    terms_and_notes: termsH,
    acceptance: acceptanceH,
  };
}

export interface QuotationLayoutPlan {
  totalPages: 1 | 2;
  page1Blocks: QuotationBlockId[];
  page2Blocks: QuotationBlockId[];
  splitItemIndex?: number; // if table continues
  page1Items: LineItem[];
  page2Items: LineItem[];
  page1Height: number;
  page2Height: number;
  page1SpareHeadroom: number;
  page2SpareHeadroom: number;
  blockHeights: Record<QuotationBlockId, number>;
  activeBlocks: QuotationBlockConfig[];
  hasRuleViolation: boolean;
  ruleViolationMessage?: string;
}

/**
 * Default block order for Quotations
 */
export const DEFAULT_BLOCK_ORDER: QuotationBlockId[] = [
  'deliverables',
  'scope_table',
  'billing_strip',
  'payment_summary',
  'gst_line',
  'inclusions_exclusions',
  'delivery_timeline',
  'notes',
  'terms_and_notes',
  'acceptance',
];

/**
 * Resolves the layout plan for the quotation.
 * If custom blocks are defined by the user in the Page Layout Panel, respects them while validating rules.
 * Otherwise, automatically flows blocks across Page 1 and Page 2.
 */
export function resolveQuotationLayout(
  doc: BillingDocument,
  type?: QuotationType
): QuotationLayoutPlan {
  const actualType: QuotationType = type || doc.quotationType || 'project';
  const blockHeights = estimateBlockHeights(doc, actualType);
  const items = doc.items || [];
  const hasDelivery = Boolean(doc.estimatedDelivery && doc.estimatedDelivery.trim());
  const partyRowH = hasDelivery ? 23 : 19;
  const page1FixedH = PAGE1_HEADER_BAND_MM + partyRowH; // ~81-85mm (directly follows HeaderBand, exactly like Invoice)

  // Determine active block configs
  let blockConfigs: QuotationBlockConfig[] = [];
  if (doc.quotationBlocks && doc.quotationBlocks.length > 0) {
    blockConfigs = [...doc.quotationBlocks];
  } else {
    // Default configs
    blockConfigs = DEFAULT_BLOCK_ORDER.map((id, index) => {
      let isVis = true;
      if (id === 'deliverables') isVis = type === 'monthly' || type === 'hybrid';
      if (id === 'billing_strip') isVis = type === 'monthly' || type === 'hybrid';
      if (id === 'inclusions_exclusions') isVis = Boolean(doc.sectionVisibility?.showInclusions && (doc.inclusions || doc.exclusions));
      if (id === 'delivery_timeline') isVis = Boolean(doc.sectionVisibility?.showTimeline && doc.deliveryTimeline);
      if (id === 'notes') isVis = Boolean(doc.sectionVisibility?.showFreeNotes && doc.freeNotes);
      return {
        id,
        page: 1 as const,
        order: index + 1,
        visible: isVis,
      };
    });
  }

  // Filter to active visible blocks with non-zero height
  const visibleConfigs = blockConfigs
    .filter((b) => b.visible && blockHeights[b.id] > 0)
    .sort((a, b) => a.order - b.order);

  // If user has a manual custom layout:
  if (doc.isCustomBlockLayout) {
    const page1Custom = visibleConfigs.filter((b) => b.page === 1).map((b) => b.id);
    const page2Custom = visibleConfigs.filter((b) => b.page === 2).map((b) => b.id);

    const p1BlocksH = page1Custom.reduce((sum, id) => sum + blockHeights[id] + BLOCK_GAP_MM, 0);
    const p1Total = page1FixedH + p1BlocksH;
    const p1Spare = USABLE_PAGE_HEIGHT_MM - p1Total;

    const p2BlocksH = page2Custom.reduce((sum, id) => sum + blockHeights[id] + BLOCK_GAP_MM, 0);
    const p2Total = PAGE2_HEADER_BAND_MM + p2BlocksH;
    const p2Spare = USABLE_PAGE_HEIGHT_MM - p2Total;

    let hasViolation = false;
    let violationMsg = '';

    if (p1Spare < 0) {
      hasViolation = true;
      violationMsg = `Page 1 content overflows by ${Math.abs(Math.round(p1Spare))}mm. Move a block to Page 2.`;
    } else if (page2Custom.length > 0 && p2BlocksH < MIN_BLOCK_START_SPACE_MM) {
      hasViolation = true;
      violationMsg = `Page 2 content is too light (${Math.round(p2BlocksH)}mm < 25mm). Move another block to Page 2.`;
    }

    const totalPages = page2Custom.length > 0 ? 2 : 1;

    return {
      totalPages,
      page1Blocks: page1Custom,
      page2Blocks: page2Custom,
      page1Items: items,
      page2Items: [],
      page1Height: p1Total,
      page2Height: p2Total,
      page1SpareHeadroom: p1Spare,
      page2SpareHeadroom: p2Spare,
      blockHeights,
      activeBlocks: visibleConfigs,
      hasRuleViolation: hasViolation,
      ruleViolationMessage: violationMsg,
    };
  }

  // Automatic Flow Mode:
  // Step A: Check if all blocks fit on Page 1
  const totalBlocksH = visibleConfigs.reduce((sum, b) => sum + blockHeights[b.id] + BLOCK_GAP_MM, 0);
  const totalPage1Comfortable = page1FixedH + totalBlocksH;

  if (totalPage1Comfortable <= USABLE_PAGE_HEIGHT_MM) {
    // Fits on Page 1 naturally!
    const page1Blocks = visibleConfigs.map((b) => b.id);
    return {
      totalPages: 1,
      page1Blocks,
      page2Blocks: [],
      page1Items: items,
      page2Items: [],
      page1Height: totalPage1Comfortable,
      page2Height: 0,
      page1SpareHeadroom: USABLE_PAGE_HEIGHT_MM - totalPage1Comfortable,
      page2SpareHeadroom: USABLE_PAGE_HEIGHT_MM,
      blockHeights,
      activeBlocks: visibleConfigs.map((b) => ({ ...b, page: 1 })),
      hasRuleViolation: false,
    };
  }

  // Multi-page needed: Flow blocks to Page 2 in priority order:
  // Priority order of what moves first:
  // 1. notes
  // 2. inclusions_exclusions
  // 3. delivery_timeline
  // 4. terms_and_notes
  // 5. acceptance
  const candidateOrder: QuotationBlockId[] = [
    'notes',
    'inclusions_exclusions',
    'delivery_timeline',
    'terms_and_notes',
    'acceptance',
  ];

  const page2Blocks: QuotationBlockId[] = [];
  let remainingP1H = totalPage1Comfortable;

  for (const candId of candidateOrder) {
    const isPresent = visibleConfigs.some((b) => b.id === candId);
    if (isPresent && remainingP1H > USABLE_PAGE_HEIGHT_MM) {
      page2Blocks.push(candId);
      remainingP1H -= blockHeights[candId] + BLOCK_GAP_MM;
    }
  }

  // Balance Rule: Ensure Page 2 has at least 25mm of content
  const page2BlocksH = page2Blocks.reduce((sum, id) => sum + blockHeights[id] + BLOCK_GAP_MM, 0);
  if (page2Blocks.length > 0 && page2BlocksH < MIN_BLOCK_START_SPACE_MM) {
    // Move one more candidate if available
    for (const candId of candidateOrder) {
      if (!page2Blocks.includes(candId) && visibleConfigs.some((b) => b.id === candId)) {
        page2Blocks.push(candId);
        remainingP1H -= blockHeights[candId] + BLOCK_GAP_MM;
        break;
      }
    }
  }

  // If still overflowing because table has many rows (e.g. 15+ or 25 items):
  let splitItemIndex: number | undefined = undefined;
  let page1Items = items;
  let page2Items: LineItem[] = [];

  if (remainingP1H > USABLE_PAGE_HEIGHT_MM && items.length > 3) {
    // Calculate how many items fit on Page 1
    const p1NonItemH = remainingP1H - blockHeights.scope_table;
    const availableForTableP1 = USABLE_PAGE_HEIGHT_MM - p1NonItemH - TABLE_HEADER_MM;
    let accumulatedH = 0;
    let countP1 = 0;
    for (let i = 0; i < items.length; i++) {
      const rowH = (items[i].subDescription && items[i].subDescription?.trim()) ? 13.5 : 11;
      if (accumulatedH + rowH <= availableForTableP1 && i < items.length - 2) {
        accumulatedH += rowH;
        countP1++;
      } else {
        break;
      }
    }
    // Hard rule: keep at least 2 items above the TOTAL bar on Page 2
    splitItemIndex = Math.max(1, Math.min(countP1, items.length - 2));
    page1Items = items.slice(0, splitItemIndex);
    page2Items = items.slice(splitItemIndex);
  }

  const page1Blocks = visibleConfigs
    .filter((b) => !page2Blocks.includes(b.id))
    .map((b) => b.id);

  const finalP1H =
    page1FixedH +
    page1Blocks.reduce((sum, id) => {
      if (id === 'scope_table' && splitItemIndex !== undefined) {
        const p1TableH = TABLE_HEADER_MM + page1Items.reduce((s, it) => s + (it.subDescription ? 13.5 : 11), 0);
        return sum + p1TableH + BLOCK_GAP_MM;
      }
      return sum + blockHeights[id] + BLOCK_GAP_MM;
    }, 0);

  const finalP2H =
    PAGE2_HEADER_BAND_MM +
    page2Blocks.reduce((sum, id) => sum + blockHeights[id] + BLOCK_GAP_MM, 0) +
    (splitItemIndex !== undefined
      ? TABLE_HEADER_MM + page2Items.reduce((s, it) => s + (it.subDescription ? 13.5 : 11), 0) + BLOCK_GAP_MM
      : 0);

  const activeConfigs = visibleConfigs.map((b) => ({
    ...b,
    page: (page2Blocks.includes(b.id) ? 2 : 1) as 1 | 2,
  }));

  return {
    totalPages: page2Blocks.length > 0 || page2Items.length > 0 ? 2 : 1,
    page1Blocks,
    page2Blocks,
    splitItemIndex,
    page1Items,
    page2Items,
    page1Height: finalP1H,
    page2Height: finalP2H,
    page1SpareHeadroom: USABLE_PAGE_HEIGHT_MM - finalP1H,
    page2SpareHeadroom: USABLE_PAGE_HEIGHT_MM - finalP2H,
    blockHeights,
    activeBlocks: activeConfigs,
    hasRuleViolation: false,
  };
}

export function resolveQuotationPages(doc: BillingDocument, _business?: BusinessProfile): number[] {
  const layout = resolveQuotationLayout(doc);
  return layout.totalPages === 2 ? [1, 2] : [1];
}

