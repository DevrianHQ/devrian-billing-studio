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
      <div className="space-y-1.5 text-[11px] text-neutral-700 leading-relaxed">
        <p>
          <strong>Example:</strong> Advance paid ₹6,000 on 10,000 package. Client requests cancellation on Day 3 (within {v.refund_window_days} days). 1 unit delivered at standard rate of ₹1,500.
        </p>
        <div className="bg-white p-2 border border-neutral-300 rounded font-mono text-[10.5px]">
          <div>1. Retained Advance Share ({v.refund_retention_percent}% of ₹6,000) = ₹3,000</div>
          <div>2. Completed Work (1 unit @ ₹1,500) = ₹1,500</div>
          <div>3. Total Deductions = ₹3,000 + ₹1,500 = ₹4,500</div>
          <div className="font-bold text-[#0E0E0E] mt-1 pt-1 border-t border-neutral-200">
            4. Net Refund Payable = ₹6,000 - ₹4,500 = ₹1,500 (Disbursed in {v.refund_processing_days} working days)
          </div>
        </div>
        <p className="text-[10px] text-neutral-500 italic">
          *Note: If cancellation occurs after {v.refund_window_days} days from advance date, 100% of the advance is strictly non-refundable.
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
      <div className="space-y-1.5 text-[11px] text-neutral-700 leading-relaxed">
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
      <div className="space-y-1.5 text-[11px] text-neutral-700 leading-relaxed">
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
      <div className="space-y-1.5 text-[11px] text-neutral-700 leading-relaxed">
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
      <div className="space-y-1.5 text-[11px] text-neutral-700 leading-relaxed">
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
      className="policies-a4-page bg-white text-[#0E0E0E] font-sans mx-auto relative flex flex-col justify-between"
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
        {/* Top Header Band */}
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
                {meta.eyebrow}
              </span>
              <h1 className="text-xl font-extrabold tracking-tight text-white uppercase mt-0.5">
                {meta.title}
              </h1>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 relative z-10">
            <div>
              <span className="text-neutral-500">Document No:</span>{' '}
              <strong className="text-white font-mono">{settings.documentNumber}-{meta.code}</strong>
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
              <span className="text-neutral-500">Classification:</span>{' '}
              <strong className="text-white uppercase">Official Policy Sheet</strong>
            </div>
          </div>
        </div>

        {/* Business Ribbon */}
        <div className="bg-[#1A1A1A] text-neutral-300 px-10 py-2 text-[9.5px] flex items-center justify-between border-b border-neutral-300">
          <div>
            <strong>DEVRIAN</strong> &bull; {v.official_email} &bull; {v.contact_email} &bull; {v.website}
          </div>
          <div>
            Udyam Reg. No.: <strong>{v.udyam_no}</strong> &bull; Proprietor: <strong>{v.owner_name}</strong>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-10 pt-5 space-y-4">
          {/* Detailed Clauses */}
          <div className="space-y-4">
            {relevantClauses.map((clause) => (
              <div key={clause.id} className="border border-[#E5E5E5] rounded-lg p-4 bg-[#FAFAFA]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded bg-[#0E0E0E] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {clause.number}
                  </span>
                  <h3 className="text-xs font-bold text-[#0E0E0E] uppercase tracking-wide">
                    {resolveVariables(clause.title, v, clauses)}
                  </h3>
                </div>
                <p className="text-[11.5px] text-neutral-700 leading-relaxed font-sans whitespace-pre-wrap">
                  {resolveVariables(clause.body, v, clauses)}
                </p>

                {clause.subClauses && clause.subClauses.length > 0 && (
                  <div className="mt-3 pl-3 border-l-2 border-neutral-300 space-y-2">
                    {clause.subClauses.map((sub) => (
                      <div key={sub.id} className="text-[11px] text-neutral-700 leading-relaxed">
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
          <div className="bg-[#F0F0F0] border-l-4 border-black p-4 rounded-r-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E0E0E] block mb-1.5">
              {meta.workedBoxTitle}
            </span>
            {meta.workedBoxContent(v)}
          </div>

          {/* Policy Compliance Notice */}
          <div className="border border-neutral-200 rounded p-3 text-[10.5px] text-neutral-600 bg-white">
            <strong>Standard Operation Notice:</strong> This policy sheet forms an integral schedule to the DEVRIAN Master Terms &amp; Conditions. Engagements commenced with DEVRIAN operate under these explicit operational terms.
          </div>

          {/* Dual Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-2">
            <div className="border border-[#E5E5E5] rounded p-2.5 bg-[#FAFAFA]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 block">
                Client Signature &amp; Acknowledgment
              </span>
              <div className="h-10 flex items-end">
                <div className="w-full border-b border-dashed border-neutral-400" />
              </div>
              <div className="flex justify-between text-[9.5px] text-neutral-600 mt-1">
                <span>Authorized Signatory</span>
                <span>Date: _______________</span>
              </div>
            </div>

            <div className="border border-[#E5E5E5] rounded p-2.5 bg-[#FAFAFA]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 block">
                Issued By: DEVRIAN
              </span>
              <div className="h-10 flex items-center justify-start">
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
        <div>{v.business_name} &bull; {meta.title} v{settings.currentVersion} &bull; {v.udyam_no}</div>
        <div>Page 1 of 1</div>
      </div>
    </div>
  );
};
