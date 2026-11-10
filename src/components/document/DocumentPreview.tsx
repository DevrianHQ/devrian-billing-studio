import React, { useMemo } from 'react';
import { BillingDocument, BusinessProfile, LineItem } from '../../types';
import { DevrianLogoMark } from '../common/DevrianLogoMark';
import { HeaderBand } from './HeaderBand';
import { MetaRow } from './MetaRow';
import { PartyColumns } from './PartyColumns';
import { LineItemsTable } from './LineItemsTable';
import { TotalsBlock } from './TotalsBlock';
import { PaymentBox } from './PaymentBox';
import { NoteBox } from './NoteBox';
import { SignatureBlock } from './SignatureBlock';
import { DocumentFooter } from './DocumentFooter';
import { Watermark } from './Watermark';
import { QuotationPreview } from '../../modules/quotation';

interface DocumentPreviewProps {
  document: BillingDocument;
  business: BusinessProfile;
  zoom?: number;
  onUpdateDoc?: (doc: BillingDocument) => void;
  onOpenPlanner?: () => void;
}

interface PageSlice {
  pageNumber: number;
  items: LineItem[];
  startIndex: number;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document: doc,
  business,
  zoom = 1,
  onUpdateDoc,
}) => {
  // If Quotation, delegate to dedicated QuotationPreview (guarantees zero regression on Invoice & Receipt)
  if (doc.type === 'quotation') {
    return (
      <QuotationPreview
        document={doc}
        business={business}
        zoom={zoom}
      />
    );
  }

  // Title handling (respects customText override or GST mode)
  const documentTitle = useMemo(() => {
    if (doc.customText?.documentTitle) {
      if (doc.type === 'invoice' && doc.gstEnabled && doc.customText.documentTitle === 'INVOICE') {
        return 'TAX INVOICE';
      }
      return doc.customText.documentTitle;
    }
    if (doc.type === 'invoice') {
      return doc.gstEnabled ? 'TAX INVOICE' : 'INVOICE';
    }
    if (doc.type === 'receipt') {
      return 'PAYMENT RECEIPT';
    }
    return 'QUOTATION';
  }, [doc.customText?.documentTitle, doc.type, doc.gstEnabled]);

  // Smart Fit & Pagination calculation
  const { pages, smartScale, overflowMm, density } = useMemo(() => {
    const items = doc.items || [];
    const isReceipt = doc.type === 'receipt';
    const isForceOnePage = doc.layoutMode === 'force_one_page';

    // Estimate item height in mm
    const getItemHeight = (item: LineItem, d: 'comfortable' | 'compact' | 'tight') => {
      const hasSub = Boolean(item.subDescription && item.subDescription.trim());
      if (d === 'tight') return hasSub ? 9.5 : 7;
      if (d === 'compact') return hasSub ? 11.5 : 8.5;
      return hasSub ? 14 : 9.5;
    };

    // Fixed page 1 header, party columns, table header, footer (MetaRow moved to bottom)
    const page1Fixed = 58 + 24 + 8.5 + 10; // ~100.5mm

    // Bottom block height on the last page
    const totalsHeight = 25;
    const paymentHeight = doc.sectionVisibility.showPaymentDetails ? 26 : 0;
    const termsCount = doc.sectionVisibility.showTermsAndNotes ? (doc.notes?.length || 0) : 0;
    const termsHeight = doc.sectionVisibility.showTermsAndNotes && termsCount > 0
      ? (isReceipt ? 22 : 12 + termsCount * 4)
      : 0;
    const closingHeight = doc.sectionVisibility.showClosingLine ? 7 : 0;
    const signatureHeight = (doc.sectionVisibility.showSignature || doc.applySignature) ? 18 : 0;
    const bottomBlockHeight = totalsHeight + paymentHeight + termsHeight + closingHeight + signatureHeight;

    // Total content height if 1 page at 'comfortable'
    const totalComfortable = page1Fixed + items.reduce((sum, item) => sum + getItemHeight(item, 'comfortable'), 0) + bottomBlockHeight;

    // 1. FORCE ONE PAGE MODE:
    if (isForceOnePage) {
      let selectedDensity: 'comfortable' | 'compact' | 'tight' = 'comfortable';
      let estTotal = totalComfortable;

      if (estTotal > 297) {
        selectedDensity = 'compact';
        estTotal = page1Fixed + items.reduce((sum, item) => sum + getItemHeight(item, 'compact'), 0) + bottomBlockHeight;
      }
      if (estTotal > 297) {
        selectedDensity = 'tight';
        estTotal = page1Fixed + items.reduce((sum, item) => sum + getItemHeight(item, 'tight'), 0) + bottomBlockHeight;
      }

      // Calculate uniform scale (min 88%)
      let scale = 1.0;
      if (estTotal > 297) {
        scale = Math.max(0.88, 297 / estTotal);
      }

      const effectiveHeight = estTotal * scale;
      const overflow = effectiveHeight > 297 ? Math.round(effectiveHeight - 297) : 0;

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
        smartScale: scale,
        overflowMm: overflow,
        density: selectedDensity,
      };
    }

    // 2. AUTO MODE (default):
    // Check if fits on 1 page with comfortable, compact, or tight (or overflow under 12mm)
    if (totalComfortable <= 297) {
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
        overflowMm: 0,
        density: 'comfortable',
      };
    }

    const totalCompact = page1Fixed + items.reduce((sum, item) => sum + getItemHeight(item, 'compact'), 0) + bottomBlockHeight;
    if (totalCompact <= 297) {
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
        overflowMm: 0,
        density: 'compact',
      };
    }

    const totalTight = page1Fixed + items.reduce((sum, item) => sum + getItemHeight(item, 'tight'), 0) + bottomBlockHeight;
    // If overflow is under 12mm, apply Smart Fit scale instead of creating a nearly empty page
    if (totalTight <= 297 || totalTight <= 309) {
      const scale = Math.max(0.88, 297 / totalTight);
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
        smartScale: scale,
        overflowMm: 0,
        density: 'tight',
      };
    }

    // Multi-page layout:
    // Page 1 takes up to 180mm of items
    const result: PageSlice[] = [];
    let p1Items: LineItem[] = [];
    let p1H = 0;
    let idx = 0;
    while (idx < items.length) {
      const h = getItemHeight(items[idx], 'comfortable');
      if (p1H + h <= 180 && idx < 12) {
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
        testH += getItemHeight(items[i], 'comfortable');
        if (testH + bottomBlockHeight <= 250) {
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
        idx = items.length;
      } else {
        let pageItems: LineItem[] = [];
        let curH = 0;
        while (idx < items.length) {
          const h = getItemHeight(items[idx], 'comfortable');
          if (curH + h <= 250 && (items.length - idx > 1 || curH + h + bottomBlockHeight > 250)) {
            pageItems.push(items[idx]);
            curH += h;
            idx++;
          } else {
            break;
          }
        }
        if (pageItems.length === 0) {
          pageItems.push(items[idx]);
          idx++;
        }
        result.push({
          pageNumber: pageNum,
          items: pageItems,
          startIndex: idx - pageItems.length + 1,
          isFirstPage: false,
          isLastPage: false,
        });
        pageNum++;
      }
    }

    if (result.length > 0) {
      result[result.length - 1].isLastPage = true;
    }

    return {
      pages: result,
      smartScale: 1.0,
      overflowMm: 0,
      density: 'comfortable',
    };
  }, [doc.items, doc.type, doc.layoutMode, doc.sectionVisibility, doc.notes, doc.applySignature]);

  const totalPages = pages.length;

  return (
    <div
      className="flex flex-col items-center gap-8 py-6 transition-transform origin-top"
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
          {/* Subtle 2.5% opacity angular "D" Watermark (Settings toggle, default OFF) */}
          <Watermark
            enabled={business.showWatermark}
            opacity={business.watermarkOpacity ?? 0.025}
          />

          {/* PAGE CONTENT */}
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
            {/* Header: full header on Page 1, compact repeated top header on subsequent pages */}
            {page.isFirstPage ? (
              <>
                <HeaderBand
                  type={doc.type}
                  business={business}
                  customText={{ ...doc.customText, documentTitle }}
                  logoUrl={business.logoDataUrl}
                  whiteLogoUrl={business.whiteLogoDataUrl}
                  wordmarkScale={business.wordmarkScale}
                  showHeaderShapes={business.showHeaderShapes}
                  accentColor={business.accentColor}
                />
                <PartyColumns
                  type={doc.type}
                  business={business}
                  customText={doc.customText}
                  clientName={doc.clientName}
                  projectName={doc.projectName}
                  contactPerson={doc.clientContactPerson}
                  clientAddress={doc.clientAddress}
                  clientPhone={doc.clientPhone}
                  clientEmail={doc.clientEmail}
                  clientGstin={doc.clientGstin}
                  gstEnabled={doc.gstEnabled}
                />
              </>
            ) : (
              /* Subsequent Page Slim Repeated Header (18mm) */
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
                    {documentTitle} {doc.documentNumber} (Contd.)
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

            {/* Line Items Table */}
            {page.items.length > 0 && (
              <div className="w-full">
                <LineItemsTable
                  type={doc.type}
                  items={page.items}
                  customText={doc.customText}
                  startIndex={page.startIndex}
                />
              </div>
            )}

            {/* Bottom block only on the LAST page */}
            {page.isLastPage && (
              <div className="w-full space-y-[1.2mm]">
                <TotalsBlock
                  type={doc.type}
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
                  advanceReceived={doc.advanceReceived}
                  totalProjectCost={doc.totalProjectCost}
                  balanceDue={doc.balanceDue}
                  amountReceived={doc.amountReceived}
                  advanceToStartWork={doc.advanceToStartWork}
                  customText={doc.customText}
                  visibility={doc.sectionVisibility}
                  accentColor={business.accentColor}
                />

                <PaymentBox
                  type={doc.type}
                  business={business}
                  paymentDetails={doc.paymentDetails}
                  paymentRows={doc.paymentRows}
                  balanceAmount={doc.balanceDue}
                  documentNumber={doc.documentNumber}
                  customText={doc.customText}
                  visibility={doc.sectionVisibility}
                />

                <NoteBox
                  type={doc.type}
                  notes={doc.notes}
                  gstEnabled={doc.gstEnabled}
                  customText={doc.customText}
                  visibility={doc.sectionVisibility}
                />

                <SignatureBlock
                  type={doc.type}
                  documentNumber={doc.documentNumber}
                  date={doc.date}
                  dueDate={doc.dueDate}
                  signatureUrl={business.signatureDataUrl}
                  applySignature={doc.applySignature}
                  customText={doc.customText}
                  visibility={doc.sectionVisibility}
                />
              </div>
            )}
          </div>

          {/* Consistent Footer on EVERY page */}
          <div className="relative z-10 mt-auto">
            <DocumentFooter
              type={doc.type}
              documentNumber={doc.documentNumber}
              udyamNo={business.udyamNo}
              email={business.email}
              currentPage={page.pageNumber}
              totalPages={totalPages}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
