import React, { useState, useMemo } from 'react';
import {
  History,
  GitBranch,
  GitCommit,
  RotateCcw,
  Plus,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileDiff,
  Calendar,
  Layers,
} from 'lucide-react';
import { Clause, DocumentVersion, PolicyVariables } from '../../types';
import { compareClauseSnapshots, VersionDiffSummary } from '../../utils/versionDiff';

interface VersionHistoryViewProps {
  currentClauses: Clause[];
  currentVariables: PolicyVariables;
  currentVersion: string;
  versions: DocumentVersion[];
  onSaveNewVersion: (version: DocumentVersion) => void;
  onRestoreVersion: (version: DocumentVersion) => void;
}

export const VersionHistoryView: React.FC<VersionHistoryViewProps> = ({
  currentClauses,
  currentVariables,
  currentVersion,
  versions,
  onSaveNewVersion,
  onRestoreVersion,
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newVersionNum, setNewVersionNum] = useState('1.1');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [changeNote, setChangeNote] = useState('');
  const [includeInAppendix, setIncludeInAppendix] = useState(true);

  // Diff comparison states
  const [diffVerAId, setDiffVerAId] = useState<string>(versions[0]?.id || 'initial');
  const [diffVerBId, setDiffVerBId] = useState<string>('current');

  // Compute diff
  const diffSummary: VersionDiffSummary = useMemo(() => {
    // Find Version A clauses
    let clausesA: Clause[] = [];
    let nameA = 'Version A';
    const foundA = versions.find((v) => v.id === diffVerAId);
    if (foundA) {
      clausesA = foundA.clausesSnapshot;
      nameA = `v${foundA.version}`;
    }

    // Find Version B clauses
    let clausesB: Clause[] = [];
    let nameB = 'Current Editor';
    if (diffVerBId === 'current') {
      clausesB = currentClauses;
      nameB = `v${currentVersion} (Current Working State)`;
    } else {
      const foundB = versions.find((v) => v.id === diffVerBId);
      if (foundB) {
        clausesB = foundB.clausesSnapshot;
        nameB = `v${foundB.version}`;
      }
    }

    return compareClauseSnapshots(clausesA, clausesB, nameA, nameB);
  }, [versions, diffVerAId, diffVerBId, currentClauses, currentVersion]);

  const handleCreateVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionNum.trim()) {
      alert('Version number is required (e.g. 1.1 or 2.0).');
      return;
    }

    const versionObj: DocumentVersion = {
      id: `ver-${Date.now()}`,
      version: newVersionNum.trim(),
      effectiveDate,
      supersedesVersion: currentVersion,
      changeNote: changeNote.trim() || 'Minor clause amendments and clarifications',
      savedAt: new Date().toISOString(),
      clausesSnapshot: JSON.parse(JSON.stringify(currentClauses)),
      variablesSnapshot: JSON.parse(JSON.stringify(currentVariables)),
      includeInAppendix,
    };

    onSaveNewVersion(versionObj);
    setShowSaveModal(false);
    setChangeNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <History size={20} className="text-white" />
          <div>
            <h2 className="text-sm font-bold text-white">Semantic Version Control &amp; Clause Diff</h2>
            <p className="text-[11px] text-neutral-400">
              Snapshot, track revisions, compare document iterations, and roll back master policy clauses safely.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <GitCommit size={14} />
          Save as New Version
        </button>
      </div>

      {/* Grid: Saved Versions List (5 cols) & Diff Viewer (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Saved Versions (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
            Saved Version Milestones ({versions.length})
          </span>

          <div className="space-y-2.5">
            {versions.map((ver) => {
              const isCurrent = ver.version === currentVersion;
              return (
                <div
                  key={ver.id}
                  className={`bg-neutral-900 border rounded-xl p-3.5 space-y-2 transition ${
                    isCurrent ? 'border-neutral-600 bg-neutral-900/90' : 'border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-black border border-neutral-700 text-xs font-mono font-bold text-white">
                        v{ver.version}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {ver.effectiveDate}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {ver.changeNote || 'Standard release snapshot'}
                  </p>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500">
                      {ver.clausesSnapshot?.length || 20} clauses snapshot
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Restore policy clauses and variables to milestone v${ver.version}? Your current editor changes will be overwritten.`
                          )
                        ) {
                          onRestoreVersion(ver);
                        }
                      }}
                      className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1 hover:underline"
                    >
                      <RotateCcw size={11} />
                      Restore Milestone
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diff Comparison Engine (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <FileDiff size={14} /> Clause Comparison (Diff Viewer)
              </span>
              <div className="flex items-center gap-2 text-[10px] font-semibold">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  +{diffSummary.addedCount} Added
                </span>
                <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                  -{diffSummary.removedCount} Removed
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  ~{diffSummary.modifiedCount} Modified
                </span>
              </div>
            </div>

            {/* Version Selectors */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">
                  Baseline (Version A)
                </label>
                <select
                  value={diffVerAId}
                  onChange={(e) => setDiffVerAId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none"
                >
                  {versions.map((ver) => (
                    <option key={ver.id} value={ver.id}>
                      v{ver.version} ({ver.effectiveDate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">
                  Comparison (Version B)
                </label>
                <select
                  value={diffVerBId}
                  onChange={(e) => setDiffVerBId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="current">Current Editor (Unsaved Working State)</option>
                  {versions.map((ver) => (
                    <option key={ver.id} value={ver.id}>
                      v{ver.version} ({ver.effectiveDate})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Diff Results List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {diffSummary.items.filter((item) => item.type !== 'unchanged').length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center text-xs text-neutral-400">
                <CheckCircle size={22} className="mx-auto mb-2 text-emerald-400" />
                Both versions are 100% identical. No added, removed, or modified clauses found between {diffSummary.versionOld} and {diffSummary.versionNew}.
              </div>
            ) : (
              diffSummary.items
                .filter((item) => item.type !== 'unchanged')
                .map((item, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-xl p-3.5 space-y-2 text-xs ${
                      item.type === 'added'
                        ? 'bg-emerald-950/30 border-emerald-800/80'
                        : item.type === 'removed'
                        ? 'bg-red-950/30 border-red-800/80'
                        : 'bg-amber-950/30 border-amber-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center font-bold text-white text-[10px]">
                          {item.numberB}
                        </span>
                        <strong className="text-white text-xs">{item.titleB}</strong>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.type === 'added'
                            ? 'bg-emerald-900 text-emerald-300'
                            : item.type === 'removed'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-amber-900 text-amber-300'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>

                    {item.changes.map((ch, cIdx) => (
                      <div key={cIdx} className="space-y-1.5 pt-1 text-[11px]">
                        <span className="text-neutral-400 uppercase font-semibold text-[10px]">
                          Changed {ch.field}:
                        </span>
                        {ch.oldValue !== undefined && (
                          <div className="p-2 rounded bg-red-950/60 border border-red-800 text-red-200 line-through">
                            {typeof ch.oldValue === 'string'
                              ? ch.oldValue
                              : JSON.stringify(ch.oldValue)}
                          </div>
                        )}
                        {ch.newValue !== undefined && (
                          <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-200">
                            {typeof ch.newValue === 'string'
                              ? ch.newValue
                              : JSON.stringify(ch.newValue)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Save Version Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitCommit size={16} className="text-white" />
                Save New Version Milestone
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVersion} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                    Semantic Version *
                  </label>
                  <input
                    type="text"
                    required
                    value={newVersionNum}
                    onChange={(e) => setNewVersionNum(e.target.value)}
                    placeholder="e.g. 1.1 or 2.0"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">
                  Change Note / Amendment Summary
                </label>
                <textarea
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. Updated Clause 12 cancellation retention and defined working hours SLA."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-300 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInAppendix}
                  onChange={(e) => setIncludeInAppendix(e.target.checked)}
                  className="rounded accent-white"
                />
                <span>Include in printed PDF Revision History appendix table</span>
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

