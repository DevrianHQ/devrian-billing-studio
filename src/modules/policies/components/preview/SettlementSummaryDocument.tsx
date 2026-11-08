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
              SETTLEMENT STATEMENT
            </span>
          </div>

          <div className="text-[9px] font-bold tracking-[0.18em] text-[#777777] uppercase font-sans">
            REF: {statementNo}
          </div>
        </div>

        {/* Content Body */}
        <div className="px-12 pt-6 space-y-4">
          {/* Main Title Block */}
          <div>
            <span className="text-[10px] font-bold text-[#888888] tracking-[0.2em] uppercase block">
              COMMERCIAL SETTLEMENT &bull; CLAUSE 12
            </span>
            <h1 className="text-xl font-extrabold text-[#0E0E0E] tracking-tight uppercase mt-0.5">
              Refund &amp; Cancellation Statement
            </h1>
            <p className="text-xs text-[#666666] mt-0.5">
              Formal accounting settlement for project cancellation and deliverable reconciliation.
            </p>
          </div>

          {/* Client & Timeline Details 2-Column Card */}
          <div className="grid grid-cols-2 gap-4 border border-[#E5E5E5] rounded p-4 bg-[#FAFAFA]">
            <div>
              <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#777777] block">
                CLIENT PARTICULARS
              </span>
              <div className="text-sm font-bold text-[#0E0E0E] mt-0.5">{clientName || 'Valued Client'}</div>
              <div className="text-xs text-[#555555] mt-0.5">Project: {projectName || 'Creative Deliverables'}</div>
              <div className="text-[10.5px] text-[#777777] mt-1">
                Agreed Total Project Value: ₹{projectTotal.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="border-l border-[#E5E5E5] pl-4">
              <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#777777] block">
                AUDIT TIMELINE
              </span>
              <div className="text-xs text-[#444444] mt-0.5">
                Advance Paid: <strong className="text-[#0E0E0E]">{input.advanceDate}</strong>
              </div>
              <div className="text-xs text-[#444444] mt-0.5">
                Cancellation Date: <strong className="text-[#0E0E0E]">{input.cancellationDate}</strong>
              </div>
              <div className="text-xs text-[#444444] mt-0.5">
                Days Elapsed:{' '}
                <strong className={result.isWithinWindow ? 'text-emerald-700' : 'text-red-700'}>
                  {result.daysElapsed} day(s)
                </strong>{' '}
                ({result.isWithinWindow ? `Within ${variables.refund_window_days}d window` : `Exceeded ${variables.refund_window_days}d window`})
              </div>
            </div>
          </div>

          {/* Accounting Table */}
          <table className="w-full text-xs border border-[#E5E5E5] border-collapse bg-white">
            <thead>
              <tr className="bg-[#0E0E0E] text-white text-[9.5px] uppercase font-bold tracking-wider">
                <th className="py-2 px-3 text-left">Description</th>
                <th className="py-2 px-3 text-center">Basis / Rate</th>
                <th className="py-2 px-3 text-center">Units</th>
                <th className="py-2 px-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#0E0E0E]">
                  Advance Remittance Received
                  <div className="text-[9.5px] text-[#777777] font-normal">Initial commitment deposit</div>
                </td>
                <td className="py-2.5 px-3 text-center text-[#555555]">Deposit</td>
                <td className="py-2.5 px-3 text-center text-[#555555]">100%</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0E0E0E]">
                  ₹{result.advance.toLocaleString('en-IN')}
                </td>
              </tr>

              <tr className="bg-[#FAFAFA]">
                <td className="py-2.5 px-3 text-[#0E0E0E]">
                  <strong>Less:</strong> Retained Advance Share
                  <div className="text-[9.5px] text-[#777777]">
                    {result.isWithinWindow
                      ? `Clause 12.1: ${result.retainedPercent}% retention`
                      : `Clause 12.2: 100% advance non-refundable after ${variables.refund_window_days} days`}
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center text-[#555555]">{result.retainedPercent}%</td>
                <td className="py-2.5 px-3 text-center text-[#555555]">Advance</td>
                <td className="py-2.5 px-3 text-right font-mono text-[#444444]">
                  - ₹{result.retainedAmount.toLocaleString('en-IN')}
                </td>
              </tr>

              <tr>
                <td className="py-2.5 px-3 text-[#0E0E0E]">
                  <strong>Less:</strong> Deliverables Work Done
                  <div className="text-[9.5px] text-[#777777]">
                    {input.unitsCompleted} completed + {input.unitsStarted} started
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center text-[#555555]">₹{input.standardRate.toLocaleString('en-IN')}/unit</td>
                <td className="py-2.5 px-3 text-center text-[#555555]">{result.totalUnitsCounted} unit(s)</td>
                <td className="py-2.5 px-3 text-right font-mono text-[#444444]">
                  - ₹{result.workDoneAmount.toLocaleString('en-IN')}
                </td>
              </tr>

              <tr className="bg-[#F0F0F0] font-bold text-[#0E0E0E]">
                <td colSpan={3} className="py-2.5 px-3 text-right uppercase text-[9.5px] tracking-wider">
                  Total Allowable Deductions:
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  ₹{result.totalDeductions.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* High Contrast Black Final Settlement Banner */}
          <div className="bg-[#0E0E0E] text-white rounded p-4 flex items-center justify-between">
            <div>
              <span className="text-[8.5px] font-bold tracking-[0.2em] uppercase text-[#888888] block">
                FINAL SETTLEMENT DETERMINATION
              </span>
              <div className="text-xs text-[#CCCCCC] mt-0.5 max-w-md">
                {result.refundAmount > 0
                  ? `Net refund of ₹${result.refundAmount.toLocaleString('en-IN')} approved for disbursement within ${variables.refund_processing_days} working days.`
                  : result.extraPayable > 0
                  ? `Completed deliverables exceed advance. Balance due from client: ₹${result.extraPayable.toLocaleString('en-IN')}.`
                  : 'Account fully settled with zero outstanding balance.'}
              </div>
            </div>

            <div className="text-right pl-4 border-l border-[#333333]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#888888] block">
                {result.refundAmount > 0 ? 'Net Refund Amount' : result.extraPayable > 0 ? 'Balance Due' : 'Balance'}
              </span>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {result.refundAmount > 0
                  ? `₹${result.refundAmount.toLocaleString('en-IN')}`
                  : result.extraPayable > 0
                  ? `₹${result.extraPayable.toLocaleString('en-IN')}`
                  : '₹0'}
              </div>
            </div>
          </div>

          {/* Note Box */}
          <div className="bg-[#F0F0F0] border-l-4 border-black p-3 text-[10px] leading-relaxed text-[#333333]">
            <strong>Accord &amp; Release:</strong> Computed pursuant to Clause 12 of DEVRIAN Terms &amp; Conditions and Policies. Once executed or disbursed, this constitutes a full and final accord and release of all claims under reference {proposalNo || 'DEV-2026-001'}.
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
                <span>Name: {clientName || 'Client'}</span>
                <span>Date: _______________</span>
              </div>
            </div>

            <div className="border border-[#E5E5E5] rounded p-2.5 bg-[#FAFAFA]">
              <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#777777] block">
                FOR DEVRIAN
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
                <span>{variables.owner_name} ({variables.owner_title})</span>
                <span>Date: {input.cancellationDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Running Footer */}
      <div className="px-12 pb-6 pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-[9px] text-[#777777] font-sans select-none">
        <div>
          <strong className="text-[#0E0E0E]">DEVRIAN</strong> &bull; Settlement Statement &bull; {variables.udyam_no}
        </div>
        <div className="font-semibold text-[#0E0E0E]">
          Page 1 of 1
        </div>
      </div>
    </div>
  );
};
