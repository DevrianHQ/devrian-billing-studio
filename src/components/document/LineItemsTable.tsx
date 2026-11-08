import React from 'react';
import { DocumentType, LineItem, DocumentCustomText } from '../../types';
import { formatINR } from '../../services/indianCurrency';

interface LineItemsTableProps {
  type: DocumentType;
  items: LineItem[];
  customText: DocumentCustomText;
  startIndex?: number;
}

export const LineItemsTable: React.FC<LineItemsTableProps> = ({
  type,
  items,
  customText,
  startIndex = 1,
}) => {
  const isReceipt = type === 'receipt';

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

  if (isReceipt) {
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
              <th style={{ ...thStyle, textAlign: 'left', paddingLeft: '4mm' }}>
                {customText.colDescription || 'DESCRIPTION'}
              </th>
              <th style={{ ...thStyle, textAlign: 'center', width: '28mm' }}>
                {customText.colMode || 'MODE'}
              </th>
              <th style={{ ...thStyle, textAlign: 'right', paddingRight: '4mm', width: '35mm' }}>
                {customText.colAmount || 'AMOUNT'}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: '0.2mm solid #E5E5E5',
                  minHeight: '12mm',
                }}
              >
                <td style={{ paddingTop: '2.5mm', paddingBottom: '2.5mm', paddingLeft: '4mm', verticalAlign: 'top' }}>
                  <div
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      fontSize: '9.5pt',
                      color: '#0E0E0E',
                    }}
                  >
                    {item.description}
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
                <td
                  style={{
                    paddingTop: '3mm',
                    paddingBottom: '3mm',
                    textAlign: 'center',
                    verticalAlign: 'top',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: '9pt',
                    color: '#0E0E0E',
                  }}
                >
                  {item.mode || 'UPI'}
                </td>
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
                  {formatINR(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Invoice Table: # | Description | Qty | Rate (₹) | Amount (₹)
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
            <th style={{ ...thStyle, textAlign: 'center', width: '10mm', paddingLeft: '2mm' }}>
              {customText.colNumber || '#'}
            </th>
            <th style={{ ...thStyle, textAlign: 'left', paddingLeft: '3mm' }}>
              {customText.colDescription || 'DESCRIPTION'}
            </th>
            <th style={{ ...thStyle, textAlign: 'center', width: '18mm' }}>
              {customText.colQty || 'QTY'}
            </th>
            <th style={{ ...thStyle, textAlign: 'right', width: '30mm' }}>
              {customText.colRate || 'RATE (₹)'}
            </th>
            <th style={{ ...thStyle, textAlign: 'right', width: '35mm', paddingRight: '4mm' }}>
              {customText.colAmount || 'AMOUNT (₹)'}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id}
              style={{
                borderBottom: '0.2mm solid #E5E5E5',
                minHeight: '12mm',
              }}
            >
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
                {startIndex + index}
              </td>
              <td style={{ paddingTop: '3mm', paddingBottom: '3mm', paddingLeft: '3mm', verticalAlign: 'top' }}>
                <div
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    fontSize: '9.5pt',
                    color: '#0E0E0E',
                  }}
                >
                  {item.description}
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
          ))}
        </tbody>
      </table>
    </div>
  );
};
