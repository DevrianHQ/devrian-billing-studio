import React, { useMemo } from 'react';
import {
  BillingDocument,
  BusinessProfile,
  QuotationBlockId,
  QuotationType,
} from '../../../types';
import { DevrianLogoMark } from '../../common/DevrianLogoMark';
import { HeaderBand } from '../HeaderBand';
import { QuotationMetaRow } from './QuotationMetaRow';
import { QuotationPartyRow } from './QuotationPartyRow';
import { QuotationDeliverablesBlock } from './QuotationDeliverablesBlock';
import { QuotationScopeTable } from './QuotationScopeTable';
import { QuotationBillingStrip } from './QuotationBillingStrip';
import { QuotationBottomBlock } from './QuotationBottomBlock';
import { QuotationTerms } from './QuotationTerms';
import { QuotationAcceptanceCompact } from './QuotationAcceptanceCompact';
import { QuotationInclusions } from './QuotationInclusions';
import { QuotationTimeline } from './QuotationTimeline';
import { QuotationFreeNotes } from './QuotationFreeNotes';
import { QuotationFooter } from './QuotationFooter';
import {
  calculateQuotationFinancials,
  resolveQuotationLayout,
  PAGE1_HEADER_BAND_MM,
  PAGE2_HEADER_BAND_MM,
  USABLE_PAGE_HEIGHT_MM,
} from '../../../services/quotationLayoutEngine';
import { getQuotationEyebrow } from '../../../services/seedData';

interface QuotationPreviewProps {
  document: BillingDocument;
  business: BusinessProfile;
  zoom?: number;
  showDebugBudget?: boolean;
}

export const QuotationPreview: React.FC<QuotationPreviewProps> = ({
  document: doc,
  business,
  zoom = 1,
  showDebugBudget = false,
}) => {
  const type: QuotationType = doc.quotationType || 'project';

  // Calculate financials and layout
  const financials = useMemo(() => {
    return calculateQuotationFinancials(doc, business);
  }, [doc, business]);

  const layout = useMemo(() => {
    return resolveQuotationLayout(doc, type);
  }, [doc, type]);

  const defaultEyebrow = getQuotationEyebrow(type);
  const eyebrowText =
    doc.customText?.eyebrow && doc.customText.eyebrow !== 'QUOTATION'
      ? doc.customText.eyebrow
      : defaultEyebrow;

  // Render a block by ID
  const renderBlock = (blockId: QuotationBlockId, isPage2 = false) => {
    switch (blockId) {
      case 'deliverables':
        return (
          <QuotationDeliverablesBlock
            key="deliverables"
            deliverables={doc.monthlyDeliverables}
          />
        );

      case 'scope_table':
        return (
          <QuotationScopeTable
            key="scope_table"
            items={isPage2 && layout.page2Items.length > 0 ? layout.page2Items : layout.page1Items}
            type={type}
            startIndex={isPage2 && layout.splitItemIndex ? layout.splitItemIndex + 1 : 1}
            customText={doc.customText}
          />
        );

      case 'billing_strip':
        return (
          <QuotationBillingStrip
            key="billing_strip"
            billingCycle={doc.billingCycle || 'Monthly'}
            startDate={doc.contractStartDate}
            minTermMonths={financials.minTermMonths}
            paymentDue={doc.paymentDueDescription || 'In advance, before each cycle begins'}
            noticeDays={doc.noticePeriodDays || 30}
            autoRenewal={doc.autoRenewalDescription || 'Auto-renews monthly until cancelled'}
          />
        );

      case 'payment_summary':
        return (
          <QuotationBottomBlock
            key="payment_summary"
            business={business}
            quotationType={type}
            financials={financials}
            paymentRows={doc.paymentRows}
            quotationNumber={doc.documentNumber}
            showQr={doc.sectionVisibility.showUpiQr || doc.paymentDetails?.showQrOnDoc}
            customText={doc.customText}
            visibility={doc.sectionVisibility}
            showMinimumCommitmentTotal={doc.showMinimumCommitmentTotal ?? true}
            gstEnabled={doc.gstEnabled}
            gstRate={doc.gstRate}
          />
        );

      case 'gst_line':
        // Included inside QuotationBottomBlock for seamless alignment
        return null;

      case 'inclusions_exclusions':
        if (!doc.sectionVisibility.showInclusions || (!doc.inclusions && !doc.exclusions)) return null;
        return (
          <QuotationInclusions
            key="inclusions_exclusions"
            inclusions={doc.inclusions}
            exclusions={doc.exclusions}
          />
        );

      case 'delivery_timeline':
        if (!doc.sectionVisibility.showTimeline || !doc.deliveryTimeline) return null;
        return (
          <QuotationTimeline
            key="delivery_timeline"
            timeline={doc.deliveryTimeline}
          />
        );

      case 'notes':
        if (!doc.sectionVisibility.showFreeNotes || !doc.freeNotes) return null;
        return (
          <QuotationFreeNotes
            key="notes"
            notes={doc.freeNotes}
          />
        );

      case 'terms_and_notes':
        if (!doc.sectionVisibility.showTermsAndNotes || !doc.notes || doc.notes.length === 0) return null;
        return (
          <QuotationTerms
            key="terms_and_notes"
            notes={doc.notes}
            heading={doc.customText?.termsSectionHeading || 'TERMS & NOTES'}
            business={business}
            document={doc}
          />
        );

      case 'acceptance':
        if (!doc.sectionVisibility.showAcceptance) return null;
        return (
          <QuotationAcceptanceCompact
            key="acceptance"
            clientName={doc.clientName}
            documentNumber={doc.documentNumber}
            date={doc.date}
            validTill={doc.validTill}
            closingLine={doc.closingLine}
            signatureUrl={business.signatureDataUrl}
            applySignature={doc.applySignature}
            isFinal={doc.isFinal}
            showClientSignature={doc.sectionVisibility.showClientSignature ?? true}
            showAuditLine={doc.sectionVisibility.showAuditLine ?? true}
            showLegalDisclaimer={doc.sectionVisibility.showLegalDisclaimer ?? true}
            customText={doc.customText}
          />
        );

      default:
        return null;
    }
  };

  // Gap distribution: comfortable 2.5mm between blocks, or slightly tighter if needed
  const p1GapStyle = layout.page1SpareHeadroom > 20
    ? { rowGap: '2.5mm' }
    : { rowGap: '2mm' };

  return (
    <div className="flex flex-col items-center gap-8 py-4 select-none">
      {/* Container scaled by zoom */}
      <div
        className="flex flex-col items-center gap-8 transition-transform origin-top"
        style={{
          transform: zoom !== 1 ? `scale(${zoom})` : undefined,
          transformOrigin: 'top center',
        }}
      >
        {/* ======================================================== */}
        {/*                        PAGE 1                            */}
        {/* ======================================================== */}
        <div
          id="page-1"
          data-page="1"
          className="a4-page a4-page-export bg-white text-[#0E0E0E] shadow-2xl relative flex flex-col justify-between overflow-hidden box-border"
          style={{
            width: '210mm',
            height: '297mm',
            minWidth: '210mm',
            minHeight: '297mm',
            maxWidth: '210mm',
            maxHeight: '297mm',
          }}
        >
          {/* Header Band: 62mm height with logo lockup, tagline, contact line, Udyam line */}
          <div className="relative z-10 shrink-0">
            <HeaderBand
              type="quotation"
              business={business}
              customText={{
                ...doc.customText,
                eyebrow: eyebrowText,
                documentTitle: doc.customText?.documentTitle || 'QUOTATION',
              }}
              accentColor={business.accentColor}
            />
          </div>

          {/* Top Fixed Row: Party Row (2 cols) - directly follows HeaderBand, exactly like Invoice */}
          <div className="relative z-10 shrink-0">
            <QuotationPartyRow
              clientName={doc.clientName}
              projectName={doc.projectName}
              contactPerson={doc.clientContactPerson}
              clientAddress={doc.clientAddress}
              clientPhone={doc.clientPhone}
              clientEmail={doc.clientEmail}
              clientGstin={doc.clientGstin}
              estimatedDelivery={type === 'project' ? doc.estimatedDelivery : undefined}
            />
          </div>

          {/* Page 1 Active Blocks */}
          <div
            className="flex-1 flex flex-col pt-2"
            style={p1GapStyle}
          >
            {layout.page1Blocks.map((blockId) => renderBlock(blockId, false))}

            {/* If line items continue on Page 2: show continuation notice on Page 1 */}
            {layout.page2Items.length > 0 && (
              <div
                className="w-full box-border mt-auto mb-2"
                style={{
                  paddingLeft: '18mm',
                  paddingRight: '18mm',
                  paddingTop: '2mm',
                }}
              >
                <div
                  className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '7.5pt',
                    color: '#64748B',
                  }}
                >
                  <span className="font-semibold tracking-wider uppercase text-[#334155]">
                    Pricing, Terms &amp; Acceptance
                  </span>
                  <span className="font-bold text-[#0E0E0E] tracking-wider uppercase">
                    Continued on Page 2 &rarr;
                  </span>
                </div>
              </div>
            )}

            {/* Closing Line on Page 1 if acceptance stays on Page 1 */}
            {layout.page1Blocks.includes('acceptance') && doc.sectionVisibility.showClosingLine && (
              <div
                className="w-full box-border"
                style={{
                  paddingLeft: '18mm',
                  paddingRight: '18mm',
                  paddingTop: '0.5mm',
                  paddingBottom: '1mm',
                }}
              >
                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontStyle: 'italic',
                    fontWeight: 400,
                    fontSize: '8pt',
                    color: '#64748B',
                    margin: 0,
                    lineHeight: 1.35,
                  }}
                >
                  {doc.closingLine ||
                    doc.customText?.closingLine ||
                    'Thank you for considering DEVRIAN. We look forward to working with you.'}
                </p>
              </div>
            )}
          </div>

          {/* Page 1 Footer */}
          <div className="relative z-10 shrink-0 mt-auto">
            <QuotationFooter
              documentNumber={doc.documentNumber}
              udyamNo={business.udyamNo || 'UDYAM-UP-54-0127731'}
              email={business.email || 'inquiry@devrian.in'}
              currentPage={1}
              totalPages={layout.totalPages}
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/*                        PAGE 2                            */}
        {/* ======================================================== */}
        {layout.totalPages === 2 && (
          <div
            id="page-2"
            data-page="2"
            className="a4-page a4-page-export bg-white text-[#0E0E0E] shadow-2xl relative flex flex-col justify-between overflow-hidden box-border"
            style={{
              width: '210mm',
              height: '297mm',
              minWidth: '210mm',
              minHeight: '297mm',
              maxWidth: '210mm',
              maxHeight: '297mm',
            }}
          >
            {/* Page 2 Slim Repeated Header (Logo mark + wordmark + "Quotation <No.> · continued") */}
            <div
              className="w-full box-border flex items-center justify-between border-b border-[#E2E8F0] shrink-0"
              style={{
                height: `${PAGE2_HEADER_BAND_MM}mm`,
                paddingLeft: '18mm',
                paddingRight: '18mm',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div className="flex items-center gap-3">
                <DevrianLogoMark
                  invert={true}
                  blackLogoUrl={business.blackLogoDataUrl}
                  scale={0.8}
                />
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: '11pt',
                    letterSpacing: '0.15em',
                    color: '#0E0E0E',
                  }}
                >
                  DEVRIAN
                </span>
              </div>

              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '8pt',
                  fontWeight: 600,
                  color: '#64748B',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Quotation {doc.documentNumber} &middot; continued
              </div>
            </div>

            {/* Page 2 Content */}
            <div className="flex-1 flex flex-col pt-3 space-y-4">
              {/* If line items continued on Page 2: render continued items */}
              {layout.page2Items.length > 0 && (
                <QuotationScopeTable
                  items={layout.page2Items}
                  type={type}
                  startIndex={(layout.splitItemIndex || 0) + 1}
                  customText={doc.customText}
                />
              )}

              {/* Render Page 2 Moved Blocks */}
              {layout.page2Blocks.map((blockId) => renderBlock(blockId, true))}

              {/* Closing Line on Page 2 if acceptance moved to Page 2 */}
              {layout.page2Blocks.includes('acceptance') && doc.sectionVisibility.showClosingLine && (
                <div
                  className="w-full box-border"
                  style={{
                    paddingLeft: '18mm',
                    paddingRight: '18mm',
                    paddingTop: '0.5mm',
                    paddingBottom: '1mm',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontStyle: 'italic',
                      fontWeight: 400,
                      fontSize: '8pt',
                      color: '#64748B',
                      margin: 0,
                      lineHeight: 1.35,
                    }}
                  >
                    {doc.closingLine ||
                      doc.customText?.closingLine ||
                      'Thank you for considering DEVRIAN. We look forward to working with you.'}
                  </p>
                </div>
              )}
            </div>

            {/* Page 2 Footer */}
            <div className="relative z-10 shrink-0 mt-auto">
              <QuotationFooter
                documentNumber={doc.documentNumber}
                udyamNo={business.udyamNo || 'UDYAM-UP-54-0127731'}
                email={business.email || 'inquiry@devrian.in'}
                currentPage={2}
                totalPages={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* Developer Debug Panel: prints measured heights and spare headroom in mm */}
      {showDebugBudget && (
        <div className="w-full max-w-[210mm] p-3.5 bg-neutral-900 border border-neutral-700 text-white rounded-lg text-xs font-mono space-y-1 mt-4">
          <div className="text-amber-400 font-bold uppercase tracking-wider">
            Developer Budget Inspection ({type.toUpperCase()}):
          </div>
          <div>Page 1 Height: {Math.round(layout.page1Height)}mm / {USABLE_PAGE_HEIGHT_MM}mm</div>
          <div className="text-emerald-400 font-bold">
            Page 1 Spare Headroom: {Math.round(layout.page1SpareHeadroom)}mm (Target $\ge$ 10mm)
          </div>
          {layout.totalPages === 2 && (
            <div>
              Page 2 Height: {Math.round(layout.page2Height)}mm (Spare: {Math.round(layout.page2SpareHeadroom)}mm)
            </div>
          )}
          <div className="text-neutral-400 text-[11px] pt-1 border-t border-neutral-800">
            Blocks P1: [{layout.page1Blocks.join(', ')}] | Blocks P2: [{layout.page2Blocks.join(', ')}]
          </div>
        </div>
      )}
    </div>
  );
};
