import React, { useMemo } from 'react';
import { BillingDocument, BusinessProfile, LineItem } from '../../../types';
import { DevrianLogoMark } from '../../common/DevrianLogoMark';
import { Watermark } from '../Watermark';
import { HeaderBand } from '../HeaderBand';
import { QuotationMetaRow } from './QuotationMetaRow';
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
  items: LineItem[];
  startIndex: number;
  isFirstPage: boolean;
  isLastPage: boolean;
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

  // Pagination and Smart Fit
  const { pages, smartScale } = useMemo(() => {
    const isForceOnePage = doc.layoutMode === 'force_one_page';

    // Height calculation
    const page1FixedH = 58 + 14 + 18 + 8 + 8; // Header + Meta + PreparedFor + TableHeader + Footer = 106mm
    const getItemHeight = (item: LineItem) => {
      const hasSub = Boolean(item.subDescription && item.subDescription.trim());
      return hasSub ? 12 : 8.5;
    };

    const itemsTotalH = items.reduce((sum, item) => sum + getItemHeight(item), 0);

    // Bottom block height on the last page
    const totalsH = 32;
    const inclusionsH = (vis.showInclusions ?? true) && (doc.inclusions || doc.exclusions) ? 18 : 0;
    const timelineH = (vis.showTimeline ?? true) && doc.deliveryTimeline ? 12 : 0;
    const paymentH = vis.showPaymentDetails ? 22 : 0;
    const termsCount = vis.showTermsAndNotes ? (doc.notes?.length || 0) : 0;
    const termsH = vis.showTermsAndNotes && termsCount > 0 ? 12 + termsCount * 3.5 : 0;
    const acceptanceH = (vis.showAcceptance ?? true) ? 24 : 0;
    const signatureH = (vis.showSignature ?? true) || doc.applySignature ? 18 : 0;

    const bottomBlockH =
      totalsH + inclusionsH + timelineH + paymentH + termsH + acceptanceH + signatureH;

    const total1PageH = page1FixedH + itemsTotalH + bottomBlockH;

    // 1. Fits in 1 page at 100% scale
    if (total1PageH <= 297 && !isForceOnePage) {
      return {
        pages: [
          {
            pageNumber: 1,
            items: items,
            startIndex: 1,
            isFirstPage: true,
            isLastPage: true,
          },
        ],
        smartScale: 1.0,
      };
    }

    // 2. Fits with Smart Fit scale down to 88% (or force one page)
    if (isForceOnePage || total1PageH <= 335) {
      const scale = Math.max(0.88, 297 / total1PageH);
      return {
        pages: [
          {
            pageNumber: 1,
            items: items,
            startIndex: 1,
            isFirstPage: true,
            isLastPage: true,
          },
        ],
        smartScale: isForceOnePage ? scale : Math.max(0.88, scale),
      };
    }

    // 3. Multi-page layout
    const result: QuotationPageSlice[] = [];
    let p1Items: LineItem[] = [];
    let p1H = 0;
    let idx = 0;

    while (idx < items.length) {
      const h = getItemHeight(items[idx]);
      if (p1H + h <= 170 && idx < 12) {
        p1Items.push(items[idx]);
        p1H += h;
        idx++;
      } else {
        break;
      }
    }

    if (p1Items.length === 0 && items.length > 0) {
      p1Items.push(items[0]);
      idx = 1;
    }

    result.push({
      pageNumber: 1,
      items: p1Items,
      startIndex: 1,
      isFirstPage: true,
      isLastPage: false,
    });

    let pageNum = 2;
    while (idx < items.length) {
      const remainingItems = items.length - idx;
      let testH = 0;
      let countFitting = 0;

      for (let i = idx; i < items.length; i++) {
        testH += getItemHeight(items[i]);
        if (testH + bottomBlockH <= 245) {
          countFitting++;
        }
      }

      if (countFitting === remainingItems) {
        result.push({
          pageNumber: pageNum,
          items: items.slice(idx),
          startIndex: idx + 1,
          isFirstPage: false,
          isLastPage: true,
        });
        break;
      } else {
        let pItems: LineItem[] = [];
        let pH = 0;
        while (idx < items.length) {
          const h = getItemHeight(items[idx]);
          if (pH + h <= 240) {
            pItems.push(items[idx]);
            pH += h;
            idx++;
          } else {
            break;
          }
        }
        if (pItems.length === 0 && idx < items.length) {
          pItems.push(items[idx]);
          idx++;
        }

        const isLast = idx >= items.length;
        result.push({
          pageNumber: pageNum,
          items: pItems,
          startIndex: idx - pItems.length + 1,
          isFirstPage: false,
          isLastPage: isLast,
        });
        pageNum++;
      }
    }

    // If all items consumed on p1 but didn't fit bottom block, add dedicated last page
    if (result.length === 1 && !result[0].isLastPage) {
      result.push({
        pageNumber: 2,
        items: [],
        startIndex: items.length + 1,
        isFirstPage: false,
        isLastPage: true,
      });
    }

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
            {page.isFirstPage ? (
              <>
                {/* 1. Header Band with #0E0E0E background, large white wordmark, contact & udyam lines */}
                <HeaderBand
                  type="quotation"
                  business={business}
                  customText={{
                    ...doc.customText,
                    documentTitle: 'QUOTATION',
                    eyebrow: 'QUOTATION',
                  }}
                  logoUrl={business.logoDataUrl}
                  whiteLogoUrl={business.whiteLogoDataUrl}
                  wordmarkScale={business.wordmarkScale}
                  showHeaderShapes={business.showHeaderShapes}
                  accentColor={business.accentColor || '#0E0E0E'}
                />

                {/* 2. Quotation Meta Row */}
                <QuotationMetaRow
                  documentNumber={doc.documentNumber}
                  date={doc.date}
                  validTill={doc.validTill}
                  projectName={doc.projectName}
                  status={doc.status}
                />

                {/* 3. Prepared For */}
                <QuotationPreparedFor
                  clientName={doc.clientName}
                  contactPerson={doc.clientContactPerson}
                  clientAddress={doc.clientAddress}
                  clientPhone={doc.clientPhone}
                  clientEmail={doc.clientEmail}
                  clientGstin={doc.clientGstin}
                  customHeading={doc.customText?.clientSectionHeading || 'PREPARED FOR'}
                />
              </>
            ) : (
              /* Slim Repeated Header on Subsequent Pages (18mm) */
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
            )}

            {/* 4. Scope of Work Table */}
            {page.items.length > 0 && (
              <div className="w-full">
                <QuotationScopeTable items={page.items} startIndex={page.startIndex} />
              </div>
            )}

            {/* BOTTOM SECTIONS ONLY ON LAST PAGE */}
            {page.isLastPage && (
              <div className="w-full space-y-[1mm]">
                {/* 5. Summary Table */}
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

                {/* 6. Inclusions & Exclusions */}
                {(vis.showInclusions ?? true) && (
                  <QuotationInclusions
                    inclusions={doc.inclusions}
                    exclusions={doc.exclusions}
                  />
                )}

                {/* 7. Delivery Timeline */}
                {(vis.showTimeline ?? true) && (
                  <QuotationTimeline timeline={doc.deliveryTimeline} />
                )}

                {/* 8. Payment Details Table */}
                {vis.showPaymentDetails && (
                  <QuotationPaymentBox
                    business={business}
                    paymentRows={doc.paymentRows}
                    advanceAmount={advanceAmount}
                    quotationNumber={doc.documentNumber}
                    showQr={vis.showUpiQr || doc.paymentDetails.showQrOnDoc}
                  />
                )}

                {/* 9. Terms & Notes */}
                {vis.showTermsAndNotes && (
                  <QuotationTerms
                    notes={doc.notes}
                    heading={doc.customText?.termsSectionHeading || 'TERMS & CONDITIONS'}
                  />
                )}

                {/* 10. Acceptance Box */}
                {(vis.showAcceptance ?? true) && (
                  <QuotationAcceptanceBox
                    showClientSignature={vis.showClientSignature ?? true}
                    clientName={doc.clientName}
                  />
                )}

                {/* 11 & 12. Closing Line & Signature Block */}
                <QuotationClosingAndSignature
                  documentNumber={doc.documentNumber}
                  date={doc.date}
                  closingLine={doc.closingLine}
                  signatureUrl={business.signatureDataUrl}
                  applySignature={doc.applySignature}
                  isFinal={doc.isFinal}
                  customText={doc.customText}
                  visibility={doc.sectionVisibility}
                />
              </div>
            )}
          </div>

          {/* 13. Quotation Document Footer on every page */}
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
