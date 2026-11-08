import React, { useState, useMemo, useRef } from 'react';
import {
  Calculator,
  Calendar,
  DollarSign,
  Layers,
  FileDown,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  User,
  Folder,
} from 'lucide-react';
import { PolicyVariables, RefundCalculationInput } from '../../types';
import { calculateRefund } from '../../utils/refundCalculator';
import { SettlementSummaryDocument } from '../preview/SettlementSummaryDocument';
import { exportPolicyPagesToPdf } from '../../utils/pdfExport';

interface RefundCalculatorViewProps {
  variables: PolicyVariables;
  logoUrl: string;
  signatureUrl: string;
}

export const RefundCalculatorView: React.FC<RefundCalculatorViewProps> = ({
  variables,
  logoUrl,
  signatureUrl,
}) => {
  const [clientName, setClientName] = useState('Anshita Singh Parihar');
  const [projectName, setProjectName] = useState('FMCG Video Editing – 15 Videos');
  const [proposalNo, setProposalNo] = useState('DEV-2026-001');

  // Today and 3 days ago as practical defaults
  const todayStr = new Date().toISOString().split('T')[0];
  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [input, setInput] = useState<RefundCalculationInput>({
    advance: 6000,
    advanceDate: fourDaysAgo,
    cancellationDate: todayStr,
    standardRate: 1200,
    unitsCompleted: 1,
    unitsStarted: 1,
  });

  const [projectTotal, setProjectTotal] = useState<number>(12000);
  const [isExporting, setIsExporting] = useState(false);

  // Print sheet reference
  const printSheetRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => {
    return calculateRefund(input, variables);
  }, [input, variables]);

  const handleExportPdf = async () => {
    if (!printSheetRef.current) return;
    setIsExporting(true);
    try {
      const fileName = `DEVRIAN_Refund_Settlement_${(clientName || 'Client').replace(/\s+/g, '_')}_${input.cancellationDate}.pdf`;
      const pageEl = (printSheetRef.current.querySelector('.policies-a4-page') as HTMLElement) || printSheetRef.current;
      await exportPolicyPagesToPdf([pageEl], fileName);
    } catch (e) {
      console.error('Failed to export settlement PDF:', e);
      alert('Error exporting settlement PDF. Please check console.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Calculator size={20} className="text-white" />
          <div>
            <h2 className="text-sm font-bold text-white">Commercial Refund &amp; Cancellation Calculator</h2>
            <p className="text-[11px] text-neutral-400">
              Compliant with DEVRIAN Terms &amp; Conditions and Policies Clause 12. Generates verified settlement statements for client disputes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={isExporting}
          className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          <FileDown size={14} />
          {isExporting ? 'Generating PDF...' : 'Export Settlement Statement (PDF)'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Client & Project Context */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              Client & Agreement Identification
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Client Name</label>
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5">
                  <User size={13} className="text-neutral-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-transparent text-xs text-neutral-200 focus:outline-none"
                    placeholder="Client Name"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Project Name</label>
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5">
                  <Folder size={13} className="text-neutral-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-transparent text-xs text-neutral-200 focus:outline-none"
                    placeholder="Project Name"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Doc / Ref No.</label>
                <input
                  type="text"
                  value={proposalNo}
                  onChange={(e) => setProposalNo(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none font-mono"
                  placeholder="DEV-2026-001"
                />
              </div>
            </div>
          </div>

          {/* Payment & Timeline Inputs */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              Financial & Timeline Parameters
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Total Agreed Project Value (₹)</label>
                <input
                  type="number"
                  value={projectTotal}
                  onChange={(e) => setProjectTotal(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 font-semibold focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Advance Received (₹)</label>
                <input
                  type="number"
                  value={input.advance}
                  onChange={(e) => setInput({ ...input, advance: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 font-semibold focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Advance Payment Date</label>
                <input
                  type="date"
                  value={input.advanceDate}
                  onChange={(e) => setInput({ ...input, advanceDate: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Cancellation Requested Date</label>
                <input
                  type="date"
                  value={input.cancellationDate}
                  onChange={(e) => setInput({ ...input, cancellationDate: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Deliverables Work Done Inputs */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              Deliverables & Standard Rate Accounting
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Units Completed & Approved</label>
                <input
                  type="number"
                  min="0"
                  value={input.unitsCompleted}
                  onChange={(e) => setInput({ ...input, unitsCompleted: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 font-semibold focus:outline-none focus:border-neutral-600"
                />
                <span className="text-[10px] text-neutral-500 mt-0.5 block">e.g. 1 video finished</span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Units Started (In-Progress)</label>
                <input
                  type="number"
                  min="0"
                  value={input.unitsStarted}
                  onChange={(e) => setInput({ ...input, unitsStarted: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 font-semibold focus:outline-none focus:border-neutral-600"
                />
                <span className="text-[10px] text-neutral-500 mt-0.5 block">e.g. 1 rough-cut draft</span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Standard Rate per Unit (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={input.standardRate}
                  onChange={(e) => setInput({ ...input, standardRate: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 font-semibold focus:outline-none focus:border-neutral-600"
                />
                <span className="text-[10px] text-neutral-500 mt-0.5 block">Standard non-package rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Output & Audit Log (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Eligibility Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
              result.isWithinWindow
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-red-950/60 border-red-800 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {result.isWithinWindow ? (
                <CheckCircle size={20} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={20} className="text-red-400 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold block uppercase tracking-wide">
                  {result.isWithinWindow ? 'Within 7-Day Refund Window' : 'Outside 7-Day Window (Non-Refundable)'}
                </span>
                <span className="text-[11px] opacity-90">
                  {result.daysElapsed} day{result.daysElapsed === 1 ? '' : 's'} elapsed between advance & request.
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10">
              {result.daysElapsed} / {variables.refund_window_days}d
            </span>
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Audit Breakdown (Clause 12 Formula)
            </span>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300">
                <span>Advance Payment Received:</span>
                <span className="font-semibold text-white">₹{result.advance.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300">
                <span>Retained Advance Share ({result.retainedPercent}%):</span>
                <span className="font-semibold text-neutral-300">₹{result.retainedAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300">
                <span>Deliverables Work ({result.totalUnitsCounted} unit(s) @ ₹{input.standardRate}):</span>
                <span className="font-semibold text-neutral-300">₹{result.workDoneAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300 font-semibold">
                <span>Total Deductions:</span>
                <span className="text-amber-400">₹{result.totalDeductions.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Big Black Total Bar (DEVRIAN Brand) */}
          <div className="bg-black border border-neutral-800 rounded-xl p-5 text-center shadow-xl">
            {result.refundAmount > 0 ? (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 block mb-1">
                  Net Refund Payable to Client
                </span>
                <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  ₹{result.refundAmount.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Disbursed via UPI/bank transfer within {variables.refund_processing_days} working days.
                </p>
              </div>
            ) : result.extraPayable > 0 ? (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400 block mb-1">
                  Additional Balance Due From Client
                </span>
                <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  ₹{result.extraPayable.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Completed work exceeds advance. Invoice required for outstanding balance.
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 block mb-1">
                  Net Refund Payable
                </span>
                <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  ₹0
                </div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Advance is fully absorbed by retention and delivered work. Account settled.
                </p>
              </div>
            )}

            {result.isNeedsOwnerConfirmation && (
              <div className="mt-3 pt-3 border-t border-neutral-800/80 text-[11px] text-amber-300 font-medium">
                Note: Request logged after {variables.refund_window_days}-day limit. Requires owner confirmation before formal issuance.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Render Container for PDF Capture (positioned offscreen with full dimensions) */}
      <div
        style={{
          position: 'fixed',
          left: '-99999px',
          top: '0',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <div ref={printSheetRef}>
          <SettlementSummaryDocument
            clientName={clientName}
            projectName={projectName}
            proposalNo={proposalNo}
            projectTotal={projectTotal}
            input={input}
            result={result}
            variables={variables}
            logoUrl={logoUrl}
            signatureUrl={signatureUrl}
          />
        </div>
      </div>
    </div>
  );
};
