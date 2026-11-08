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

  // Group clauses across pages cleanly to prevent awkward splits
  // Page 1: Clauses 1-2 + Table of Contents + Key Terms Box
  const page1Clauses = activeClauses.filter((c) => c.number >= 1 && c.number <= 2);
  // Page 2: Clauses 3-8 (Commercial, Payments, Revisions, Delivery)
  const page2Clauses = activeClauses.filter((c) => c.number >= 3 && c.number <= 8);
  // Page 3: Clauses 9-12 (Project Files, Materials, NDA, Cancellation & Refund with Worked Box)
  const page3Clauses = activeClauses.filter((c) => c.number >= 9 && c.number <= 12);
  // Page 4: Clauses 13-20 (Backup, Portfolio, SLA, Liability, Jurisdiction)
  const page4Clauses = activeClauses.filter((c) => c.number >= 13 && c.number <= 20);

  const totalPages = 5;

  // Render slim repeated header on pages 2+
  const renderSlimHeader = (pageNumber: number) => (
    <div>
      <div className="bg-[#0E0E0E] text-white px-10 py-3.5 flex items-center justify-between select-none border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <img
            src={logoUrl || '/brand/devrian-symbol-pure-white.png'}
            alt="DEVRIAN"
            className="h-6 w-auto object-contain"
            crossOrigin="anonymous"
          />
          <div className="border-l border-neutral-700 pl-3">
            <span className="text-[9px] font-bold tracking-[0.25em] text-neutral-400 uppercase">
              TERMS &amp; CONDITIONS AND POLICIES
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-neutral-400">
          <span>Doc: <strong className="text-white font-mono">{settings.documentNumber}</strong></span>
          <span>Version: <strong className="text-white font-mono">v{settings.currentVersion}</strong></span>
          <span className="font-mono text-neutral-300">Page {pageNumber} of {totalPages}</span>
        </div>
      </div>
      <div className="bg-[#1A1A1A] text-neutral-400 px-10 py-1.5 text-[9px] flex items-center justify-between border-b border-neutral-300">
        <div>DEVRIAN &bull; inquiry@devrian.in &bull; devrian.in</div>
        <div>Udyam: <strong>{v.udyam_no}</strong> &bull; Proprietor: <strong>{v.owner_name}</strong></div>
      </div>
    </div>
  );

  // Render footer on every page
  const renderFooter = (pageNumber: number) => (
    <div className="px-10 pb-5 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-[9.5px] text-neutral-500">
      <div>
        {v.business_name} &bull; Terms &amp; Conditions v{settings.currentVersion} &bull; {v.udyam_no} &bull; {v.contact_email}
      </div>
      <div className="font-mono font-medium">Page {pageNumber} of {totalPages}</div>
    </div>
  );

  return (
    <div className="space-y-8 print:space-y-0">
      {/* ================= PAGE 1 ================= */}
      <div
        className="policies-a4-page bg-white text-[#0E0E0E] font-sans mx-auto relative flex flex-col justify-between shadow-lg print:shadow-none"
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: '297mm',
          boxSizing: 'border-box',
          padding: '0',
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div>
          {/* Main Top Header Band */}
          <div className="bg-[#0E0E0E] text-white px-10 pt-7 pb-6 relative overflow-hidden select-none">
            <div
              className="absolute right-0 top-0 bottom-0 w-80 opacity-15 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, transparent 40%, #ffffff 40%, #ffffff 45%, transparent 45%, transparent 55%, #ffffff 55%, #ffffff 60%, transparent 60%)',
              }}
            />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <img
                  src={logoUrl || '/brand/devrian-symbol-pure-white.png'}
                  alt="DEVRIAN"
                  className="h-8 w-auto object-contain"
                  crossOrigin="anonymous"
                />
                <div className="border-l border-neutral-700 pl-3">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase block">
                    BILLING STUDIO
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase block">
                  L E G A L
                </span>
                <h1 className="text-xl font-extrabold tracking-tight text-white uppercase mt-0.5">
                  TERMS &amp; CONDITIONS AND POLICIES
                </h1>
              </div>
            </div>

            {/* Meta row */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 relative z-10">
              <div>
                <span className="text-neutral-500">Document No:</span>{' '}
                <strong className="text-white font-mono">{settings.documentNumber}</strong>
              </div>
              <div>
                <span className="text-neutral-500">Version:</span>{' '}
                <strong className="text-white font-mono">v{settings.currentVersion}</strong>
              </div>
              <div>
                <span className="text-neutral-500">Effective Date:</span>{' '}
                <strong className="text-white">{settings.effectiveDate}</strong>
              </div>
              <div>
                <span className="text-neutral-500">Last Updated:</span>{' '}
                <strong className="text-white">{settings.lastUpdated}</strong>
              </div>
            </div>
          </div>

          {/* Business Details Ribbon */}
          <div className="bg-[#1A1A1A] text-neutral-300 px-10 py-2 text-[9.5px] flex items-center justify-between border-b border-neutral-300">
            <div>
              <strong>DEVRIAN</strong> &bull; {v.official_email} &bull; {v.contact_email} &bull; {v.website}
            </div>
            <div>
              Udyam Reg. No.: <strong>{v.udyam_no}</strong> &bull; Proprietor: <strong>{v.owner_name}</strong>
            </div>
          </div>

          {/* Body */}
          <div className="px-10 pt-5 space-y-4">
            {/* Key Terms at a Glance */}
            {settings.showKeyTermsBox && (
              <div className="border border-[#E5E5E5] rounded-lg p-3.5 bg-[#FAFAFA]">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 block mb-2">
                  K E Y   T E R M S   A T   A   G L A N C E
                </span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="bg-white border border-[#EBEBEB] p-2 rounded">
                    <span className="text-neutral-500 block font-semibold">Advance Payment</span>
                    <strong className="text-[#0E0E0E]">{v.advance_percent}% Before Work Begins</strong>
                  </div>
                  <div className="bg-white border border-[#EBEBEB] p-2 rounded">
                    <span className="text-neutral-500 block font-semibold">Balance Due</span>
                    <strong className="text-[#0E0E0E]">Within {v.balance_due_hours} Hours of Approval</strong>
                  </div>
                  <div className="bg-white border border-[#EBEBEB] p-2 rounded">
                    <span className="text-neutral-500 block font-semibold">Refund Eligibility</span>
                    <strong className="text-[#0E0E0E]">{v.refund_window_days} Days ({v.refund_retention_percent}% Retained)</strong>
                  </div>
                  <div className="bg-white border border-[#EBEBEB] p-2 rounded">
                    <span className="text-neutral-500 block font-semibold">Included Revisions</span>
                    <strong className="text-[#0E0E0E]">{v.revision_rounds} Rounds per Deliverable</strong>
                  </div>
                  <div className="bg-white border border-[#EBEBEB] p-2 rounded">
                    <span className="text-neutral-500 block font-semibold">Feedback SLA</span>
                    <strong className="text-[#0E0E0E]">Within {v.feedback_window_hours} Hours</strong>
                  </div>
                  <div className="bg-white border border-[#EBEBEB] p-2 rounded">
                    <span className="text-neutral-500 block font-semibold">Project Archiving</span>
                    <strong className="text-[#0E0E0E]">{v.backup_days} Days Post Delivery</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Table of Contents */}
            {settings.showTableOfContents && (
              <div className="border border-[#E5E5E5] rounded-lg p-3 bg-white">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 block mb-2">
                  T A B L E   O F   C O N T E N T S
                </span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-neutral-700">
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>1. Definitions and Scope</span> <span className="font-mono text-neutral-500">Page 1</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>2. Acceptance of Terms</span> <span className="font-mono text-neutral-500">Page 1</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>3. Pricing and Taxes</span> <span className="font-mono text-neutral-500">Page 2</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>4. Payment Terms &amp; Advance</span> <span className="font-mono text-neutral-500">Page 2</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>5. Late Payment Protocols</span> <span className="font-mono text-neutral-500">Page 2</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>6. Timelines &amp; Client Duties</span> <span className="font-mono text-neutral-500">Page 2</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>7. Revisions and Amendments</span> <span className="font-mono text-neutral-500">Page 2</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>8. Delivery &amp; Acceptance</span> <span className="font-mono text-neutral-500">Page 2</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>9. Raw Footage &amp; Project Files</span> <span className="font-mono text-neutral-500">Page 3</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>10. Client Assets &amp; Licences</span> <span className="font-mono text-neutral-500">Page 3</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>11. Non-Disclosure &amp; Privacy</span> <span className="font-mono text-neutral-500">Page 3</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>12. Cancellation and Refunds</span> <span className="font-mono text-neutral-500">Page 3</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>13. Advance Protection</span> <span className="font-mono text-neutral-500">Page 4</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>14. File Backup &amp; Storage</span> <span className="font-mono text-neutral-500">Page 4</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>15. Portfolio &amp; Marketing</span> <span className="font-mono text-neutral-500">Page 4</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5">
                    <span>20. Law &amp; Jurisdiction</span> <span className="font-mono text-neutral-500">Page 4</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5 font-semibold text-[#0E0E0E]">
                    <span>Formal Execution &amp; Signatures</span> <span className="font-mono text-neutral-500">Page 5</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-neutral-200 py-0.5 font-semibold text-[#0E0E0E]">
                    <span>Revision History Appendix</span> <span className="font-mono text-neutral-500">Page 5</span>
                  </div>
                </div>
              </div>
            )}

            {/* Clauses 1 & 2 */}
            <div className="space-y-3 pt-1">
              {page1Clauses.map((clause) => (
                <div key={clause.id} className="border-l-2 border-[#0E0E0E] pl-3 py-0.5">
                  <div className="text-[11.5px] font-bold text-[#0E0E0E] uppercase tracking-wide">
                    {clause.number}. {resolveVariables(clause.title, v, clauses)}
                  </div>
                  <div className="text-[11px] text-neutral-700 leading-relaxed font-sans mt-0.5 whitespace-pre-wrap">
                    {resolveVariables(clause.body, v, clauses)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {renderFooter(1)}
      </div>

      {/* ================= PAGE 2 ================= */}
      <div
        className="policies-a4-page bg-white text-[#0E0E0E] font-sans mx-auto relative flex flex-col justify-between shadow-lg print:shadow-none"
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: '297mm',
          boxSizing: 'border-box',
          padding: '0',
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div>
          {renderSlimHeader(2)}
          <div className="px-10 pt-5 space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-1">
              SECTION 02: COMMERCIAL TERMS, PAYMENTS, REVISIONS &amp; TIMELINES
            </div>

            {page2Clauses.map((clause) => (
              <div key={clause.id} className="border-l-2 border-neutral-400 pl-3 py-0.5">
                <div className="text-[11px] font-bold text-[#0E0E0E] uppercase tracking-wide">
                  {clause.number}. {resolveVariables(clause.title, v, clauses)}
                </div>
                <div className="text-[10.5px] text-neutral-700 leading-relaxed font-sans mt-0.5 whitespace-pre-wrap">
                  {resolveVariables(clause.body, v, clauses)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {renderFooter(2)}
      </div>

      {/* ================= PAGE 3 ================= */}
      <div
        className="policies-a4-page bg-white text-[#0E0E0E] font-sans mx-auto relative flex flex-col justify-between shadow-lg print:shadow-none"
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: '297mm',
          boxSizing: 'border-box',
          padding: '0',
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div>
          {renderSlimHeader(3)}
          <div className="px-10 pt-5 space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-1">
              SECTION 03: ASSETS, CONFIDENTIALITY &amp; CANCELLATION FRAMEWORK
            </div>

            {page3Clauses.map((clause) => (
              <div key={clause.id} className="border-l-2 border-neutral-400 pl-3 py-0.5">
                <div className="text-[11px] font-bold text-[#0E0E0E] uppercase tracking-wide">
                  {clause.number}. {resolveVariables(clause.title, v, clauses)}
                </div>
                <div className="text-[10.5px] text-neutral-700 leading-relaxed font-sans mt-0.5 whitespace-pre-wrap">
                  {resolveVariables(clause.body, v, clauses)}
                </div>

                {clause.subClauses && clause.subClauses.length > 0 && (
                  <div className="mt-2 pl-3 border-l border-neutral-300 space-y-1.5">
                    {clause.subClauses.map((sub) => (
                      <div key={sub.id} className="text-[10px] text-neutral-700 leading-relaxed">
                        <strong className="text-[#0E0E0E]">{sub.number}</strong>{' '}
                        {resolveVariables(sub.body, v, clauses)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Clause 12 Worked Example Box */}
                {clause.hasWorkedExampleBox && settings.showWorkedExampleBox && (
                  <div className="mt-2 bg-[#F0F0F0] border-l-4 border-black p-2.5 rounded-r text-[10px] leading-relaxed text-neutral-700">
                    <strong className="text-[#0E0E0E]">Clause 12 Worked Settlement Calculation:</strong> Advance ₹6,000 paid on a ₹10,000 package. Client cancels on Day 3 (within {v.refund_window_days} days). 1 deliverable completed at standard rate of ₹1,500. Retained share ({v.refund_retention_percent}% of ₹6,000) = ₹3,000. Completed work = ₹1,500. Total deductions = ₹4,500. Net refund payable to client = ₹1,500 (disbursed in {v.refund_processing_days} working days).
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {renderFooter(3)}
      </div>

      {/* ================= PAGE 4 ================= */}
      <div
        className="policies-a4-page bg-white text-[#0E0E0E] font-sans mx-auto relative flex flex-col justify-between shadow-lg print:shadow-none"
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: '297mm',
          boxSizing: 'border-box',
          padding: '0',
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div>
          {renderSlimHeader(4)}
          <div className="px-10 pt-5 space-y-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-1">
              SECTION 04: OPERATIONS, BACKUP, SLA &amp; LEGAL JURISDICTION
            </div>

            {page4Clauses.map((clause) => (
              <div key={clause.id} className="border-l-2 border-neutral-400 pl-3 py-0.5">
                <div className="text-[10.5px] font-bold text-[#0E0E0E] uppercase tracking-wide">
                  {clause.number}. {resolveVariables(clause.title, v, clauses)}
                </div>
                <div className="text-[10px] text-neutral-700 leading-relaxed font-sans mt-0.5 whitespace-pre-wrap">
                  {resolveVariables(clause.body, v, clauses)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {renderFooter(4)}
      </div>

      {/* ================= PAGE 5 ================= */}
      <div
        className="policies-a4-page bg-white text-[#0E0E0E] font-sans mx-auto relative flex flex-col justify-between shadow-lg print:shadow-none"
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: '297mm',
          boxSizing: 'border-box',
          padding: '0',
          fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div>
          {renderSlimHeader(5)}
          <div className="px-10 pt-5 space-y-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-1">
              SECTION 05: FORMAL ACKNOWLEDGEMENT &amp; REVISION HISTORY
            </div>

            {/* Acknowledgement Box */}
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-4">
              <h3 className="text-xs font-bold text-[#0E0E0E] uppercase tracking-wider mb-2">
                CLIENT ACKNOWLEDGEMENT &amp; ACCEPTANCE
              </h3>
              <p className="text-[11px] text-neutral-700 leading-relaxed">
                By countersigning this document, transferring the project advance, or issuing written confirmation via email or WhatsApp, the Client formally covenants and declares that they have carefully read, understood, and unconditionally accepted all 20 sections of these DEVRIAN Master Terms &amp; Conditions and Policies.
              </p>
            </div>

            {/* Signature Blocks */}
            {settings.showAcknowledgementSignatures && (
              <div className="grid grid-cols-2 gap-8 pt-2">
                {/* Client Signature */}
                <div className="border border-[#E5E5E5] rounded p-4 bg-white">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-neutral-500 block">
                    Signed For &amp; On Behalf Of Client
                  </span>
                  <div className="h-16 flex items-end">
                    <div className="w-full border-b border-dashed border-neutral-400" />
                  </div>
                  <div className="space-y-1 text-[10px] text-neutral-700 mt-2">
                    <div>Authorized Signature: _______________________</div>
                    <div>Signatory Name: __________________________</div>
                    <div>Designation / Title: _________________________</div>
                    <div>Date: ____________________________________</div>
                  </div>
                </div>

                {/* DEVRIAN Signature */}
                <div className="border border-[#E5E5E5] rounded p-4 bg-white">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-neutral-500 block">
                    Signed For &amp; On Behalf Of DEVRIAN
                  </span>
                  <div className="h-16 flex items-center justify-start">
                    {signatureUrl ? (
                      <img
                        src={signatureUrl}
                        alt="Dev Rajpoot"
                        className="h-12 w-auto object-contain"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <span className="font-serif italic text-xl font-bold text-neutral-800">
                        Dev Rajpoot
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-[10px] text-neutral-700 mt-2 pt-1 border-t border-neutral-200">
                    <div>Authorized Signatory: <strong>{v.owner_name}</strong></div>
                    <div>Designation: <strong>{v.owner_title}</strong></div>
                    <div>Entity: <strong>{v.business_name}</strong> (Udyam: {v.udyam_no})</div>
                    <div>Date: <strong>{settings.effectiveDate}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* Revision History Appendix */}
            {settings.showRevisionHistoryAppendix && versions && versions.length > 0 && (
              <div className="pt-2">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5">
                  APPENDIX: REVISION HISTORY &amp; AMENDMENT LOG
                </span>
                <table className="w-full text-[10px] border border-[#E5E5E5] border-collapse">
                  <thead>
                    <tr className="bg-[#0E0E0E] text-white text-[9px] uppercase font-bold tracking-wider">
                      <th className="py-1.5 px-2.5 text-left">Version</th>
                      <th className="py-1.5 px-2.5 text-left">Effective Date</th>
                      <th className="py-1.5 px-2.5 text-left">Supersedes</th>
                      <th className="py-1.5 px-2.5 text-left">Amendment Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {versions.map((ver) => (
                      <tr key={ver.id} className="hover:bg-neutral-50">
                        <td className="py-1.5 px-2.5 font-mono font-bold text-[#0E0E0E]">
                          v{ver.version}
                        </td>
                        <td className="py-1.5 px-2.5 text-neutral-700">{ver.effectiveDate}</td>
                        <td className="py-1.5 px-2.5 text-neutral-500 font-mono">
                          {ver.supersedesVersion ? `v${ver.supersedesVersion}` : 'None'}
                        </td>
                        <td className="py-1.5 px-2.5 text-neutral-700">{ver.changeNote}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {renderFooter(5)}
      </div>
    </div>
  );
};

