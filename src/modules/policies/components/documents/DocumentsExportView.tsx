import React, { useState, useRef } from 'react';
import {
  FileText,
  FileDown,
  Layers,
  MessageSquare,
  Copy,
  Check,
  Settings2,
  FileCheck2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Clause, PolicyVariables, PolicySettings, DocumentVersion, IndividualPolicyType } from '../../types';
import { FullTermsDocument } from '../preview/FullTermsDocument';
import { PolicySummaryDocument } from '../preview/PolicySummaryDocument';
import { IndividualPolicyDocument } from '../preview/IndividualPolicyDocument';
import { exportPolicyPagesToPdf } from '../../utils/pdfExport';
import { formatPolicySummaryForWhatsApp, copyTextToClipboard } from '../../utils/plainTextFormatter';
import { findUnresolvedInClauses } from '../../utils/variableResolver';

interface DocumentsExportViewProps {
  clauses: Clause[];
  variables: PolicyVariables;
  settings: PolicySettings;
  versions: DocumentVersion[];
  logoUrl: string;
  signatureUrl: string;
  onUpdateSettings: (settings: PolicySettings) => void;
}

export const DocumentsExportView: React.FC<DocumentsExportViewProps> = ({
  clauses,
  variables,
  settings,
  versions,
  logoUrl,
  signatureUrl,
  onUpdateSettings,
}) => {
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [exportingType, setExportingType] = useState<string | null>(null);

  // Hidden print containers
  const fullTermsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const individualRef = useRef<HTMLDivElement>(null);
  const [currentIndividualType, setCurrentIndividualType] = useState<IndividualPolicyType>('refund');

  const unresolvedIssues = findUnresolvedInClauses(clauses, variables);
  const hasUnresolved = unresolvedIssues.length > 0;
  const unreviewedCount = clauses.filter((c) => c.status === 'SUGGESTED' && !c.isReviewed).length;

  const handleExportFull = async () => {
    if (hasUnresolved) {
      alert('Export blocked: Please resolve placeholders in Policy Variables tab first.');
      return;
    }
    if (!fullTermsRef.current) return;
    setExportingType('full');
    try {
      const pageElements = Array.from(
        fullTermsRef.current.querySelectorAll('.policies-a4-page')
      ) as HTMLElement[];
      await exportPolicyPagesToPdf(
        pageElements.length > 0 ? pageElements : [fullTermsRef.current],
        `DEVRIAN_Terms_and_Conditions_and_Policies_v${settings.currentVersion}.pdf`
      );
    } catch (e) {
      console.error(e);
      alert('Error generating full terms PDF.');
    } finally {
      setExportingType(null);
    }
  };

  const handleExportSummary = async () => {
    if (hasUnresolved) {
      alert('Export blocked: Please resolve placeholders in Policy Variables tab first.');
      return;
    }
    if (!summaryRef.current) return;
    setExportingType('summary');
    try {
      const pageEl = (summaryRef.current.querySelector('.policies-a4-page') as HTMLElement) || summaryRef.current;
      await exportPolicyPagesToPdf(
        [pageEl],
        `DEVRIAN_Policy_Summary_v${settings.currentVersion}.pdf`
      );
    } catch (e) {
      console.error(e);
      alert('Error generating summary PDF.');
    } finally {
      setExportingType(null);
    }
  };

  const handleExportIndividual = async (type: IndividualPolicyType) => {
    if (hasUnresolved) {
      alert('Export blocked: Please resolve placeholders in Policy Variables tab first.');
      return;
    }
    setCurrentIndividualType(type);
    setExportingType(`ind_${type}`);
    // Allow DOM to settle for individualRef render
    await new Promise((r) => setTimeout(r, 60));
    try {
      if (individualRef.current) {
        const pageEl = (individualRef.current.querySelector('.policies-a4-page') as HTMLElement) || individualRef.current;
        await exportPolicyPagesToPdf(
          [pageEl],
          `DEVRIAN_${type.toUpperCase()}_Policy_v${settings.currentVersion}.pdf`
        );
      }
    } catch (e) {
      console.error(e);
      alert('Error generating policy sheet PDF.');
    } finally {
      setExportingType(null);
    }
  };

  const handleCopyWhatsAppText = async () => {
    const text = formatPolicySummaryForWhatsApp(clauses, variables, settings);
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileText size={20} className="text-white" />
          <div>
            <h2 className="text-sm font-bold text-white">Commercial Documents &amp; Exports</h2>
            <p className="text-[11px] text-neutral-400">
              Generate pixel-perfect A4 PDFs conforming to the official DEVRIAN visual brand language.
            </p>
          </div>
        </div>

        {hasUnresolved && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950 text-red-300 border border-red-800 text-xs font-semibold">
            <ShieldAlert size={14} className="text-red-400" />
            <span>Exports blocked: {unresolvedIssues.length} unresolved token(s)</span>
          </div>
        )}
      </div>

      {/* Grid of 4 Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document 1: Full Terms & Conditions */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-white">
                <Layers size={18} />
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                6-Page A4 PDF
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Terms &amp; Conditions and Policies
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Complete multi-page commercial agreement covering all 20 legal clauses, auto-generated Table of Contents, Key Terms box, dual signature blocks, and revision changelog.
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-mono">
              {settings.documentNumber} (v{settings.currentVersion})
            </span>
            <button
              type="button"
              onClick={handleExportFull}
              disabled={exportingType === 'full'}
              className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <FileDown size={14} />
              {exportingType === 'full' ? 'Generating...' : 'Download Terms & Policies PDF'}
            </button>
          </div>
        </div>

        {/* Document 2: Policy Summary */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-white">
                <FileText size={18} />
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                1-Page Smart-Fit A4
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Policy Summary (Client Attachment)
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Condensed single-page policy sheet ideal for attaching to invoices, estimates, and proposals. Features smart-fit auto-scaling to prevent awkward overflows.
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500 font-mono">
              {settings.documentNumber}-SUM
            </span>
            <button
              type="button"
              onClick={handleExportSummary}
              disabled={exportingType === 'summary'}
              className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <FileDown size={14} />
              {exportingType === 'summary' ? 'Generating...' : 'Download Summary PDF'}
            </button>
          </div>
        </div>

        {/* Document 3: WhatsApp / Plain Text Copy */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                <MessageSquare size={18} />
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                Plain-Text / WhatsApp
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Plain-Text Summary for WhatsApp &amp; Email
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Clean, professionally formatted commercial copy without markdown symbols. Ready to paste directly into WhatsApp chats, proposal emails, or client DMs.
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowWhatsAppModal(true)}
              className="text-xs text-neutral-400 hover:text-white underline underline-offset-4"
            >
              Preview Text
            </button>
            <button
              type="button"
              onClick={handleCopyWhatsAppText}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              {copiedWhatsApp ? <Check size={14} /> : <Copy size={14} />}
              {copiedWhatsApp ? 'Copied to Clipboard!' : 'Copy WhatsApp Text'}
            </button>
          </div>
        </div>

        {/* Document 4: Individual Policy Sheets */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-white">
                <FileCheck2 size={18} />
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                5 Standalone Sheets
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Individual Policy Sheets (1-Page)
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Separate, targeted single-page documents with specialized worked examples and clause focus for specific client inquiries.
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-800/80 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleExportIndividual('refund')}
                disabled={exportingType?.startsWith('ind_')}
                className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold text-left truncate transition"
              >
                1. Refund &amp; Cancellation
              </button>
              <button
                type="button"
                onClick={() => handleExportIndividual('payment')}
                disabled={exportingType?.startsWith('ind_')}
                className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold text-left truncate transition"
              >
                2. Payment &amp; Late Fees
              </button>
              <button
                type="button"
                onClick={() => handleExportIndividual('revision')}
                disabled={exportingType?.startsWith('ind_')}
                className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold text-left truncate transition"
              >
                3. Revision &amp; Approval
              </button>
              <button
                type="button"
                onClick={() => handleExportIndividual('delivery')}
                disabled={exportingType?.startsWith('ind_')}
                className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold text-left truncate transition"
              >
                4. Delivery &amp; IP Rights
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleExportIndividual('communication')}
              disabled={exportingType?.startsWith('ind_')}
              className="w-full px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold text-center transition"
            >
              5. Communication, SLA &amp; Working Hours
            </button>
          </div>
        </div>
      </div>

      {/* Document Formatting & Smart-Fit Settings */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <Settings2 size={15} />
          <span>Document Formatting, Numbering &amp; Smart-Fit Configuration</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-medium text-neutral-400 block mb-1">Document Identifier</label>
            <input
              type="text"
              value={settings.documentNumber}
              onChange={(e) => onUpdateSettings({ ...settings, documentNumber: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-neutral-400 block mb-1">Active Version Tag</label>
            <input
              type="text"
              value={settings.currentVersion}
              onChange={(e) => onUpdateSettings({ ...settings, currentVersion: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-neutral-400 block mb-1">Effective Date</label>
            <input
              type="date"
              value={settings.effectiveDate}
              onChange={(e) => onUpdateSettings({ ...settings, effectiveDate: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-neutral-400 block mb-1">Summary Smart-Fit Scale</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.88"
                max="1.0"
                step="0.01"
                value={settings.summaryScale || 1.0}
                onChange={(e) => onUpdateSettings({ ...settings, summaryScale: parseFloat(e.target.value) })}
                className="w-full accent-white"
              />
              <span className="text-xs font-mono text-neutral-300 w-10">
                {Math.round((settings.summaryScale || 1.0) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Section Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-neutral-800/80 text-xs text-neutral-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showTableOfContents}
              onChange={(e) => onUpdateSettings({ ...settings, showTableOfContents: e.target.checked })}
              className="rounded accent-white"
            />
            <span>Table of Contents</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showKeyTermsBox}
              onChange={(e) => onUpdateSettings({ ...settings, showKeyTermsBox: e.target.checked })}
              className="rounded accent-white"
            />
            <span>Key Terms Glance Box</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showAcknowledgementSignatures}
              onChange={(e) => onUpdateSettings({ ...settings, showAcknowledgementSignatures: e.target.checked })}
              className="rounded accent-white"
            />
            <span>Signature Blocks</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showRevisionHistoryAppendix}
              onChange={(e) => onUpdateSettings({ ...settings, showRevisionHistoryAppendix: e.target.checked })}
              className="rounded accent-white"
            />
            <span>Revision History Table</span>
          </label>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-emerald-400" size={18} />
                <h3 className="text-sm font-bold text-white">Plain-Text Copy for WhatsApp &amp; Email</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <textarea
              readOnly
              value={formatPolicySummaryForWhatsApp(clauses, variables, settings)}
              rows={16}
              className="w-full bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-lg p-3 text-xs font-mono leading-relaxed focus:outline-none resize-none select-all"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                Stripped of markdown symbols • Clean line breaks &amp; bullet points
              </span>
              <button
                type="button"
                onClick={handleCopyWhatsAppText}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5"
              >
                {copiedWhatsApp ? <Check size={14} /> : <Copy size={14} />}
                {copiedWhatsApp ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Render Containers for PDF Capture (positioned offscreen with full dimensions and full opacity) */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          zIndex: -9999,
          opacity: 1,
          pointerEvents: 'none',
        }}
      >
        <div ref={fullTermsRef}>
          <FullTermsDocument
            clauses={clauses}
            variables={variables}
            settings={settings}
            versions={versions}
            logoUrl={logoUrl}
            signatureUrl={signatureUrl}
          />
        </div>

        <div ref={summaryRef}>
          <PolicySummaryDocument
            clauses={clauses}
            variables={variables}
            settings={settings}
            logoUrl={logoUrl}
            signatureUrl={signatureUrl}
            scale={settings.smartFitSummary ? settings.summaryScale || 1.0 : 1.0}
          />
        </div>

        <div ref={individualRef}>
          <IndividualPolicyDocument
            type={currentIndividualType}
            clauses={clauses}
            variables={variables}
            settings={settings}
            logoUrl={logoUrl}
            signatureUrl={signatureUrl}
          />
        </div>
      </div>
    </div>
  );
};
