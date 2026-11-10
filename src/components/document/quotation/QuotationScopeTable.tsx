import React from 'react';
import { LineItem, DocumentCustomText, QuotationType } from '../../../types';
import { formatINR } from '../../../services/indianCurrency';

interface QuotationScopeTableProps {
  items: LineItem[];
  type?: QuotationType;
  startIndex?: number;
  customText?: DocumentCustomText;
}

export const QuotationScopeTable: React.FC<QuotationScopeTableProps> = ({
  items,
  type = 'project',
  startIndex = 1,
  customText,
}) => {
  const isHybrid = type === 'hybrid';
  const isMonthly = type === 'monthly';

  const colDescriptionLabel =
    customText?.colDescription && customText.colDescription !== 'Description'
      ? customText.colDescription
      : isMonthly
      ? 'MONTHLY SERVICES'
      : isHybrid
      ? 'PRICING & DELIVERABLES'
      : 'SCOPE OF WORK';

  const thStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: '6.8pt',
    letterSpacing: '0.22em',
    wordSpacing: '0.6em',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    paddingTop: '2.4mm',
    paddingBottom: '2.4mm',
  };

  return (
    <div
      data-section="quotation-scope-table"
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '2mm',
        paddingBottom: '1mm',
      }}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: '#0E0E0E', height: '8.5mm' }}>
            {/* # */}
            <th style={{ ...thStyle, textAlign: 'center', width: '9mm', paddingLeft: '2mm' }}>
              {customText?.colNumber || '#'}
            </th>

            {/* Description */}
            <th style={{ ...thStyle, textAlign: 'left', paddingLeft: '3mm' }}>
              {colDescriptionLabel}
            </th>

            {/* Billing Column (Shown only in Hybrid) */}
            {isHybrid && (
              <th style={{ ...thStyle, textAlign: 'center', width: '24mm' }}>
                BILLING
              </th>
            )}

            {/* Qty */}
            <th style={{ ...thStyle, textAlign: 'center', width: '16mm' }}>
              {customText?.colQty || 'QTY'}
            </th>

            {/* Rate */}
            <th style={{ ...thStyle, textAlign: 'right', width: '28mm' }}>
              {customText?.colRate || (isMonthly ? 'RATE / MO (₹)' : 'RATE (₹)')}
            </th>

            {/* Amount */}
            <th style={{ ...thStyle, textAlign: 'right', width: '32mm', paddingRight: '4mm' }}>
              {customText?.colAmount || 'AMOUNT (₹)'}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const rowNumber = startIndex + index;
            const isItemOneTime = item.billing === 'one_time';
            return (
              <tr
                key={item.id || index}
                style={{
                  borderBottom: '0.2mm solid #E5E5E5',
                  minHeight: '11mm',
                }}
              >
                {/* # */}
                <td
                  style={{
                    paddingTop: '2.2mm',
                    paddingBottom: '2.2mm',
                    paddingLeft: '2mm',
                    textAlign: 'center',
                    verticalAlign: 'top',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: '8pt',
                    color: '#8A8A8A',
                  }}
                >
                  {rowNumber}
                </td>

                {/* Scope / Pricing Description */}
                <td
                  style={{
                    paddingTop: '2.2mm',
                    paddingBottom: '2.2mm',
                    paddingLeft: '3mm',
                    paddingRight: '3mm',
                    verticalAlign: 'top',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      fontSize: '8.8pt',
                      color: '#0E0E0E',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {item.description || 'Service deliverable'}
                  </p>
                  {item.subDescription && item.subDescription.trim() && (
                    <p
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 400,
                        fontSize: '7.8pt',
                        color: '#64748B',
                        margin: 0,
                        marginTop: '0.8mm',
                        lineHeight: 1.35,
                      }}
                    >
                      {item.subDescription}
                    </p>
                  )}
                </td>

                {/* Billing Badge (Hybrid only) */}
                {isHybrid && (
                  <td
                    style={{
                      paddingTop: '2.2mm',
                      paddingBottom: '2.2mm',
                      textAlign: 'center',
                      verticalAlign: 'top',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                        fontSize: '6.5pt',
                        letterSpacing: '0.12em',
                        padding: '0.6mm 1.8mm',
                        borderRadius: '1mm',
                        textTransform: 'uppercase',
                        display: 'inline-block',
                        backgroundColor: isItemOneTime ? '#FEF3C7' : '#E0E7FF',
                        color: isItemOneTime ? '#92400E' : '#3730A3',
                      }}
                    >
                      {isItemOneTime ? 'One-time Setup' : 'Monthly Retainer'}
                    </span>
                  </td>
                )}

                {/* Qty */}
                <td
                  style={{
                    paddingTop: '2.2mm',
                    paddingBottom: '2.2mm',
                    textAlign: 'center',
                    verticalAlign: 'top',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: '8.5pt',
                    color: '#0E0E0E',
                  }}
                >
                  {item.quantity ?? item.qty ?? 1}
                </td>

                {/* Rate */}
                <td
                  style={{
                    paddingTop: '2.2mm',
                    paddingBottom: '2.2mm',
                    textAlign: 'right',
                    verticalAlign: 'top',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: '8.5pt',
                    color: '#0E0E0E',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatINR(item.rate)}
                </td>

                {/* Amount */}
                <td
                  style={{
                    paddingTop: '2.2mm',
                    paddingBottom: '2.2mm',
                    paddingRight: '4mm',
                    textAlign: 'right',
                    verticalAlign: 'top',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    fontSize: '8.8pt',
                    color: '#0E0E0E',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatINR(item.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
