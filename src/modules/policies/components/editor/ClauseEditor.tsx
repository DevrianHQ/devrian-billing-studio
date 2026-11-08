import React, { useState, useMemo } from 'react';
import {
  Plus,
  RotateCcw,
  Search,
  Filter,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { Clause, PolicyVariables } from '../../types';
import { ClauseItem } from './ClauseItem';
import { findUnresolvedInClauses } from '../../utils/variableResolver';

interface ClauseEditorProps {
  clauses: Clause[];
  variables: PolicyVariables;
  onChange: (clauses: Clause[]) => void;
  onResetAll: () => void;
}

export const ClauseEditor: React.FC<ClauseEditorProps> = ({
  clauses,
  variables,
  onChange,
  onResetAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_review' | 'confirmed' | 'hidden'>('all');

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    clauses.forEach((c) => {
      c.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [clauses]);

  // Unreviewed count
  const unreviewedCount = useMemo(() => {
    return clauses.filter((c) => c.status === 'SUGGESTED' && !c.isReviewed).length;
  }, [clauses]);

  // Unresolved variables
  const unresolvedIssues = useMemo(() => {
    return findUnresolvedInClauses(clauses, variables);
  }, [clauses, variables]);

  // Filtered clauses
  const filteredClauses = useMemo(() => {
    return clauses.filter((clause) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = clause.title.toLowerCase().includes(query);
        const matchBody = clause.body.toLowerCase().includes(query);
        const matchNumber = String(clause.number).includes(query);
        if (!matchTitle && !matchBody && !matchNumber) return false;
      }

      // Tag filter
      if (selectedTag !== 'all') {
        if (!clause.tags?.includes(selectedTag)) return false;
      }

      // Status filter
      if (statusFilter === 'needs_review') {
        if (clause.status !== 'SUGGESTED' || clause.isReviewed) return false;
      } else if (statusFilter === 'confirmed') {
        if (clause.status !== 'CONFIRMED' && !clause.isReviewed) return false;
      } else if (statusFilter === 'hidden') {
        if (clause.isVisible) return false;
      }

      return true;
    });
  }, [clauses, searchQuery, selectedTag, statusFilter]);

  // Re-numbering helper
  const renumberClauses = (list: Clause[]): Clause[] => {
    return list.map((c, idx) => {
      const newNum = idx + 1;
      const updatedSubs = c.subClauses?.map((sub, sIdx) => ({
        ...sub,
        number: `${newNum}.${sIdx + 1}`,
      }));
      return {
        ...c,
        number: newNum,
        subClauses: updatedSubs,
      };
    });
  };

  const handleUpdateClause = (updatedClause: Clause) => {
    const updated = clauses.map((c) => (c.id === updatedClause.id ? updatedClause : c));
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newClauses = [...clauses];
    const temp = newClauses[index - 1];
    newClauses[index - 1] = newClauses[index];
    newClauses[index] = temp;
    onChange(renumberClauses(newClauses));
  };

  const handleMoveDown = (index: number) => {
    if (index === clauses.length - 1) return;
    const newClauses = [...clauses];
    const temp = newClauses[index + 1];
    newClauses[index + 1] = newClauses[index];
    newClauses[index] = temp;
    onChange(renumberClauses(newClauses));
  };

  const handleDuplicateClause = (clause: Clause) => {
    const newClause: Clause = {
      ...clause,
      id: `clause-${Date.now()}`,
      key: `${clause.key}_copy_${Math.floor(Math.random() * 1000)}`,
      title: `${clause.title} (Copy)`,
      status: 'CONFIRMED',
      isReviewed: true,
    };
    const index = clauses.findIndex((c) => c.id === clause.id);
    const newClauses = [...clauses];
    newClauses.splice(index + 1, 0, newClause);
    onChange(renumberClauses(newClauses));
  };

  const handleDeleteClause = (clauseId: string) => {
    if (clauses.length <= 1) {
      alert('You must retain at least one clause.');
      return;
    }
    const newClauses = clauses.filter((c) => c.id !== clauseId);
    onChange(renumberClauses(newClauses));
  };

  const handleResetClause = (clauseId: string) => {
    const updated = clauses.map((c) => {
      if (c.id === clauseId) {
        return {
          ...c,
          title: c.defaultTitle || c.title,
          body: c.defaultBody || c.body,
          subClauses: c.subClauses?.map((s) => ({
            ...s,
            body: s.defaultBody || s.body,
          })),
        };
      }
      return c;
    });
    onChange(updated);
  };

  const handleAddNewClause = () => {
    const newNum = clauses.length + 1;
    const newClause: Clause = {
      id: `clause-${Date.now()}`,
      number: newNum,
      key: `custom_clause_${Date.now()}`,
      title: 'New Policy Clause',
      defaultTitle: 'New Policy Clause',
      body: 'Insert policy provisions, obligations, and terms here. Use {{variable}} tokens as needed.',
      defaultBody: 'Insert policy provisions, obligations, and terms here.',
      tags: ['custom'],
      isVisible: true,
      status: 'CONFIRMED',
      isReviewed: true,
      subClauses: [],
    };
    onChange([...clauses, newClause]);
  };

  const handleMarkAllReviewed = () => {
    const updated = clauses.map((c) => ({
      ...c,
      status: 'CONFIRMED' as const,
      isReviewed: true,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top Notification Banners */}
      {unreviewedCount > 0 && (
        <div className="bg-amber-950/70 border border-amber-700/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold text-xs tracking-wide">
                {unreviewedCount} clause{unreviewedCount === 1 ? '' : 's'} marked as Suggested:
              </span>
              <p className="text-[11px] text-amber-300/80">
                These clauses contain suggested commercial defaults. Please review them before sending to clients.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleMarkAllReviewed}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5"
          >
            <CheckCircle2 size={13} />
            Mark All as Reviewed
          </button>
        </div>
      )}

      {unresolvedIssues.length > 0 && (
        <div className="bg-red-950/80 border border-red-700/90 rounded-xl p-3.5 flex items-start gap-3 text-red-200">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold tracking-wide">
              {unresolvedIssues.length} Clause{unresolvedIssues.length === 1 ? '' : 's'} have unresolved placeholders:
            </span>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-red-300/90">
              {unresolvedIssues.map((issue) => (
                <li key={issue.clauseNumber}>
                  Clause {issue.clauseNumber} ({issue.clauseTitle}): Missing {issue.placeholders.join(', ')}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-red-400 mt-1">
              Add missing tokens in the <strong>Policy Variables</strong> tab to resolve. PDF export is blocked while placeholders are unresolved.
            </p>
          </div>
        </div>
      )}

      {/* Control Bar: Filters, Search, Actions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clauses by keyword or clause #..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition ${
                statusFilter === 'all'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All ({clauses.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('needs_review')}
              className={`px-2.5 py-1 rounded-md transition ${
                statusFilter === 'needs_review'
                  ? 'bg-amber-950 text-amber-300 font-semibold border border-amber-800/80'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Needs Review ({unreviewedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('confirmed')}
              className={`px-2.5 py-1 rounded-md transition ${
                statusFilter === 'confirmed'
                  ? 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/80'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Confirmed
            </button>
          </div>

          {/* Tags Dropdown */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-300">
              <Filter size={12} className="text-neutral-500" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-transparent text-neutral-200 focus:outline-none text-xs"
              >
                <option value="all" className="bg-neutral-900">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag} className="bg-neutral-900">
                    #{tag}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Add Clause Button */}
          <button
            type="button"
            onClick={handleAddNewClause}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={13} />
            Add Clause
          </button>

          {/* Reset All */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all clauses and sub-clauses to original DEVRIAN standard defaults? Any custom modifications will be replaced.')) {
                onResetAll();
              }
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition"
            title="Reset All Clauses to Default"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Clauses List */}
      <div className="space-y-3">
        {filteredClauses.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center text-neutral-400 text-xs">
            No clauses match the current filters or search query.
          </div>
        ) : (
          filteredClauses.map((clause) => {
            const index = clauses.findIndex((c) => c.id === clause.id);
            return (
              <ClauseItem
                key={clause.id}
                clause={clause}
                index={index}
                totalClauses={clauses.length}
                variables={variables}
                allClauses={clauses}
                onUpdate={handleUpdateClause}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                onDuplicate={() => handleDuplicateClause(clause)}
                onDelete={() => handleDeleteClause(clause.id)}
                onReset={() => handleResetClause(clause.id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

