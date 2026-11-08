import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileDown,
  Printer,
  Layers,
  FileText,
  FileCheck2,
} from 'lucide-react';
import { Clause, PolicyVariables, PolicySettings, DocumentVersion, IndividualPolicyType } from '../../types';
import { FullTermsDocument } from './FullTermsDocument';
import { PolicySummaryDocument } from './PolicySummaryDocument';
import { IndividualPolicyDocument } from './IndividualPolicyDocument';
import { exportPolicyPagesToPdf } from '../../utils/pdfExport';
import { findUnresolvedInClauses } from '../../utils/variableResolver';

interface PoliciesPreviewProps {
  clauses: Clause[];
  variables: PolicyVariables;
  settings: PolicySettings;
  versions: DocumentVersion[];
  logoUrl: string;
  signatureUrl: string;
  onSave?: () => void;
}

export const PoliciesPreview: React.FC<PoliciesPreviewProps> = ({
  clauses,
  variables,
  settings,
  versions,
  logoUrl,
  signatureUrl,
  onSave,
}) => {
  const [docView, setDocView] = useState<'full' | 'summary' | 'individual'>('full');
  const [selectedIndividualType, setSelectedIndividualType] = useState<IndividualPolicyType>('refund');
  const [zoom, setZoom] = useState<number>(0.75); // 75% default comfortable fit
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const printablePagesRef = useRef<HTMLDivElement>(null);

  // Check unresolved placeholders
  const unresolvedIssues = findUnresolvedInClauses(clauses, variables);
  const hasUnresolved = unresolvedIssues.length > 0;

  // Unreviewed count
  const unreviewedCount = clauses.filter((c) => c.status === 'SUGGESTED' && !c.isReviewed).length;

  // Keyboard shortcut listener (Ctrl+P, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleExportPdf();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (onSave) onSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [docView, selectedIndividualType, hasUnresolved, clauses, variables]);

  const handleExportPdf = async () => {
    if (hasUnresolved) {
      alert(
        `Export blocked: There are unresolved placeholders in your clauses (${unresolvedIssues[0].placeholders.join(
          ', '
        )}). Please configure them in Policy Variables before exporting.`
      );
      return;
    }

    if (unreviewedCount > 0) {
      const proceed = window.confirm(
        `Notice: You have ${unreviewedCount} clause(s) marked as Suggested (Needs Review). Do you wish to export anyway? (No badges will appear on the final PDF).`
      );
      if (!proceed) return;
    }

    if (!printablePagesRef.current) return;

    setIsExporting(true);
    try {
      // Find all page nodes
      const pageElements = Array.from(
        printablePagesRef.current.querySelectorAll('.policies-a4-page')
      ) as HTMLElement[];

      const elementsToExport =
        pageElements.length > 0 ? pageElements : [printablePagesRef.current];

      let fileName = `DEVRIAN_Terms_and_Conditions_v${settings.currentVersion}.pdf`;
      if (docView === 'summary') {
        fileName = `DEVRIAN_Policy_Summary_v${settings.currentVersion}.pdf`;
      } else if (docView === 'individual') {
        fileName = `DEVRIAN_Policy_${selectedIndividualType.toUpperCase()}_v${settings.currentVersion}.pdf`;
      }

      await exportPolicyPagesToPdf(elementsToExport, fileName);
    } catch (e) {
      console.error('PDF generation error:', e);
      alert('Encountered an issue generating PDF. Please review console.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e2022] rounded-xl overflow-hidden border border-neutral-800">
      {/* Top Toolbar */}
      <div className="bg-[#141517] border-b border-neutral-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-neutral-300 select-none">
        {/* Document Selector Pills */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg p-1 text-xs">
          <button
            type="button"
            onClick={() => setDocView('full')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition ${
              docView === 'full'
                ? 'bg-neutral-800 text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>Master T&amp;C (5p)</span>
          </button>

          <button
            type="button"
            onClick={() => setDocView('summary')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition ${
              docView === 'summary'
                ? 'bg-neutral-800 text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>Policy Summary (1p)</span>
          </button>

          <button
            type="button"
            onClick={() => setDocView('individual')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition ${
              docView === 'individual'
                ? 'bg-neutral-800 text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileCheck2 size={13} />
            <span>Individual Sheets</span>
          </button>
        </div>

        {/* If Individual View, Dropdown */}
        {docView === 'individual' && (
          <select
            value={selectedIndividualType}
            onChange={(e) => setSelectedIndividualType(e.target.value as IndividualPolicyType)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none"
          >
            <option value="refund">Refund &amp; Cancellation Policy</option>
            <option value="payment">Payment &amp; Late Payment Policy</option>
            <option value="revision">Revision &amp; Approval Policy</option>
            <option value="delivery">Delivery, Ownership &amp; IP Policy</option>
            <option value="communication">Communication &amp; Working Hours</option>
          </select>
        )}

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              className="p-1.5 text-neutral-400 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="px-2 text-[11px] font-mono text-neutral-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
              className="p-1.5 text-neutral-400 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              onClick={() => setZoom(0.75)}
              className="p-1.5 text-neutral-400 hover:text-white border-l border-neutral-800 transition"
              title="Reset Zoom (75%)"
            >
              <Maximize2 size={13} />
            </button>
          </div>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              hasUnresolved
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-white hover:bg-neutral-200 text-neutral-950'
            }`}
            title={hasUnresolved ? 'Resolve placeholders to export' : 'Generate Premium A4 PDF (Ctrl+P)'}
          >
            <FileDown size={14} />
            <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Sheet Canvas Area on Neutral Grey Paper Background */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8 custom-scrollbar flex flex-col items-center justify-start bg-[#2B2D30]"
      >
        <div
          ref={printablePagesRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {docView === 'full' && (
            <FullTermsDocument
              clauses={clauses}
              variables={variables}
              settings={settings}
              versions={versions}
              logoUrl={logoUrl}
              signatureUrl={signatureUrl}
            />
          )}

          {docView === 'summary' && (
            <div className="policies-a4-page shadow-2xl">
              <PolicySummaryDocument
                clauses={clauses}
                variables={variables}
                settings={settings}
                logoUrl={logoUrl}
                signatureUrl={signatureUrl}
                scale={settings.smartFitSummary ? settings.summaryScale || 1.0 : 1.0}
              />
            </div>
          )}

          {docView === 'individual' && (
            <div className="policies-a4-page shadow-2xl">
              <IndividualPolicyDocument
                type={selectedIndividualType}
                clauses={clauses}
                variables={variables}
                settings={settings}
                logoUrl={logoUrl}
                signatureUrl={signatureUrl}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

