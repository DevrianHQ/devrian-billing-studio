import React from 'react';
import { LineItem, DocumentCustomText } from '../../../types';
import { formatINR } from '../../../services/indianCurrency';

interface QuotationScopeTableProps {
  items: LineItem[];
  startIndex?: number;
  customText?: DocumentCustomText;
}

export const QuotationScopeTable: React.FC<QuotationScopeTableProps> = ({
  items,
  startIndex = 1,
  customText,
}) => {
  const colDescriptionLabel =
    customText?.colDescription && customText.colDescription !== 'Description'
      ? customText.colDescription
      : 'SCOPE OF WORK';

  const thStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: '7pt',
    letterSpacing: '0.2em',
    wordSpacing: '0.7em',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    paddingTop: '2.5mm',
    paddingBottom: '2.5mm',
  };

  return (
    <div
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '3mm',
        paddingBottom: '1mm',
      }}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: '#0E0E0E', height: '8.5mm' }}>
            {/* # */}
            <th style={{ ...thStyle, textAlign: 'center', width: '10mm', paddingLeft: '2mm' }}>
              {customText?.colNumber || '#'}
            </th>

            {/* Scope of Work */}
            <th style={{ ...thStyle, textAlign: 'left', paddingLeft: '3mm' }}>
              {colDescriptionLabel}
            </th>

            {/* Qty */}
            <th style={{ ...thStyle, textAlign: 'center', width: '18mm' }}>
              {customText?.colQty || 'QTY'}
            </th>

            {/* Rate */}
            <th style={{ ...thStyle, textAlign: 'right', width: '30mm' }}>
              {customText?.colRate || 'RATE (₹)'}
            </th>

            {/* Amount */}
            <th style={{ ...thStyle, textAlign: 'right', width: '35mm', paddingRight: '4mm' }}>
              {customText?.colAmount || 'AMOUNT (₹)'}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const rowNumber = startIndex + index;
            return (
              <tr
                key={item.id || index}
                style={{
                  borderBottom: '0.2mm solid #E5E5E5',
                  minHeight: '12mm',
                }}
              >
                {/* # */}
                <td
                  style={{
                    paddingTop: '2.5mm',
                    paddingBottom: '2.5mm',
                    paddingLeft: '2mm',
                    textAlign: 'center',
                    verticalAlign: 'top',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: '8.5pt',
                    color: '#8A8A8A',
                  }}
                >
                  {rowNumber}
                </td>

                {/* Scope Description */}
                <td style={{ paddingTop: '3mm', paddingBottom: '3mm', paddingLeft: '3mm', verticalAlign: 'top' }}>
                  <div
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      fontSize: '9.5pt',
                      color: '#0E0E0E',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.description || 'Service deliverable'}
                  </div>
                  {item.subDescription && (
                    <div
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 400,
                        fontSize: '8pt',
                        color: '#6B6B6B',
                        marginTop: '0.8mm',
                        lineHeight: 1.35,
                      }}
                    >
                      {item.subDescription}
                    </div>
                  )}
                </td>

                {/* Qty */}
                <td
                  style={{
                    paddingTop: '3mm',
                    paddingBottom: '3mm',
                    textAlign: 'center',
                    verticalAlign: 'top',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                    fontSize: '9pt',
                    color: '#0E0E0E',
                  }}
                >
                  {item.qty}
                </td>

                {/* Rate */}
                <td
                  style={{
                    paddingTop: '3mm',
                    paddingBottom: '3mm',
                    textAlign: 'right',
                    verticalAlign: 'top',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                    fontSize: '9pt',
                    color: '#0E0E0E',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatINR(item.rate, false)}
                </td>

                {/* Amount */}
                <td
                  style={{
                    paddingTop: '3mm',
                    paddingBottom: '3mm',
                    paddingRight: '4mm',
                    textAlign: 'right',
                    verticalAlign: 'top',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    fontSize: '9.5pt',
                    color: '#0E0E0E',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatINR(item.amount, false)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
