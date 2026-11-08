import React from 'react';
import { PolicyVariables, RefundCalculationInput, RefundCalculationResult } from '../../types';

interface SettlementSummaryDocumentProps {
  clientName: string;
  projectName: string;
  proposalNo: string;
  projectTotal: number;
  input: RefundCalculationInput;
  result: RefundCalculationResult;
  variables: PolicyVariables;
  logoUrl?: string;
  signatureUrl?: string;
}

export const SettlementSummaryDocument: React.FC<SettlementSummaryDocumentProps> = ({
  clientName,
  projectName,
  proposalNo,
  projectTotal,
  input,
  result,
  variables,
  logoUrl = '/brand/devrian-symbol-pure-white.png',
  signatureUrl,
}) => {
  const statementNo = `SETTLE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

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
      {/* Top Black Header Band */}
      <div>
        <div className="bg-[#0E0E0E] text-white px-10 pt-8 pb-7 relative overflow-hidden select-none">
          {/* Subtle diagonal geometry in top right */}
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

            {/* Document Title & Eyebrow */}
            <div className="text-right">
              <span className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase block">
                C O M M E R C I A L   S E T T L E M E N T
              </span>
              <h1 className="text-xl font-extrabold tracking-tight text-white uppercase mt-0.5">
                REFUND &amp; CANCELLATION STATEMENT
              </h1>
            </div>
          </div>

          {/* Meta Bar */}
          <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 relative z-10">
            <div>
              <span className="text-neutral-500">Statement No:</span>{' '}
              <strong className="text-white font-mono">{statementNo}</strong>
            </div>
            <div>
              <span className="text-neutral-500">Date:</span>{' '}
              <strong className="text-white">{input.cancellationDate || new Date().toISOString().slice(0, 10)}</strong>
            </div>
            <div>
              <span className="text-neutral-500">Reference:</span>{' '}
              <strong className="text-white">{proposalNo || 'DEV-2026-001'}</strong>
            </div>
            <div>
              <span className="text-neutral-500">Status:</span>{' '}
              <strong className="text-white uppercase">
                {result.isWithinWindow ? '7-Day Eligible' : 'Post-Window Log'}
              </strong>
            </div>
          </div>
        </div>

        {/* Business Details Ribbon */}
        <div className="bg-[#1A1A1A] text-neutral-300 px-10 py-2.5 text-[10px] flex items-center justify-between border-b border-neutral-300">
          <div>
            <strong>DEVRIAN</strong> &bull; Devrian.official@gmail.com &bull; inquiry@devrian.in &bull; devrian.in
          </div>
          <div>
            Udyam Reg. No.: <strong>{variables.udyam_no}</strong> &bull; Proprietor: <strong>Dev Rajpoot</strong>
          </div>
        </div>

        {/* Document Body */}
        <div className="px-10 pt-6 space-y-5">
          {/* Client & Project Information Box */}
          <div className="grid grid-cols-2 gap-4 border border-[#E5E5E5] rounded-lg p-4 bg-[#FAFAFA]">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 block">
                Client Particulars
              </span>
              <div className="text-sm font-bold text-[#0E0E0E] mt-0.5">{clientName || 'Valued Client'}</div>
              <div className="text-xs text-neutral-600 mt-0.5">Project: {projectName || 'Creative Deliverables'}</div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Agreed Total Project Value: ₹{projectTotal.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="border-l border-[#E5E5E5] pl-4">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 block">
                Audit Timeline
              </span>
              <div className="text-xs text-neutral-700 mt-0.5">
                Advance Paid: <strong>{input.advanceDate}</strong>
              </div>
              <div className="text-xs text-neutral-700 mt-0.5">
                Cancellation Date: <strong>{input.cancellationDate}</strong>
              </div>
              <div className="text-xs text-neutral-700 mt-0.5">
                Calendar Days Elapsed:{' '}
                <strong className={result.isWithinWindow ? 'text-emerald-700' : 'text-red-700'}>
                  {result.daysElapsed} day(s)
                </strong>{' '}
                ({result.isWithinWindow ? `Within ${variables.refund_window_days}d window` : `Exceeded ${variables.refund_window_days}d window`})
              </div>
            </div>
          </div>

          {/* Settlement Calculation Table */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-2">
              Accounting &amp; Deliverables Breakdown (As per Clause 12)
            </div>
            <table className="w-full text-xs border border-[#E5E5E5] border-collapse">
              <thead>
                <tr className="bg-[#0E0E0E] text-white text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2 px-3 text-left">Description</th>
                  <th className="py-2 px-3 text-center">Basis / Rate</th>
                  <th className="py-2 px-3 text-center">Units / Factor</th>
                  <th className="py-2 px-3 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#0E0E0E]">
                    Advance Remittance Received
                    <div className="text-[10px] text-neutral-500 font-normal">Initial commitment deposit</div>
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-600">Initial Deposit</td>
                  <td className="py-2.5 px-3 text-center text-neutral-600">100%</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0E0E0E]">
                    ₹{result.advance.toLocaleString('en-IN')}
                  </td>
                </tr>

                <tr className="bg-[#FBFBFB]">
                  <td className="py-2.5 px-3 text-[#0E0E0E]">
                    <strong>Less:</strong> Retained Advance Share
                    <div className="text-[10px] text-neutral-500">
                      {result.isWithinWindow
                        ? `Clause 12.1: ${result.retainedPercent}% fixed retention of advance`
                        : `Clause 12.2: 100% advance non-refundable after ${variables.refund_window_days} days`}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-600">{result.retainedPercent}% share</td>
                  <td className="py-2.5 px-3 text-center text-neutral-600">Advance</td>
                  <td className="py-2.5 px-3 text-right font-mono text-neutral-800">
                    - ₹{result.retainedAmount.toLocaleString('en-IN')}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 text-[#0E0E0E]">
                    <strong>Less:</strong> Deliverables Work Performed
                    <div className="text-[10px] text-neutral-500">
                      {input.unitsCompleted} completed + {input.unitsStarted} started deliverables
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center text-neutral-600">₹{input.standardRate.toLocaleString('en-IN')}/unit</td>
                  <td className="py-2.5 px-3 text-center text-neutral-600">{result.totalUnitsCounted} unit(s)</td>
                  <td className="py-2.5 px-3 text-right font-mono text-neutral-800">
                    - ₹{result.workDoneAmount.toLocaleString('en-IN')}
                  </td>
                </tr>

                <tr className="bg-[#F0F0F0] font-bold text-[#0E0E0E]">
                  <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-[10px] tracking-wider">
                    Total Allowable Deductions:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    ₹{result.totalDeductions.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* High Impact Result Card */}
          <div className="bg-[#0E0E0E] text-white rounded-lg p-5 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-neutral-400 block">
                Final Settlement Determination
              </span>
              <div className="text-xs text-neutral-300 mt-1 max-w-md">
                {result.refundAmount > 0
                  ? `Refund of ₹${result.refundAmount.toLocaleString('en-IN')} is approved and will be remitted to the client's originating payment source within ${variables.refund_processing_days} working days.`
                  : result.extraPayable > 0
                  ? `Deliverables executed exceed the advance payment. An outstanding balance of ₹${result.extraPayable.toLocaleString('en-IN')} is due from the client.`
                  : 'Advance payment is precisely absorbed by allowable retention and completed work. Both parties agree that no further sums are due.'}
              </div>
            </div>

            <div className="text-right pl-4 border-l border-neutral-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                {result.refundAmount > 0 ? 'Net Refund Amount' : result.extraPayable > 0 ? 'Balance Due to DEVRIAN' : 'Net Settlement Balance'}
              </span>
              <div className="text-2xl font-extrabold font-mono text-white mt-0.5">
                {result.refundAmount > 0
                  ? `₹${result.refundAmount.toLocaleString('en-IN')}`
                  : result.extraPayable > 0
                  ? `₹${result.extraPayable.toLocaleString('en-IN')}`
                  : '₹0'}
              </div>
            </div>
          </div>

          {/* Legal Note Box with solid black left border */}
          <div className="bg-[#F0F0F0] border-l-4 border-black p-3.5 text-[11px] leading-relaxed text-neutral-700">
            <strong>Policy Compliance Notice:</strong> This statement is computed pursuant to Section 12 (Cancellation and Refunds) of the DEVRIAN Master Commercial Terms &amp; Policies. Once signed or disbursed, this settlement constitutes a full and final accord and release of all claims arising from proposal reference {proposalNo || 'DEV-2026-001'}.
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="border border-[#E5E5E5] rounded p-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 block">
                Client Acknowledged &amp; Accepted
              </span>
              <div className="h-12 flex items-end">
                <div className="w-full border-b border-dashed border-neutral-400" />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-600 mt-1">
                <span>Name: {clientName || 'Client'}</span>
                <span>Date: _______________</span>
              </div>
            </div>

            <div className="border border-[#E5E5E5] rounded p-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 block">
                For DEVRIAN (Authorized Signatory)
              </span>
              <div className="h-12 flex items-center justify-start">
                {signatureUrl ? (
                  <img
                    src={signatureUrl}
                    alt="Dev Rajpoot"
                    className="h-10 w-auto object-contain"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <span className="font-serif italic text-lg font-bold text-neutral-800">
                    Dev Rajpoot
                  </span>
                )}
              </div>
              <div className="flex justify-between text-[10px] text-neutral-600 mt-1 pt-1 border-t border-neutral-300">
                <span>Dev Rajpoot (Founder &amp; CEO)</span>
                <span>Date: {input.cancellationDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 pb-6 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-[10px] text-neutral-500">
        <div>DEVRIAN &bull; Terms &amp; Conditions v{variables.balance_due_hours ? '1.0' : '1.0'} &bull; {variables.udyam_no} &bull; {variables.contact_email}</div>
        <div>Page 1 of 1</div>
      </div>
    </div>
  );
};
