import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { LineItem } from '../../../types';
import { formatINR } from '../../../services/indianCurrency';

interface DataTableProps {
  items: LineItem[];
  tableType: 'project' | 'monthly';
  isDense?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  items,
  tableType = 'project',
  isDense = false,
}) => {
  const isProject = tableType === 'project';
  const rowMinHeight = isDense ? `${QUOTATION_TOKENS.spacing.num.tableRowDenseH}mm` : `${QUOTATION_TOKENS.spacing.num.tableRowStandardH}mm`;

  return (
    <div
      data-section="quotation-data-table"
      className="w-full box-border bg-white select-none"
      style={{
        paddingLeft: QUOTATION_TOKENS.layout.pageMarginLeft, // 18mm
        paddingRight: QUOTATION_TOKENS.layout.pageMarginRight, // 18mm
      }}
    >
      <table className="w-full border-collapse" style={{ width: QUOTATION_TOKENS.layout.contentWidth }}>
        <thead>
          <tr
            style={{
              backgroundColor: QUOTATION_TOKENS.colors.black,
              height: `${QUOTATION_TOKENS.spacing.num.tableHeaderH}mm`, // 8.5mm
            }}
          >
            {/* Standard # Column (10mm) for both Project & Monthly */}
            <th
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.tableHead,
                textAlign: 'left',
                width: '10mm',
                paddingLeft: '3mm',
              }}
            >
              #
            </th>

            {/* DESCRIPTION: 84mm */}
            <th
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.tableHead,
                textAlign: 'left',
                width: '84mm',
                paddingLeft: '2.5mm',
                paddingRight: '3mm',
              }}
            >
              DESCRIPTION
            </th>

            {/* QTY: 16mm */}
            <th
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.tableHead,
                textAlign: 'right',
                width: '16mm',
                paddingRight: '3mm',
              }}
            >
              QTY
            </th>

            {/* RATE (₹): 30mm */}
            <th
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.tableHead,
                textAlign: 'right',
                width: '30mm',
                paddingRight: '3mm',
              }}
            >
              RATE (₹)
            </th>

            {/* AMOUNT (₹): 34mm */}
            <th
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.tableHead,
                textAlign: 'right',
                width: '34mm',
                paddingRight: '3.5mm',
              }}
            >
              AMOUNT (₹)
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const hasSub = Boolean(item.subDescription && item.subDescription.trim());
            const isOneTimeSetup = !isProject && item.billing === 'one_time';

            return (
              <tr
                key={item.id || index}
                style={{
                  minHeight: hasSub ? `${QUOTATION_TOKENS.spacing.num.tableRowSubDescH}mm` : rowMinHeight,
                  borderBottom: `${QUOTATION_TOKENS.layout.ruleThickness} solid ${QUOTATION_TOKENS.colors.rule}`,
                }}
              >
                {/* # Column */}
                <td
                  style={{
                    paddingTop: '2mm',
                    paddingBottom: '2mm',
                    paddingLeft: '3mm',
                    verticalAlign: 'middle',
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '8.5pt',
                    fontWeight: 600,
                    color: QUOTATION_TOKENS.colors.greyLight,
                    ...QUOTATION_TOKENS.font.scale.numbers,
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </td>

                {/* Description + optional sub-description + optional One-time badge */}
                <td
                  style={{
                    paddingTop: '2mm',
                    paddingBottom: '2mm',
                    paddingLeft: '2.5mm',
                    paddingRight: '3mm',
                    verticalAlign: 'middle',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontFamily: QUOTATION_TOKENS.font.family,
                        fontSize: '9.5pt',
                        fontWeight: 600,
                        color: QUOTATION_TOKENS.colors.black,
                        lineHeight: 1.25,
                      }}
                    >
                      {item.description}
                    </span>
                    {isOneTimeSetup && (
                      <span
                        style={{
                          fontSize: '6.5pt',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: QUOTATION_TOKENS.colors.black,
                          backgroundColor: QUOTATION_TOKENS.colors.noteBackground,
                          border: `0.25mm solid ${QUOTATION_TOKENS.colors.boxBorder}`,
                          padding: '0.4mm 2mm',
                          borderRadius: '0mm',
                        }}
                      >
                        One-time
                      </span>
                    )}
                  </div>
                  {hasSub && (
                    <p
                      style={{
                        fontFamily: QUOTATION_TOKENS.font.family,
                        fontSize: '7pt',
                        fontWeight: 400,
                        color: QUOTATION_TOKENS.colors.greyMid,
                        margin: 0,
                        marginTop: '0.6mm',
                        lineHeight: 1.3,
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
                    textAlign: 'right',
                    paddingRight: '3mm',
                    verticalAlign: 'middle',
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '9pt',
                    fontWeight: 500,
                    color: QUOTATION_TOKENS.colors.black,
                    ...QUOTATION_TOKENS.font.scale.numbers,
                  }}
                >
                  {item.qty || item.quantity || 1}
                </td>

                {/* Rate */}
                <td
                  style={{
                    paddingTop: '2mm',
                    paddingBottom: '2mm',
                    textAlign: 'right',
                    paddingRight: '3mm',
                    verticalAlign: 'middle',
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '9pt',
                    fontWeight: 500,
                    color: QUOTATION_TOKENS.colors.black,
                    ...QUOTATION_TOKENS.font.scale.numbers,
                  }}
                >
                  {formatINR(item.rate || 0)}
                </td>

                {/* Amount */}
                <td
                  style={{
                    paddingTop: '2mm',
                    paddingBottom: '2mm',
                    textAlign: 'right',
                    paddingRight: '3.5mm',
                    verticalAlign: 'middle',
                    fontFamily: QUOTATION_TOKENS.font.family,
                    fontSize: '9.5pt',
                    fontWeight: 600,
                    color: QUOTATION_TOKENS.colors.black,
                    ...QUOTATION_TOKENS.font.scale.numbers,
                  }}
                >
                  {formatINR(item.amount || 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
