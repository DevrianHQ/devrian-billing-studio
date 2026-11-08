import React from 'react';
import { Clause, PolicyVariables, PolicySettings } from '../../types';
import { resolveVariables } from '../../utils/variableResolver';

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

  // Selected core clauses for concise summary
  const summaryClauses = [
    {
      title: 'Advance & Payment Terms',
      points: [
        `An advance of ${v.advance_percent}% is mandatory before any creative or production work commences.`,
        `The remaining balance is due within ${v.balance_due_hours} hours of project completion and final approval.`,
        `Payment delays pause active work immediately and extend turnaround timelines by the delay duration.`,
      ],
    },
    {
      title: 'Cancellation & Refund Framework',
      points: [
        `Cancellation within ${v.refund_window_days} calendar days of advance: ${v.refund_retention_percent}% of advance is retained, plus deductions for completed/started units at standard rates.`,
        `After ${v.refund_window_days} days from advance payment, the advance is strictly 100% non-refundable.`,
        `Approved refund disbursements are processed within ${v.refund_processing_days} working days via originating payment method.`,
      ],
    },
    {
      title: 'Revisions & Scope Management',
      points: [
        `${v.revision_rounds} included revision rounds are provided per deliverable within the approved brief.`,
        `Client feedback must be submitted within ${v.feedback_window_hours} hours of each draft presentation.`,
        `Changes in script, concept, footage or brand direction constitute a new scope (${v.extra_revision_charge}).`,
      ],
    },
    {
      title: 'Deliverables, Assets & File Retention',
      points: [
        `Final edited videos/exports are transferred upon receipt of full final settlement payment.`,
        `Project files, project archives, and raw assets remain proprietary to DEVRIAN unless purchased separately.`,
        `Working project files are archived for ${v.backup_days} calendar days post-delivery, after which they may be purged.`,
      ],
    },
    {
      title: 'Communication SLA & Jurisdiction',
      points: [
        `Official working hours: ${v.working_days}, ${v.working_hours}. Standard query response window is ${v.reply_time_hours} business hours.`,
        `All engagements are governed under the exclusive jurisdiction of the competent courts of ${v.jurisdiction_city}, ${v.jurisdiction_state}.`,
      ],
    },
  ];

  return (
    <div
      className="policies-a4-page bg-white text-[#0E0E0E] font-sans mx-auto relative flex flex-col justify-between"
      style={{
        width: '210mm',
        minHeight: '297mm',
        height: '297mm',
        boxSizing: 'border-box',
        padding: '0',
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        transform: scale < 1.0 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      <div>
        {/* Top Black Header Band */}
        <div className="bg-[#0E0E0E] text-white px-10 pt-7 pb-6 relative overflow-hidden select-none">
          {/* Subtle diagonal background lines */}
          <div
            className="absolute right-0 top-0 bottom-0 w-80 opacity-15 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, transparent 40%, #ffffff 40%, #ffffff 45%, transparent 45%, transparent 55%, #ffffff 55%, #ffffff 60%, transparent 60%)',
            }}
          />

          <div className="flex items-center justify-between relative z-10">
            {/* Wordmark Lockup */}
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

            {/* Document Eyebrow & Title */}
            <div className="text-right">
              <span className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase block">
                L E G A L   S U M M A R Y
              </span>
              <h1 className="text-xl font-extrabold tracking-tight text-white uppercase mt-0.5">
                TERMS &amp; POLICIES SUMMARY
              </h1>
            </div>
          </div>

          {/* Meta Bar */}
          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 relative z-10">
            <div>
              <span className="text-neutral-500">Document No:</span>{' '}
              <strong className="text-white font-mono">{settings.documentNumber}-SUM</strong>
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
              <span className="text-neutral-500">Standard:</span>{' '}
              <strong className="text-white uppercase">Client Attachment</strong>
            </div>
          </div>
        </div>

        {/* Business Sub-header Ribbon */}
        <div className="bg-[#1A1A1A] text-neutral-300 px-10 py-2 text-[9.5px] flex items-center justify-between border-b border-neutral-300">
          <div>
            <strong>DEVRIAN</strong> &bull; {v.official_email} &bull; {v.contact_email} &bull; {v.website}
          </div>
          <div>
            Udyam Reg. No.: <strong>{v.udyam_no}</strong> &bull; Proprietor: <strong>{v.owner_name}</strong>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-10 pt-5 space-y-4">
          {/* Key Terms at a Glance (Compact Grid) */}
          <div className="border border-[#E5E5E5] rounded-lg p-3.5 bg-[#FAFAFA]">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 block mb-2">
              K E Y   T E R M S   A T   A   G L A N C E
            </span>
            <div className="grid grid-cols-3 gap-2.5 text-[10.5px]">
              <div className="bg-white border border-[#EBEBEB] p-2 rounded">
                <div className="text-[9px] text-neutral-500 uppercase font-bold">Advance Required</div>
                <div className="font-bold text-[#0E0E0E] mt-0.5">{v.advance_percent}% Before Kick-off</div>
              </div>

              <div className="bg-white border border-[#EBEBEB] p-2 rounded">
                <div className="text-[9px] text-neutral-500 uppercase font-bold">Balance Payment</div>
                <div className="font-bold text-[#0E0E0E] mt-0.5">Within {v.balance_due_hours}h of Approval</div>
              </div>

              <div className="bg-white border border-[#EBEBEB] p-2 rounded">
                <div className="text-[9px] text-neutral-500 uppercase font-bold">Refund Eligibility</div>
                <div className="font-bold text-[#0E0E0E] mt-0.5">{v.refund_window_days} Days ({v.refund_retention_percent}% Retained)</div>
              </div>

              <div className="bg-white border border-[#EBEBEB] p-2 rounded">
                <div className="text-[9px] text-neutral-500 uppercase font-bold">Included Revisions</div>
                <div className="font-bold text-[#0E0E0E] mt-0.5">{v.revision_rounds} Rounds per Deliverable</div>
              </div>

              <div className="bg-white border border-[#EBEBEB] p-2 rounded">
                <div className="text-[9px] text-neutral-500 uppercase font-bold">Turnaround SLA</div>
                <div className="font-bold text-[#0E0E0E] mt-0.5">{v.feedback_window_hours}h Review Cycle</div>
              </div>

              <div className="bg-white border border-[#EBEBEB] p-2 rounded">
                <div className="text-[9px] text-neutral-500 uppercase font-bold">File Retention</div>
                <div className="font-bold text-[#0E0E0E] mt-0.5">{v.backup_days} Days Post Delivery</div>
              </div>
            </div>
          </div>

          {/* 5 Core Policy Sections */}
          <div className="space-y-3">
            {summaryClauses.map((sc, idx) => (
              <div key={idx} className="border-b border-neutral-200 pb-2.5">
                <div className="text-xs font-bold text-[#0E0E0E] uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded bg-[#0E0E0E] text-white flex items-center justify-center text-[9px] font-bold">
                    {idx + 1}
                  </span>
                  <span>{sc.title}</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-neutral-700 pl-5 leading-snug">
                  {sc.points.map((pt, pIdx) => (
                    <li key={pIdx}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Policy Compliance Box */}
          <div className="bg-[#F0F0F0] border-l-4 border-black p-3 text-[10.5px] leading-relaxed text-neutral-700">
            <strong>Binding Agreement:</strong> By transferring the advance payment, approving an estimate, or issuing written confirmation via Email/WhatsApp, the Client formally covenants and agrees to these summary policies and DEVRIAN's full master terms.
          </div>

          {/* Signatures Row */}
          <div className="grid grid-cols-2 gap-8 pt-1">
            <div className="border border-[#E5E5E5] rounded p-2.5 bg-[#FAFAFA]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 block">
                Client Acceptance Signature
              </span>
              <div className="h-9 flex items-end">
                <div className="w-full border-b border-dashed border-neutral-400" />
              </div>
              <div className="flex justify-between text-[9.5px] text-neutral-600 mt-1">
                <span>Authorized Signatory</span>
                <span>Date: _______________</span>
              </div>
            </div>

            <div className="border border-[#E5E5E5] rounded p-2.5 bg-[#FAFAFA]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 block">
                DEVRIAN Commercial Authorization
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
                  <span className="font-serif italic text-base font-bold text-neutral-800">
                    Dev Rajpoot
                  </span>
                )}
              </div>
              <div className="flex justify-between text-[9.5px] text-neutral-600 mt-1 pt-0.5 border-t border-neutral-300">
                <span>{v.owner_name} ({v.owner_title})</span>
                <span>{v.contact_email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 pb-5 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-[9.5px] text-neutral-500">
        <div>{v.business_name} &bull; Policy Summary v{settings.currentVersion} &bull; {v.udyam_no} &bull; {v.contact_email}</div>
        <div>Page 1 of 1</div>
      </div>
    </div>
  );
};
