import React from 'react';
import { MonthlyDeliverable } from '../../../types';

interface QuotationDeliverablesBlockProps {
  deliverables?: MonthlyDeliverable[];
  heading?: string;
}

export const QuotationDeliverablesBlock: React.FC<QuotationDeliverablesBlockProps> = ({
  deliverables = [],
  heading = "WHAT'S INCLUDED EACH MONTH",
}) => {
  if (!deliverables || deliverables.length === 0) return null;

  // Split deliverables into 2 columns for compact side-by-side display
  const half = Math.ceil(deliverables.length / 2);
  const leftCol = deliverables.slice(0, half);
  const rightCol = deliverables.slice(half);

  return (
    <div
      data-section="quotation-deliverables"
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '2mm',
        paddingBottom: '2mm',
      }}
    >
      <div
        style={{
          border: '0.25mm solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          borderRadius: '1.5mm',
          padding: '3mm 4mm',
          boxSizing: 'border-box',
        }}
      >
        {/* Section Heading + Count Badge */}
        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: '6.8pt',
            letterSpacing: '0.24em',
            wordSpacing: '0.6em',
            color: '#0E0E0E',
            textTransform: 'uppercase',
            marginBottom: '2mm',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'between',
          }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-[2mm]">
            <span
              style={{
                width: '1.8mm',
                height: '1.8mm',
                backgroundColor: '#0E0E0E',
                display: 'inline-block',
              }}
            />
            <span>{heading}</span>
          </div>
          <span
            style={{
              fontSize: '6.5pt',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#475569',
              backgroundColor: '#E2E8F0',
              padding: '0.5mm 2.2mm',
              borderRadius: '0.8mm',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {deliverables.length} DELIVERABLES
          </span>
        </div>

        {/* 2-Column Unpriced Deliverables List */}
        <div className="grid grid-cols-2 gap-x-[6mm] gap-y-[1.2mm]">
          {/* Left Column */}
          <div className="space-y-[1.2mm]">
            {leftCol.map((d) => (
              <div
                key={d.id}
                className="flex items-baseline justify-between py-[0.6mm] border-b border-[#E2E8F0]/70"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '8.2pt',
                  lineHeight: 1.3,
                }}
              >
                <span className="font-medium text-[#1E293B] pr-2">
                  {d.item || 'Deliverable item'}
                </span>
                <span className="font-semibold text-[#0E0E0E] shrink-0 font-mono text-[7.8pt]">
                  {d.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-[1.2mm]">
            {rightCol.map((d) => (
              <div
                key={d.id}
                className="flex items-baseline justify-between py-[0.6mm] border-b border-[#E2E8F0]/70"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '8.2pt',
                  lineHeight: 1.3,
                }}
              >
                <span className="font-medium text-[#1E293B] pr-2">
                  {d.item || 'Deliverable item'}
                </span>
                <span className="font-semibold text-[#0E0E0E] shrink-0 font-mono text-[7.8pt]">
                  {d.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
