import React from 'react';
import {
  BillingDocument,
  QuotationBlockConfig,
  QuotationBlockId,
  QuotationType,
} from '../../types';
import {
  resolveQuotationLayout,
  DEFAULT_BLOCK_ORDER,
  estimateBlockHeights,
} from '../../services/quotationLayoutEngine';
import {
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  MoveRight,
  AlertTriangle,
  Layers,
  Wand2,
} from 'lucide-react';

interface QuotationPageLayoutPanelProps {
  document: BillingDocument;
  onChange: (doc: BillingDocument) => void;
}

const BLOCK_NAMES: Record<QuotationBlockId, string> = {
  deliverables: "What's Included Each Month",
  scope_table: 'Scope of Work / Pricing Table',
  billing_strip: 'Billing & Term Strip',
  payment_summary: 'Payment Details & Summary',
  gst_line: 'GST Notice Line',
  inclusions_exclusions: 'Inclusions & Exclusions',
  delivery_timeline: 'Delivery Timeline',
  notes: 'Free Notes',
  terms_and_notes: 'Terms & Notes Box',
  acceptance: 'Acceptance Box',
};

export const QuotationPageLayoutPanel: React.FC<QuotationPageLayoutPanelProps> = ({
  document: doc,
  onChange,
}) => {
  const type: QuotationType = doc.quotationType || 'project';
  const layout = resolveQuotationLayout(doc, type);
  const blockHeights = estimateBlockHeights(doc, type);

  // Active blocks from doc or default
  const blocks: QuotationBlockConfig[] =
    doc.quotationBlocks && doc.quotationBlocks.length > 0
      ? doc.quotationBlocks
      : DEFAULT_BLOCK_ORDER.map((id, index) => {
          let visible = true;
          if (id === 'deliverables') visible = type === 'monthly' || type === 'hybrid';
          if (id === 'billing_strip') visible = type === 'monthly' || type === 'hybrid';
          if (id === 'inclusions_exclusions') visible = Boolean(doc.sectionVisibility?.showInclusions);
          if (id === 'delivery_timeline') visible = Boolean(doc.sectionVisibility?.showTimeline);
          if (id === 'notes') visible = Boolean(doc.sectionVisibility?.showFreeNotes);
          return {
            id,
            page: 1 as const,
            order: index + 1,
            visible,
          };
        });

  // Sort blocks by page, then order
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    return a.order - b.order;
  });

  const handleUpdateBlocks = (newBlocks: QuotationBlockConfig[], isCustom = true) => {
    onChange({
      ...doc,
      quotationBlocks: newBlocks,
      isCustomBlockLayout: isCustom,
    });
  };

  const handleToggleVisible = (blockId: QuotationBlockId) => {
    const updated = blocks.map((b) =>
      b.id === blockId ? { ...b, visible: !b.visible } : b
    );
    // Also sync with sectionVisibility if relevant
    const newVis = { ...(doc.sectionVisibility || {}) };
    if (blockId === 'inclusions_exclusions') newVis.showInclusions = !newVis.showInclusions;
    if (blockId === 'delivery_timeline') newVis.showTimeline = !newVis.showTimeline;
    if (blockId === 'notes') newVis.showFreeNotes = !newVis.showFreeNotes;
    if (blockId === 'terms_and_notes') newVis.showTermsAndNotes = !newVis.showTermsAndNotes;
    if (blockId === 'acceptance') newVis.showAcceptance = !newVis.showAcceptance;

    onChange({
      ...doc,
      quotationBlocks: updated,
      isCustomBlockLayout: true,
      sectionVisibility: newVis,
    });
  };

  const handlePageChange = (blockId: QuotationBlockId, targetPage: 1 | 2) => {
    const updated = blocks.map((b) =>
      b.id === blockId ? { ...b, page: targetPage } : b
    );
    handleUpdateBlocks(updated, true);
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedBlocks.length) return;

    const currentBlock = sortedBlocks[index];
    const targetBlock = sortedBlocks[targetIndex];

    // Swap order values
    const updated = blocks.map((b) => {
      if (b.id === currentBlock.id) return { ...b, order: targetBlock.order, page: targetBlock.page };
      if (b.id === targetBlock.id) return { ...b, order: currentBlock.order, page: currentBlock.page };
      return b;
    });

    handleUpdateBlocks(updated, true);
  };

  const handleAutoLayout = () => {
    // Reset to auto layout
    const autoPlan = resolveQuotationLayout(
      { ...doc, isCustomBlockLayout: false, quotationBlocks: undefined },
      type
    );
    onChange({
      ...doc,
      quotationBlocks: autoPlan.activeBlocks,
      isCustomBlockLayout: false,
    });
  };

  const handleMoveLastBlockToPage2 = () => {
    // Find the last visible block currently on Page 1
    const p1Blocks = sortedBlocks.filter((b) => b.page === 1 && b.visible);
    if (p1Blocks.length === 0) return;
    const lastP1 = p1Blocks[p1Blocks.length - 1];
    const updated = blocks.map((b) =>
      b.id === lastP1.id ? { ...b, page: 2 as const } : b
    );
    handleUpdateBlocks(updated, true);
  };

  const isCustom = Boolean(doc.isCustomBlockLayout);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-amber-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-white">
            Page Layout Panel
          </h3>
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
              layout.totalPages === 2
                ? 'bg-indigo-950/70 border-indigo-500/60 text-indigo-300'
                : 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
            }`}
          >
            {layout.totalPages} {layout.totalPages === 1 ? 'Page' : 'Pages'}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
              isCustom
                ? 'bg-amber-950/60 border-amber-600/70 text-amber-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300'
            }`}
          >
            {isCustom ? 'Custom' : 'Auto'}
          </span>
        </div>
      </div>

      {/* Rule Violation Warning Banner with Fix Automatically */}
      {layout.hasRuleViolation && (
        <div className="flex items-center justify-between p-2.5 bg-amber-950/50 border border-amber-500/80 rounded-lg text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-400 shrink-0" />
            <span>{layout.ruleViolationMessage}</span>
          </div>
          <button
            type="button"
            onClick={handleAutoLayout}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] rounded transition-colors shrink-0 ml-2"
          >
            Fix Automatically
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleAutoLayout}
          className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-700 transition"
        >
          <Wand2 size={12} className="text-amber-400" />
          <span>Auto Layout</span>
        </button>

        <button
          type="button"
          onClick={handleMoveLastBlockToPage2}
          className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-700 transition"
        >
          <MoveRight size={12} className="text-sky-400" />
          <span>Move Last to P2</span>
        </button>
      </div>

      {/* Block Rows List */}
      <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
        {/* Fixed Header Notice */}
        <div className="p-2 bg-neutral-950/60 border border-neutral-800/80 rounded text-[11px] text-neutral-400 flex items-center justify-between select-none">
          <span className="font-medium text-neutral-300">
            Header Band, Quotation Meta &amp; Party Rows
          </span>
          <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">
            Fixed (Page 1)
          </span>
        </div>

        {sortedBlocks.map((block, idx) => {
          const h = blockHeights[block.id] || 0;
          return (
            <div
              key={block.id}
              className={`p-2 rounded-lg border flex items-center justify-between gap-2 text-xs transition ${
                !block.visible
                  ? 'bg-neutral-950/40 border-neutral-800/60 text-neutral-500 opacity-60'
                  : block.page === 2
                  ? 'bg-indigo-950/20 border-indigo-900/40 text-neutral-200'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-200'
              }`}
            >
              {/* Left: Name and estimated height */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleVisible(block.id)}
                  className="text-neutral-400 hover:text-white shrink-0 p-0.5"
                  title={block.visible ? 'Hide section' : 'Show section'}
                >
                  {block.visible ? <Eye size={13} className="text-emerald-400" /> : <EyeOff size={13} />}
                </button>
                <div className="truncate">
                  <span className="font-semibold">{BLOCK_NAMES[block.id]}</span>
                  {h > 0 && (
                    <span className="ml-1.5 text-[10px] text-neutral-500 font-mono">
                      (~{Math.round(h)}mm)
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Page 1 / Page 2 switcher and reorder arrows */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Page Selector Pill */}
                <div className="flex bg-neutral-900 p-0.5 rounded border border-neutral-800 text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => handlePageChange(block.id, 1)}
                    className={`px-1.5 py-0.5 rounded transition ${
                      block.page === 1
                        ? 'bg-white text-black font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    P1
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePageChange(block.id, 2)}
                    className={`px-1.5 py-0.5 rounded transition ${
                      block.page === 2
                        ? 'bg-indigo-500 text-white font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    P2
                  </button>
                </div>

                {/* Up/Down Reorder */}
                <div className="flex items-center">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveOrder(idx, 'up')}
                    className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sortedBlocks.length - 1}
                    onClick={() => handleMoveOrder(idx, 'down')}
                    className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

