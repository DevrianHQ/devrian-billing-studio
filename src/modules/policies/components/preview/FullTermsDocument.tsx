import React from 'react';
import { Clause, PolicyVariables, PolicySettings, DocumentVersion } from '../../types';
import { resolveVariables } from '../../utils/variableResolver';

interface FullTermsDocumentProps {
  clauses: Clause[];
  variables: PolicyVariables;
  settings: PolicySettings;
  versions: DocumentVersion[];
  logoUrl?: string;
  signatureUrl?: string;
}

export const FullTermsDocument: React.FC<FullTermsDocumentProps> = ({
  clauses,
  variables,
  settings,
  versions,
  logoUrl = '/brand/devrian-symbol-pure-white.png',
  signatureUrl,
}) => {
  const v = variables;
  const activeClauses = clauses.filter((c) => c.isVisible);

  // Group clauses across pages cleanly
  // Page 1: Dark Cover Page
  // Page 2: TOC + Key Terms Glance + Clauses 1 & 2
  // Page 3: Clauses 3 to 8 (Commercial, Payments, Revisions, Delivery)
  // Page 4: Clauses 9 to 11 (Project Files, Materials, Confidentiality)
  // Page 5: Clauses 12 to 20 (Refunds with Worked Box, Backup, SLA, Jurisdiction)
  // Page 6: Dark Closing Page (Looking Ahead, Accord, Dual Signatures, Revision Log)

  const page2Clauses = activeClauses.filter((c) => c.number >= 1 && c.number <= 2);
  const page3Clauses = activeClauses.filter((c) => c.number >= 3 && c.number <= 8);
  const page4Clauses = activeClauses.filter((c) => c.number >= 9 && c.number <= 11);
  const page5Clauses = activeClauses.filter((c) => c.number >= 12 && c.number <= 20);

  const totalPages = 6;

  // Background chevron polygon watermark for dark pages (Pages 1 & 6)
  const renderDarkChevronWatermark = () => (
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
          fill="#333333"
        />
        <path
          d="M220 0 L520 350 L220 700 L120 700 L420 350 L120 0 Z"
          fill="#222222"
        />
      </svg>
    </div>
  );

  // Background chevron watermark for light interior pages (Pages 2-5)
  const renderLightChevronWatermark = () => (
    <div className="absolute right-0 top-0 bottom-0 w-[45%] pointer-events-none overflow-hidden select-none opacity-[0.035]">
      <svg
        viewBox="0 0 400 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
        preserveAspectRatio="none"
      >
        <path
          d="M100 0 L400 350 L100 700 L0 700 L300 350 L0 0 Z"
          fill="#000000"
        />
      </svg>
    </div>
  );

  // Interior page running header (matching PDF 2 with original logo mark + wordmark)
  const renderInteriorHeader = (sectionTitle: string) => (
    <div className="px-12 pt-8 pb-3 border-b border-[#E5E5E5] flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        {/* Original Symbol Mark (Black) */}
        <img
          src="/brand/devrian-symbol-black.png"
          alt="DEVRIAN"
          className="h-5 w-auto object-contain"
          crossOrigin="anonymous"
        />
        {/* Original Wordmark Image (Black) */}
        <img
          src="/brand/devrian-brand-wordmark.png"
          alt="DEVRIAN"
          className="h-3.5 w-auto object-contain"
          crossOrigin="anonymous"
        />
        <span className="text-[#D0D0D0] font-light">|</span>
        <span className="text-[9px] font-semibold tracking-[0.18em] text-[#777777] uppercase font-sans">
          TERMS &amp; CONDITIONS AND POLICIES
        </span>
      </div>

      <div className="text-[9px] font-bold tracking-[0.18em] text-[#777777] uppercase font-sans">
        {sectionTitle}
      </div>
    </div>
  );

  // Interior page running footer
  const renderInteriorFooter = (pageNumber: number) => (
    <div className="px-12 pb-6 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-[9px] text-[#777777] font-sans select-none">
      <div>
        <strong className="text-[#0E0E0E]">DEVRIAN</strong> &bull; Terms &amp; Conditions and Policies v{settings.currentVersion} &bull; Udyam: {v.udyam_no}
      </div>
      <div className="font-semibold text-[#0E0E0E]">
        Page {pageNumber} of {totalPages}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 print:space-y-0">
      {/* ========================================================= */}
      {/* PAGE 1: DEEP BLACK COVER PAGE (Original Wordmark & Crisp Title) */}
      {/* ========================================================= */}
      <div
        className="policies-a4-page bg-[#0A0A0A] text-white font-sans mx-auto relative flex flex-col justify-between shadow-2xl print:shadow-none overflow-hidden"
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: '297mm',
          boxSizing: 'border-box',
          padding: '0',
          backgroundColor: '#0A0A0A',
          color: '#FFFFFF',
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {renderDarkChevronWatermark()}

        {/* Top: Original Symbol + Original Wordmark in Pure White */}
        <div className="px-12 pt-12 relative z-10 select-none">
          <div className="flex items-center gap-3.5">
            <img
              src="/brand/devrian-symbol-pure-white.png"
              alt="DEVRIAN"
              className="h-8 w-auto object-contain"
              crossOrigin="anonymous"
            />
            <img
              src="/brand/devrian-brand-wordmark-white.png"
              alt="DEVRIAN"
              className="h-5 w-auto object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <div className="mt-3">
            <span className="text-[9.5px] font-bold tracking-[0.25em] text-[#888888] uppercase block">
              TERMS &amp; CONDITIONS AND POLICIES
            </span>
          </div>
        </div>

        {/* Center: Massive Bold Headline & Subtitle (WITHOUT the word MASTER) */}
        <div className="px-12 relative z-10 my-auto">
          <h1 className="text-5xl font-black tracking-tight text-white uppercase leading-[1.1] max-w-lg font-sans">
            TERMS &amp;<br />
            CONDITIONS &amp;<br />
            POLICIES
          </h1>

          {/* Accent Line */}
          <div className="w-14 h-1 bg-white mt-6 mb-4" />

          <p className="text-sm font-medium text-[#A0A0A0] tracking-wide max-w-md">
            Official DEVRIAN Commercial Standards, Deliverable SLA &amp; Service Agreement
          </p>
        </div>

        {/* Bottom: 2x2 Meta Grid */}
        <div className="px-12 pb-12 relative z-10">
          <div className="border border-[#262626] divide-y divide-[#262626] bg-[#0E0E0E]/80 backdrop-blur-sm">
            {/* Row 1 */}
            <div className="grid grid-cols-2 divide-x divide-[#262626]">
              <div className="p-4">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.22em] text-[#777777] block mb-1">
                  PREPARED BY
                </span>
                <span className="text-xs font-bold text-white block">
                  {v.owner_name} | {v.owner_title}, {v.business_name}
                </span>
              </div>

              <div className="p-4">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.22em] text-[#777777] block mb-1">
                  PRESENTED TO
                </span>
                <span className="text-xs font-bold text-white block">
                  Commercial Clients &amp; Business Partners
                </span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 divide-x divide-[#262626]">
              <div className="p-4">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.22em] text-[#777777] block mb-1">
                  EFFECTIVE DATE
                </span>
                <span className="text-xs font-bold text-white block">
                  {settings.effectiveDate}
                </span>
              </div>

              <div className="p-4">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.22em] text-[#777777] block mb-1">
                  DOCUMENT IDENTIFIER
                </span>
                <span className="text-xs font-bold text-white font-mono block">
                  {settings.documentNumber} &bull; v{settings.currentVersion}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[9px] text-[#666666] mt-3">
            <span>Udyam Reg. No.: {v.udyam_no} &bull; {v.website}</span>
            <span>Commercial Terms &amp; Policies Documentation</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PAGE 2: INTERIOR - TOC, KEY TERMS & CLAUSES 1-2 */}
      {/* ========================================================= */}
      <div
        className="policies-a4-page bg-white text-[#0E0E0E] font-sans mx-auto relative flex flex-col justify-between shadow-2xl print:shadow-none overflow-hidden"
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: '297mm',
          boxSizing: 'border-box',
          padding: '0',
          backgroundColor: '#FFFFFF',
          color: '#0E0E0E',
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {renderLightChevronWatermark()}

        <div>
          {renderInteriorHeader('SECTION 01 • FRAMEWORK & SCOPE')}

          <div className="px-12 pt-6 space-y-5">
            {/* Section Eyebrow & Title */}
            <div>
              <span className="text-[10px] font-bold text-[#888888] tracking-[0.2em] uppercase block">
                01
              </span>
              <h2 className="text-xl font-extrabold text-[#0E0E0E] tracking-tight uppercase mt-0.5">
                About DEVRIAN &amp; Scope of Engagement
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Standardized operating guidelines, deliverables scope, and legal definitions.
              </p>
            </div>

            {/* Black Highlight Callout Box */}
            <div className="bg-[#0E0E0E] text-white p-3.5 rounded text-xs font-semibold leading-relaxed">
              These Terms &amp; Conditions and Policies govern all creative deliverables, video editing, post-production, and commercial services provided by DEVRIAN. By remitting an advance or signing an estimate, the Client unconditionally covenants to these terms.
            </div>

            {/* Key Terms at a Glance */}
            {settings.showKeyTermsBox && (
              <div className="border border-[#E5E5E5] rounded p-3.5 bg-[#FAFAFA]">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.22em] text-[#777777] block mb-2">
                  KEY COMMERCIAL TERMS AT A GLANCE
                </span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="bg-white border border-[#E5E5E5] p-2 rounded">
                    <span className="text-[#888888] font-semibold block text-[9px] uppercase">Advance Payment</span>
                    <strong className="text-[#0E0E0E] text-[11px]">{v.advance_percent}% Before Kick-off</strong>
                  </div>
                  <div className="bg-white border border-[#E5E5E5] p-2 rounded">
                    <span className="text-[#888888] font-semibold block text-[9px] uppercase">Balance Settlement</span>
                    <strong className="text-[#0E0E0E] text-[11px]">Within {v.balance_due_hours}h of Approval</strong>
                  </div>
                  <div className="bg-white border border-[#E5E5E5] p-2 rounded">
                    <span className="text-[#888888] font-semibold block text-[9px] uppercase">Refund Eligibility</span>
                    <strong className="text-[#0E0E0E] text-[11px]">{v.refund_window_days} Days ({v.refund_retention_percent}% Retained)</strong>
                  </div>
                  <div className="bg-white border border-[#E5E5E5] p-2 rounded">
                    <span className="text-[#888888] font-semibold block text-[9px] uppercase">Included Revisions</span>
                    <strong className="text-[#0E0E0E] text-[11px]">{v.revision_rounds} Rounds per Deliverable</strong>
                  </div>
                  <div className="bg-white border border-[#E5E5E5] p-2 rounded">
                    <span className="text-[#888888] font-semibold block text-[9px] uppercase">Review SLA</span>
                    <strong className="text-[#0E0E0E] text-[11px]">{v.feedback_window_hours}h Draft Turnaround</strong>
                  </div>
                  <div className="bg-white border border-[#E5E5E5] p-2 rounded">
                    <span className="text-[#888888] font-semibold block text-[9px] uppercase">Asset Retention</span>
                    <strong className="text-[#0E0E0E] text-[11px]">{v.backup_days} Days Post Delivery</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Table of Contents */}
            {settings.showTableOfContents && (
              <div className="border border-[#E5E5E5] rounded p-3 bg-white">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.22em] text-[#777777] block mb-2">
                  TABLE OF CONTENTS &amp; CLAUSE MAP
                </span>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[9.5px] text-[#444444]">
                  <div className="flex justify-between border-b border-dashed border-[#EBEBEB] py-0.5">
                    <span>1. Definitions and Scope</span> <span className="font-mono text-[#888888]">Page 2</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#EBEBEB] py-0.5">
                    <span>2. Acceptance of Terms</span> <span className="font-mono text-[#888888]">Page 2</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#EBEBEB] py-0.5">
                    <span>3. Pricing and Taxes</span> <span className="font-mono text-[#888888]">Page 3</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#EBEBEB] py-0.5">
                    <span>4. Payment Terms &amp; Advance</span> <span className="font-mono text-[#888888]">Page 3</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#EBEBEB] py-0.5">
                    <span>5. Late Payment Protocols</span> <span className="font-mono text-[#888888]">Page 3</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#EBEBEB] py-0.5">
                    <span>7. Revisions Policy</span> <span className="font-mono text-[#888888]">Page 3</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#EBEBEB] py-0.5">
                    <span>9. Raw Footage &amp; Project Files</span> <span className="font-mono text-[#888888]">Page 4</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#EBEBEB] py-0.5">
                    <span>11. Confidentiality &amp; NDA</span> <span className="font-mono text-[#888888]">Page 4</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#EBEBEB] py-0.5">
                    <span>12. Cancellation and Refunds</span> <span className="font-mono text-[#888888]">Page 5</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#EBEBEB] py-0.5">
                    <span>20. Law &amp; Jurisdiction</span> <span className="font-mono text-[#888888]">Page 5</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#EBEBEB] py-0.5 font-bold text-[#0E0E0E]">
                    <span>Formal Execution &amp; Signatures</span> <span className="font-mono">Page 6</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-[#EBEBEB] py-0.5 font-bold text-[#0E0E0E]">
                    <span>Document Revision Log</span> <span className="font-mono">Page 6</span>
                  </div>
                </div>
              </div>
            )}

            {/* Clauses 1 & 2 */}
            <div className="space-y-3 pt-1">
              {page2Clauses.map((clause) => (
                <div key={clause.id} className="border-l-2 border-[#0E0E0E] pl-3.5 py-0.5">
                  <div className="text-xs font-bold text-[#0E0E0E] uppercase tracking-wide">
                    {clause.number}. {resolveVariables(clause.title, v, clauses)}
                  </div>
                  <div className="text-[11px] text-[#444444] leading-relaxed font-sans mt-0.5 whitespace-pre-wrap">
                    {resolveVariables(clause.body, v, clauses)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {renderInteriorFooter(2)}
      </div>

      {/* ========================================================= */}
      {/* PAGE 3: COMMERCIAL TERMS, PAYMENTS & REVISIONS (Clauses 3-8) */}
      {/* ========================================================= */}
      <div
        className="policies-a4-page bg-white text-[#0E0E0E] font-sans mx-auto relative flex flex-col justify-between shadow-2xl print:shadow-none overflow-hidden"
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: '297mm',
          boxSizing: 'border-box',
          padding: '0',
          backgroundColor: '#FFFFFF',
          color: '#0E0E0E',
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {renderLightChevronWatermark()}

        <div>
          {renderInteriorHeader('SECTION 02 • COMMERCIAL TERMS & CADENCE')}

          <div className="px-12 pt-6 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-[#888888] tracking-[0.2em] uppercase block">
                02
              </span>
              <h2 className="text-xl font-extrabold text-[#0E0E0E] tracking-tight uppercase mt-0.5">
                Pricing, Payments &amp; Revision Policies
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Clear financial terms, advance requirements, delay stop-work protocols, and scope limits.
              </p>
            </div>

            {/* Clauses 3 to 8 */}
            <div className="space-y-3">
              {page3Clauses.map((clause) => (
                <div key={clause.id} className="border-l-2 border-neutral-300 pl-3.5 py-0.5">
                  <div className="text-[11px] font-bold text-[#0E0E0E] uppercase tracking-wide flex items-center justify-between">
                    <span>
                      {clause.number}. {resolveVariables(clause.title, v, clauses)}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#444444] leading-relaxed font-sans mt-0.5 whitespace-pre-wrap">
                    {resolveVariables(clause.body, v, clauses)}
                  </div>
                </div>
              ))}
            </div>

            {/* Note box with black left border */}
            <div className="bg-[#F0F0F0] border-l-4 border-black p-3 text-[10.5px] leading-relaxed text-[#333333]">
              <strong>Standard Payment Protocol:</strong> Work begins strictly after receipt of the {v.advance_percent}% advance. If the final balance is not settled within {v.balance_due_hours} hours of project approval, delivery of watermark-free high-resolution final exports is paused immediately until payment clearance.
            </div>
          </div>
        </div>

        {renderInteriorFooter(3)}
      </div>

      {/* ========================================================= */}
      {/* PAGE 4: ASSETS, CONFIDENTIALITY & IP (Clauses 9-11) */}
      {/* ========================================================= */}
      <div
        className="policies-a4-page bg-white text-[#0E0E0E] font-sans mx-auto relative flex flex-col justify-between shadow-2xl print:shadow-none overflow-hidden"
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: '297mm',
          boxSizing: 'border-box',
          padding: '0',
          backgroundColor: '#FFFFFF',
          color: '#0E0E0E',
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {renderLightChevronWatermark()}

        <div>
          {renderInteriorHeader('SECTION 03 • ASSETS, INTELLECTUAL PROPERTY & NDA')}

          <div className="px-12 pt-6 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-[#888888] tracking-[0.2em] uppercase block">
                03
              </span>
              <h2 className="text-xl font-extrabold text-[#0E0E0E] tracking-tight uppercase mt-0.5">
                Deliverable Ownership &amp; Confidentiality
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Provisions governing source files, licensed assets, client materials, and non-disclosure.
              </p>
            </div>

            {/* 2-Column Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[#E5E5E5] rounded overflow-hidden bg-white">
                <div className="bg-[#0E0E0E] text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-white text-black flex items-center justify-center text-[10px] font-black">
                    A
                  </span>
                  Raw Footage &amp; Project Files
                </div>
                <div className="p-3.5 space-y-2 text-[10.5px] text-[#444444] leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="text-black font-bold">▸</span>
                    <span>Premiere / After Effects project files, project trees, and working templates remain DEVRIAN proprietary IP.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-black font-bold">▸</span>
                    <span>Open-project source files are not included in standard pricing and require a separate buyout agreement.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-black font-bold">▸</span>
                    <span>Clients receive final rendered MP4/MOV high-definition video files upon full balance payment.</span>
                  </div>
                </div>
              </div>

              <div className="border border-[#E5E5E5] rounded overflow-hidden bg-white">
                <div className="bg-[#0E0E0E] text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-white text-black flex items-center justify-center text-[10px] font-black">
                    B
                  </span>
                  Client Materials &amp; Licences
                </div>
                <div className="p-3.5 space-y-2 text-[10.5px] text-[#444444] leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="text-black font-bold">▸</span>
                    <span>Client warrants they own or hold commercial licences for all supplied logos, footage, audio, and assets.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-black font-bold">▸</span>
                    <span>DEVRIAN is indemnified against third-party copyright claims arising from client-provided creative media.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-black font-bold">▸</span>
                    <span>Stock music and motion assets sourced by DEVRIAN include standard commercial online synchronization licences.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clauses 9 to 11 Body */}
            <div className="space-y-3 pt-2">
              {page4Clauses.map((clause) => (
                <div key={clause.id} className="border-l-2 border-neutral-300 pl-3.5 py-0.5">
                  <div className="text-[11px] font-bold text-[#0E0E0E] uppercase tracking-wide">
                    {clause.number}. {resolveVariables(clause.title, v, clauses)}
                  </div>
                  <div className="text-[10.5px] text-[#444444] leading-relaxed font-sans mt-0.5 whitespace-pre-wrap">
                    {resolveVariables(clause.body, v, clauses)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {renderInteriorFooter(4)}
      </div>

      {/* ========================================================= */}
      {/* PAGE 5: CANCELLATIONS, SLA & JURISDICTION (Clauses 12-20) */}
      {/* ========================================================= */}
      <div
        className="policies-a4-page bg-white text-[#0E0E0E] font-sans mx-auto relative flex flex-col justify-between shadow-2xl print:shadow-none overflow-hidden"
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: '297mm',
          boxSizing: 'border-box',
          padding: '0',
          backgroundColor: '#FFFFFF',
          color: '#0E0E0E',
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {renderLightChevronWatermark()}

        <div>
          {renderInteriorHeader('SECTION 04 • CANCELLATION, SLA & JURISDICTION')}

          <div className="px-12 pt-6 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-[#888888] tracking-[0.2em] uppercase block">
                04
              </span>
              <h2 className="text-xl font-extrabold text-[#0E0E0E] tracking-tight uppercase mt-0.5">
                Cancellation, Refunds &amp; Legal Framework
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Precise refund accounting formula (Clause 12), backup periods, service levels, and jurisdiction.
              </p>
            </div>

            {/* Clauses 12-20 */}
            <div className="space-y-3">
              {page5Clauses.map((clause) => (
                <div key={clause.id} className="border-l-2 border-neutral-300 pl-3.5 py-0.5">
                  <div className="text-[11px] font-bold text-[#0E0E0E] uppercase tracking-wide">
                    {clause.number}. {resolveVariables(clause.title, v, clauses)}
                  </div>
                  <div className="text-[10px] text-[#444444] leading-relaxed font-sans mt-0.5 whitespace-pre-wrap">
                    {resolveVariables(clause.body, v, clauses)}
                  </div>

                  {clause.subClauses && clause.subClauses.length > 0 && (
                    <div className="mt-1.5 pl-3 border-l border-neutral-300 space-y-1">
                      {clause.subClauses.map((sub) => (
                        <div key={sub.id} className="text-[9.5px] text-[#555555] leading-relaxed">
                          <strong className="text-[#0E0E0E]">{sub.number}</strong>{' '}
                          {resolveVariables(sub.body, v, clauses)}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Worked Calculation Box for Clause 12 */}
                  {clause.hasWorkedExampleBox && settings.showWorkedExampleBox && (
                    <div className="mt-2 bg-[#F0F0F0] border-l-4 border-black p-2.5 rounded-r text-[9.5px] leading-relaxed text-[#333333]">
                      <strong className="text-[#0E0E0E]">Clause 12 Worked Settlement Calculation:</strong> Advance ₹6,000 paid on a ₹10,000 package. Client cancels on Day 3 (within {v.refund_window_days} days). 1 deliverable completed at standard rate of ₹1,500. Retained share ({v.refund_retention_percent}% of ₹6,000) = ₹3,000. Completed work = ₹1,500. Total deductions = ₹4,500. Net refund payable to client = ₹1,500 (disbursed in {v.refund_processing_days} working days).
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {renderInteriorFooter(5)}
      </div>

      {/* ========================================================= */}
      {/* PAGE 6: DEEP BLACK CLOSING PAGE (White Signature & Original Wordmark) */}
      {/* ========================================================= */}
      <div
        className="policies-a4-page bg-[#0A0A0A] text-white font-sans mx-auto relative flex flex-col justify-between shadow-2xl print:shadow-none overflow-hidden"
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: '297mm',
          boxSizing: 'border-box',
          padding: '0',
          backgroundColor: '#0A0A0A',
          color: '#FFFFFF',
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {renderDarkChevronWatermark()}

        {/* Top Header with Original White Symbol + Wordmark */}
        <div>
          <div className="px-12 pt-10 pb-4 border-b border-[#222222] flex items-center justify-between relative z-10 select-none">
            <div className="flex items-center gap-3">
              <img
                src="/brand/devrian-symbol-pure-white.png"
                alt="DEVRIAN"
                className="h-6 w-auto object-contain"
                crossOrigin="anonymous"
              />
              <img
                src="/brand/devrian-brand-wordmark-white.png"
                alt="DEVRIAN"
                className="h-4 w-auto object-contain"
                crossOrigin="anonymous"
              />
            </div>

            <span className="text-[9px] font-bold tracking-[0.2em] text-[#888888] uppercase font-sans">
              LEGAL ACCORD &amp; EXECUTION
            </span>
          </div>

          {/* Section Heading & Content */}
          <div className="px-12 pt-7 pb-2 space-y-4 relative z-10">
            {/* Title Block with White Accent Pill matching Reference PDF */}
            <div>
              <span className="text-[10px] font-bold text-[#888888] font-mono tracking-[0.25em] uppercase block">
                05
              </span>
              <h2 className="text-[25px] font-black text-white tracking-tight uppercase mt-1 leading-tight">
                Looking Ahead &amp; Mutual Accord
              </h2>
              <div className="w-12 h-1 bg-white mt-2 rounded-full" />
            </div>

            <p className="text-[11px] text-[#C5C5C5] leading-relaxed max-w-[530px]">
              The objective is to establish DEVRIAN commercial engagements on principles of mutual trust, transparent accountability, and clear operational boundaries. By engaging our services, clients partner with an agency committed to structured creative excellence and long-term business value.
            </p>

            {/* Dark Card with White Left Border */}
            <div className="border-l-4 border-white bg-[#141414] p-3.5 text-[10.5px] leading-relaxed text-[#E0E0E0] max-w-[530px] rounded-r shadow-sm">
              Any formal engagement, creative brief, quotation, or proposal with DEVRIAN is governed by these Terms &amp; Conditions and Policies. Both parties agree that this document establishes the full commercial understanding and supersedes all prior verbal discussions.
            </div>

            {/* Dual Signature Blocks with Matched Heights & Clean Horizontal Lines */}
            {settings.showAcknowledgementSignatures && (
              <div className="grid grid-cols-2 gap-4 pt-1 max-w-[530px]">
                {/* Client Signature Card */}
                <div className="border border-[#262626] rounded-lg p-3.5 bg-[#111111]/90 flex flex-col justify-between h-[155px]">
                  <div>
                    <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#888888] block">
                      CLIENT ACCEPTANCE
                    </span>
                    <div className="h-10 border-b border-dashed border-[#444444] flex items-end pb-1">
                      <span className="text-[8.5px] text-[#666666] italic">Authorized Signatory</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-[9px] text-[#888888] pt-1">
                    <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-0.5">
                      <span className="text-[#666666]">Signatory Name:</span>
                      <span className="text-[#888888] font-mono text-[8.5px]">—</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-0.5">
                      <span className="text-[#666666]">Designation:</span>
                      <span className="text-[#888888] font-mono text-[8.5px]">—</span>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[#666666]">Date:</span>
                      <span className="text-[#888888] font-mono text-[8.5px]">—</span>
                    </div>
                  </div>
                </div>

                {/* DEVRIAN Sign-off Card with WHITE SIGNATURE */}
                <div className="border border-[#262626] rounded-lg p-3.5 bg-[#111111]/90 flex flex-col justify-between h-[155px]">
                  <div>
                    <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#888888] block">
                      FOR DEVRIAN
                    </span>
                    <div className="h-10 flex items-center justify-start border-b border-[#222222]">
                      {signatureUrl ? (
                        <img
                          src={signatureUrl}
                          alt="Dev Rajpoot"
                          style={{ filter: 'brightness(0) invert(1)' }}
                          className="h-10 w-auto object-contain"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <span className="font-serif italic text-lg font-bold text-white tracking-wide">
                          Dev Rajpoot
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[9px] text-white pt-1 space-y-0.5">
                    <div className="font-bold text-[10.5px] text-white">{v.owner_name}</div>
                    <div className="text-[#888888]">{v.owner_title}, {v.business_name}</div>
                    <div className="text-[#666666] font-mono text-[8.5px] flex items-center gap-1 pt-0.5">
                      <span>Udyam:</span>
                      <span className="text-[#888888]">{v.udyam_no}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Revision Log Table */}
            {settings.showRevisionHistoryAppendix && versions && versions.length > 0 && (
              <div className="pt-1 max-w-[530px]">
                <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#888888] block mb-1.5">
                  APPENDIX: DOCUMENT REVISION LOG
                </span>
                <div className="border border-[#262626] rounded-lg overflow-hidden bg-[#111111]/80">
                  <table className="w-full text-[8.5px] border-collapse">
                    <thead>
                      <tr className="bg-[#181818] text-white text-[8px] uppercase font-bold tracking-wider border-b border-[#262626]">
                        <th className="py-1.5 px-3 text-left w-[18%]">Version</th>
                        <th className="py-1.5 px-3 text-left w-[27%]">Effective Date</th>
                        <th className="py-1.5 px-3 text-left w-[55%]">Amendment Summary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F1F] text-[#AAAAAA]">
                      {versions.map((ver) => (
                        <tr key={ver.id} className="hover:bg-white/[0.02]">
                          <td className="py-1 px-3 font-mono font-bold text-white">v{ver.version}</td>
                          <td className="py-1 px-3 text-[#888888] font-mono">{ver.effectiveDate}</td>
                          <td className="py-1 px-3 text-[#CCCCCC]">{ver.changeNote}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Original White Brand Wordmark & Official Footer */}
        <div className="relative z-10 select-none">
          <div className="px-12 pb-3">
            <img
              src="/brand/devrian-brand-wordmark-white.png"
              alt="DEVRIAN"
              className="h-5 w-auto object-contain opacity-90"
              crossOrigin="anonymous"
            />
          </div>

          <div className="px-12 pb-8 pt-3 border-t border-[#222222] flex items-center justify-between text-[9px] text-[#777777] font-sans">
            <div>
              <strong className="text-white">DEVRIAN</strong> &bull; Terms &amp; Conditions and Policies v{settings.currentVersion} &bull; Udyam: {v.udyam_no}
            </div>
            <div className="font-semibold text-white">
              Page 6 of {totalPages}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
