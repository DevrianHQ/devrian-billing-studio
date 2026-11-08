import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  RotateCcw,
  Copy,
  Trash2,
  Plus,
  Tag,
  AlertTriangle,
  Code,
} from 'lucide-react';
import { Clause, PolicyVariables } from '../../types';
import { NeedsReviewBadge } from './NeedsReviewBadge';
import {
  resolveVariables,
  findUnresolvedInText,
} from '../../utils/variableResolver';

interface ClauseItemProps {
  clause: Clause;
  index: number;
  totalClauses: number;
  variables: PolicyVariables;
  allClauses: Clause[];
  onUpdate: (updated: Clause) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onReset: () => void;
}

export const ClauseItem: React.FC<ClauseItemProps> = ({
  clause,
  index,
  totalClauses,
  variables,
  allClauses,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showResolvedPreview, setShowResolvedPreview] = useState(false);

  // Unresolved placeholders check
  const unresolvedInTitle = findUnresolvedInText(
    clause.title,
    variables,
    allClauses
  );
  const unresolvedInBody = findUnresolvedInText(
    clause.body,
    variables,
    allClauses
  );
  const hasUnresolved =
    unresolvedInTitle.length > 0 || unresolvedInBody.length > 0;

  const handleTitleChange = (newTitle: string) => {
    onUpdate({ ...clause, title: newTitle });
  };

  const handleBodyChange = (newBody: string) => {
    onUpdate({ ...clause, body: newBody });
  };

  const handleToggleVisibility = () => {
    onUpdate({ ...clause, isVisible: !clause.isVisible });
  };

  const handleToggleReviewed = () => {
    onUpdate({
      ...clause,
      isReviewed: !clause.isReviewed,
      status: clause.isReviewed ? 'SUGGESTED' : 'CONFIRMED',
    });
  };

  const handleAddSubClause = () => {
    const subs = clause.subClauses || [];
    const newSubNum = `${clause.number}.${subs.length + 1}`;
    const newSub = {
      id: `sub-${Date.now()}`,
      number: newSubNum,
      body: 'New policy sub-clause specification.',
      defaultBody: 'New policy sub-clause specification.',
    };
    onUpdate({
      ...clause,
      subClauses: [...subs, newSub],
    });
  };

  const handleUpdateSubClause = (subId: string, newBody: string) => {
    const subs = (clause.subClauses || []).map((s) =>
      s.id === subId ? { ...s, body: newBody } : s
    );
    onUpdate({ ...clause, subClauses: subs });
  };

  const handleDeleteSubClause = (subId: string) => {
    const subs = (clause.subClauses || [])
      .filter((s) => s.id !== subId)
      .map((s, idx) => ({ ...s, number: `${clause.number}.${idx + 1}` }));
    onUpdate({ ...clause, subClauses: subs });
  };

  return (
    <div
      className={`bg-neutral-900 border rounded-xl transition-all duration-200 overflow-hidden ${
        !clause.isVisible
          ? 'opacity-60 border-neutral-800'
          : hasUnresolved
          ? 'border-red-600/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
          : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* Header Bar */}
      <div className="bg-neutral-950/80 px-4 py-3 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
          {/* Reorder Buttons */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded">
            <button
              type="button"
              disabled={index === 0}
              onClick={onMoveUp}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition"
              title="Move Up"
            >
              <ChevronUp size={13} />
            </button>
            <button
              type="button"
              disabled={index === totalClauses - 1}
              onClick={onMoveDown}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 border-l border-neutral-800 transition"
              title="Move Down"
            >
              <ChevronDown size={13} />
            </button>
          </div>

          {/* Clause Number */}
          <span className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-200 shrink-0">
            {clause.number}
          </span>

          {/* Title Input */}
          <input
            type="text"
            value={clause.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Clause Title..."
            className="bg-transparent text-sm font-semibold text-white focus:outline-none focus:border-b focus:border-neutral-500 flex-1 min-w-[140px] px-1 py-0.5"
          />

          {/* Needs Review Badge */}
          <NeedsReviewBadge
            status={clause.status}
            isReviewed={clause.isReviewed}
            onToggleReview={handleToggleReviewed}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Resolved Preview Toggle */}
          <button
            type="button"
            onClick={() => setShowResolvedPreview(!showResolvedPreview)}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition ${
              showResolvedPreview
                ? 'bg-neutral-200 text-neutral-900 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Toggle Live Variable Preview"
          >
            <Code size={12} />
            <span className="hidden sm:inline">Preview Variables</span>
          </button>

          {/* Visibility Toggle */}
          <button
            type="button"
            onClick={handleToggleVisibility}
            className={`p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition ${
              !clause.isVisible ? 'text-amber-400' : ''
            }`}
            title={clause.isVisible ? 'Hide clause from document' : 'Show clause in document'}
          >
            {clause.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          {/* Duplicate Clause */}
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Duplicate clause"
          >
            <Copy size={14} />
          </button>

          {/* Reset to Default */}
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition"
            title="Reset to default text"
          >
            <RotateCcw size={14} />
          </button>

          {/* Delete Clause */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition"
            title="Delete clause"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Unresolved Variable Warning Bar */}
      {hasUnresolved && (
        <div className="bg-red-950/80 border-b border-red-800/80 px-4 py-1.5 text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle size={13} className="shrink-0 text-red-400" />
          <span>
            <strong>Unresolved placeholders found:</strong>{' '}
            {[...unresolvedInTitle, ...unresolvedInBody].join(', ')}. PDF export will be blocked until these are resolved in Policy Variables.
          </span>
        </div>
      )}

      {/* Body Area */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {/* Tags */}
          {clause.tags && clause.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag size={11} className="text-neutral-500" />
              {clause.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800/80 text-neutral-400 border border-neutral-700/60"
                >
                  #{t}
                </span>
              ))}
              <span className="text-[10px] text-neutral-500 ml-auto font-mono">
                Key: {'{{'}ref:{clause.key}{'}}'}
              </span>
            </div>
          )}

          {/* Live Preview Mode or Editor Textarea */}
          {showResolvedPreview ? (
            <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800 text-xs text-neutral-300 leading-relaxed font-sans whitespace-pre-wrap select-text">
              <div className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">
                Live Resolved Text (As it appears in PDF):
              </div>
              {resolveVariables(clause.body, variables, allClauses)}
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                Clause Content (supports Hindi/Devanagari and {'{{variable}}'} tokens):
              </label>
              <textarea
                value={clause.body}
                onChange={(e) => handleBodyChange(e.target.value)}
                rows={3}
                placeholder="Enter policy clause wording..."
                className="w-full bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-lg p-3 text-xs leading-relaxed focus:outline-none focus:border-neutral-600 transition resize-y font-sans"
              />
            </div>
          )}

          {/* Sub-Clauses Section */}
          <div className="space-y-2 pt-1 border-t border-neutral-800/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Sub-Clauses {clause.subClauses?.length ? `(${clause.subClauses.length})` : ''}
              </span>
              <button
                type="button"
                onClick={handleAddSubClause}
                className="text-[11px] text-neutral-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 transition"
              >
                <Plus size={12} /> Add Sub-Clause
              </button>
            </div>

            {clause.subClauses && clause.subClauses.length > 0 && (
              <div className="space-y-2 pl-3 border-l-2 border-neutral-800">
                {clause.subClauses.map((sub) => (
                  <div key={sub.id} className="flex items-start gap-2 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
                    <span className="text-xs font-bold text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded shrink-0">
                      {sub.number}
                    </span>
                    <textarea
                      value={sub.body}
                      onChange={(e) => handleUpdateSubClause(sub.id, e.target.value)}
                      rows={2}
                      className="flex-1 bg-transparent text-neutral-300 text-xs focus:outline-none resize-none font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSubClause(sub.id)}
                      className="text-neutral-500 hover:text-red-400 p-1 transition"
                      title="Delete sub-clause"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

