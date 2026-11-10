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

  return (
    <div
      className="w-full box-border"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '2.5mm',
        paddingBottom: '2.5mm',
      }}
    >
      <table className="w-full border-collapse" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <thead>
          <tr
            style={{
              backgroundColor: '#0E0E0E',
              color: '#FFFFFF',
              height: '8mm',
            }}
          >
            {/* # */}
            <th
              style={{
                width: '8mm',
                paddingLeft: '2mm',
                paddingRight: '1mm',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '6.8pt',
                letterSpacing: '0.15em',
              }}
            >
              {customText?.colNumber || '#'}
            </th>

            {/* Scope of Work */}
            <th
              style={{
                paddingLeft: '3mm',
                paddingRight: '3mm',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '6.8pt',
                letterSpacing: '0.22em',
                wordSpacing: '0.45em',
                textTransform: 'uppercase',
              }}
            >
              {colDescriptionLabel}
            </th>

            {/* Qty */}
            <th
              style={{
                width: '16mm',
                paddingLeft: '2mm',
                paddingRight: '2mm',
                textAlign: 'right',
                fontWeight: 600,
                fontSize: '6.8pt',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              {customText?.colQty || 'QTY'}
            </th>

            {/* Rate */}
            <th
              style={{
                width: '24mm',
                paddingLeft: '2mm',
                paddingRight: '2mm',
                textAlign: 'right',
                fontWeight: 600,
                fontSize: '6.8pt',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              {customText?.colRate || 'RATE (₹)'}
            </th>

            {/* Amount */}
            <th
              style={{
                width: '28mm',
                paddingLeft: '2mm',
                paddingRight: '2.5mm',
                textAlign: 'right',
                fontWeight: 600,
                fontSize: '6.8pt',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              {customText?.colAmount || 'AMOUNT (₹)'}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const rowNumber = startIndex + idx;
            return (
              <tr
                key={item.id || idx}
                style={{
                  borderBottom: '0.2mm solid #E5E5E5',
                  minHeight: '8mm',
                }}
              >
                {/* # */}
                <td
                  style={{
                    paddingTop: '2mm',
                    paddingBottom: '2mm',
                    paddingLeft: '2mm',
                    paddingRight: '1mm',
                    textAlign: 'center',
                    fontSize: '8pt',
                    color: '#6B6B6B',
                    verticalAlign: 'top',
                    fontWeight: 500,
                  }}
                >
                  {rowNumber}
                </td>

                {/* Description + optional grey sub-description */}
                <td
                  style={{
                    paddingTop: '2mm',
                    paddingBottom: '2mm',
                    paddingLeft: '3mm',
                    paddingRight: '3mm',
                    textAlign: 'left',
                    verticalAlign: 'top',
                  }}
                >
                  <p
                    style={{
                      fontSize: '9pt',
                      fontWeight: 600,
                      color: '#0E0E0E',
                      lineHeight: 1.3,
                      margin: 0,
                    }}
                  >
                    {item.description || 'Service deliverable'}
                  </p>
                  {item.subDescription && item.subDescription.trim() && (
                    <p
                      style={{
                        fontSize: '7.8pt',
                        fontWeight: 400,
                        color: '#6B6B6B',
                        lineHeight: 1.3,
                        marginTop: '0.8mm',
                        marginBottom: 0,
                      }}
                    >
                      {item.subDescription}
                    </p>
                  )}
                </td>

                {/* Qty */}
                <td
                  style={{
                    paddingTop: '2mm',
                    paddingBottom: '2mm',
                    paddingLeft: '2mm',
                    paddingRight: '2mm',
                    textAlign: 'right',
                    fontSize: '8.5pt',
                    color: '#262626',
                    verticalAlign: 'top',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {item.qty}
                </td>

                {/* Rate */}
                <td
                  style={{
                    paddingTop: '2mm',
                    paddingBottom: '2mm',
                    paddingLeft: '2mm',
                    paddingRight: '2mm',
                    textAlign: 'right',
                    fontSize: '8.5pt',
                    color: '#262626',
                    verticalAlign: 'top',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatINR(item.rate)}
                </td>

                {/* Amount */}
                <td
                  style={{
                    paddingTop: '2mm',
                    paddingBottom: '2mm',
                    paddingLeft: '2mm',
                    paddingRight: '2.5mm',
                    textAlign: 'right',
                    fontSize: '8.5pt',
                    fontWeight: 600,
                    color: '#0E0E0E',
                    verticalAlign: 'top',
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

