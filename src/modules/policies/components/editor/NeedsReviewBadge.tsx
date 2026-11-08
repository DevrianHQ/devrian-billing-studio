import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ClauseStatus } from '../../types';

interface NeedsReviewBadgeProps {
  status: ClauseStatus;
  isReviewed: boolean;
  onToggleReview?: () => void;
  className?: string;
}

export const NeedsReviewBadge: React.FC<NeedsReviewBadgeProps> = ({
  status,
  isReviewed,
  onToggleReview,
  className = '',
}) => {
  if (status === 'CONFIRMED' || isReviewed) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 ${className}`}
        title="Owner Confirmed Clause"
      >
        <CheckCircle2 size={11} />
        Confirmed
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-amber-950/70 text-amber-300 border border-amber-700/80 animate-pulse"
        title="Suggested default: Needs owner review before finalization"
      >
        <AlertCircle size={11} />
        Needs Review
      </span>
      {onToggleReview && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleReview();
          }}
          className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
          title="Click to mark as reviewed by business owner"
        >
          Mark Reviewed
        </button>
      )}
    </div>
  );
};

