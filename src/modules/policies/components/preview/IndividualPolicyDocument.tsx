import React from 'react';
import { Clause, PolicyVariables, PolicySettings, IndividualPolicyType } from '../../types';
import { resolveVariables } from '../../utils/variableResolver';

interface IndividualPolicyDocumentProps {
  type: IndividualPolicyType;
  clauses: Clause[];
  variables: PolicyVariables;
  settings: PolicySettings;
  logoUrl?: string;
  signatureUrl?: string;
}

const POLICY_META: Record<
  IndividualPolicyType,
  {
    code: string;
    eyebrow: string;
    title: string;
    clauseKeys: string[];
    workedBoxTitle: string;
    workedBoxContent: (v: PolicyVariables) => React.ReactNode;
  }
> = {
  refund: {
    code: 'POL-REFUND',
    eyebrow: 'COMMERCIAL POLICY 01',
    title: 'REFUND & CANCELLATION POLICY',
    clauseKeys: ['cancellation_refund', 'advance_protection'],
    workedBoxTitle: 'Worked Settlement Formula (Clause 12)',
    workedBoxContent: (v) => (
      <div className="space-y-1.5 text-[10.5px] text-[#333333] leading-relaxed">
        <p>
          <strong>Calculation Example:</strong> Advance paid ₹6,000 on a ₹10,000 package. Client requests cancellation on Day 3 (within {v.refund_window_days} days). 1 unit delivered at standard rate of ₹1,500.
        </p>
        <div className="bg-white p-2.5 border border-[#E5E5E5] rounded font-mono text-[10px] space-y-0.5">
          <div>1. Retained Advance Share ({v.refund_retention_percent}% of ₹6,000) = ₹3,000</div>
          <div>2. Completed Work (1 unit @ ₹1,500) = ₹1,500</div>
          <div>3. Total Allowable Deductions = ₹3,000 + ₹1,500 = ₹4,500</div>
          <div className="font-bold text-[#0E0E0E] mt-1 pt-1 border-t border-[#E5E5E5]">
            4. Net Refund Payable = ₹6,000 - ₹4,500 = ₹1,500 (Disbursed in {v.refund_processing_days} working days)
          </div>
        </div>
        <p className="text-[9.5px] text-[#666666] italic">
          *Note: After {v.refund_window_days} days from advance payment date, 100% of the advance is strictly non-refundable.
        </p>
      </div>
    ),
  },
  payment: {
    code: 'POL-PAYMENT',
    eyebrow: 'COMMERCIAL POLICY 02',
    title: 'PAYMENT & LATE PAYMENT POLICY',
    clauseKeys: ['pricing_taxes', 'payment_terms', 'late_payment', 'suspension_termination'],
    workedBoxTitle: 'Payment Protocol & Deadlines',
    workedBoxContent: (v) => (
      <div className="space-y-1.5 text-[10.5px] text-[#333333] leading-relaxed">
        <p>
          <strong>Advance Requirement:</strong> An advance of {v.advance_percent}% is mandatory prior to slot booking and commencement.
        </p>
        <p>
          <strong>Balance Window:</strong> Final balance must be disbursed within {v.balance_due_hours} hours of project approval before watermark-free delivery.
        </p>
        <p>
          <strong>Delayed Payment Stop-Work:</strong> Active video editing, revision drafts, and asset delivery immediately halt if payments exceed the {v.balance_due_hours}-hour deadline. Work resumes only upon bank credit confirmation.
        </p>
      </div>
    ),
  },
  revision: {
    code: 'POL-REVISION',
    eyebrow: 'COMMERCIAL POLICY 03',
    title: 'REVISION & APPROVAL POLICY',
    clauseKeys: ['revisions', 'timelines_responsibilities', 'delivery_approval'],
    workedBoxTitle: 'Scope & Turnaround Standard',
    workedBoxContent: (v) => (
      <div className="space-y-1.5 text-[10.5px] text-[#333333] leading-relaxed">
        <p>
          <strong>Included Scope:</strong> Exactly {v.revision_rounds} rounds of minor adjustments (timing, typography, color tweaks) are included per video.
        </p>
        <p>
          <strong>Review Window:</strong> Feedback must be consolidated and returned within {v.feedback_window_hours} hours of receiving draft preview links.
        </p>
        <p>
          <strong>Out of Scope:</strong> Script restructuring, re-recording voiceover, replacement footage, or changing the initial approved moodboard is classified as a scope expansion and will be {v.extra_revision_charge}.
        </p>
      </div>
    ),
  },
  delivery: {
    code: 'POL-DELIVERY',
    eyebrow: 'COMMERCIAL POLICY 04',
    title: 'DELIVERY & OWNERSHIP POLICY',
    clauseKeys: ['delivery_approval', 'project_files', 'backup_archiving', 'showcase_portfolio'],
    workedBoxTitle: 'Intellectual Property & Asset Archival',
    workedBoxContent: (v) => (
      <div className="space-y-1.5 text-[10.5px] text-[#333333] leading-relaxed">
        <p>
          <strong>Deliverable License:</strong> Full perpetual commercial usage rights to final rendered videos are granted upon 100% receipt of invoice balance.
        </p>
        <p>
          <strong>Source Projects:</strong> Premiere Pro/After Effects project files, plugins, project structures, and working assets remain DEVRIAN proprietary IP unless an open-file buyout agreement is executed.
        </p>
        <p>
          <strong>Archiving Guarantee:</strong> Project files are retained on local NVMe/cloud storage for {v.backup_days} days. Clients must maintain secondary backups of all deliverables.
        </p>
      </div>
    ),
  },
  communication: {
    code: 'POL-SLA',
    eyebrow: 'COMMERCIAL POLICY 05',
    title: 'COMMUNICATION & WORKING HOURS POLICY',
    clauseKeys: ['communication_hours', 'timelines_responsibilities', 'governing_law'],
    workedBoxTitle: 'Availability & Response Service Level Agreement',
    workedBoxContent: (v) => (
      <div className="space-y-1.5 text-[10.5px] text-[#333333] leading-relaxed">
        <p>
          <strong>Active Business Hours:</strong> {v.working_days}, {v.working_hours} (IST). Inquiries submitted outside these hours are queued for next business day morning.
        </p>
        <p>
          <strong>Query Response SLA:</strong> Maximum {v.reply_time_hours} business hours turnaround for all standard operational communications.
        </p>
        <p>
          <strong>Primary Channels:</strong> WhatsApp Business ({v.official_email}) and Email ({v.contact_email}). Formal approvals must be documented in writing.
        </p>
      </div>
    ),
  },
};

export const IndividualPolicyDocument: React.FC<IndividualPolicyDocumentProps> = ({
  type,
  clauses,
  variables,
  settings,
  logoUrl = '/brand/devrian-symbol-pure-white.png',
  signatureUrl,
}) => {
  const meta = POLICY_META[type] || POLICY_META.refund;
  const v = variables;

  const relevantClauses = clauses.filter(
    (c) => c.isVisible && meta.clauseKeys.includes(c.key)
  );

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
              OFFICIAL POLICY SHEET
            </span>
          </div>

          <div className="text-[9px] font-bold tracking-[0.18em] text-[#777777] uppercase font-sans">
            DOCUMENT: {settings.documentNumber}-{meta.code}
          </div>
        </div>

        {/* Content Body */}
        <div className="px-12 pt-6 space-y-4">
          <div>
            <span className="text-[10px] font-bold text-[#888888] tracking-[0.2em] uppercase block">
              {meta.eyebrow}
            </span>
            <h1 className="text-xl font-extrabold text-[#0E0E0E] tracking-tight uppercase mt-0.5">
              {meta.title}
            </h1>
            <p className="text-xs text-[#666666] mt-0.5">
              DEVRIAN Commercial Schedule • Governed by Terms &amp; Conditions and Policies DEV-TNC-v1.0.
            </p>
          </div>

          {/* Focused Clauses */}
          <div className="space-y-3">
            {relevantClauses.map((clause) => (
              <div key={clause.id} className="border border-[#E5E5E5] rounded p-3.5 bg-[#FAFAFA]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-4 h-4 rounded bg-[#0E0E0E] text-white flex items-center justify-center text-[9.5px] font-bold">
                    {clause.number}
                  </span>
                  <h3 className="text-xs font-bold text-[#0E0E0E] uppercase tracking-wide">
                    {resolveVariables(clause.title, v, clauses)}
                  </h3>
                </div>
                <p className="text-[11px] text-[#444444] leading-relaxed font-sans whitespace-pre-wrap">
                  {resolveVariables(clause.body, v, clauses)}
                </p>

                {clause.subClauses && clause.subClauses.length > 0 && (
                  <div className="mt-2 pl-3 border-l-2 border-[#D0D0D0] space-y-1">
                    {clause.subClauses.map((sub) => (
                      <div key={sub.id} className="text-[10.5px] text-[#444444] leading-relaxed">
                        <strong className="text-[#0E0E0E]">{sub.number}</strong>{' '}
                        {resolveVariables(sub.body, v, clauses)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Worked Example Box */}
          <div className="bg-[#F0F0F0] border-l-4 border-black p-3.5 rounded-r">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#0E0E0E] block mb-1">
              {meta.workedBoxTitle}
            </span>
            {meta.workedBoxContent(v)}
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
          <strong className="text-[#0E0E0E]">DEVRIAN</strong> &bull; {meta.title} &bull; Udyam: {v.udyam_no}
        </div>
        <div className="font-semibold text-[#0E0E0E]">
          Page 1 of 1
        </div>
      </div>
    </div>
  );
};
