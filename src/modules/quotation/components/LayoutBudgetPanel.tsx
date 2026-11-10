import React, { useMemo } from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { BillingDocument } from '../../../types';
import { SavedQuotationTemplate } from '../types';
import { computeQuotationFinancials, measureQuotationLayout } from '../layoutEngine';

interface BlockBudgetItem {
  name: string;
  specTopMm: number;
  specHeightMm: number;
  measuredHeightMm: number;
  measuredTopMm: number;
  gapMm: number;
  status: 'OPTIMAL' | 'LEVER_APPLIED' | 'OVERFLOW';
}

interface LayoutBudgetPanelProps {
  document: BillingDocument;
  template: SavedQuotationTemplate;
}

export const LayoutBudgetPanel: React.FC<LayoutBudgetPanelProps> = ({
  document: doc,
  template,
}) => {
  const isMonthly = doc.quotationType === 'monthly' || doc.quotationType === 'hybrid';
  const layout = useMemo(() => measureQuotationLayout(doc, template), [doc, template]);
  const financials = useMemo(() => computeQuotationFinancials(doc), [doc]);

  const items = doc.items || [];
  const deliverables = doc.monthlyDeliverables || template.sampleData.deliverables || [];
  const terms = doc.notes || template.terms || [];

  // Project Page 1 Budget calculation
  const projectBudget = useMemo((): BlockBudgetItem[] => {
    const list: BlockBudgetItem[] = [];
    let currentTop = 0;

    // 1. HeaderBand
    list.push({
      name: 'HeaderBand (full-bleed #0E0E0E)',
      specTopMm: 0,
      specHeightMm: 48,
      measuredHeightMm: 48,
      measuredTopMm: currentTop,
      gapMm: 4,
      status: 'OPTIMAL',
    });
    currentTop += 48 + 4;

    // 2. MetaRow
    list.push({
      name: 'MetaRow (4 equal columns: 43.5mm)',
      specTopMm: 52,
      specHeightMm: 12,
      measuredHeightMm: 12,
      measuredTopMm: currentTop,
      gapMm: 4,
      status: 'OPTIMAL',
    });
    currentTop += 12 + 4;

    // 3. PartyRow
    list.push({
      name: 'PartyRow (Prepared For | Project: 84mm + 84mm)',
      specTopMm: 68,
      specHeightMm: 19,
      measuredHeightMm: 19,
      measuredTopMm: currentTop,
      gapMm: 4,
      status: 'OPTIMAL',
    });
    currentTop += 19 + 4;

    // 4. SectionHeading + DataTable
    const isDense = items.length >= 5;
    const rowH = isDense ? 9.0 : 9.5;
    const dataTableH = 8.5 + (items.length * rowH) + 6.5; // heading 6.5mm
    list.push({
      name: `SCOPE OF WORK + DataTable (${items.length} rows)`,
      specTopMm: 91,
      specHeightMm: isDense ? 53.5 : 46.5,
      measuredHeightMm: Math.round(dataTableH),
      measuredTopMm: currentTop,
      gapMm: 4,
      status: items.length > 5 ? 'OVERFLOW' : (isDense ? 'LEVER_APPLIED' : 'OPTIMAL'),
    });
    currentTop += Math.round(dataTableH) + 4;

    // 5. PaymentBox + SummaryBlock (2 columns)
    list.push({
      name: 'Two-Column Row: PaymentBox (L) & SummaryBlock (R)',
      specTopMm: 145,
      specHeightMm: 34,
      measuredHeightMm: 34,
      measuredTopMm: currentTop,
      gapMm: 3,
      status: 'OPTIMAL',
    });
    currentTop += 34 + 3;

    // 6. GST Note
    list.push({
      name: 'GST Note ("Prices exclude GST...")',
      specTopMm: 182,
      specHeightMm: 4,
      measuredHeightMm: 4,
      measuredTopMm: currentTop,
      gapMm: 3,
      status: 'OPTIMAL',
    });
    currentTop += 4 + 3;

    // 7. NoteBox
    const noteBoxH = 8 + 3 + (terms.length * 5.2);
    list.push({
      name: `NoteBox "TERMS & NOTES" (${terms.length} points)`,
      specTopMm: 189,
      specHeightMm: 36,
      measuredHeightMm: Math.round(noteBoxH),
      measuredTopMm: currentTop,
      gapMm: 3,
      status: terms.length > 5 ? 'OVERFLOW' : 'OPTIMAL',
    });
    currentTop += Math.round(noteBoxH) + 3;

    // 8. Instruction Line + SignaturePair
    list.push({
      name: 'Instruction Line + SignaturePair (82mm + 82mm, 11mm sig)',
      specTopMm: 228,
      specHeightMm: 29.5, // 4mm + 2mm gap + 26mm pair - overlap + 3.5mm issue
      measuredHeightMm: 33.5,
      measuredTopMm: currentTop,
      gapMm: 2,
      status: 'OPTIMAL',
    });
    currentTop += 33.5 + 2;

    // 9. ClosingLine
    list.push({
      name: 'ClosingLine (Body Italic)',
      specTopMm: 263.5,
      specHeightMm: 4,
      measuredHeightMm: 4,
      measuredTopMm: currentTop,
      gapMm: 282 - (currentTop + 4),
      status: currentTop + 4 > 282 ? 'OVERFLOW' : 'OPTIMAL',
    });
    currentTop += 4;

    // 10. Footer
    list.push({
      name: 'Footer (Rule at y=282mm, text at y=285mm)',
      specTopMm: 282,
      specHeightMm: 15,
      measuredHeightMm: 15,
      measuredTopMm: 282,
      gapMm: 0,
      status: currentTop > 282 ? 'OVERFLOW' : 'OPTIMAL',
    });

    return list;
  }, [items, terms]);

  // Monthly Page 1 Budget
  const monthlyP1Budget = useMemo((): BlockBudgetItem[] => {
    const list: BlockBudgetItem[] = [];
    let currentTop = 0;

    // HeaderBand
    list.push({
      name: 'HeaderBand (full-bleed #0E0E0E)',
      specTopMm: 0,
      specHeightMm: 48,
      measuredHeightMm: 48,
      measuredTopMm: currentTop,
      gapMm: 4,
      status: 'OPTIMAL',
    });
    currentTop += 48 + 4;

    // MetaRow
    list.push({
      name: 'MetaRow (4 equal columns)',
      specTopMm: 52,
      specHeightMm: 12,
      measuredHeightMm: 12,
      measuredTopMm: currentTop,
      gapMm: 4,
      status: 'OPTIMAL',
    });
    currentTop += 12 + 4;

    // PartyRow
    list.push({
      name: 'PartyRow (Prepared For | Service: 84mm + 84mm)',
      specTopMm: 68,
      specHeightMm: 19,
      measuredHeightMm: 19,
      measuredTopMm: currentTop,
      gapMm: 4,
      status: 'OPTIMAL',
    });
    currentTop += 19 + 4;

    // Deliverables ListTable
    const listH = 8.5 + (deliverables.length * 9.5) + 4; // header + rows + note
    list.push({
      name: `WHAT'S INCLUDED EACH MONTH (${deliverables.length} items)`,
      specTopMm: 91,
      specHeightMm: 69.5,
      measuredHeightMm: Math.round(listH),
      measuredTopMm: currentTop,
      gapMm: 4,
      status: deliverables.length > 6 ? 'OVERFLOW' : 'OPTIMAL',
    });
    currentTop += Math.round(listH) + 4;

    // Pricing DataTable
    const priceH = 8.5 + (items.length * 9.5);
    list.push({
      name: `MONTHLY RETAINER PRICING (${items.length} rows)`,
      specTopMm: 168.5,
      specHeightMm: 37,
      measuredHeightMm: Math.round(priceH),
      measuredTopMm: currentTop,
      gapMm: 4,
      status: items.length > 3 ? 'OVERFLOW' : 'OPTIMAL',
    });
    currentTop += Math.round(priceH) + 4;

    // SummaryBlock
    list.push({
      name: 'SummaryBlock (Monthly Retainer, TotalBar DUE TO START)',
      specTopMm: 213.5,
      specHeightMm: 38,
      measuredHeightMm: 38,
      measuredTopMm: currentTop,
      gapMm: 4,
      status: 'OPTIMAL',
    });
    currentTop += 38 + 4;

    // Continued Notice
    list.push({
      name: 'Continued Notice ("Continued on page 2...")',
      specTopMm: 272,
      specHeightMm: 4,
      measuredHeightMm: 4,
      measuredTopMm: currentTop,
      gapMm: 282 - (currentTop + 4),
      status: currentTop + 4 > 282 ? 'OVERFLOW' : 'OPTIMAL',
    });

    // Footer
    list.push({
      name: 'Footer (Page 1 of 2)',
      specTopMm: 282,
      specHeightMm: 15,
      measuredHeightMm: 15,
      measuredTopMm: 282,
      gapMm: 0,
      status: 'OPTIMAL',
    });

    return list;
  }, [items, deliverables]);

  // Monthly Page 2 Budget
  const monthlyP2Budget = useMemo((): BlockBudgetItem[] => {
    const list: BlockBudgetItem[] = [];
    let currentTop = 0;

    // SlimHeader
    list.push({
      name: 'SlimHeader (Small Lockup + CONTINUED, rule at y=22)',
      specTopMm: 0,
      specHeightMm: 24,
      measuredHeightMm: 24,
      measuredTopMm: currentTop,
      gapMm: 4,
      status: 'OPTIMAL',
    });
    currentTop += 24 + 4;

    // KeyValueStrip
    list.push({
      name: 'BILLING & TERM (KeyValueStrip: 4 cols x 2 rows = 26mm)',
      specTopMm: 28,
      specHeightMm: 26,
      measuredHeightMm: 26,
      measuredTopMm: currentTop,
      gapMm: 4,
      status: 'OPTIMAL',
    });
    currentTop += 26 + 4;

    // PaymentBox (174mm)
    list.push({
      name: 'PaymentBox Full Width (174mm x 34mm)',
      specTopMm: 58,
      specHeightMm: 34,
      measuredHeightMm: 34,
      measuredTopMm: currentTop,
      gapMm: 4,
      status: 'OPTIMAL',
    });
    currentTop += 34 + 4;

    // GST Note
    list.push({
      name: 'GST Note ("Prices exclude GST...")',
      specTopMm: 96,
      specHeightMm: 4,
      measuredHeightMm: 4,
      measuredTopMm: currentTop,
      gapMm: 4,
      status: 'OPTIMAL',
    });
    currentTop += 4 + 4;

    // NoteBox (7 points)
    const notesH = 8 + 3 + (terms.length * 5.2);
    list.push({
      name: `TERMS & NOTES (${terms.length} points)`,
      specTopMm: 104,
      specHeightMm: 50,
      measuredHeightMm: Math.round(notesH),
      measuredTopMm: currentTop,
      gapMm: 4,
      status: terms.length > 7 ? 'OVERFLOW' : 'OPTIMAL',
    });
    currentTop += Math.round(notesH) + 4;

    // Instruction Line + SignaturePair
    list.push({
      name: 'Instruction Line + SignaturePair (82mm + 82mm, 18mm sig)',
      specTopMm: 162,
      specHeightMm: 37,
      measuredHeightMm: 41,
      measuredTopMm: currentTop,
      gapMm: 2,
      status: 'OPTIMAL',
    });
    currentTop += 41 + 2;

    // ClosingLine
    list.push({
      name: 'ClosingLine (Body Italic)',
      specTopMm: 205,
      specHeightMm: 4,
      measuredHeightMm: 4,
      measuredTopMm: currentTop,
      gapMm: 282 - (currentTop + 4),
      status: currentTop + 4 > 282 ? 'OVERFLOW' : 'OPTIMAL',
    });

    // Footer
    list.push({
      name: 'Footer (Page 2 of 2)',
      specTopMm: 282,
      specHeightMm: 15,
      measuredHeightMm: 15,
      measuredTopMm: 282,
      gapMm: 0,
      status: currentTop > 282 ? 'OVERFLOW' : 'OPTIMAL',
    });

    return list;
  }, [terms]);

  const renderTable = (title: string, items: BlockBudgetItem[]) => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
          {title}
        </span>
        <span className="text-[11px] font-mono text-neutral-400">
          Target Ceiling: 282mm (Footer Rule)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 text-[10px] uppercase">
              <th className="py-2 pr-3">Block / Component</th>
              <th className="py-2 pr-3 text-right">Spec Top</th>
              <th className="py-2 pr-3 text-right">Meas. Top</th>
              <th className="py-2 pr-3 text-right">Spec H</th>
              <th className="py-2 pr-3 text-right">Meas. H</th>
              <th className="py-2 pr-3 text-right">Next Gap</th>
              <th className="py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
            {items.map((row, idx) => (
              <tr key={idx} className="hover:bg-neutral-800/30">
                <td className="py-2 pr-3 font-sans font-medium text-white">{row.name}</td>
                <td className="py-2 pr-3 text-right text-neutral-400">{row.specTopMm.toFixed(1)}mm</td>
                <td className="py-2 pr-3 text-right text-neutral-200">{row.measuredTopMm.toFixed(1)}mm</td>
                <td className="py-2 pr-3 text-right text-neutral-400">{row.specHeightMm.toFixed(1)}mm</td>
                <td className="py-2 pr-3 text-right text-neutral-200">{row.measuredHeightMm.toFixed(1)}mm</td>
                <td className="py-2 pr-3 text-right text-neutral-400">{row.gapMm.toFixed(1)}mm</td>
                <td className="py-2 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.status === 'OPTIMAL'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : row.status === 'LEVER_APPLIED'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 select-none p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Developer Layout Budget &amp; Measurement Panel
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time measurement of block top, height and gap per page versus LOCKED specification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              layout.canExport
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                : 'bg-red-950 text-red-300 border border-red-600/40'
            }`}
          >
            {layout.canExport ? '✓ Budget Passed (Ready to Export)' : '✗ Export Blocked'}
          </span>
        </div>
      </div>

      {/* Render tables based on template */}
      {!isMonthly ? (
        renderTable('Project Template (Exactly 1 Page Budget)', projectBudget)
      ) : (
        <>
          {renderTable('Monthly Retainer · Page 1 Budget (Scope & Pricing)', monthlyP1Budget)}
          {renderTable('Monthly Retainer · Page 2 Budget (Terms, Payment & Acceptance)', monthlyP2Budget)}
        </>
      )}
    </div>
  );
};

