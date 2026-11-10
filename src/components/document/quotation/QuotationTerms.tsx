import React from 'react';
import { getPolicyAdapterValues, resolveQuotationVariables } from '../../../services/policyAdapter';
import { BusinessProfile, BillingDocument } from '../../../types';

interface QuotationTermsProps {
  notes?: string[];
  heading?: string;
  business?: BusinessProfile;
  document?: BillingDocument;
}

export const QuotationTerms: React.FC<QuotationTermsProps> = ({
  notes = [],
  heading = 'TERMS & NOTES',
  business,
  document: doc,
}) => {
  if (!notes || notes.length === 0) return null;

  const policyVals = getPolicyAdapterValues(business, doc);

  return (
    <div
      data-section="quotation-terms"
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
          backgroundColor: '#F0F0F0',
          borderLeft: '1.2mm solid #0E0E0E',
          padding: '3.5mm 4mm',
          boxSizing: 'border-box',
          borderRadius: '1mm',
        }}
      >
        {/* Section Heading */}
        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: '6.8pt',
            letterSpacing: '0.22em',
            wordSpacing: '0.6em',
            color: '#0E0E0E',
            textTransform: 'uppercase',
            marginBottom: '1.5mm',
            lineHeight: 1,
          }}
        >
          {heading}
        </div>

        {/* Numbered Terms List (8.5pt font, 1.5 line height) */}
        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 400,
            fontSize: '8.5pt',
            color: '#262626',
            lineHeight: 1.5,
          }}
        >
          <ol className="list-decimal list-outside ml-4 space-y-[1.2mm]">
            {notes.map((note, index) => {
              const resolved = resolveQuotationVariables(note, policyVals);
              return (
                <li key={index} style={{ paddingLeft: '1mm' }}>
                  {resolved}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
};
