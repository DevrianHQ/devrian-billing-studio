import React from 'react';
import { Clause, PolicyVariables, PolicySettings } from '../../types';

interface PolicySummaryDocumentProps {
  clauses: Clause[];
  variables: PolicyVariables;
  settings: PolicySettings;
  logoUrl?: string;
  signatureUrl?: string;
  scale?: number; // Smart-fit scale (e.g. 0.88 - 1.0)
}

export const PolicySummaryDocument: React.FC<PolicySummaryDocumentProps> = ({
  clauses,
  variables,
  settings,
  logoUrl = '/brand/devrian-symbol-pure-white.png',
  signatureUrl,
  scale = 1.0,
}) => {
  const v = variables;

  const summaryCards = [
    {
      label: 'A',
      title: 'Advance & Payment Protocols',
      points: [
        `An advance of ${v.advance_percent}% is mandatory prior to project kick-off and production.`,
        `The balance is due strictly within ${v.balance_due_hours} hours of deliverable approval.`,
        `Delays in payment pause active editing and extend turnaround schedules accordingly.`,
      ],
    },
    {
      label: 'B',
      title: 'Cancellation & Refund Framework',
      points: [
        `Cancellation within ${v.refund_window_days} days: ${v.refund_retention_percent}% advance retained + deduction for completed units.`,
        `After ${v.refund_window_days} calendar days, the advance deposit is strictly non-refundable.`,
        `Approved refund disbursements are released within ${v.refund_processing_days} working days via UPI/bank.`,
      ],
    },
    {
      label: 'C',
      title: 'Revisions & Client SLA',
      points: [
        `Includes ${v.revision_rounds} rounds of adjustments (timing, color, typography) within approved brief.`,
        `Client review & feedback must be returned within ${v.feedback_window_hours} hours per draft iteration.`,
        `Concept or footage replacement is treated as a new scope (${v.extra_revision_charge}).`,
      ],
    },
    {
      label: 'D',
      title: 'Deliverables & File Archiving',
      points: [
        `High-resolution export files are transferred upon 100% receipt of invoice balance.`,
        `Raw assets, project files, and project structures remain DEVRIAN proprietary IP.`,
        `Project archives are preserved for ${v.backup_days} days post-delivery before archival purging.`,
      ],
    },
  ];

  return (
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
        transform: scale < 1.0 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {/* Light Chevron Watermark */}
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

      <div>
        {/* Running Header */}
        <div className="px-12 pt-8 pb-3 border-b border-[#E5E5E5] flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <img
              src="/brand/devrian-symbol-black.png"
              alt="DEVRIAN"
              className="h-5 w-auto object-contain"
              crossOrigin="anonymous"
            />
            <img
              src="/brand/devrian-brand-wordmark.png"
              alt="DEVRIAN"
              className="h-3.5 w-auto object-contain"
              crossOrigin="anonymous"
            />
            <span className="text-[#D0D0D0] font-light">|</span>
            <span className="text-[9px] font-semibold tracking-[0.18em] text-[#777777] uppercase font-sans">
              POLICY SUMMARY ATTACHMENT
            </span>
          </div>

          <div className="text-[9px] font-bold tracking-[0.18em] text-[#777777] uppercase font-sans">
            DOCUMENT: {settings.documentNumber}-SUM (v{settings.currentVersion})
          </div>
        </div>

        {/* Content Body */}
        <div className="px-12 pt-6 space-y-4">
          {/* Main Title Block */}
          <div>
            <span className="text-[10px] font-bold text-[#888888] tracking-[0.2em] uppercase block">
              COMMERCIAL SUMMARY
            </span>
            <h1 className="text-xl font-extrabold text-[#0E0E0E] tracking-tight uppercase mt-0.5">
              Client Terms &amp; Policies Summary
            </h1>
            <p className="text-xs text-[#666666] mt-0.5">
              Condensed operating guidelines for proposals, estimates, and invoices.
            </p>
          </div>

          {/* Black Highlight Callout Box (PDF 2 style) */}
          <div className="bg-[#0E0E0E] text-white p-3.5 rounded text-xs font-semibold leading-relaxed">
            This Policy Summary is attached to DEVRIAN proposals and billing invoices. By paying an advance deposit or confirming an order in writing, the Client confirms acceptance of these terms.
          </div>

          {/* Key Metrics 3x2 Grid */}
          <div className="border border-[#E5E5E5] rounded p-3.5 bg-[#FAFAFA]">
            <span className="text-[8.5px] font-bold uppercase tracking-[0.22em] text-[#777777] block mb-2">
              CORE METRICS &amp; OPERATIONAL SLA
            </span>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="bg-white border border-[#E5E5E5] p-2 rounded">
                <span className="text-[#888888] font-semibold block text-[9px] uppercase">Advance</span>
                <strong className="text-[#0E0E0E] text-[11px]">{v.advance_percent}% Before Work</strong>
              </div>
              <div className="bg-white border border-[#E5E5E5] p-2 rounded">
                <span className="text-[#888888] font-semibold block text-[9px] uppercase">Balance Due</span>
                <strong className="text-[#0E0E0E] text-[11px]">Within {v.balance_due_hours}h</strong>
              </div>
              <div className="bg-white border border-[#E5E5E5] p-2 rounded">
                <span className="text-[#888888] font-semibold block text-[9px] uppercase">Refund Window</span>
                <strong className="text-[#0E0E0E] text-[11px]">{v.refund_window_days} Calendar Days</strong>
              </div>
              <div className="bg-white border border-[#E5E5E5] p-2 rounded">
                <span className="text-[#888888] font-semibold block text-[9px] uppercase">Revisions</span>
                <strong className="text-[#0E0E0E] text-[11px]">{v.revision_rounds} Included Rounds</strong>
              </div>
              <div className="bg-white border border-[#E5E5E5] p-2 rounded">
                <span className="text-[#888888] font-semibold block text-[9px] uppercase">Feedback SLA</span>
                <strong className="text-[#0E0E0E] text-[11px]">Within {v.feedback_window_hours} Hours</strong>
              </div>
              <div className="bg-white border border-[#E5E5E5] p-2 rounded">
                <span className="text-[#888888] font-semibold block text-[9px] uppercase">Working Hours</span>
                <strong className="text-[#0E0E0E] text-[11px]">{v.working_hours}</strong>
              </div>
            </div>
          </div>

          {/* 4 Cards in 2x2 Grid with Dark Header Bar (PDF 2 style) */}
          <div className="grid grid-cols-2 gap-3.5">
            {summaryCards.map((card) => (
              <div key={card.label} className="border border-[#E5E5E5] rounded overflow-hidden bg-white">
                <div className="bg-[#0E0E0E] text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-white text-black flex items-center justify-center text-[9.5px] font-black">
                    {card.label}
                  </span>
                  <span>{card.title}</span>
                </div>
                <div className="p-3 space-y-1.5 text-[10px] text-[#444444] leading-relaxed">
                  {card.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-1.5">
                      <span className="text-black font-bold">▸</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Note Box with solid black left border */}
          <div className="bg-[#F0F0F0] border-l-4 border-black p-3 text-[10px] leading-relaxed text-[#333333]">
            <strong>Governing Jurisdiction:</strong> All agreements are governed by the laws of India under the exclusive jurisdiction of the competent courts of {v.jurisdiction_city}, {v.jurisdiction_state}. Full Terms &amp; Conditions and Policies are available upon request.
          </div>

          {/* Dual Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-1">
            <div className="border border-[#E5E5E5] rounded p-2.5 bg-[#FAFAFA]">
              <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#777777] block">
                CLIENT ACKNOWLEDGEMENT
              </span>
              <div className="h-9 flex items-end">
                <div className="w-full border-b border-dashed border-[#AAAAAA]" />
              </div>
              <div className="flex justify-between text-[9px] text-[#666666] mt-1">
                <span>Authorized Signatory</span>
                <span>Date: _______________</span>
              </div>
            </div>

            <div className="border border-[#E5E5E5] rounded p-2.5 bg-[#FAFAFA]">
              <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#777777] block">
                ISSUED FOR DEVRIAN
              </span>
              <div className="h-9 flex items-center justify-start">
                {signatureUrl ? (
                  <img
                    src={signatureUrl}
                    alt="Dev Rajpoot"
                    className="h-8 w-auto object-contain"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <span className="font-serif italic text-sm font-bold text-[#0E0E0E]">
                    Dev Rajpoot
                  </span>
                )}
              </div>
              <div className="flex justify-between text-[9px] text-[#666666] mt-1 pt-0.5 border-t border-[#E5E5E5]">
                <span>{v.owner_name} ({v.owner_title})</span>
                <span>{v.contact_email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Running Footer */}
      <div className="px-12 pb-6 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-[9px] text-[#777777] font-sans select-none">
        <div>
          <strong className="text-[#0E0E0E]">DEVRIAN</strong> &bull; Policy Summary &bull; Udyam: {v.udyam_no} &bull; {v.contact_email}
        </div>
        <div className="font-semibold text-[#0E0E0E]">
          Page 1 of 1
        </div>
      </div>
    </div>
  );
};
