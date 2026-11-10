import React, { useMemo } from 'react';
import { BillingDocument, BusinessProfile, LineItem } from '../../../types';
import { DevrianLogoMark } from '../../common/DevrianLogoMark';
import { Watermark } from '../Watermark';
import { HeaderBand } from '../HeaderBand';
import { QuotationPreparedFor } from './QuotationPreparedFor';
import { QuotationScopeTable } from './QuotationScopeTable';
import { QuotationTotalsBlock } from './QuotationTotalsBlock';
import { QuotationInclusions } from './QuotationInclusions';
import { QuotationTimeline } from './QuotationTimeline';
import { QuotationPaymentBox } from './QuotationPaymentBox';
import { QuotationTerms } from './QuotationTerms';
import { QuotationAcceptanceBox } from './QuotationAcceptanceBox';
import { QuotationClosingAndSignature } from './QuotationClosingAndSignature';
import { QuotationFooter } from './QuotationFooter';

interface QuotationPreviewProps {
  document: BillingDocument;
  business: BusinessProfile;
  zoom?: number;
}

interface QuotationPageSlice {
  pageNumber: number;
  type: 'scope_and_totals' | 'scope_continued' | 'terms_and_acceptance' | 'single_page_all';
  items: LineItem[];
  startIndex: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  showTotals?: boolean;
  showContinuationNotice?: boolean;
}

export const QuotationPreview: React.FC<QuotationPreviewProps> = ({
  document: doc,
  business,
  zoom = 1,
}) => {
  const items = doc.items || [];
  const vis = doc.sectionVisibility;

  // Calculate Advance Amount and Balance Payable
  const discountAmount = doc.discountAmount || 0;
  const netTaxable = Math.max(0, doc.subtotal - discountAmount);
  const totalTaxAmount = doc.gstEnabled ? (doc.totalTaxAmount || 0) : 0;
  const totalProjectCost = netTaxable + totalTaxAmount;

  const advancePercent = doc.advancePercent ?? business.advancePercentDefault ?? 50;
  const advanceAmount =
    doc.advanceToStartWork !== undefined && doc.advanceToStartWork > 0
      ? doc.advanceToStartWork
      : doc.advanceType === 'flat' && doc.advanceReceived > 0
      ? doc.advanceReceived
      : Math.round((totalProjectCost * advancePercent) / 100);

  const balancePayable = Math.max(0, totalProjectCost - advanceAmount);

  // Pagination and Multi-Page Arrangement
  const { pages, smartScale } = useMemo(() => {
    const isForceOnePage = doc.layoutMode === 'force_one_page';

    const getItemHeight = (item: LineItem) => {
      const hasSub = Boolean(item.subDescription && item.subDescription.trim());
      return hasSub ? 14 : 9.5;
    };

    // If forced to 1 page explicitly
    if (isForceOnePage) {
      const page1FixedH = 62 + 16 + 22 + 8 + 12; // Header + Meta + PreparedFor + TableHeader + Footer
      const itemsTotalH = items.reduce((sum, item) => sum + getItemHeight(item), 0);
      const bottomBlockH = 34 + 20 + 14 + 24 + 32 + 24 + 18;
      const totalH = page1FixedH + itemsTotalH + bottomBlockH;
      const scale = Math.max(0.75, 297 / Math.max(297, totalH));

      return {
        pages: [
          {
            pageNumber: 1,
            type: 'single_page_all' as const,
            items: items,
            startIndex: 1,
            isFirstPage: true,
            isLastPage: true,
            showTotals: true,
            showContinuationNotice: false,
          },
        ],
        smartScale: scale,
      };
    }

    // DEFAULT 2-PAGE ARCHITECTURE
    // Available height for line items on Page 1 along with Header, Meta, Prepared For, and Totals
    // 297mm - Header (62mm) - Meta (16mm) - PreparedFor (22mm) - TableHeader (8mm) - TotalsBlock (36mm) - Bridge (10mm) - Footer (12mm) - Margin (15mm) = 116mm
    const p1AvailableH = 116;

    let p1Items: LineItem[] = [];
    let p1H = 0;
    let idx = 0;

    while (idx < items.length) {
      const h = getItemHeight(items[idx]);
      if (p1H + h <= p1AvailableH && p1Items.length < 8) {
        p1Items.push(items[idx]);
        p1H += h;
        idx++;
      } else {
        break;
      }
    }

    // Standard case: all items fit on Page 1 -> 2 Page Quotation (Page 1 = Scope & Summary, Page 2 = Terms & Acceptance)
    if (idx >= items.length) {
      return {
        pages: [
          {
            pageNumber: 1,
            type: 'scope_and_totals' as const,
            items: p1Items,
            startIndex: 1,
            isFirstPage: true,
            isLastPage: false,
            showTotals: true,
            showContinuationNotice: true,
          },
          {
            pageNumber: 2,
            type: 'terms_and_acceptance' as const,
            items: [],
            startIndex: items.length + 1,
            isFirstPage: false,
            isLastPage: true,
            showTotals: false,
            showContinuationNotice: false,
          },
        ],
        smartScale: 1.0,
      };
    }

    // Multi-page case: items overflow Page 1
    const result: QuotationPageSlice[] = [];
    result.push({
      pageNumber: 1,
      type: 'scope_and_totals' as const,
      items: p1Items,
      startIndex: 1,
      isFirstPage: true,
      isLastPage: false,
      showTotals: false,
      showContinuationNotice: false,
    });

    let currentItemIdx = p1Items.length;
    let pageNum = 2;

    while (currentItemIdx < items.length) {
      let nextBatch: LineItem[] = [];
      let batchH = 0;
      let testRemainingH = 0;
      for (let i = currentItemIdx; i < items.length; i++) {
        testRemainingH += getItemHeight(items[i]);
      }

      // If remaining items + totals block fit on current continued page
      if (testRemainingH + 36 <= 230) {
        result.push({
          pageNumber: pageNum,
          type: 'scope_continued' as const,
          items: items.slice(currentItemIdx),
          startIndex: currentItemIdx + 1,
          isFirstPage: false,
          isLastPage: false,
          showTotals: true,
          showContinuationNotice: true,
        });
        pageNum++;
        break;
      } else {
        while (currentItemIdx < items.length) {
          const h = getItemHeight(items[currentItemIdx]);
          if (batchH + h <= 220) {
            nextBatch.push(items[currentItemIdx]);
            batchH += h;
            currentItemIdx++;
          } else {
            break;
          }
        }
        if (nextBatch.length === 0 && currentItemIdx < items.length) {
          nextBatch.push(items[currentItemIdx]);
          currentItemIdx++;
        }
        const hasConsumedAll = currentItemIdx >= items.length;
        result.push({
          pageNumber: pageNum,
          type: 'scope_continued' as const,
          items: nextBatch,
          startIndex: currentItemIdx - nextBatch.length + 1,
          isFirstPage: false,
          isLastPage: false,
          showTotals: hasConsumedAll,
          showContinuationNotice: hasConsumedAll,
        });
        pageNum++;
      }
    }

    // Final Page: Terms, Inclusions, Timeline, Payment & Acceptance
    result.push({
      pageNumber: pageNum,
      type: 'terms_and_acceptance' as const,
      items: [],
      startIndex: items.length + 1,
      isFirstPage: false,
      isLastPage: true,
      showTotals: false,
      showContinuationNotice: false,
    });

    return {
      pages: result,
      smartScale: 1.0,
    };
  }, [items, doc.layoutMode, vis, doc.inclusions, doc.exclusions, doc.deliveryTimeline, doc.notes, doc.applySignature]);

  const totalPages = pages.length;

  return (
    <div
      className="flex flex-col items-center gap-8 py-6 transition-transform origin-top select-none"
      style={{
        transform: zoom !== 1 ? `scale(${zoom})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {pages.map((page) => (
        <div
          key={page.pageNumber}
          id={`a4-page-${page.pageNumber}`}
          className="a4-page-export relative bg-white text-[#0E0E0E] shadow-[0_12px_36px_rgba(0,0,0,0.18)] flex flex-col justify-between"
          style={{
            width: '210mm',
            height: '297mm',
            minHeight: '297mm',
            maxHeight: '297mm',
            boxSizing: 'border-box',
          }}
        >
          {/* Subtle Watermark (Settings toggle, default OFF) */}
          <Watermark
            enabled={business.showWatermark}
            opacity={business.watermarkOpacity ?? 0.025}
          />

          {/* PAGE CONTENT CONTAINER */}
          <div
            className="relative z-10 flex-1 flex flex-col"
            style={
              smartScale < 1.0
                ? {
                    transform: `scale(${smartScale})`,
                    transformOrigin: 'top center',
                    width: '100%',
                  }
                : undefined
            }
          >
            {/* PAGE 1: SCOPE OF WORK & FINANCIAL SUMMARY */}
            {page.type === 'scope_and_totals' && (
              <>
                {/* 1. Header Band with #0E0E0E background, large white wordmark, contact & udyam lines */}
                <HeaderBand
                  type="quotation"
                  business={business}
                  customText={doc.customText}
                  logoUrl={business.logoDataUrl}
                  whiteLogoUrl={business.whiteLogoDataUrl}
                  wordmarkScale={business.wordmarkScale}
                  showHeaderShapes={business.showHeaderShapes}
                />

                {/* 2. Prepared For (consistent with PartyColumns on Invoice & Receipt) */}
                <QuotationPreparedFor
                  clientName={doc.clientName}
                  projectName={doc.projectName}
                  contactPerson={doc.clientContactPerson}
                  clientAddress={doc.clientAddress}
                  clientPhone={doc.clientPhone}
                  clientEmail={doc.clientEmail}
                  clientGstin={doc.clientGstin}
                  customHeading={doc.customText?.clientSectionHeading || 'PREPARED FOR'}
                />

                {/* 4. Scope of Work Table */}
                {page.items.length > 0 && (
                  <div className="w-full">
                    <QuotationScopeTable
                      items={page.items}
                      startIndex={page.startIndex}
                      customText={doc.customText}
                    />
                  </div>
                )}

                {/* 5. Summary / Totals Table */}
                {page.showTotals && (
                  <QuotationTotalsBlock
                    subtotal={doc.subtotal}
                    discountAmount={doc.discountAmount}
                    discountType={doc.discountType}
                    discountValue={doc.discountValue}
                    gstEnabled={doc.gstEnabled}
                    gstRate={doc.gstRate}
                    gstType={doc.gstType}
                    cgstAmount={doc.cgstAmount}
                    sgstAmount={doc.sgstAmount}
                    igstAmount={doc.igstAmount}
                    totalTaxAmount={doc.totalTaxAmount}
                    advanceAmount={advanceAmount}
                    advancePercent={advancePercent}
                    advanceType={doc.advanceType}
                    balancePayable={balancePayable}
                    customText={doc.customText}
                    visibility={doc.sectionVisibility}
                  />
                )}

                {/* 6. Continued on Page 2 Bridge Notice */}
                {page.showContinuationNotice && (
                  <div
                    className="w-full box-border mt-auto mb-2"
                    style={{
                      paddingLeft: '18mm',
                      paddingRight: '18mm',
                      paddingTop: '2mm',
                    }}
                  >
                    <div
                      className="flex items-center justify-between pt-2 border-t border-[#E5E5E5]"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '7.2pt',
                        color: '#71717A',
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0E0E0E]" />
                        <span className="font-medium tracking-wider uppercase text-[#52525B]">
                          Inclusions, Exclusions, Delivery Timeline, Terms &amp; Acceptance
                        </span>
                      </div>
                      <span className="font-semibold text-[#0E0E0E] tracking-wider uppercase">
                        Detailed on Page 2 &rarr;
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* CONTINUED SCOPE PAGE (if items overflow Page 1) */}
            {page.type === 'scope_continued' && (
              <>
                {/* Sleek Continued Header matching DocumentPreview */}
                <div
                  className="border-b border-[#2A2A2A] flex justify-between items-center bg-[#0E0E0E] text-white box-border shrink-0"
                  style={{
                    height: '18mm',
                    paddingLeft: '18mm',
                    paddingRight: '18mm',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <DevrianLogoMark
                      logoUrl={business.logoDataUrl}
                      whiteLogoUrl={business.whiteLogoDataUrl}
                      scale={0.7}
                    />
                    <span className="text-[#555555]">·</span>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                        fontSize: '7.5pt',
                        color: '#E5E5E5',
                        letterSpacing: '0.15em',
                        wordSpacing: '0.4em',
                        textTransform: 'uppercase',
                      }}
                    >
                      QUOTATION {doc.documentNumber} (Contd.)
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500,
                      fontSize: '7pt',
                      color: '#9CA3AF',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Page {page.pageNumber} of {totalPages}
                  </div>
                </div>

                {/* Scope of Work Table */}
                {page.items.length > 0 && (
                  <div className="w-full">
                    <QuotationScopeTable
                      items={page.items}
                      startIndex={page.startIndex}
                      customText={doc.customText}
                    />
                  </div>
                )}

                {/* Summary / Totals Table if finished on this page */}
                {page.showTotals && (
                  <QuotationTotalsBlock
                    subtotal={doc.subtotal}
                    discountAmount={doc.discountAmount}
                    discountType={doc.discountType}
                    discountValue={doc.discountValue}
                    gstEnabled={doc.gstEnabled}
                    gstRate={doc.gstRate}
                    gstType={doc.gstType}
                    cgstAmount={doc.cgstAmount}
                    sgstAmount={doc.sgstAmount}
                    igstAmount={doc.igstAmount}
                    totalTaxAmount={doc.totalTaxAmount}
                    advanceAmount={advanceAmount}
                    advancePercent={advancePercent}
                    advanceType={doc.advanceType}
                    balancePayable={balancePayable}
                    customText={doc.customText}
                    visibility={doc.sectionVisibility}
                  />
                )}

                {page.showContinuationNotice && (
                  <div
                    className="w-full box-border mt-auto mb-2"
                    style={{
                      paddingLeft: '18mm',
                      paddingRight: '18mm',
                      paddingTop: '2mm',
                    }}
                  >
                    <div
                      className="flex items-center justify-between pt-2 border-t border-[#E5E5E5]"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '7.2pt',
                        color: '#71717A',
                      }}
                    >
                      <span className="font-medium tracking-wider uppercase text-[#52525B]">
                        Inclusions, Exclusions, Delivery Timeline, Terms &amp; Acceptance
                      </span>
                      <span className="font-semibold text-[#0E0E0E] tracking-wider uppercase">
                        Detailed on Next Page &rarr;
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* PAGE 2: DELIVERABLE SCOPE, TERMS & ACCEPTANCE */}
            {page.type === 'terms_and_acceptance' && (
              <>
                {/* Sleek Continued Header matching DocumentPreview */}
                <div
                  className="border-b border-[#2A2A2A] flex justify-between items-center bg-[#0E0E0E] text-white box-border shrink-0"
                  style={{
                    height: '18mm',
                    paddingLeft: '18mm',
                    paddingRight: '18mm',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <DevrianLogoMark
                      logoUrl={business.logoDataUrl}
                      whiteLogoUrl={business.whiteLogoDataUrl}
                      scale={0.7}
                    />
                    <span className="text-[#555555]">·</span>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                        fontSize: '7.5pt',
                        color: '#E5E5E5',
                        letterSpacing: '0.15em',
                        wordSpacing: '0.4em',
                        textTransform: 'uppercase',
                      }}
                    >
                      QUOTATION {doc.documentNumber} (Contd.)
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 500,
                      fontSize: '7pt',
                      color: '#9CA3AF',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Page {page.pageNumber} of {totalPages}
                  </div>
                </div>

                {/* Page 2 Content Container */}
                <div
                  className="flex-1 flex flex-col justify-start space-y-[2.6mm] box-border"
                  style={{
                    paddingTop: '3mm',
                    paddingBottom: '2mm',
                  }}
                >
                  {/* 1. Inclusions & Exclusions */}
                  {(vis.showInclusions ?? true) && (
                    <QuotationInclusions
                      inclusions={doc.inclusions}
                      exclusions={doc.exclusions}
                    />
                  )}

                  {/* 2. Delivery Timeline */}
                  {(vis.showTimeline ?? true) && (
                    <QuotationTimeline timeline={doc.deliveryTimeline} />
                  )}

                  {/* 3. Payment Details Card */}
                  {vis.showPaymentDetails && (
                    <QuotationPaymentBox
                      business={business}
                      paymentRows={doc.paymentRows}
                      advanceAmount={advanceAmount}
                      quotationNumber={doc.documentNumber}
                      showQr={vis.showUpiQr || doc.paymentDetails.showQrOnDoc}
                    />
                  )}

                  {/* 4. Terms & Notes */}
                  {vis.showTermsAndNotes && (
                    <QuotationTerms
                      notes={doc.notes}
                      heading={doc.customText?.termsSectionHeading || 'TERMS & CONDITIONS'}
                    />
                  )}

                  {/* 5. Acceptance Box */}
                  {(vis.showAcceptance ?? true) && (
                    <QuotationAcceptanceBox
                      showClientSignature={vis.showClientSignature ?? true}
                      clientName={doc.clientName}
                    />
                  )}

                  {/* 6. Closing Line & Signature Block with Dates at the bottom */}
                  <QuotationClosingAndSignature
                    documentNumber={doc.documentNumber}
                    date={doc.date}
                    validTill={doc.validTill}
                    closingLine={doc.closingLine}
                    signatureUrl={business.signatureDataUrl}
                    applySignature={doc.applySignature}
                    isFinal={doc.isFinal}
                    customText={doc.customText}
                    visibility={doc.sectionVisibility}
                  />
                </div>
              </>
            )}

            {/* SINGLE PAGE FALLBACK (only if layoutMode === 'force_one_page') */}
            {page.type === 'single_page_all' && (
              <>
                <HeaderBand
                  type="quotation"
                  business={business}
                  customText={doc.customText}
                  logoUrl={business.logoDataUrl}
                  whiteLogoUrl={business.whiteLogoDataUrl}
                  wordmarkScale={business.wordmarkScale}
                  showHeaderShapes={business.showHeaderShapes}
                />
                <QuotationPreparedFor
                  clientName={doc.clientName}
                  projectName={doc.projectName}
                  contactPerson={doc.clientContactPerson}
                  clientAddress={doc.clientAddress}
                  clientPhone={doc.clientPhone}
                  clientEmail={doc.clientEmail}
                  clientGstin={doc.clientGstin}
                  customHeading={doc.customText?.clientSectionHeading || 'PREPARED FOR'}
                />
                {page.items.length > 0 && (
                  <div className="w-full">
                    <QuotationScopeTable
                      items={page.items}
                      startIndex={page.startIndex}
                      customText={doc.customText}
                    />
                  </div>
                )}
                <div className="w-full space-y-[1mm]">
                  <QuotationTotalsBlock
                    subtotal={doc.subtotal}
                    discountAmount={doc.discountAmount}
                    discountType={doc.discountType}
                    discountValue={doc.discountValue}
                    gstEnabled={doc.gstEnabled}
                    gstRate={doc.gstRate}
                    gstType={doc.gstType}
                    cgstAmount={doc.cgstAmount}
                    sgstAmount={doc.sgstAmount}
                    igstAmount={doc.igstAmount}
                    totalTaxAmount={doc.totalTaxAmount}
                    advanceAmount={advanceAmount}
                    advancePercent={advancePercent}
                    advanceType={doc.advanceType}
                    balancePayable={balancePayable}
                    customText={doc.customText}
                    visibility={doc.sectionVisibility}
                  />
                  {(vis.showInclusions ?? true) && (
                    <QuotationInclusions
                      inclusions={doc.inclusions}
                      exclusions={doc.exclusions}
                    />
                  )}
                  {(vis.showTimeline ?? true) && (
                    <QuotationTimeline timeline={doc.deliveryTimeline} />
                  )}
                  {vis.showPaymentDetails && (
                    <QuotationPaymentBox
                      business={business}
                      paymentRows={doc.paymentRows}
                      advanceAmount={advanceAmount}
                      quotationNumber={doc.documentNumber}
                      showQr={vis.showUpiQr || doc.paymentDetails.showQrOnDoc}
                    />
                  )}
                  {vis.showTermsAndNotes && (
                    <QuotationTerms
                      notes={doc.notes}
                      heading={doc.customText?.termsSectionHeading || 'TERMS & CONDITIONS'}
                    />
                  )}
                  {(vis.showAcceptance ?? true) && (
                    <QuotationAcceptanceBox
                      showClientSignature={vis.showClientSignature ?? true}
                      clientName={doc.clientName}
                    />
                  )}
                  <QuotationClosingAndSignature
                    documentNumber={doc.documentNumber}
                    date={doc.date}
                    validTill={doc.validTill}
                    closingLine={doc.closingLine}
                    signatureUrl={business.signatureDataUrl}
                    applySignature={doc.applySignature}
                    isFinal={doc.isFinal}
                    customText={doc.customText}
                    visibility={doc.sectionVisibility}
                  />
                </div>
              </>
            )}
          </div>

          {/* 7. Quotation Document Footer on every page */}
          <div className="relative z-10 mt-auto">
            <QuotationFooter
              documentNumber={doc.documentNumber}
              udyamNo={business.udyamNo || 'UDYAM-UP-54-0127731'}
              email={business.email || 'inquiry@devrian.in'}
              currentPage={page.pageNumber}
              totalPages={totalPages}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
