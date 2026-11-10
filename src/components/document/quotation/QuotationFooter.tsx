import React from 'react';

interface QuotationFooterProps {
  documentNumber: string;
  udyamNo?: string;
  email?: string;
  currentPage: number;
  totalPages: number;
}

export const QuotationFooter: React.FC<QuotationFooterProps> = ({
  documentNumber,
  udyamNo = 'UDYAM-UP-54-0127731',
  email = 'inquiry@devrian.in',
  currentPage,
  totalPages,
}) => {
  return (
    <div
      className="w-full box-border mt-auto select-none"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingBottom: '4mm',
      }}
    >
      <div
        style={{
          borderTop: '0.2mm solid #E5E5E5',
          paddingTop: '1.5mm',
          fontFamily: "'Poppins', sans-serif",
          fontSize: '6.5pt',
          color: '#8A8A8A',
        }}
        className="flex items-center justify-between"
      >
        {/* Left: DEVRIAN | Quotation <number> */}
        <div style={{ fontWeight: 500, color: '#7A7A7A' }}>
          DEVRIAN | Quotation {documentNumber}
        </div>

        {/* Center: Udyam number */}
        <div style={{ fontWeight: 500, color: '#7A7A7A' }} className="text-center font-mono">
          {udyamNo}
        </div>

        {/* Right: inquiry@devrian.in and Page X of Y */}
        <div style={{ fontWeight: 500, color: '#7A7A7A' }} className="text-right flex items-center gap-1.5">
          <span>{email}</span>
          {totalPages > 1 && (
            <>
              <span>·</span>
              <span>
                Page {currentPage} of {totalPages}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
