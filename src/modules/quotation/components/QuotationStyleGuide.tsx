import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { HeaderBand } from './HeaderBand';
import { SlimHeader } from './SlimHeader';
import { MetaRow } from './MetaRow';
import { PartyRow } from './PartyRow';
import { SectionHeading } from './SectionHeading';
import { DataTable } from './DataTable';
import { ListTable } from './ListTable';
import { KeyValueStrip } from './KeyValueStrip';
import { SummaryBlock } from './SummaryBlock';
import { TotalBar } from './TotalBar';
import { PaymentBox } from './PaymentBox';
import { NoteBox } from './NoteBox';
import { SignaturePair } from './SignaturePair';
import { ClosingLine } from './ClosingLine';
import { Footer } from './Footer';
import { DEFAULT_BUSINESS_PROFILE } from '../../../services/seedData';
import { LineItem, MonthlyDeliverable } from '../../../types';

export const QuotationStyleGuide: React.FC = () => {
  const sampleItems: LineItem[] = [
    {
      id: 'sg-1',
      description: 'Brand Identity System',
      subDescription: 'Logo, typography, color palette, guidelines and vector master assets',
      qty: 1,
      rate: 45000,
      amount: 45000,
    },
    {
      id: 'sg-2',
      description: 'Investor Pitch Deck & Narrative Presentation',
      subDescription: '15 investor-ready slides with custom infographics and narrative pacing',
      qty: 1,
      rate: 25000,
      amount: 25000,
    },
  ];

  const sampleDeliverables: MonthlyDeliverable[] = [
    { id: 'del-1', item: 'Instagram Reels', quantity: '8 / month' },
    { id: 'del-2', item: 'Posts / Carousels', quantity: '12 / month' },
    { id: 'del-3', item: 'Stories', quantity: 'as per plan' },
    { id: 'del-4', item: 'Content calendar', quantity: '1' },
    { id: 'del-5', item: 'Monthly performance report', quantity: '1' },
  ];

  const sampleTerms = [
    'Advance of 50% is required to initiate work.',
    'Remaining 50% due within 48 hours of project completion and prior to final asset handover.',
    'Valid for 15 days from the date of issue.',
    'Work starts within 2 business days of advance clearance.',
    'Full Terms & Conditions and Service Policies apply: devrian.in/terms',
  ];

  const policyVars = {
    advance_percent: 50,
    balance_due_hours: 48,
    tnc_version: 'latest',
    min_term_months: 3,
    notice_days: 30,
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto p-4 text-white">
      {/* Title */}
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-xl font-bold tracking-tight">Quotation Design System &amp; Style Guide</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Strict token-based component catalog for DEVRIAN Billing Studio.
          Only 15 authorized quotation components. Zero inline arbitrary styling.
        </p>
      </div>

      {/* Typography Tokens */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
          Typography Tokens (Poppins Only)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-1">
            <span style={QUOTATION_TOKENS.font.scale.label}>LABEL (6.5pt / 500 / 0.3em)</span>
            <p className="text-[11px] text-neutral-400">Micro-captions &amp; section labels</p>
          </div>
          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-1">
            <span style={{ ...QUOTATION_TOKENS.font.scale.value, color: QUOTATION_TOKENS.colors.white }}>VALUE (10pt / 600)</span>
            <p className="text-[11px] text-neutral-400">Primary figures &amp; titles</p>
          </div>
          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-1">
            <span style={{ ...QUOTATION_TOKENS.font.scale.sectionHeading, color: QUOTATION_TOKENS.colors.white }}>
              SECTION-HEADING (7pt / 700 / 0.3em)
            </span>
            <p className="text-[11px] text-neutral-400">Card &amp; box headers</p>
          </div>
          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-1">
            <span style={{ ...QUOTATION_TOKENS.font.scale.body, color: QUOTATION_TOKENS.colors.taglineLight }}>BODY (8.5pt / 400 / 1.5)</span>
            <p className="text-[11px] text-neutral-400">Standard prose &amp; instructions</p>
          </div>
          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-1">
            <span style={QUOTATION_TOKENS.font.scale.small}>SMALL (7pt / 400 / 1.4)</span>
            <p className="text-[11px] text-neutral-400">Secondary notes &amp; disclaimers</p>
          </div>
          <div className="p-3 bg-neutral-950 rounded border border-neutral-800 space-y-1">
            <span style={QUOTATION_TOKENS.font.scale.tableHead}>TABLE-HEAD (7pt / 600 / 0.2em)</span>
            <p className="text-[11px] text-neutral-400">White on black table columns</p>
          </div>
        </div>
      </div>

      {/* Component 1: HeaderBand (Page 1) */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          1. HeaderBand (Page 1 · 48mm)
        </span>
        <div className="bg-white rounded overflow-hidden shadow">
          <HeaderBand
            business={DEFAULT_BUSINESS_PROFILE}
            eyebrow="QUOTATION · ONE-TIME PROJECT"
            documentTitle="QUOTATION"
          />
        </div>
      </div>

      {/* Component 2: SlimHeader (Page 2) */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          2. SlimHeader (Page 2 · 24mm · Single Lockup Only)
        </span>
        <div className="bg-white rounded overflow-hidden shadow">
          <SlimHeader
            documentNumber="DEV-QT-2026-001"
            blackLogoUrl="/brand/devrian-symbol-dark.png"
          />
        </div>
      </div>

      {/* Component 3: MetaRow */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          3. MetaRow (4 Columns: Number | Date | Valid Till | Status Badge)
        </span>
        <div className="bg-white rounded overflow-hidden shadow py-2">
          <MetaRow
            documentNumber="DEV-QT-2026-001"
            date="2026-11-10"
            validTill="2026-11-25"
            status="DRAFT"
          />
        </div>
      </div>

      {/* Component 4: PartyRow */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          4. PartyRow (2 Columns: PREPARED FOR | PROJECT / SERVICE)
        </span>
        <div className="bg-white rounded overflow-hidden shadow py-2">
          <PartyRow
            clientName="Apex Global Enterprises"
            contactPerson="Rohan Mehra"
            clientAddress="Tech Park, Whitefield, Bengaluru, KA 560066"
            clientPhone="+91 98765 43210"
            clientEmail="rohan@apexglobal.com"
            projectName="Enterprise Brand Identity &amp; Digital Launch Kit"
            estimatedDelivery="2026-11-25"
          />
        </div>
      </div>

      {/* Component 5: SectionHeading */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          5. SectionHeading (7pt / 700 with 0.6mm x 8mm black accent bar)
        </span>
        <div className="bg-white rounded overflow-hidden shadow p-4">
          <SectionHeading title="SCOPE OF WORK" />
        </div>
      </div>

      {/* Component 6: DataTable */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          6. DataTable ("SCOPE OF WORK" - 5 Columns: # 10 | Desc 84 | Qty 16 | Rate 30 | Amount 34)
        </span>
        <div className="bg-white rounded overflow-hidden shadow py-2">
          <DataTable items={sampleItems} tableType="project" />
        </div>
      </div>

      {/* Component 7: ListTable */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          7. ListTable ("WHAT'S INCLUDED EACH MONTH" - Deliverable 124mm | Quantity 50mm)
        </span>
        <div className="bg-white rounded overflow-hidden shadow py-2">
          <ListTable deliverables={sampleDeliverables} />
        </div>
      </div>

      {/* Component 8: KeyValueStrip */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          8. KeyValueStrip ("BILLING &amp; TERM" - BORDERED, 4 Cols x 2 Rows = 26mm)
        </span>
        <div className="bg-white rounded overflow-hidden shadow py-2">
          <KeyValueStrip
            billingCycle="Monthly"
            startDate="2026-11-10"
            minTermMonths={3}
            paymentDue="In advance, on or before the 1st of each cycle"
            noticeDays={30}
            autoRenewal="Auto-renews monthly until cancelled in writing"
          />
        </div>
      </div>

      {/* Component 9 & 10: SummaryBlock & TotalBar */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          9 &amp; 10. SummaryBlock &amp; TotalBar (84mm Width, Matching Table Right Edge)
        </span>
        <div className="bg-white rounded overflow-hidden shadow p-4 flex justify-end">
          <SummaryBlock
            summaryType="project"
            subtotal={70000}
            discountAmount={5000}
            discountType="flat"
            discountValue={5000}
            advanceAmount={32500}
            advancePercent={50}
            balancePayable={32500}
          />
        </div>
      </div>

      {/* Component 11: PaymentBox */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          11. PaymentBox (Bordered Box with UPI, Bank Transfer &amp; QR)
        </span>
        <div className="bg-white rounded overflow-hidden shadow p-4">
          <PaymentBox
            business={DEFAULT_BUSINESS_PROFILE}
            showQr={true}
            amount={32500}
            quotationNumber="DEV-QT-2026-001"
            isFullWidth={true}
          />
        </div>
      </div>

      {/* Component 12: NoteBox */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          12. NoteBox ("TERMS &amp; NOTES" - #F0F0F0 with 1.2mm Left Black Border)
        </span>
        <div className="bg-white rounded overflow-hidden shadow py-2">
          <NoteBox notes={sampleTerms} variables={policyVars} />
        </div>
      </div>

      {/* Component 13: SignaturePair */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          13. SignaturePair (Symmetrical 82mm Columns, 10mm Gutter, Signature Above Rule)
        </span>
        <div className="bg-white rounded overflow-hidden shadow py-2">
          <SignaturePair
            clientName="Apex Global Enterprises"
            documentNumber="DEV-QT-2026-001"
            date="2026-11-10"
            showClientSignature={true}
            showLegalDisclaimer={true}
          />
        </div>
      </div>

      {/* Component 14: ClosingLine */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          14. ClosingLine (Body Italic)
        </span>
        <div className="bg-white rounded overflow-hidden shadow py-2">
          <ClosingLine text="Thank you for considering DEVRIAN. We look forward to working with you." />
        </div>
      </div>

      {/* Component 15: Footer */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
          15. Footer (Fixed at 282mm, 3 Columns: Brand &amp; Doc # | Udyam Centre | Email &amp; Page Right)
        </span>
        <div className="bg-white rounded overflow-hidden shadow relative h-[15mm]">
          <Footer
            documentNumber="DEV-QT-2026-001"
            currentPage={1}
            totalPages={1}
          />
        </div>
      </div>
    </div>
  );
};
