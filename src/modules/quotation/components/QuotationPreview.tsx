import React, { useMemo } from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { BillingDocument, BusinessProfile } from '../../../types';
import { SavedQuotationTemplate } from '../types';
import { QuotationTemplateService } from '../templates';
import { computeQuotationFinancials, measureQuotationLayout } from '../layoutEngine';
import { getQuotationPolicyVariables } from '../utils/policiesAdapter';

// Strict token-based components (14 locked components only)
import { HeaderBand } from './HeaderBand';
import { SlimHeader } from './SlimHeader';
import { MetaRow } from './MetaRow';
import { PartyRow } from './PartyRow';
import { SectionHeading } from './SectionHeading';
import { DataTable } from './DataTable';
import { ListTable } from './ListTable';
import { KeyValueStrip } from './KeyValueStrip';
import { SummaryBlock } from './SummaryBlock';
import { PaymentBox } from './PaymentBox';
import { NoteBox } from './NoteBox';
import { SignaturePair } from './SignaturePair';
import { ClosingLine } from './ClosingLine';
import { Footer } from './Footer';

interface QuotationPreviewProps {
  document: BillingDocument;
  business: BusinessProfile;
  zoom?: number;
  templateOverride?: SavedQuotationTemplate;
  showFitIndicator?: boolean;
}

export const QuotationPreview: React.FC<QuotationPreviewProps> = ({
  document: doc,
  business,
  zoom = 1.0,
  templateOverride,
  showFitIndicator = true,
}) => {
  const isMonthly = doc.quotationType === 'monthly' || doc.quotationType === 'hybrid';
  const templateType = isMonthly ? 'monthly' : 'project';

  // Active saved template definition
  const template = useMemo(() => {
    if (templateOverride) return templateOverride;
    return QuotationTemplateService.getTemplate(templateType);
  }, [templateOverride, templateType]);

  // Financial calculations
  const financials = useMemo(() => {
    return computeQuotationFinancials(doc);
  }, [doc]);

  // Layout & overflow measurement
  const layout = useMemo(() => {
    return measureQuotationLayout(doc, template);
  }, [doc, template]);

  // Policy variables (read-only adapter with fallbacks 50, 48, 'latest')
  const policyVars = useMemo(() => {
    return getQuotationPolicyVariables(
      doc.advancePercent ?? template.advancePercentDefault ?? 50,
      business.balanceDueHoursDefault ?? template.balanceDueHoursDefault ?? 48,
      'latest',
      doc.minTermMonths ?? template.billingDefaults?.minTermMonths ?? 3,
      doc.noticePeriodDays ?? template.billingDefaults?.noticeDays ?? 30
    );
  }, [doc, template, business]);

  // Document & template properties
  const termsList = doc.notes && doc.notes.length > 0 ? doc.notes : template.terms;
  const showClientCol = doc.sectionVisibility?.showClientSignature ?? template.visibility.showClientSignature ?? true;
  const showLegalDisclaimer = doc.sectionVisibility?.showLegalDisclaimer ?? template.visibility.showLegalDisclaimer ?? true;
  const showPaymentDetails = doc.sectionVisibility?.showPaymentDetails ?? template.visibility.showPaymentDetails ?? true;
  const showQr = doc.sectionVisibility?.showUpiQr ?? template.paymentToggles.showQr ?? true;
  const showTerms = doc.sectionVisibility?.showTermsAndNotes ?? template.visibility.showTermsAndNotes ?? true;
  const showAcceptance = doc.sectionVisibility?.showAcceptance ?? template.visibility.showAcceptance ?? true;
  const showClosingLine = doc.sectionVisibility?.showClosingLine ?? template.visibility.showClosingLine ?? true;
  const showGstLine = doc.sectionVisibility?.showGstLine ?? template.visibility.showGstLine ?? true;

  // Single lockup slim header requirement
  const blackLogoUrl = business?.blackLogoDataUrl || '/brand/devrian-symbol-dark.png';

  const deliverablesList = doc.monthlyDeliverables && doc.monthlyDeliverables.length > 0
    ? doc.monthlyDeliverables
    : (template.sampleData.deliverables || [
      { id: 'del-1', item: 'Instagram Reels', quantity: '8 / month' },
      { id: 'del-2', item: 'Posts / Carousels', quantity: '12 / month' },
      { id: 'del-3', item: 'Stories', quantity: 'as per plan' },
      { id: 'del-4', item: 'Content calendar', quantity: '1' },
      { id: 'del-5', item: 'Monthly performance report', quantity: '1' },
    ]);

  const items = doc.items || [];
  const isDenseProject = !isMonthly && items.length >= 5;

  return (
    <div className="flex flex-col items-center py-6 select-none">
      {/* Live Fits / Overflow Indicator */}
      {showFitIndicator && (
        <div className="mb-4 max-w-[210mm] w-full px-2">
          {layout.hasOverflow || layout.hardLimitViolations.length > 0 ? (
            <div className="p-3 bg-red-950/80 border border-red-500/80 rounded-xl text-red-200 text-xs shadow-lg space-y-1">
              <div className="flex items-center justify-between font-bold text-red-300">
                <span>LAYOUT OVERFLOW / EXPORT BLOCKED</span>
                <span className="text-[11px] font-mono uppercase bg-red-900/60 px-2 py-0.5 rounded">
                  {isMonthly ? '2-Page Fixed Layout' : '1-Page Fixed Layout'}
                </span>
              </div>
              {layout.overflowMessage && (
                <p className="text-red-200 text-xs">{layout.overflowMessage}</p>
              )}
              {layout.hardLimitViolations.length > 0 && (
                <ul className="list-disc list-inside text-[11px] text-red-300 space-y-0.5">
                  {layout.hardLimitViolations.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="py-2 px-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between shadow-sm">
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>Layout Fits Cleanly ({isMonthly ? '2 Pages' : '1 Page'})</span>
              </span>
              <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-400">
                {isMonthly ? (
                  <>
                    <span>Page 1: Fits</span>
                    <span>·</span>
                    <span>Page 2: Fits</span>
                  </>
                ) : (
                  <span>Page 1: Fits (1 of 1)</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pages Container with Zoom Scaling */}
      <div
        className="flex flex-col items-center gap-8 origin-top transition-transform duration-150"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* ========================================================================= */}
        {/* TEMPLATE 1: PROJECT (EXACTLY 1 PAGE)                                     */}
        {/* ========================================================================= */}
        {!isMonthly ? (
          <div className="flex flex-col items-center">
            <div className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase mb-2">
              Page 1 of 1 · Project Quotation
            </div>

            <div
              className="a4-page-export bg-white text-black relative box-border overflow-hidden shadow-2xl"
              style={{
                width: QUOTATION_TOKENS.layout.pageWidth, // 210mm
                height: QUOTATION_TOKENS.layout.pageHeight, // 297mm
                backgroundColor: QUOTATION_TOKENS.colors.white,
              }}
            >
              {/* 1. HeaderBand (48mm) */}
              <HeaderBand
                customText={doc.customText}
                business={business}
                eyebrow="QUOTATION · ONE-TIME PROJECT"
                documentTitle="QUOTATION"
              />

              {/* Page 1 Body Content */}
              <div
                className="w-full flex flex-col justify-start"
                style={{
                  maxHeight: `${QUOTATION_TOKENS.spacing.num.page1UsableH}mm`, // 234mm
                  gap: isDenseProject ? '3mm' : '4mm',
                  paddingTop: isDenseProject ? '3mm' : '4mm',
                }}
              >
                {/* 2. MetaRow: 4 equal columns (12mm) */}
                <MetaRow
                  documentNumber={doc.documentNumber}
                  date={doc.date}
                  validTill={doc.validTill}
                  status={doc.status}
                  validityDays={template.validityDays}
                />

                {/* 3. PartyRow: PREPARED FOR & PROJECT (19mm) */}
                <PartyRow
                  clientName={doc.clientName}
                  contactPerson={doc.clientContactPerson}
                  clientAddress={doc.clientAddress}
                  clientPhone={doc.clientPhone}
                  clientEmail={doc.clientEmail}
                  clientGstin={doc.clientGstin}
                  projectHeading="PROJECT"
                  projectName={doc.projectName || 'Brand Identity & Digital Design'}
                  estimatedDelivery={doc.estimatedDelivery}
                />

                {/* 4. SectionHeading "SCOPE OF WORK" + DataTable (Max 5 rows) */}
                <div className="w-full flex flex-col">
                  <div
                    style={{
                      paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                      paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                      marginBottom: '2mm',
                    }}
                  >
                    <SectionHeading title="SCOPE OF WORK" />
                  </div>
                  <DataTable
                    items={items.slice(0, 5)}
                    tableType="project"
                    isDense={isDenseProject}
                  />
                </div>

                {/* 5. Two-column row: LEFT PaymentBox (84mm) & RIGHT SummaryBlock (84mm) */}
                <div
                  className="w-full flex items-start justify-between box-border"
                  style={{
                    paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                    paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                    width: QUOTATION_TOKENS.layout.pageWidth,
                  }}
                >
                  {/* Left Column (84mm): PaymentBox */}
                  {showPaymentDetails ? (
                    <PaymentBox
                      business={business}
                      heading="PAYMENT DETAILS"
                      showQr={showQr}
                      amount={financials.advanceAmount}
                      quotationNumber={doc.documentNumber}
                      isFullWidth={false}
                    />
                  ) : (
                    <div style={{ width: QUOTATION_TOKENS.layout.colWidth }} />
                  )}

                  {/* Right Column (84mm): SummaryBlock */}
                  <SummaryBlock
                    summaryType="project"
                    subtotal={financials.subtotal}
                    discountAmount={financials.discountAmount}
                    discountType={doc.discountType}
                    discountValue={doc.discountValue}
                    taxAmount={financials.taxAmount}
                    gstEnabled={doc.gstEnabled}
                    gstRate={doc.gstRate}
                    advanceAmount={financials.advanceAmount}
                    advancePercent={financials.advancePercent}
                    balancePayable={financials.balancePayable}
                    labelSubtotal="Subtotal"
                    labelDiscount="Discount"
                    labelTotal="TOTAL"
                    hideZeroRows={template.visibility.hideZeroRows}
                  />
                </div>

                {/* 6. Quiet one-line rule note (only if GST toggle is off) */}
                {!doc.gstEnabled && showGstLine && (
                  <div
                    style={{
                      paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                      paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: QUOTATION_TOKENS.font.family,
                        ...QUOTATION_TOKENS.font.scale.small,
                        fontStyle: 'italic',
                        color: QUOTATION_TOKENS.colors.greyDark,
                        margin: 0,
                        lineHeight: 1,
                      }}
                    >
                      Prices exclude GST. Taxes will be added if applicable at billing.
                    </p>
                  </div>
                )}

                {/* 7. NoteBox "TERMS & NOTES" (Max 5 points) */}
                {showTerms && (
                  <NoteBox
                    heading="TERMS & NOTES"
                    notes={termsList.slice(0, 5)}
                    variables={policyVars}
                  />
                )}

                {/* 8 & 9. Instruction line & SignaturePair */}
                {showAcceptance && (
                  <SignaturePair
                    clientName={doc.clientName}
                    documentNumber={doc.documentNumber}
                    date={doc.date}
                    signatureUrl={business.signatureDataUrl}
                    applySignature={doc.applySignature}
                    isFinal={doc.isFinal}
                    showClientSignature={showClientCol}
                    showLegalDisclaimer={showLegalDisclaimer}
                    instructionText={template.labels.instructionLine}
                    isProject={true}
                  />
                )}

                {/* 10. ClosingLine */}
                {showClosingLine && (
                  <ClosingLine text={template.labels.closingLine} />
                )}
              </div>

              {/* 11. Footer: y=282 rule, y=285 text (Page 1 of 1) */}
              <Footer
                documentNumber={doc.documentNumber}
                currentPage={1}
                totalPages={1}
                udyamNo={business.udyamNo}
                email={business.email}
              />
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* TEMPLATE 2: MONTHLY RETAINER (EXACTLY 2 PAGES)                           */
          /* ========================================================================= */
          <>
            {/* ----------------- PAGE 1: SCOPE & PRICING ----------------- */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase mb-2">
                Page 1 of 2 · Client Information, Scope &amp; Pricing
              </div>

              <div
                className="a4-page-export bg-white text-black relative box-border overflow-hidden shadow-2xl"
                style={{
                  width: QUOTATION_TOKENS.layout.pageWidth, // 210mm
                  height: QUOTATION_TOKENS.layout.pageHeight, // 297mm
                  backgroundColor: QUOTATION_TOKENS.colors.white,
                }}
              >
                {/* 1. HeaderBand (48mm) */}
                <HeaderBand
                  customText={doc.customText}
                  business={business}
                  eyebrow="QUOTATION · MONTHLY RETAINER"
                  documentTitle="QUOTATION"
                />

                {/* Page 1 Body Content */}
                <div
                  className="w-full flex flex-col justify-start"
                  style={{
                    maxHeight: `${QUOTATION_TOKENS.spacing.num.page1UsableH}mm`, // 234mm
                    gap: '4mm',
                    paddingTop: '4mm',
                  }}
                >
                  {/* 2. MetaRow: 4 equal columns (12mm) */}
                  <MetaRow
                    documentNumber={doc.documentNumber}
                    date={doc.date}
                    validTill={doc.validTill}
                    status={doc.status}
                    validityDays={template.validityDays}
                  />

                  {/* 3. PartyRow: PREPARED FOR & SERVICE (19mm) */}
                  <PartyRow
                    clientName={doc.clientName}
                    contactPerson={doc.clientContactPerson}
                    clientAddress={doc.clientAddress}
                    clientPhone={doc.clientPhone}
                    clientEmail={doc.clientEmail}
                    clientGstin={doc.clientGstin}
                    projectHeading="SERVICE"
                    projectName={doc.projectName || 'Social Media Management & Growth'}
                    platforms={doc.platforms || 'Instagram · YouTube · LinkedIn'}
                  />

                  {/* 4. SectionHeading "WHAT'S INCLUDED EACH MONTH" + ListTable (Max 6 rows) */}
                  <div className="w-full flex flex-col">
                    <div
                      style={{
                        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                        marginBottom: '2mm',
                      }}
                    >
                      <SectionHeading title="WHAT'S INCLUDED EACH MONTH" />
                    </div>
                    <ListTable deliverables={deliverablesList.slice(0, 6)} />
                    <div
                      style={{
                        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                        marginTop: '1.5mm',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: QUOTATION_TOKENS.font.family,
                          ...QUOTATION_TOKENS.font.scale.small,
                          fontStyle: 'italic',
                          color: QUOTATION_TOKENS.colors.greyDark,
                        }}
                      >
                        Deliverables reset at the start of each monthly billing cycle and do not roll over.
                      </span>
                    </div>
                  </div>

                  {/* 5. SectionHeading "MONTHLY RETAINER PRICING" + DataTable (Max 3 rows) */}
                  <div className="w-full flex flex-col">
                    <div
                      style={{
                        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                        marginBottom: '2mm',
                      }}
                    >
                      <SectionHeading title="PRICING" />
                    </div>
                    <DataTable
                      items={items.slice(0, 3)}
                      tableType="monthly"
                    />
                  </div>

                  {/* 6. SummaryBlock right-aligned (x=108..192) */}
                  <div
                    className="w-full box-border"
                    style={{
                      paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                      paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                    }}
                  >
                    <SummaryBlock
                      summaryType="monthly"
                      subtotal={financials.subtotal}
                      discountAmount={financials.discountAmount}
                      discountType={doc.discountType}
                      discountValue={doc.discountValue}
                      oneTimeSetupTotal={financials.oneTimeSetupTotal}
                      monthlyFeeTotal={financials.monthlyFeeTotal}
                      minTermMonths={financials.minTermMonths}
                      minimumCommitmentTotal={financials.minimumCommitmentTotal}
                      showMinimumCommitment={doc.showMinimumCommitmentTotal ?? template.visibility.showMinimumCommitment}
                      dueToStart={financials.dueToStart}
                      labelTotal="DUE TO START"
                      hideZeroRows={template.visibility.hideZeroRows}
                    />
                  </div>
                </div>

                {/* 7. Continued notice at bottom (SMALL italic #8A8A8A, right-aligned, above footer) */}
                <div
                  className="absolute right-0 flex justify-end"
                  style={{
                    bottom: '18mm', // Sits cleanly above the footer rule at 282mm
                    paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                  }}
                >
                  <span
                    style={{
                      fontFamily: QUOTATION_TOKENS.font.family,
                      ...QUOTATION_TOKENS.font.scale.small,
                      fontStyle: 'italic',
                      color: QUOTATION_TOKENS.colors.greyLight, // #8A8A8A
                    }}
                  >
                    Continued on page 2 · Billing terms, payment details and acceptance
                  </span>
                </div>

                {/* 8. Footer: Page 1 of 2 */}
                <Footer
                  documentNumber={doc.documentNumber}
                  currentPage={1}
                  totalPages={2}
                  udyamNo={business.udyamNo}
                  email={business.email}
                />
              </div>
            </div>

            {/* ----------------- PAGE 2: TERMS & ACCEPTANCE ----------------- */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase mb-2">
                Page 2 of 2 · Terms, Payment &amp; Client Acceptance
              </div>

              <div
                className="a4-page-export bg-white text-black relative box-border overflow-hidden shadow-2xl"
                style={{
                  width: QUOTATION_TOKENS.layout.pageWidth, // 210mm
                  height: QUOTATION_TOKENS.layout.pageHeight, // 297mm
                  backgroundColor: QUOTATION_TOKENS.colors.white,
                }}
              >
                {/* 1. SlimHeader (24mm, NO duplicate DEVRIAN, NO meta row, NO party row) */}
                <SlimHeader
                  documentNumber={doc.documentNumber}
                  blackLogoUrl={blackLogoUrl}
                />

                {/* Page 2 Body Content */}
                <div
                  className="w-full flex flex-col justify-start"
                  style={{
                    maxHeight: `${QUOTATION_TOKENS.spacing.num.page2UsableH}mm`, // 258mm
                    gap: '4mm',
                    paddingTop: '3mm',
                  }}
                >
                  {/* 2. SectionHeading "BILLING & TERM" + KeyValueStrip (26mm) */}
                  <div className="w-full flex flex-col">
                    <div
                      style={{
                        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                        marginBottom: '2mm',
                      }}
                    >
                      <SectionHeading title="BILLING & TERM" />
                    </div>
                    <KeyValueStrip
                      billingCycle={doc.billingCycle || 'Monthly'}
                      startDate={doc.contractStartDate || doc.date}
                      minTermMonths={doc.minTermMonths || 3}
                      paymentDue={doc.paymentDueDescription || 'In advance, on or before the 1st of each cycle'}
                      noticeDays={doc.noticePeriodDays || 30}
                      autoRenewal={doc.autoRenewalDescription || 'Auto-renews monthly until cancelled in writing'}
                    />
                  </div>

                  {/* 3. PaymentBox (full-width 174mm) */}
                  {showPaymentDetails && (
                    <div
                      className="w-full box-border"
                      style={{
                        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                      }}
                    >
                      <PaymentBox
                        business={business}
                        heading="PAYMENT DETAILS"
                        showQr={showQr}
                        amount={financials.dueToStart}
                        quotationNumber={doc.documentNumber}
                        isFullWidth={true}
                      />
                    </div>
                  )}

                  {/* 4. Quiet one-line rule note (only if GST toggle is off) */}
                  {!doc.gstEnabled && showGstLine && (
                    <div
                      style={{
                        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: QUOTATION_TOKENS.font.family,
                          ...QUOTATION_TOKENS.font.scale.small,
                          fontStyle: 'italic',
                          color: QUOTATION_TOKENS.colors.greyDark,
                          margin: 0,
                          lineHeight: 1,
                        }}
                      >
                        Prices exclude GST. Taxes will be added if applicable at billing.
                      </p>
                    </div>
                  )}

                  {/* 5. NoteBox "TERMS & NOTES" (Max 7 points) */}
                  {showTerms && (
                    <NoteBox
                      heading="TERMS & NOTES"
                      notes={termsList.slice(0, 7)}
                      variables={policyVars}
                    />
                  )}

                  {/* 6. Instruction line + SignaturePair (18mm signature space in Monthly) */}
                  {showAcceptance && (
                    <SignaturePair
                      clientName={doc.clientName}
                      documentNumber={doc.documentNumber}
                      date={doc.date}
                      signatureUrl={business.signatureDataUrl}
                      applySignature={doc.applySignature}
                      isFinal={doc.isFinal}
                      showClientSignature={showClientCol}
                      showLegalDisclaimer={showLegalDisclaimer}
                      instructionText={template.labels.instructionLine}
                      isProject={false}
                    />
                  )}

                  {/* 7. ClosingLine */}
                  {showClosingLine && (
                    <ClosingLine text={template.labels.closingLine} />
                  )}
                </div>

                {/* 8. Footer: Page 2 of 2 */}
                <Footer
                  documentNumber={doc.documentNumber}
                  currentPage={2}
                  totalPages={2}
                  udyamNo={business.udyamNo}
                  email={business.email}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
