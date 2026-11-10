import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { MonthlyDeliverable } from '../../../types';

interface ListTableProps {
  deliverables?: MonthlyDeliverable[];
}

export const ListTable: React.FC<ListTableProps> = ({
  deliverables = [],
}) => {
  if (!deliverables || deliverables.length === 0) return null;

  return (
    <div
      data-section="quotation-list-table"
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
            {/* # Index: 10mm (Aligns with DataTable #) */}
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

            {/* DELIVERABLE: 114mm */}
            <th
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.tableHead,
                textAlign: 'left',
                width: '114mm',
                paddingLeft: '2.5mm',
                paddingRight: '3mm',
              }}
            >
              DELIVERABLE
            </th>

            {/* QUANTITY: 50mm (right-aligned) */}
            <th
              style={{
                fontFamily: QUOTATION_TOKENS.font.family,
                ...QUOTATION_TOKENS.font.scale.tableHead,
                textAlign: 'right',
                width: '50mm',
                paddingRight: '3.5mm',
              }}
            >
              QUANTITY
            </th>
          </tr>
        </thead>
        <tbody>
          {deliverables.map((item, index) => {
            const isGray = index % 2 === 0;
            return (
              <tr
                key={item.id || index}
                style={{
                  minHeight: `${QUOTATION_TOKENS.spacing.num.tableRowStandardH}mm`, // 9.5mm
                  backgroundColor: isGray ? QUOTATION_TOKENS.colors.noteBackground : QUOTATION_TOKENS.colors.white,
                  borderBottom: `${QUOTATION_TOKENS.layout.ruleThickness} solid ${QUOTATION_TOKENS.colors.rule}`,
                }}
              >
                {/* # Index Column (10mm) */}
                <td
                  style={{
                    paddingTop: '2.5mm',
                    paddingBottom: '2.5mm',
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

                {/* Deliverable Name */}
                <td
                  style={{
                    paddingTop: '2.5mm',
                    paddingBottom: '2.5mm',
                    paddingLeft: '2.5mm',
                    paddingRight: '3mm',
                    verticalAlign: 'middle',
                  }}
                >
                  <span
                    style={{
                      fontFamily: QUOTATION_TOKENS.font.family,
                      fontSize: '9.2pt',
                      fontWeight: 600,
                      color: QUOTATION_TOKENS.colors.black,
                      lineHeight: 1.3,
                    }}
                  >
                    {item.item}
                  </span>
                </td>

                {/* Quantity / Scope (right-aligned, no box, matching deliverable font & size) */}
                <td
                  style={{
                    paddingTop: '2.5mm',
                    paddingBottom: '2.5mm',
                    textAlign: 'right',
                    paddingRight: '3.5mm',
                    verticalAlign: 'middle',
                  }}
                >
                  <span
                    style={{
                      fontFamily: QUOTATION_TOKENS.font.family,
                      fontSize: '9.2pt',
                      fontWeight: 600,
                      color: QUOTATION_TOKENS.colors.black,
                      lineHeight: 1.3,
                      ...QUOTATION_TOKENS.font.scale.numbers,
                    }}
                  >
                    {item.quantity}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
