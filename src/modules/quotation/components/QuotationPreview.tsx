import React, { useMemo } from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { BillingDocument, BusinessProfile } from '../../../types';
import { SavedQuotationTemplate } from '../types';
import { QuotationTemplateService } from '../templates';
import { computeQuotationFinancials, measureQuotationLayout } from '../layoutEngine';
import { getQuotationPolicyVariables } from '../utils/policiesAdapter';
import { formatDisplayDate } from '../../../services/dateUtils';

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
                  {isMonthly ? '3-Page Fixed Layout' : '2-Page Fixed Layout'}
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
                <span>Layout Fits Cleanly ({isMonthly ? '3 Pages' : '2 Pages'})</span>
              </span>
              <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-400">
                {isMonthly ? (
                  <>
                    <span>Page 1: Cover</span>
                    <span>·</span>
                    <span>Page 2: Fits</span>
                    <span>·</span>
                    <span>Page 3: Fits</span>
                  </>
                ) : (
                  <>
                    <span>Page 1: Cover</span>
                    <span>·</span>
                    <span>Page 2: Fits</span>
                  </>
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
          <>
            {/* ----------------- PAGE 1: DEEP BLACK COVER PAGE (Matching Terms & Conditions) ----------------- */}
            <div className="flex flex-col items-center">
              <div
                className="a4-page-export text-white relative box-border overflow-hidden shadow-2xl flex flex-col justify-between"
                style={{
                  width: QUOTATION_TOKENS.layout.pageWidth, // 210mm
                  height: QUOTATION_TOKENS.layout.pageHeight, // 297mm
                  backgroundColor: QUOTATION_TOKENS.colors.black, // #0E0E0E
                  color: QUOTATION_TOKENS.colors.white,
                  fontFamily: QUOTATION_TOKENS.font.family,
                  boxSizing: 'border-box',
                }}
              >
                {/* Background chevron polygon watermark (matching Terms & Policies) */}
                <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none overflow-hidden select-none opacity-20">
                  <svg
                    viewBox="0 0 400 700"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full object-cover"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M100 0 L400 350 L100 700 L0 700 L300 350 L0 0 Z"
                      fill={QUOTATION_TOKENS.colors.bodyText}
                    />
                    <path
                      d="M220 0 L520 350 L220 700 L120 700 L420 350 L120 0 Z"
                      fill={QUOTATION_TOKENS.colors.shapeDark1}
                    />
                  </svg>
                </div>

                {/* Top: Logo mark + Wordmark + Eyebrow */}
                <div
                  className="relative z-10 select-none box-border"
                  style={{
                    paddingLeft: '24mm',
                    paddingTop: '24mm',
                    paddingRight: '24mm',
                  }}
                >
                  <div className="flex items-center" style={{ gap: '3.5mm' }}>
                    <img
                      src="/brand/devrian-symbol-pure-white.png"
                      alt="DEVRIAN"
                      style={{
                        height: '8mm',
                        width: 'auto',
                        maxHeight: '8mm',
                      }}
                      className="object-contain shrink-0"
                      crossOrigin="anonymous"
                    />
                    <img
                      src="/brand/devrian-brand-wordmark-white.png"
                      alt="DEVRIAN"
                      style={{
                        height: '5mm',
                        width: 'auto',
                        maxHeight: '5mm',
                      }}
                      className="object-contain shrink-0"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div style={{ marginTop: '3mm' }}>
                    <span
                      style={{
                        fontFamily: QUOTATION_TOKENS.font.family,
                        fontSize: '7.5pt',
                        fontWeight: 700,
                        letterSpacing: '0.25em',
                        color: QUOTATION_TOKENS.colors.greyLight,
                        textTransform: 'uppercase',
                        display: 'block',
                      }}
                    >
                      {doc.customText?.coverEyebrow || doc.customText?.eyebrow || 'QUOTATION · ONE-TIME PROJECT'}
                    </span>
                  </div>
                </div>

                {/* Center: Headline, White Accent Bar & Subtitle */}
                <div
                  className="relative z-10 my-auto select-none box-border"
                  style={{
                    paddingLeft: '24mm',
                    paddingRight: '24mm',
                  }}
                >
                  <h1
                    style={{
                      fontFamily: QUOTATION_TOKENS.font.family,
                      fontSize: '36pt',
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      color: QUOTATION_TOKENS.colors.white,
                      textTransform: 'uppercase',
                      lineHeight: 1.05,
                      margin: 0,
                    }}
                  >
                    {doc.customText?.coverTitle ? (
                      <span style={{ whiteSpace: 'pre-line' }}>{doc.customText.coverTitle}</span>
                    ) : (
                      <>
                        PROJECT<br />
                        QUOTATION
                      </>
                    )}
                  </h1>

                  {/* Accent Line */}
                  <div
                    style={{
                      width: '14mm',
                      height: '1mm',
                      backgroundColor: QUOTATION_TOKENS.colors.white,
                      marginTop: '6mm',
                      marginBottom: '4mm',
                    }}
                  />

                  <p
                    style={{
                      fontFamily: QUOTATION_TOKENS.font.family,
                      fontSize: '11pt',
                      fontWeight: 500,
                      color: QUOTATION_TOKENS.colors.taglineLight,
                      letterSpacing: '0.02em',
                      margin: 0,
                      maxWidth: '120mm',
                    }}
                  >
                    {doc.projectName || 'Commercial Creative & Video Production Services'}
                  </p>

                  {doc.estimatedDelivery && (
                    <p
                      style={{
                        fontFamily: QUOTATION_TOKENS.font.family,
                        fontSize: '8pt',
                        fontWeight: 400,
                        color: QUOTATION_TOKENS.colors.metaLight,
                        marginTop: '2mm',
                        margin: 0,
                      }}
                    >
                      Estimated delivery: {doc.estimatedDelivery}
                    </p>
                  )}
                </div>

                {/* Bottom: 2x2 Meta Grid (Matching SS 2) */}
                <div
                  className="relative z-10 box-border w-full"
                  style={{
                    paddingLeft: '24mm',
                    paddingRight: '24mm',
                    paddingBottom: '20mm',
                  }}
                >
                  <div
                    style={{
                      border: `0.25mm solid ${QUOTATION_TOKENS.colors.hairlineDark}`,
                      backgroundColor: QUOTATION_TOKENS.colors.black,
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Row 1 */}
                    <div
                      className="grid grid-cols-2"
                      style={{
                        borderBottom: `0.25mm solid ${QUOTATION_TOKENS.colors.hairlineDark}`,
                      }}
                    >
                      {/* PREPARED FOR: Client Details stacked cleanly in lines */}
                      <div
                        style={{
                          padding: '4mm 5mm',
                          borderRight: `0.25mm solid ${QUOTATION_TOKENS.colors.hairlineDark}`,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '7.2pt',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.22em',
                            color: QUOTATION_TOKENS.colors.greyLight,
                            display: 'block',
                            marginBottom: '1.5mm',
                          }}
                        >
                          PREPARED FOR
                        </span>
                        {/* Line 1: Client Name */}
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '10.5pt',
                            fontWeight: 700,
                            color: QUOTATION_TOKENS.colors.white,
                            display: 'block',
                          }}
                        >
                          {doc.clientName || 'Client Name'}
                        </span>
                        {/* Line 2: Contact Person */}
                        {doc.clientContactPerson && (
                          <span
                            style={{
                              fontFamily: QUOTATION_TOKENS.font.family,
                              fontSize: '8.2pt',
                              color: QUOTATION_TOKENS.colors.metaLight,
                              display: 'block',
                              marginTop: '0.8mm',
                            }}
                          >
                            Attn: {doc.clientContactPerson}
                          </span>
                        )}
                        {/* Line 3: Address */}
                        {doc.clientAddress && (
                          <span
                            style={{
                              fontFamily: QUOTATION_TOKENS.font.family,
                              fontSize: '8.2pt',
                              color: QUOTATION_TOKENS.colors.metaLight,
                              display: 'block',
                              marginTop: '0.8mm',
                              lineHeight: 1.3,
                            }}
                          >
                            {doc.clientAddress}
                          </span>
                        )}
                        {/* Line 4: Email / Phone */}
                        {(doc.clientEmail || doc.clientPhone) && (
                          <span
                            style={{
                              fontFamily: QUOTATION_TOKENS.font.family,
                              fontSize: '8.2pt',
                              color: QUOTATION_TOKENS.colors.metaLight,
                              display: 'block',
                              marginTop: '0.8mm',
                            }}
                          >
                            {[doc.clientEmail, doc.clientPhone].filter(Boolean).join(' • ')}
                          </span>
                        )}
                        {/* Line 5: GSTIN (if present) */}
                        {doc.clientGstin && (
                          <span
                            style={{
                              fontFamily: QUOTATION_TOKENS.font.family,
                              fontSize: '7.5pt',
                              color: QUOTATION_TOKENS.colors.greyLight,
                              display: 'block',
                              marginTop: '0.8mm',
                            }}
                          >
                            GSTIN: {doc.clientGstin}
                          </span>
                        )}
                      </div>

                      {/* PREPARED BY: Dev Rajpoot in 3 clean lines */}
                      <div style={{ padding: '4mm 5mm' }}>
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '7.2pt',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.22em',
                            color: QUOTATION_TOKENS.colors.greyLight,
                            display: 'block',
                            marginBottom: '1.5mm',
                          }}
                        >
                          PREPARED BY
                        </span>
                        {/* Line 1: Name */}
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '10.5pt',
                            fontWeight: 700,
                            color: QUOTATION_TOKENS.colors.white,
                            display: 'block',
                          }}
                        >
                          {doc.customText?.preparedByName || business.proprietor || 'Dev Rajpoot'}
                        </span>
                        {/* Line 2: Role / Company */}
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '8.5pt',
                            fontWeight: 500,
                            color: QUOTATION_TOKENS.colors.taglineLight,
                            display: 'block',
                            marginTop: '0.8mm',
                          }}
                        >
                          {doc.customText?.preparedByTitle || (business.tagline ? `${business.tagline}, ${business.businessName || 'DEVRIAN'}` : 'Founder & CEO, DEVRIAN')}
                        </span>
                        {/* Line 3: Email & Website */}
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '8.2pt',
                            color: QUOTATION_TOKENS.colors.metaLight,
                            display: 'block',
                            marginTop: '0.8mm',
                          }}
                        >
                          {doc.customText?.preparedByContact || `${business.email || 'inquiry@devrian.in'} • ${business.website || 'devrian.in'}`}
                        </span>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-2">
                      {/* QUOTATION DATE: Date on top, Valid Till on its own line below */}
                      <div
                        style={{
                          padding: '4mm 5mm',
                          borderRight: `0.25mm solid ${QUOTATION_TOKENS.colors.hairlineDark}`,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '7.2pt',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.22em',
                            color: QUOTATION_TOKENS.colors.greyLight,
                            display: 'block',
                            marginBottom: '1.5mm',
                          }}
                        >
                          QUOTATION DATE
                        </span>
                        {/* Line 1: Quotation Date */}
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '10.5pt',
                            fontWeight: 700,
                            color: QUOTATION_TOKENS.colors.white,
                            display: 'block',
                          }}
                        >
                          {formatDisplayDate(doc.date)}
                        </span>
                        {/* Line 2: Valid Till below */}
                        {doc.validTill && (
                          <span
                            style={{
                              fontFamily: QUOTATION_TOKENS.font.family,
                              fontSize: '8.2pt',
                              fontWeight: 500,
                              color: QUOTATION_TOKENS.colors.metaLight,
                              display: 'block',
                              marginTop: '1mm',
                            }}
                          >
                            Valid Till: {formatDisplayDate(doc.validTill)}
                          </span>
                        )}
                      </div>

                      {/* DOCUMENT IDENTIFIER: Only Quotation Number (NO status/sent) */}
                      <div style={{ padding: '4mm 5mm' }}>
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '7.2pt',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.22em',
                            color: QUOTATION_TOKENS.colors.greyLight,
                            display: 'block',
                            marginBottom: '1.5mm',
                          }}
                        >
                          DOCUMENT IDENTIFIER
                        </span>
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '10.5pt',
                            fontWeight: 700,
                            color: QUOTATION_TOKENS.colors.white,
                            display: 'block',
                            ...QUOTATION_TOKENS.font.scale.numbers,
                          }}
                        >
                          {doc.documentNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Line */}
                  <div
                    className="flex justify-between items-center select-none"
                    style={{
                      marginTop: '3.5mm',
                      fontFamily: QUOTATION_TOKENS.font.family,
                      fontSize: '7.2pt',
                      color: QUOTATION_TOKENS.colors.greyMid,
                    }}
                  >
                    <span>
                      {doc.customText?.udyamLine || (business.udyamNo ? `Udyam Reg. No.: ${business.udyamNo} • ${business.website || 'devrian.in'}` : 'Udyam Reg. No.: UDYAM-UP-54-0127731 • devrian.in')}
                    </span>
                    <span>Commercial Project Quotation • Page 1 of 2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------- PAGE 2: SCOPE OF WORK, PRICING & ACCEPTANCE ----------------- */}
            <div className="flex flex-col items-center">
              <div
                className="a4-page-export bg-white text-black relative box-border overflow-hidden shadow-2xl"
                style={{
                  width: QUOTATION_TOKENS.layout.pageWidth, // 210mm
                  height: QUOTATION_TOKENS.layout.pageHeight, // 297mm
                  backgroundColor: QUOTATION_TOKENS.colors.white,
                }}
              >
                {/* 1. SlimHeader */}
                <SlimHeader
                  documentNumber={doc.documentNumber}
                  blackLogoUrl={blackLogoUrl}
                />

                {/* Page 2 Body Content */}
                <div
                  className="w-full flex flex-col justify-start"
                  style={{
                    maxHeight: `${QUOTATION_TOKENS.spacing.num.page2UsableH}mm`, // 258mm
                    gap: isDenseProject ? '3mm' : '4mm',
                    paddingTop: '3mm',
                  }}
                >
                  {/* 2. SectionHeading "SCOPE OF WORK" + DataTable (Max 6 rows) */}
                  <div className="w-full flex flex-col">
                    <div
                      style={{
                        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                        marginBottom: '2mm',
                      }}
                    >
                      <SectionHeading title={doc.customText?.itemsSectionHeading || 'SCOPE OF WORK'} />
                    </div>
                    <DataTable
                      items={items.slice(0, 6)}
                      tableType="project"
                      isDense={isDenseProject}
                    />
                  </div>

                  {/* 3. SummaryBlock (Right-aligned under Scope of Work) */}
                  <div
                    className="w-full flex justify-end box-border"
                    style={{
                      paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                      paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                    }}
                  >
                    <div style={{ width: QUOTATION_TOKENS.layout.colWidth }}>
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
                  </div>

                  {/* 4. PaymentBox (Full Width 174mm - Structured 2-column & 2x2 grid matching Invoice) */}
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
                        heading={doc.customText?.paymentSectionHeading || 'PAYMENT DETAILS'}
                        showQr={showQr}
                        amount={financials.advanceAmount}
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
                          fontSize: '8.5pt',
                          fontStyle: 'italic',
                          fontWeight: 400,
                          color: QUOTATION_TOKENS.colors.greyDark,
                          margin: 0,
                          lineHeight: 1.3,
                        }}
                      >
                        {doc.customText?.gstLine || 'Prices exclude GST. Taxes will be added if applicable at billing.'}
                      </p>
                    </div>
                  )}

                  {/* 5. NoteBox "TERMS & NOTES" (Max 5 points) */}
                  {showTerms && (
                    <NoteBox
                      heading={doc.customText?.termsSectionHeading || 'TERMS & NOTES'}
                      notes={termsList.slice(0, 5)}
                      variables={policyVars}
                    />
                  )}

                  {/* 6. Instruction line & SignaturePair */}
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
                      instructionText={doc.customText?.instructionLine || template.labels.instructionLine}
                      isProject={true}
                    />
                  )}

                  {/* 7. ClosingLine */}
                  {showClosingLine && (
                    <ClosingLine text={doc.customText?.closingLine || template.labels.closingLine} />
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
        ) : (
          /* ========================================================================= */
          /* TEMPLATE 2: MONTHLY RETAINER (3-PAGE FIXED LAYOUT - MATCHING OTP)         */
          /* ========================================================================= */
          <>
            {/* ----------------- PAGE 1: DEEP BLACK COVER PAGE (Matching Terms & Conditions) ----------------- */}
            <div className="flex flex-col items-center">
              <div
                className="a4-page-export text-white relative box-border overflow-hidden shadow-2xl flex flex-col justify-between"
                style={{
                  width: QUOTATION_TOKENS.layout.pageWidth, // 210mm
                  height: QUOTATION_TOKENS.layout.pageHeight, // 297mm
                  backgroundColor: QUOTATION_TOKENS.colors.black, // #0E0E0E
                  color: QUOTATION_TOKENS.colors.white,
                  fontFamily: QUOTATION_TOKENS.font.family,
                  boxSizing: 'border-box',
                }}
              >
                {/* Background chevron polygon watermark (matching Terms & Policies) */}
                <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none overflow-hidden select-none opacity-20">
                  <svg
                    viewBox="0 0 400 700"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full object-cover"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M100 0 L400 350 L100 700 L0 700 L300 350 L0 0 Z"
                      fill={QUOTATION_TOKENS.colors.bodyText}
                    />
                    <path
                      d="M220 0 L520 350 L220 700 L120 700 L420 350 L120 0 Z"
                      fill={QUOTATION_TOKENS.colors.shapeDark1}
                    />
                  </svg>
                </div>

                {/* Top: Logo mark + Wordmark + Eyebrow */}
                <div
                  className="relative z-10 select-none box-border"
                  style={{
                    paddingLeft: '24mm',
                    paddingTop: '24mm',
                    paddingRight: '24mm',
                  }}
                >
                  <div className="flex items-center" style={{ gap: '3.5mm' }}>
                    <img
                      src="/brand/devrian-symbol-pure-white.png"
                      alt="DEVRIAN"
                      style={{
                        height: '8mm',
                        width: 'auto',
                        maxHeight: '8mm',
                      }}
                      className="object-contain shrink-0"
                      crossOrigin="anonymous"
                    />
                    <img
                      src="/brand/devrian-brand-wordmark-white.png"
                      alt="DEVRIAN"
                      style={{
                        height: '5mm',
                        width: 'auto',
                        maxHeight: '5mm',
                      }}
                      className="object-contain shrink-0"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div style={{ marginTop: '3mm' }}>
                    <span
                      style={{
                        fontFamily: QUOTATION_TOKENS.font.family,
                        fontSize: '7.5pt',
                        fontWeight: 700,
                        letterSpacing: '0.25em',
                        color: QUOTATION_TOKENS.colors.greyLight,
                        textTransform: 'uppercase',
                        display: 'block',
                      }}
                    >
                      {doc.customText?.coverEyebrow || doc.customText?.eyebrow || 'QUOTATION · MONTHLY RETAINER'}
                    </span>
                  </div>
                </div>

                {/* Center: Headline, White Accent Bar & Subtitle */}
                <div
                  className="relative z-10 my-auto select-none box-border"
                  style={{
                    paddingLeft: '24mm',
                    paddingRight: '24mm',
                  }}
                >
                  <h1
                    style={{
                      fontFamily: QUOTATION_TOKENS.font.family,
                      fontSize: '36pt',
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      color: QUOTATION_TOKENS.colors.white,
                      textTransform: 'uppercase',
                      lineHeight: 1.05,
                      margin: 0,
                    }}
                  >
                    {doc.customText?.coverTitle ? (
                      <span style={{ whiteSpace: 'pre-line' }}>{doc.customText.coverTitle}</span>
                    ) : (
                      <>
                        MONTHLY<br />
                        RETAINER
                      </>
                    )}
                  </h1>

                  {/* Accent Line */}
                  <div
                    style={{
                      width: '14mm',
                      height: '1mm',
                      backgroundColor: QUOTATION_TOKENS.colors.white,
                      marginTop: '6mm',
                      marginBottom: '4mm',
                    }}
                  />

                  <p
                    style={{
                      fontFamily: QUOTATION_TOKENS.font.family,
                      fontSize: '11pt',
                      fontWeight: 500,
                      color: QUOTATION_TOKENS.colors.taglineLight,
                      letterSpacing: '0.02em',
                      margin: 0,
                      maxWidth: '120mm',
                    }}
                  >
                    {doc.projectName || 'Social Media Management & Monthly Creative Retainer'}
                  </p>

                  <p
                    style={{
                      fontFamily: QUOTATION_TOKENS.font.family,
                      fontSize: '8.2pt',
                      fontWeight: 400,
                      color: QUOTATION_TOKENS.colors.metaLight,
                      marginTop: '2.5mm',
                      margin: 0,
                    }}
                  >
                    {doc.platforms
                      ? `Platforms: ${doc.platforms}`
                      : (doc.billingCycle ? `Billing Cycle: ${doc.billingCycle}` : 'Ongoing monthly creative, editing & growth services')}
                  </p>
                </div>

                {/* Bottom: 2x2 Meta Grid (Matching OTP Cover) */}
                <div
                  className="relative z-10 box-border w-full"
                  style={{
                    paddingLeft: '24mm',
                    paddingRight: '24mm',
                    paddingBottom: '20mm',
                  }}
                >
                  <div
                    style={{
                      border: `0.25mm solid ${QUOTATION_TOKENS.colors.hairlineDark}`,
                      backgroundColor: QUOTATION_TOKENS.colors.black,
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Row 1 */}
                    <div
                      className="grid grid-cols-2"
                      style={{
                        borderBottom: `0.25mm solid ${QUOTATION_TOKENS.colors.hairlineDark}`,
                      }}
                    >
                      {/* PREPARED FOR */}
                      <div
                        style={{
                          padding: '4mm 5mm',
                          borderRight: `0.25mm solid ${QUOTATION_TOKENS.colors.hairlineDark}`,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '7.2pt',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.22em',
                            color: QUOTATION_TOKENS.colors.greyLight,
                            display: 'block',
                            marginBottom: '1.5mm',
                          }}
                        >
                          PREPARED FOR
                        </span>
                        {/* Line 1: Client Name */}
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '10.5pt',
                            fontWeight: 700,
                            color: QUOTATION_TOKENS.colors.white,
                            display: 'block',
                          }}
                        >
                          {doc.clientName || 'Client Name'}
                        </span>
                        {/* Line 2: Contact Person */}
                        {doc.clientContactPerson && (
                          <span
                            style={{
                              fontFamily: QUOTATION_TOKENS.font.family,
                              fontSize: '8.2pt',
                              color: QUOTATION_TOKENS.colors.metaLight,
                              display: 'block',
                              marginTop: '0.8mm',
                            }}
                          >
                            Attn: {doc.clientContactPerson}
                          </span>
                        )}
                        {/* Line 3: Address */}
                        {doc.clientAddress && (
                          <span
                            style={{
                              fontFamily: QUOTATION_TOKENS.font.family,
                              fontSize: '8.2pt',
                              color: QUOTATION_TOKENS.colors.metaLight,
                              display: 'block',
                              marginTop: '0.8mm',
                              lineHeight: 1.3,
                            }}
                          >
                            {doc.clientAddress}
                          </span>
                        )}
                        {/* Line 4: Email / Phone */}
                        {(doc.clientEmail || doc.clientPhone) && (
                          <span
                            style={{
                              fontFamily: QUOTATION_TOKENS.font.family,
                              fontSize: '8.2pt',
                              color: QUOTATION_TOKENS.colors.metaLight,
                              display: 'block',
                              marginTop: '0.8mm',
                            }}
                          >
                            {[doc.clientEmail, doc.clientPhone].filter(Boolean).join(' • ')}
                          </span>
                        )}
                        {/* Line 5: GSTIN (if present) */}
                        {doc.clientGstin && (
                          <span
                            style={{
                              fontFamily: QUOTATION_TOKENS.font.family,
                              fontSize: '7.5pt',
                              color: QUOTATION_TOKENS.colors.greyLight,
                              display: 'block',
                              marginTop: '0.8mm',
                            }}
                          >
                            GSTIN: {doc.clientGstin}
                          </span>
                        )}
                      </div>

                      {/* PREPARED BY: Dev Rajpoot in 3 clean lines */}
                      <div style={{ padding: '4mm 5mm' }}>
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '7.2pt',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.22em',
                            color: QUOTATION_TOKENS.colors.greyLight,
                            display: 'block',
                            marginBottom: '1.5mm',
                          }}
                        >
                          PREPARED BY
                        </span>
                        {/* Line 1: Name */}
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '10.5pt',
                            fontWeight: 700,
                            color: QUOTATION_TOKENS.colors.white,
                            display: 'block',
                          }}
                        >
                          {doc.customText?.preparedByName || business.proprietor || 'Dev Rajpoot'}
                        </span>
                        {/* Line 2: Role / Company */}
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '8.5pt',
                            fontWeight: 500,
                            color: QUOTATION_TOKENS.colors.taglineLight,
                            display: 'block',
                            marginTop: '0.8mm',
                          }}
                        >
                          {doc.customText?.preparedByTitle || (business.tagline ? `${business.tagline}, ${business.businessName || 'DEVRIAN'}` : 'Founder & CEO, DEVRIAN')}
                        </span>
                        {/* Line 3: Email & Website */}
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '8.2pt',
                            color: QUOTATION_TOKENS.colors.metaLight,
                            display: 'block',
                            marginTop: '0.8mm',
                          }}
                        >
                          {doc.customText?.preparedByContact || `${business.email || 'inquiry@devrian.in'} • ${business.website || 'devrian.in'}`}
                        </span>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-2">
                      {/* QUOTATION DATE: Date on top, Valid Till on its own line below */}
                      <div
                        style={{
                          padding: '4mm 5mm',
                          borderRight: `0.25mm solid ${QUOTATION_TOKENS.colors.hairlineDark}`,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '7.2pt',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.22em',
                            color: QUOTATION_TOKENS.colors.greyLight,
                            display: 'block',
                            marginBottom: '1.5mm',
                          }}
                        >
                          QUOTATION DATE
                        </span>
                        {/* Line 1: Quotation Date */}
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '10.5pt',
                            fontWeight: 700,
                            color: QUOTATION_TOKENS.colors.white,
                            display: 'block',
                          }}
                        >
                          {formatDisplayDate(doc.date)}
                        </span>
                        {/* Line 2: Valid Till below */}
                        {doc.validTill && (
                          <span
                            style={{
                              fontFamily: QUOTATION_TOKENS.font.family,
                              fontSize: '8.2pt',
                              fontWeight: 500,
                              color: QUOTATION_TOKENS.colors.metaLight,
                              display: 'block',
                              marginTop: '1mm',
                            }}
                          >
                            Valid Till: {formatDisplayDate(doc.validTill)}
                          </span>
                        )}
                      </div>

                      {/* DOCUMENT IDENTIFIER: Only Quotation Number */}
                      <div style={{ padding: '4mm 5mm' }}>
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '7.2pt',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.22em',
                            color: QUOTATION_TOKENS.colors.greyLight,
                            display: 'block',
                            marginBottom: '1.5mm',
                          }}
                        >
                          DOCUMENT IDENTIFIER
                        </span>
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '10.5pt',
                            fontWeight: 700,
                            color: QUOTATION_TOKENS.colors.white,
                            display: 'block',
                            ...QUOTATION_TOKENS.font.scale.numbers,
                          }}
                        >
                          {doc.documentNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Line */}
                  <div
                    className="flex justify-between items-center select-none"
                    style={{
                      marginTop: '3.5mm',
                      fontFamily: QUOTATION_TOKENS.font.family,
                      fontSize: '7.2pt',
                      color: QUOTATION_TOKENS.colors.greyMid,
                    }}
                  >
                    <span>
                      {doc.customText?.udyamLine || (business.udyamNo ? `Udyam Reg. No.: ${business.udyamNo} • ${business.website || 'devrian.in'}` : 'Udyam Reg. No.: UDYAM-UP-54-0127731 • devrian.in')}
                    </span>
                    <span>Commercial Monthly Retainer Quotation • Page 1 of 3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------- PAGE 2: SCOPE OF DELIVERABLES & PRICING ----------------- */}
            <div className="flex flex-col items-center">
              <div
                className="a4-page-export bg-white text-black relative box-border overflow-hidden shadow-2xl flex flex-col justify-between"
                style={{
                  width: QUOTATION_TOKENS.layout.pageWidth, // 210mm
                  height: QUOTATION_TOKENS.layout.pageHeight, // 297mm
                  backgroundColor: QUOTATION_TOKENS.colors.white,
                }}
              >
                <div>
                  {/* SlimHeader */}
                  <SlimHeader
                    documentNumber={doc.documentNumber}
                    blackLogoUrl={blackLogoUrl}
                    titleLabel="SCOPE & PRICING"
                  />

                  {/* Page 2 Body Content */}
                  <div
                    className="w-full flex flex-col justify-start"
                    style={{
                      maxHeight: `${QUOTATION_TOKENS.spacing.num.page2UsableH}mm`,
                      gap: '4mm',
                      paddingTop: '3mm',
                    }}
                  >
                    {/* 1. SectionHeading "WHAT'S INCLUDED EACH MONTH" + ListTable */}
                    <div className="w-full flex flex-col">
                      <div
                        style={{
                          paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                          paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                          marginBottom: '2mm',
                        }}
                      >
                        <SectionHeading title={doc.customText?.deliverablesSectionHeading || "WHAT'S INCLUDED EACH MONTH"} />
                      </div>
                      <ListTable deliverables={deliverablesList.slice(0, 6)} />
                      <div
                        style={{
                          paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                          paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                          marginTop: '2mm',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: QUOTATION_TOKENS.font.family,
                            fontSize: '8.5pt',
                            fontStyle: 'italic',
                            color: QUOTATION_TOKENS.colors.greyDark,
                          }}
                        >
                          {doc.customText?.deliverablesResetNote || 'Deliverables reset at the start of each monthly billing cycle and do not roll over.'}
                        </span>
                      </div>
                    </div>

                    {/* 2. SectionHeading "PRICING" + DataTable */}
                    <div className="w-full flex flex-col">
                      <div
                        style={{
                          paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                          paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                          marginBottom: '2mm',
                        }}
                      >
                        <SectionHeading title={doc.customText?.pricingSectionHeading || 'PRICING'} />
                      </div>
                      <DataTable
                        items={items.slice(0, 3)}
                        tableType="monthly"
                      />
                    </div>

                    {/* 3. SummaryBlock (Right-aligned) */}
                    <div
                      className="w-full flex justify-end box-border"
                      style={{
                        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                      }}
                    >
                      <div style={{ width: QUOTATION_TOKENS.layout.colWidth }}>
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
                  </div>
                </div>

                {/* Continued notice & Footer */}
                <div>
                  <div
                    className="flex justify-end select-none"
                    style={{
                      paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                      marginBottom: '2mm',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: QUOTATION_TOKENS.font.family,
                        fontSize: '8.5pt',
                        fontStyle: 'italic',
                        color: QUOTATION_TOKENS.colors.greyLight,
                      }}
                    >
                      Continued on page 3 · Billing terms, payment details and acceptance
                    </span>
                  </div>

                  <Footer
                    documentNumber={doc.documentNumber}
                    currentPage={2}
                    totalPages={3}
                    udyamNo={business.udyamNo}
                    email={business.email}
                  />
                </div>
              </div>
            </div>

            {/* ----------------- PAGE 3: TERMS, PAYMENT & CLIENT ACCEPTANCE ----------------- */}
            <div className="flex flex-col items-center">
              <div
                className="a4-page-export bg-white text-black relative box-border overflow-hidden shadow-2xl flex flex-col justify-between"
                style={{
                  width: QUOTATION_TOKENS.layout.pageWidth, // 210mm
                  height: QUOTATION_TOKENS.layout.pageHeight, // 297mm
                  backgroundColor: QUOTATION_TOKENS.colors.white,
                }}
              >
                <div>
                  {/* SlimHeader */}
                  <SlimHeader
                    documentNumber={doc.documentNumber}
                    blackLogoUrl={blackLogoUrl}
                    titleLabel="TERMS & ACCEPTANCE"
                  />

                  {/* Page 3 Body Content */}
                  <div
                    className="w-full flex flex-col justify-start"
                    style={{
                      maxHeight: `${QUOTATION_TOKENS.spacing.num.page2UsableH}mm`,
                      gap: '4mm',
                      paddingTop: '3mm',
                    }}
                  >
                    {/* 1. KeyValueStrip (Black Header + Gray Box - Matching PaymentBox) */}
                    <div
                      className="w-full box-border"
                      style={{
                        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft,
                        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight,
                      }}
                    >
                      <KeyValueStrip
                        heading={doc.customText?.billingSectionHeading || 'BILLING & TERM'}
                        billingCycle={doc.billingCycle || 'Monthly'}
                        startDate={doc.contractStartDate || doc.date}
                        minTermMonths={doc.minTermMonths || 3}
                        paymentDue={doc.paymentDueDescription || 'In advance, on or before the 1st of each cycle'}
                        noticeDays={doc.noticePeriodDays || 30}
                        autoRenewal={doc.autoRenewalDescription || 'Auto-renews monthly until cancelled in writing'}
                      />
                    </div>

                    {/* 2. PaymentBox (full-width 174mm) */}
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
                          heading={doc.customText?.paymentSectionHeading || 'PAYMENT DETAILS'}
                          showQr={showQr}
                          amount={financials.dueToStart}
                          quotationNumber={doc.documentNumber}
                          isFullWidth={true}
                        />
                      </div>
                    )}

                    {/* 3. Quiet one-line rule note (only if GST toggle is off) */}
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
                            fontSize: '8.5pt',
                            fontStyle: 'italic',
                            fontWeight: 400,
                            color: QUOTATION_TOKENS.colors.greyDark,
                            margin: 0,
                            lineHeight: 1.3,
                          }}
                        >
                          {doc.customText?.gstLine || 'Prices exclude GST. Taxes will be added if applicable at billing.'}
                        </p>
                      </div>
                    )}

                    {/* 4. NoteBox "TERMS & NOTES" (Max 7 points) */}
                    {showTerms && (
                      <NoteBox
                        heading={doc.customText?.termsSectionHeading || 'TERMS & NOTES'}
                        notes={termsList.slice(0, 7)}
                        variables={policyVars}
                      />
                    )}

                    {/* 5. Instruction line + SignaturePair */}
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
                        instructionText={doc.customText?.instructionLine || template.labels.instructionLine}
                        isProject={false}
                      />
                    )}

                    {/* 6. ClosingLine */}
                    {showClosingLine && (
                      <ClosingLine text={doc.customText?.closingLine || template.labels.closingLine} />
                    )}
                  </div>
                </div>

                {/* Footer: Page 3 of 3 */}
                <Footer
                  documentNumber={doc.documentNumber}
                  currentPage={3}
                  totalPages={3}
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
